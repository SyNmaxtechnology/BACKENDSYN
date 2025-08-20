//const moment = require("moment-timezone");
const path = require("path");
const Factura = require("../models/Factura");
const Producto = require("../models/Producto");
const Articulo = require("../models/Articulo");
const FacturaDetalle = require("../models/FacturaDetalle");
const FuncionesFactura = require("../functions/Factura");
const Consecutivo = require("../functions/Consecutivos");
const OBJ = require("../functions/Json");
const FA = require("../functions/FacturaElectronica");
const CondicionVenta = require("../ServiciosWeb/CondicionVenta");
const MedioPago = require("../ServiciosWeb/MedioPago");
const TipoDocumento = require("../ServiciosWeb/TipoDocumento");
const tipoDocumentoExoneracion = require("../ServiciosWeb/TipoDocumentoExoneracion");
const CondicionImpuesto = require("../ServiciosWeb/CondicionImpuesto");
const EstadoAceptacion = require("../ServiciosWeb/estadoAceptacion");
const TipoCedula = require("../ServiciosWeb/tipoCedula");
const Monedas = require("../ServiciosWeb/Monedas");
const consulta = require("../functions/consulta");
const email = require("../functions/Email");
const Xml = require("../functions/Xml");
const jwt = require("jsonwebtoken");
const fecha = require("../db/fecha");
const ExistenciaController = require("./ExistenciaController");
const RecetaController = require("./RecetaController");
const Bodega = require("../models/Bodega");
const FacturaElectronica = require("../functions/FacturaElectronica");
const Cliente = require("../models/Cliente");
const ClienteController = require('./ClienteController');
const TipoCambioController = require("./TipoCambioController");
const impuestoController = require("./TipoImpuestoController");
const TipoImpuestoController = require("../models/TipoImpuesto");
const UsuarioController = require('./UsuariosController');
const Emisor = require("../models/Emisor");
const { obtenerBodegaPrincipal } = require("./BodegaController");

//const UnidadesMedidaServicios = ['Al','Alc','Cm','I','Os','Sp','Spe','St','m','kg','s','A','K','mol','cd','m²','m³'];
const UnidadesMedidaServicios = ['Al', 'Alc', 'Cm', 'I', 'Os', 'Sp', 'Spe', 'St', 'd', 'h', 's'];
require("dotenv").config({ path : '../variables.env'});

exports.nuevaFactura = (req, res) => {

    const {tipo} = req.body;

    if(tipo.toString() === 'nuevaFactura') {
        console.log("nueva factura");
        nuevaFactura(req,res);
    } else if( tipo.toString() === 'proformaFactura') {
        proformaAFactura(req,res);
    } else {
        res.status(400).json({
            message: 'Información inválida'
        })
    }
}

const proformaAFactura = (req,res) => {

    const {id,tipo_factura,idbodega} = req.body.factura;
    console.log(req.body);
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const permiso = decodedToken.permiso;

    //stringPreviousClaveNumerica, tipoComprobante, id, idemisor
    const idfactura= id;
    const situacionComprobante = '00000000000000000000000000000000000000000000000000';
    FuncionesFactura.generacion_clave_numerica(situacionComprobante,tipo_factura,id,idemisor).then(responseConsecutivos => {
        const {claveNumerica,nuevoConsecutivo,llave,clave,numeroInterno} =responseConsecutivos;
        console.log("consecutivo ",nuevoConsecutivo);
        console.log("Clavenumerica ", claveNumerica);
        Factura.actualizarConsecutivosElectronicos({
            clavenumerica: claveNumerica, 
            consecutivo: String(nuevoConsecutivo), 
            idfactura: id,
            idemisor,
            numeroInterno}).then(consecutivosActualizados => {
                
                const {affectedRows} = consecutivosActualizados;

                if(affectedRows > 0){
                    // { idfactura, tipo_factura }

                    Factura.actualizarIdBodega({ idbodega,idfactura,idemisor}).then(({affectedRows})=> {
                        if(affectedRows < 1){
                            console.log("No se pudo actualizar el idebodega en la factura con id "+idfactura);
                            return res.status(400).json({
                                message: 'Hubo un error en la actualización de la factura'
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(400).json({
                            message: 'Hubo un error en el servidor'
                        })
                    })
                    Factura.obtenerDatosFactura({ idfactura: id , tipo_factura }).then(datosFactura => {
                        
                        FacturaDetalle.obtenerOrdenesPorFactura({idfactura: id,tipo: tipo_factura,idemisor}).then(async datosLineas => {
                            console.log(datosFactura[0])
                            //const idbodega = idbodega
                            //---------------------------------------------------------------------
                            if(permiso !== 'integrador'){
                                for await (orden of datosLineas) {

                                    RecetaController.obtenerDatosReceta({idemisor, idproducto: orden.idproducto})
                                    .then(responseReceta => {
                                            console.log("respuesta ",responseReceta)
                                            if(responseReceta.length === 0){
                                                console.log('No se pudo actualizar el stock')
    
                                            } else {
                                            if(UnidadesMedidaServicios.includes(orden.unidad_medida) == false){ // no es un servicio
                                                const datosReceta = responseReceta;
                                                for(let linea of datosReceta){
                                                    const {idproducto, idarticulo, cantidad} = linea;
                                                    const cantidadTotal = Number(orden.cantidad) * cantidad;
                                                    
                                                            //Number(ordenes[id].cantidad) * cantidad;
                                                    Articulo.obtenerUNidadMedida({
                                                        idemisor,
                                                        idarticulo
                                                    }).then(responseArticulo => {
                                                        const unidadMedidaArticulo = responseArticulo[0].unidad_medida;
                                                        if(UnidadesMedidaServicios.includes(unidadMedidaArticulo) == false){
                                                            
                                                            ExistenciaController.restarExistencia({cantidad: cantidadTotal,idarticulo, idemisor,idbodega})
                                                            .then(responseExistencia => {
                                                                if(typeof responseExistencia[0][0].mensaje !== 'undefined'  &&
                                                                responseExistencia[0][0].mensaje != 'OK') {
                                                                    console.log('No se pudo actualizar el stock')
                                                                } else {
                                                                    console.log('Stock actualizado')
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                console.log('Ha ocurrido un error en el servidor')
                                                                return res.status(500).json({
                                                                    message: 'Ha ocurrido un error en el servior'
                                                                    })
                                                                })
                                                                
                                                            }
                                                        })
                                                    .catch(err => {
                                                        console.log(err);
                                                        return res.status(500).json({
                                                            message: 'Ha ocurrido un error en el servior'
                                                        })
                                                    })
                                                }
                                            }
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return res.status(500).json({
                                            message: 'Ha ocurrido un error en el servidor'
                                        })
                                    })
                                }
    
                            } else {
                                console.log("NO tiene los permisos para ejecutar los procesos de inventario")
                            }
                            //----------------------------------------------------------------------
                            
                            FA.crearXML(datosFactura[0], datosLineas, tipo_factura, llave, clave, id).then(xmlCreado => {
                                const { key_username_hacienda, key_password_hacienda,
                                         TOKEN_API, Client_ID } = datosFactura[0];
                                const xml = xmlCreado;
                                const userAgent = req.headers["user-agent"];
                                const objToken = {
                                    userHacienda: key_username_hacienda,
                                    passHacienda: key_password_hacienda,
                                    TOKEN_API,
                                    Client_ID,
                                    userAgent,
                                }

                                let tipoIdentificacion = ''
                                let numeroCliente = ''
                                if (datosFactura[0].datosCliente != null) {
                                    tipoIdentificacion = datosFactura[0].datosCliente.cliente_tipo_identificacion;
                                    numeroCliente = datosFactura[0].datosCliente.cedula_cliente;
                                } else {
                                    tipoIdentificacion = null;
                                    numeroCliente = null;
                                }

                                const objSendComprobante = {
                                    "clave": datosFactura[0].clavenumerica,
                                    "fecha": datosFactura[0].fecha_factura,
                                    "emisor": {
                                        "tipoIdentificacion": datosFactura[0].emisor_tipo_identificacion,
                                        "numeroIdentificacion": datosFactura[0].numero_emisor
                                    },
                                    "receptor": {
                                        "tipoIdentificacion": tipoIdentificacion,
                                        "numeroIdentificacion": numeroCliente
                                    },
                                    "comprobanteXml": xml,
                                    "API": datosFactura[0].API,
                                    userAgent,
                                }

                                const objData = {
                                    objToken,
                                    objSendComprobante
                                }

                                FA.enviarDoc(objData)
                                .then(response => {
                                    const { codigo, token } = response;

                                    if (codigo === 202) {
                                        FA.obtenerEstadoComprobante(datosFactura[0].clavenumerica, token, datosFactura[0].API, userAgent, idfactura,tipo_factura).then(data => {
                                                console.log("data final ",data);
                                                if(tipo_factura == '01'){ //FACTURA ELECTRONICA
                                                    if(data == 'rechazado'){
                                                        const obj = {
                                                            tipo_factura,
                                                            clave: datosFactura[0].clavenumerica,
                                                            status: data
                                                        }
                                                        actualizarEstado(obj)
                                                            .then(  data => {
                                                                res.status(200).json({ mesasage: 'Comprobante generado'});
                                                        })
                                                    } if(data == 'aceptado') {

                                                        /*res.status(200).json({
                                                            idfactura:  idfactura
                                                        })*/

                                                        
                                                        const obj = {
                                                            tipo_factura,
                                                            clave: datosFactura[0].clavenumerica,
                                                            status: data
                                                        }

                                                        actualizarEstado(obj)
                                                            .then( async data => {
                                                                //enviar el correeo

                                                                    const obj = {
                                                                        tipo: tipo_factura,
                                                                        id: idfactura,
                                                                        idemisor
                                                                    }
                                                                    res.status(200).json({ mesasage: 'Comprobante generado'});

                                                                    encabezadoReporteFactura(obj)
                                                                        .then(response => {
                                                                            console.log("respopnse ", response);
                                                                            const obj = {
                                                                                tipo: tipo_factura,
                                                                                idfactura,
                                                                                idemisor
                                                                            }
                                                                            FacturaDetalle.obtenerOrdenesPorFactura(obj)
                                                                                .then(ordenes => {
                                                                                    const cliente = datosFactura[0].datosCliente;
                                                                                    
                                                                                    //arrayCorreo.push();                                                                                    
                                                                                    generarReportePdf(response[0], ordenes, '02', res, cliente.cliente_correo+','.toString(),idemisor);
                                                                                })
                                                                                .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(500).json({ err })});
                                                                        })
                                                                        .catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).json({ err })
                                                                        });
                                                                
                                                                
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                res.status(500).json(err)}) 
                                                    }
                                                } 
                                                if(tipo_factura == '04') { // TIQUETE ELECTRONICO
                                                    const obj = {
                                                        tipo_factura,
                                                        clave: datosFactura[0].clavenumerica,
                                                        status: data
                                                    }
                                                    actualizarEstado(obj)
                                                        .then(  data => {
                                                            res.status(200).json({ mesasage: 'Comprobante generado'});
                                                    })
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                res.status(200).json({ mesasage: 'Comprobante generado'});
                                                //res.status(500).json(err)
                                            });
                                    }

                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        message: 'No se pudo enviar el comprobante'
                                    })
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                console.log("No se pudo generar el comprobante xml")
                                res.status(500).json({
                                    message: 'No se pudo generar el comprobante xml'
                                })
                            })
                        })
                        .catch(err => {
                            console.log(err);
                            console.log("No se pudo obtener la informacion de las lineas")
                            res.status(500).json({
                                message: 'No se pudo obtener la información del comprobante'
                            })
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        console.log("No se pudo obtener la informacion de la factura")
                        res.status(500).json({
                            message: 'No se pudo obtener la información del comprobante'
                        })
                    })
                } else {
                    res.status(400).json({
                        message: 'No se pudo generar el comprobante'
                    })
                }

         }).catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudo generar la venta'
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'No se pudo generar la venta'
        })
    })
}

const nuevaFactura = (req, res) => {

    return new Promise(async(resolve, reject) => {
        try {

            let { factura, ordenes, objOrdenes } = req.body;
            let { idcliente, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas,plazo_credito,medio_pago2,idbodega } = factura;    
            let idbodegaSeleccionada = null;
            let bodegaBuscada = null
        
            const fecha_factura = fecha();
            const authHeader = req.get('Authorization');
            const token = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(token,process.env.KEY);
            const idemisor = decodedToken.id;
            const idusuario = decodedToken.uid;
            const permiso = decodedToken.permiso;
            let tipoCambioActual = '';

            if(idbodega == null|| typeof idbodega === 'undefined' ) {
                bodegaBuscada = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                idbodegaSeleccionada = bodegaBuscada[0].idbodega;
            } else {
                idbodegaSeleccionada = idbodega;
            }

            if(!tipocambio || tipocambio == '' || Number(tipocambio) === 1){
                const obtenerTipoCambio = await TipoCambioController.obtenerTipoCambio(fecha_factura.substr(0,10));
                tipoCambioActual = obtenerTipoCambio[0].tipocambio;
            } else {
                tipoCambioActual = tipocambio;
            }

            const respuesta = await Factura.nuevaFactura({ idusuario,idcliente, idbodegaSeleccionada,idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipoCambioActual, tipo_factura,otrosCargos,notas, plazo_credito,medio_pago2 });
            
            const { insertId } = respuesta;
            let idfactura = insertId;
            console.log("idfactura", idfactura);
            if(plazo_credito != '' && condicion_venta == '02'){
                //agregar factura a facturas con credito
                const idfacturaCredito = await Factura.agregarFacturasConCredito({
                    idemisor,
                    idcliente,
                    idfactura,
                    fecha_factura,
                    montototal: totalcomprobante,
                    saldoactual: totalcomprobante,
                    factura: '1'
                });

                const {affectedRows} = idfacturaCredito;
                console.log("La factura se guardó como factura de crédito");
                if(affectedRows === 0 ){
                   return res.status(400).json({
                        message: 'No se pudo agregar la factura con condición de venta crédito'
                    })
                }
            }

            const situacionComprobante = '00000000000000000000000000000000000000000000000000';
  
            FuncionesFactura.generacion_clave_numerica(situacionComprobante, tipo_factura, insertId, idemisor)
                .then(data => {
                    const { llave, clave } = data;
                    const objClave = {
                        clave: data.claveNumerica,
                        consecutivo: data.nuevoConsecutivo,
                        id: idfactura,
                        numeroInterno: data.numeroInterno
                    }
                    console.log("llegó aqui")
                    Factura.guardarClaveNumerica(objClave).then(async response => {
                    //
                        //ordeness

                        let i = 0;
                        let o = 0;
                        for (const id in ordenes) {

                            o++;
                            ordenes[id].idfactura = idfactura;
                            ordenes[id].numerodocumento = o;
                            ordenes[id].tipo_factura = tipo_factura;
                            console.log("detalle ",ordenes[id]);
                           // ExistenciaController.
                            FacturaDetalle.insertarDetalle(ordenes[id])
                                .then(response => {
                                    console.log("Orden insertada")
                                    const { affectedRows } = response;
                                    if (affectedRows > 0) {

                                        if(permiso !== 'integrador'){
                                            RecetaController.obtenerDatosReceta({idemisor, idproducto: ordenes[id].idproducto})
                                            .then(responseReceta => {
                                                console.log("respuesta ",responseReceta)
                                                if(responseReceta.length === 0){
                                                    console.log('No se pudo actualizar el stock')

                                                } else {
                                                    if(UnidadesMedidaServicios.includes(ordenes[id].unidad_medida) == false){ // no es un servicio
                                                        const datosReceta = responseReceta;
                                                        for(let linea of datosReceta){
                                                            const {idproducto, idarticulo, cantidad} = linea;
                                                            const cantidadTotal = Number(ordenes[id].cantidad) * cantidad;
                                                            

                                                            console.log("Datos entrada ",{
                                                                cantidad: cantidadTotal,idarticulo, idemisor,idproducto
                                                            })
                                                                    
                                                            Articulo.obtenerUNidadMedida({
                                                                idemisor,
                                                                idarticulo
                                                            }).then(async responseArticulo => {
                                                                const unidadMedidaArticulo = responseArticulo[0].unidad_medida;
                                                                if(UnidadesMedidaServicios.includes(unidadMedidaArticulo) == false){
                                                                    ExistenciaController.restarExistencia({cantidad: cantidadTotal,idarticulo, idemisor,idbodega:idbodegaSeleccionada})
                                                                    .then(responseExistencia => {
                                                                        if(typeof responseExistencia[0][0].mensaje !== 'undefined'  &&
                                                                        responseExistencia[0][0].mensaje != 'OK') {
                                                                            console.log('No se pudo actualizar el stock')
                                                                        }else {
                                                                            console.log('Stock actualizado')
                                                                        }
                                                                    })
                                                                    .catch(err => {
                                                                        console.log(err);
                                                                        console.log('Ha ocurrido un error en el servidor')
                                                                        return res.status(500).json({
                                                                            message: 'Ha ocurrido un error en el servior'
                                                                        })
                                                                    })
                                                                        }
                                                                    })
                                                            .catch(err => {
                                                                console.log(err);
                                                                return res.status(500).json({
                                                                    message: 'Ha ocurrido un error en el servior'
                                                                })
                                                            })
                                                        }
                                                    }
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                return res.status(500).json({
                                                    message: 'Ha ocurrido un error en el servidor'
                                                })
                                            })
                                        } else {
                                            console.log("No tiene permiso para ejecutar los procesos de inventario");
                                        }   

                                        i++;

                                    }
                                })
                                .catch(err => {
                                    console.log("Error en las ordenes de la factura");
                                    res.status(500).json({ message: 'Error al insertar las lineas de detalle' })
                                });
                        };//Termina el for

                        
                        FacturaDetalle.eliminarLineasTemporales({idemisor,idusuario})
                        .then(({affectedRows}) => {
                            if(affectedRows === 0) {
                                console.log("NO se borraron las lineas");
                            } else {
                                console.log("Se borraron las lineas");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        
                        res.status(201).json({tipo_factura,idfactura});
                        
                    })
                }).catch(err => {
                    console.log("error",err);
                    res.status(500).json({ message: 'Error al generar la clavenumerica' })
                })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: 'Falló la creación de la nueva factura'
            })
        }
    })
}

exports.anularFactura = (req, res) => {

    const { id , tipo_factura} = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const permiso = decodedToken.permiso; // si es integrador no debe ejecutar los proceso de inventario
    const objBusqueda = {
        id , tipo_factura,idemisor
    }

    Factura.obtenerDatosNotaCredito(objBusqueda)
        .then(response => {
            
            const datosfactura = response.factura[0];
            const ordenes = response.ordenes;
            const codigoAnulacion = '01'; //Anular documento de referencia
            const razon = 'Anulación del comprobante';
            /*let datetimenow = Date.now();
            const fechaEmision = moment(datetimenow).toISOString(true);*/
            const fechaNota = fecha();
            //const objOrdenes = datosfactura.detalles_factura;
            //fecha emision es la fecha cuando se envio el comprobante de referencia
            datosfactura.fecha_emision = datosfactura.fecha_factura;
            datosfactura.fecha_factura = fechaNota;
            datosfactura.razon = razon;
            datosfactura.codigo = codigoAnulacion;
            datosfactura.idemisor = datosfactura.idemisor; // ESTE IDEMISOR TIENE QUE SER EL QUE VIENE EN LA FACTURA REGISTRADA
            datosfactura.tipoDocReferencia = datosfactura.tipo_factura;
            datosfactura.tipo_factura = '03';
            datosfactura.NumeroReferencia = datosfactura.clavenumerica;
            datosfactura.idusuario = idusuario
            Factura.insertarNotaCredito(datosfactura)
                .then(response => {

                    const { affectedRows, insertId } = response;

                    if (affectedRows > 0) {

                        const situacionComprobante = '00000000000000000000000000000000000000000000000000';
                        const tipo_factura = datosfactura.tipo_factura;
                        const idemisor = datosfactura.idemisor;
                        const idfactura = insertId;

                        FuncionesFactura.generacion_clave_numerica(situacionComprobante, tipo_factura, insertId, idemisor)
                            .then(data => {
                                const { llave, clave } = data;
                                const objClave = {
                                    clave: data.claveNumerica,
                                    consecutivo: data.nuevoConsecutivo,
                                    id: idfactura,
                                    numeroInterno: data.numeroInterno,
                                    tipo_factura
                                }
                                Factura.guardarClaveNumerica(objClave).then(async response => {
                                    console.log("response clave numerica ", response);
                                    let i = 0;
                                    const idbodega = await Factura.obtenerIdbodegaPorClavenumerica({
                                        idemisor,
                                        clavenumerica: datosfactura.NumeroReferencia
                                    })
                                    console.log({idbodegaAsociada:idbodega})
                                    ordenes.forEach((orden) => {
                                        orden.idfactura = idfactura;
                                        orden.idemisor = idemisor;
                                        orden.tipo_factura = datosfactura.tipo_factura; 
                                        FacturaDetalle.insertarDetalle(orden)
                                            .then(response => {
                                                console.log("response insertar orden ", response)
                                                const { affectedRows } = response;
                                                if (affectedRows > 0) {
                                                    if(permiso !== 'integrador'){
                                                        RecetaController.obtenerDatosReceta({idemisor, idproducto: orden.idproducto})
                                                        .then(responseReceta => {
                                                            console.log("respuesta ",responseReceta)
                                                            if(responseReceta.length === 0){
                                                                console.log('No se pudo actualizar el stock')
                            
                                                            } else {

                                                                Producto.obtenerUnidadMedida({ idemisor, 
                                                                    idproducto: orden.idproducto}).then( async responseProducto => {

                                                                    const datosReceta = responseReceta;
                                                                    const unidadMedidaProducto = responseProducto[0].unidad_medida;

                                                                    if(UnidadesMedidaServicios.includes(unidadMedidaProducto) == false){ // no es un servicio
                                                                        
                                                                        for(let linea of datosReceta){
                                                                    
                                                                            const {idproducto, idarticulo, cantidad,unidad_medida} = linea;
                                                                            let cantidadTotal;
            
                                                                            if(UnidadesMedidaServicios.includes(unidad_medida)){
                                                                                cantidadTotal = 0;
                                                                            } else {
                                                                                
                                                                                cantidadTotal = Number(orden.cantidad) * cantidad;
            
                                                                                console.log("Datos entrada ",{
                                                                                cantidad: cantidadTotal,idarticulo, idemisor,idproducto
                                                                                })
                                                                                    
                                                                                
                                                                                ExistenciaController.sumarExistencia({cantidad: cantidadTotal,idarticulo, idemisor,idbodega: idbodega[0].idbodega})
                                                                                .then(responseExistencia => {
                                                                                    if(typeof responseExistencia[0][0].mensaje !== 'undefined'  &&
                                                                                    responseExistencia[0][0].mensaje != 'OK') {
                                                                                        console.log('No se pudo actualizar el stock')
                                                                                    }else {
                                                                                        console.log('Stock actualizado')
                                                                                    }
                                                                                })
                                                                                .catch(err => {
                                                                                    console.log(err);
                                                                                    //return res.status(500).json({message: 'Ha ocurrido un error en el servidor' })
                                                                                            
                                                                                
                                                                                })
                                                                            }
                                                                        }
                                                                    } 
                                                                    
                                                                })
                                                                .catch(err => {
                                                                    return res.status(500).json({
                                                                        message: 'Ha ocurrido un error en el servidor'
                                                                    })
                                                                })
                                                                
                                                            }
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                            return res.status(500).json({
                                                                message: 'Ha ocurrido un error en el servidor'
                                                            })
                                                        })
                                                    }else {
                                                        console.log("No tiene permisos para ejecutar los procesos de inventario")
                                                    }
                                                    i++;
                                                    if (i == ordenes.length) {
                                                        /*const objJSON = {|
                                                            id: idfactura,|
                                                            json: JSON.stringify(objOrdenes),
                                                            tipo_factura
                                                        }*/


                                                                    const datos = {
                                                                        idfactura: insertId,
                                                                        tipo_factura: datosfactura.tipo_factura
                                                                    }

                                                                    Factura.obtenerDatosFactura(datos)
                                                                        .then(respuestaFactura => {
                                                                            console.log("response ", respuestaFactura);
                                                                            const { key_username_hacienda, key_password_hacienda, TOKEN_API, Client_ID, tipo_factura } = respuestaFactura[0];

                                                                            FA.crearXML(respuestaFactura[0], ordenes, tipo_factura, llave, clave, idfactura)
                                                                                .then(response => {
                                                                                    const xmlFirmado = response;
                                                                                    const userAgent = req.headers["user-agent"];
                                                                                    const objToken = {
                                                                                        userHacienda: key_username_hacienda,
                                                                                        passHacienda: key_password_hacienda,
                                                                                        TOKEN_API,
                                                                                        Client_ID,
                                                                                        userAgent,
                                                                                    }


                                                                                    let tipoIdentificacion = ''
                                                                                    let numeroCliente = ''
                                                                                    if (respuestaFactura[0].datosCliente != null) {
                                                                                        tipoIdentificacion = respuestaFactura[0].datosCliente.cliente_tipo_identificacion;
                                                                                        numeroCliente = respuestaFactura[0].datosCliente.cedula_cliente;
                                                                                    } else {
                                                                                        tipoIdentificacion = null;
                                                                                        numeroCliente = null;
                                                                                    }

                                                                                    const objSendComprobante = {
                                                                                        "clave": respuestaFactura[0].clavenumerica,
                                                                                        "fecha": respuestaFactura[0].fecha_factura,
                                                                                        "emisor": {
                                                                                            "tipoIdentificacion": respuestaFactura[0].emisor_tipo_identificacion,
                                                                                            "numeroIdentificacion": respuestaFactura[0].numero_emisor
                                                                                        },
                                                                                        "receptor": {
                                                                                            "tipoIdentificacion": tipoIdentificacion,
                                                                                            "numeroIdentificacion": numeroCliente
                                                                                        },
                                                                                        "comprobanteXml": xmlFirmado,
                                                                                        "API": respuestaFactura[0].API,
                                                                                        userAgent,
                                                                                    }

                                                                                    const objData = {
                                                                                        objToken,
                                                                                        objSendComprobante
                                                                                    }

                                                                                    FA.enviarDoc(objData)
                                                                                        .then(response => {
                                                                                            const { codigo, token } = response;

                                                                                            if (codigo === 202) {
                                                                                                FA.obtenerEstadoComprobante(respuestaFactura[0].clavenumerica, token, respuestaFactura[0].API, userAgent, idfactura,tipo_factura).then(data => {
                                                                                                        console.log(data);
                                                                                                        const obj = {
                                                                                                            idfactura:idfactura,
                                                                                                            status: data,
                                                                                                            clave: respuestaFactura[0].clavenumerica,
                                                                                                            tipo_factura,
                                                                                                            idemisor 
                                                                                                        }

                                                                                                        Factura.actualizarEstadoFactura(obj)
                                                                                                            .then(respuesta => {
                                                                                                                const { affectedRows } = respuesta;

                                                                                                                if(affectedRows > 0){
                                                                                                                    
                                                                                                                    if(respuestaFactura[0].datosCliente != null){ // NOTA de factura
                                                                                                                        
                                                                                                                     //NOTA DE FACTURA
                                                                                                                        if(data == 'rechazado'){
                                                                                                                            res.status(200).json({
                                                                                                                                message: 'La nota de crédito ha sido enviada'
                                                                                                                            });
                                                                                                                        } 
                                                                                                                        if(data == 'aceptado'){

                                                                                                                            Factura.actualizarEstadoAnulado(objBusqueda.id)
                                                                                                                                .then(response => {

                                                                                                                                    res.status(200).json({
                                                                                                                                        idfactura: insertId,
                                                                                                                                        correo: respuestaFactura[0].datosCliente.cliente_correo+','
                                                                                                                                    });
                                                                                                                                })                                                           
                                                                                                                                .catch(err => {
                                                                                                                                    console.log(err);
                                                                                                                                    res.status(500).json({
                                                                                                                                        message: 'Error al actualizar el estado de anulación de la nota de crédito'
                                                                                                                                    })
                                                                                                                                })
                                                                                                                            
                                                                                                                          /* const obj = {
                                                                                                                                tipo: tipo_factura,
                                                                                                                                id: idfactura,
                                                                                                                                idemisor
                                                                                                                            }
                                                                                                                            encabezadoReporteFactura(obj)
                                                                                                                                .then(response => {
                                                                                                                                    const obj = {
                                                                                                                                        tipo: tipo_factura,
                                                                                                                                        idfactura
                                                                                                                                    }
                                                                                                                                    FacturaDetalle.obtenerOrdenesPorFactura(obj)
                                                                                                                                        .then(ordenes => {
                                                                                                                                            console.log("response factura", response);
                                                                                                                                            console.log("ordenes factura", ordenes);
                                                                                                                                            const cliente = respuestaFactura[0].datosCliente;
                                                                                                                                            
                                                                                                                                            //arrayCorreo.push();                                                                                    
                                                                                                                                            generarReportePdf(response[0], ordenes, '02', res, cliente.cliente_correo+','.toString());

                                                                                                                                            Factura.actualizarEstadoAnulado(objBusqueda.id);
                                                                                                                                        })
                                                                                                                                        .catch(err => {
                                                                                                                                            console.log(err);
                                                                                                                                            res.status(500).json({ err })});
                                                                                                                                })
                                                                                                                                .catch(err => {
                                                                                                                                    console.log(err);
                                                                                                                                    res.status(500).json({ err })
                                                                                                                                })*/
                                                                                                                        }
                                                                                                                    } else { // nota de tqieuet
                                                                                                                        Factura.actualizarEstadoAnulado(objBusqueda.id);
                                                                                                                        res.status(200).json({
                                                                                                                            message: 'La nota de crédito ha sido enviada'
                                                                                                                        });
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                            .catch(err =>{
                                                                                                                console.log(err);
                                                                                                                res.status(500).json(err)})
                                                                                                    })
                                                                                                    .catch(err => {
                                                                                                        res.status(200).json({ mesasage: 'Comprobante generado'});
                                                                                                       // res.status(500).json(err)
                                                                                                    
                                                                                                    });
                                                                                            }

                                                                                        })
                                                                                        .catch(err => {
                                                                                            console.log(err);
                                                                                            res.status(500).json(err)
                                                                                        })
                                                                                });
                                                                        }).catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).json({ err: 'No se pudo obtener la informacion de la nota de credito' })
                                                                        })

                                                                }
                                                       
                                                } else {
                                                    console.log(err);
                                                    res.status(500).json({ err: 'No se pudo insertar la linea' });
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                res.status(500).json({ err })
                                            });
                                    })
                                }).catch(err => {
                                    console.log(err);
                                    res.status(500).json({ err })
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ err })
                            })
                    } else {
                        //No se insertó la nota de credito
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ err })
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                err
            });
        })
}

exports.obtenerFactura = (req, res) => {

    const { idfactura } = req.params;

    Factura.obtenerDatosFactura({ idfactura })
        .then(factura => {
            res.json(factura)
        })
        .catch(err => res.status(500).json(err));
}

exports.reporteFacturaDetallado = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio, fechaFin} = req.body;

        //delete response[0].idfactura;
        const facturas = await Factura.obtenerEncabezadoReporteFacturaDetallado({fechaInicio, fechaFin,idemisor});
        const lineas = await FacturaDetalle.obtenerLineasReporteFacturaDetallado({fechaInicio, fechaFin,idemisor});    

        const totales = await Factura.sumatoriaDeFacturasAgrupadasPorMoneda(
            { fechaInicio, fechaFin,idemisor}
        )

        console.log(totales);
        res.status(200).json({
            factura: facturas,
            lineas,
            totales
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    }
}

exports.buscarComprobantes = (req, res) => {
    const { tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = req.body;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    let obj = {
        tipoFactura,
        fechaInicio,
        fechaFin,
        consecutivo,
        claveNumerica,
        numeroInterno,
        nombreCliente,
        idemisor
    }

    /*moment(fechaInicio, 'America/CostaRica');
    const fecha1 = moment(fechaInicio).toISOString(true);
     obj.fechaInicio = fecha1;

    moment(fechaFin, 'America/CostaRica');
    const fecha2 = moment(fechaFin).toISOString(true);
     obj.fechaFin = fecha2;*/

    if(tipoFactura == 'SI'){
        Factura.buscarProforma(obj)
        .then(data => {
            res.status(200).json({
                data
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err })
        });
    } else if(tipoFactura != '03' && tipoFactura != 'SI') {
        Factura.buscarComprobantes(obj)
        .then(data => {
            res.status(200).json({
                data
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err })
        });
    } else if(tipoFactura == '03') {
        Factura.buscarNotaCredito(obj)
        .then(data => {
            res.status(200).json({
                data
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err })
        });
    }
}

exports.reporteFactura = (req, res) => {
    const { idfactura, tipo } = req.query;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    console.log("idfactura ", idfactura) 
    if(typeof idfactura === 'undefined' || typeof tipo === 'undefined'){
        return  res.status(400).json({
            message: 'Faltan parametros'
        })
    }

    Factura.obtenerDatosReporteFactura({ idfactura, tipo })
        .then(factura => {
            FacturaDetalle.obtenerOrdenesPorFactura({ idfactura, tipo,idemisor })
                .then(ordenes => {
                    console.log("ordenes ", ordenes);
                    const obj = {
                        factura,
                        ordenes
                    }

                    res.status(200).json(obj);

                })
                .catch(err => res.status(500).json(err));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        });
}

exports.tipoCambio = (req, res) => {

    FuncionesFactura.obtenerTipoCambio()
        .then(response => {
            return res.status(200).json({
                response: response
            })
        })
        .catch(err => res.status(500).json({
            message: 'Hubo un error al obtener el tipo de cambio'
        }))

}

exports.reportePDF = (req, res) => {
    
    const { id, tipo, listaCorreos, tipoFactura } = req.query;
    if (typeof id === 'undefined' || typeof tipo === 'undefined' || typeof tipoFactura === 'undefined') {
        return res.status(400).json({
            err: 'Faltan paramétros'
        })
    } else {

        const authHeader = req.query.token;
        const token = authHeader;
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
       
        const obj = {
            tipo: tipoFactura,
            id,
            idemisor
        }

        encabezadoReporteFactura(obj)
            .then(response => {
                const obj = {
                    tipo: tipoFactura,
                    idfactura :id,
                    idemisor
                }
                FacturaDetalle.obtenerOrdenesPorFactura(obj)
                    .then(ordenes => {
                        console.log("datos factura entrada", response);
                        generarReportePdf(response[0], ordenes, tipo, res, listaCorreos,idemisor);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ err })
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ err })
            });
    }
}

exports.obtenerMonedas = (req, res) => {
    try{

        console.log("usaurio ",req.session.user)
        const monedas = Monedas();
        res.status(200).json({monedas});
    }catch(err){
        res.status(500).json({err});
    }

    /*Factura.obtenerMonedas()
    .then(response => {
        if (response.length === 0) return res.status(404).json({
            message: 'No hay resultados'
        });
        res.status(200).json({ response });
    })
    .catch(err => res.status(500).json({
        message: err
    }));*/
}
exports.CondicionVenta = (req, res) => {
    console.log(global.user);
    const condicionVenta = CondicionVenta();
    res.status(200).json({ condicionVenta });
}

exports.MedioPago = (req, res) => {
    const medioPago = MedioPago();
    console.log(global.user);
    res.status(200).json({ medioPago });
}

exports.TipoDocumento = (req, res) => {
    console.log(global.user);
    const tipoDocumento = TipoDocumento();
    res.status(200).json({ tipoDocumento });
}

exports.tipoDocumentoExoneracion = (req, res) => {
    console.log(global.user);
    const tipoExoneracion = tipoDocumentoExoneracion();
    res.status(200).json({ tipoExoneracion });
}

exports.condicionImpuesto = (req,res) => {
    try {
        res.status(200).json({
           condicionImpuesto: CondicionImpuesto()
        })
    } catch(err) {
        res.status(500).json({
            err: err
        })
    }
}

exports.estadoAceptacion = (req,res) => {
    try {
        res.status(200).json({
            estadoAceptacion: EstadoAceptacion()
         })
    } catch(err){
        console.log(err);
        res.status(500).json({
            err: err
        })
    }
}

exports.obtenerConsecutivo = (req,res) => {
    const {id} = req.body;
    Consecutivo.obtenerActualConsecutivo({
        idemisor:id
    }).then(data =>  {
        console.log(data)
    })
}

exports.actualizarConsecutivo = (req,res) => {
    const {tipoconse,idemisor} = req.body;
    Consecutivo.actualiarEmisorConsecutivo({
        tipoconse,idemisor
    }).then(data =>  {
        console.log(data)
    })
}

const actualizarEstado = (obj) => {
    return new Promise((resolve, reject) => {
        Factura.actualizarEstadoFactura(obj)
            .then(data => {
                console.log(obj);
                console.log("Data", data);
                const { affectedRows } = data;
                if (affectedRows > 0) {
                    resolve({
                        status: 'ok',
                        message: 'El comprobante ha sido generado'
                    })
                }
            })
            .catch(err => {

                console.log(err);
                reject(err)
            });
    })
}
const encabezadoReporteFactura = (obj) => {
    return new Promise((resolve, reject) => {
        Factura.encabezadoReporteFactura(obj)
            .then(data => {
                resolve(data);
            })
            .catch(err => reject(err));
    });
}

const generarReportePdf = (obj, ordenes, tipoFuncion, res, listaCorreos,idemisor, respuestaHttp = true) => { //comparar que si viene la informacion del cliente es factura sino tiquete
    return new Promise((resolve, reject) => {
       try {
         
        let tipo = '';
        let  altura = (ordenes.length) * 5;
        if(obj.notas_emisor && obj.notas_emisor.length > 0) {
            altura+= 20;
        }
        
        const f = new Date(obj.fecha_factura);
        const anio = f.getFullYear();
        const mes = (f.getMonth() < 10) ? '0' + Number(f.getMonth() + 1).toString() : Number(f.getMonth() + 1).toString();
        const dia = f.getDate();
        const fecha = anio + '/' + mes + '/' + dia;

        obj.fecha_factura = obj.fecha_factura.replace(/-/g,'/');

        switch (obj.tipo_factura) {
            case '01':
                tipo = 'Factura Electrónica';
                obj.tipo_factura = tipo;
                break;
            case '04':
                tipo = 'Tiquete Electrónico';
                obj.tipo_factura = tipo;
                break;
            case '03':
                tipo = 'Nota de Crédito';
                obj.tipo_factura = tipo;
                break;
        }
        
        if (obj.datosCliente !== null) {
            consulta.crearReporteConReceptor(ordenes, obj)
                .then(response => {
                    console.log("Reporte con receptor ", response);
                    
                    crearPDF(response, obj.clavenumerica,altura)
                        .then(data => {
                            console.log("llegó 1")

                            if (tipoFuncion == '01') {

                                //descargar el pdf
                                const archivo = '../pdf/' + obj.clavenumerica + '.pdf';
                                descargar(archivo, res)
                                    .then(response => {
                                        //res.status(200).json({ message: 'descargado :)' });
                                    })
                                    .catch(err => { res.status(500).json({ err }) });
                            } else if (tipoFuncion == '02') { //enviar el correo
                                console.log("enviar correo");

                                //-----------------------------------------
                                console.log("enviar id de obtenerXml ", obj.id);
                                Xml.obtenerXML({idfactura: obj.id, tipo}).then(datosRespuestaXML => {
                                    console.log("Obtener XML con receptor ", datosRespuestaXML);
                                    const xml = {};
                                    const acuseXml = {};
                                    if (datosRespuestaXML.length > 0){
                                       // const { xml, acuseXml } = datosRespuestaXML[0];
                                       xml.prop = datosRespuestaXML[0].xml;  
                                       acuseXml.prop  = datosRespuestaXML[0].acuseXml;    
                                    }else{
                                         xml.prop = 'SIN XML';
                                         acuseXml.prop = 'SIN ACUSE';
                                    }
                                        const textoComprobante = xml.prop;
                                        const textoAcuseXml = acuseXml.prop;
                                        const nombreComprobanteXml = obj.clavenumerica + '.xml';
                                        const nombreAcuseXml = 'Respuesta_' + obj.clavenumerica + '.xml';
                                        const ruta = '../pdf/' + obj.clavenumerica + '.pdf';
                                        const root = path.join(__dirname, ruta);
                                        const correoEmisor = obj.emisor_correo;
                                        const correoReceptor = obj.datosCliente.cliente_correo;
                                        const nombrePDF = obj.clavenumerica + '.pdf';
                                        const rutaPDF = root
                                        const Correos = listaCorreos.split(','); // 3 correos
                                        if (typeof Correos[0] !== 'undefined' && Correos[0].length > 0) {
                                            
                                            console.log("correo1")
                                            console.log(Correos[0])
                                            email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[0],obj.status_factura, obj.emisor_nombrecomercial || obj.emisor_nombre ).then(data => {
                                                
                                                
                                                console.log("Correo enviado fgfdg");
                                                
                                                if(respuestaHttp) {
                                                    res.status(200).json({
                                                        message: 'Correos enviados :)'
                                                    })
                                                }


                                                Factura.actualizarErrorEnvioCorreo({
                                                    idemisor: idemisor,
                                                    idfactura: obj.id,
                                                    descripcion: null
                                                }).then(responseActualizarEstadoError => {
                                                    if(responseActualizarEstadoError.affectedRows > 0){
                                                        console.log("El estado de error email ha sido actualizado")
                                                    } else {
                                                        console.log("El estado de error email no ha sido actualizado")
                                                    }
                                                })
                                                .catch(err => {
                                                    console.log("error actualizar el estado del envio correo",err);
                                                }) 

                                                console.log("respuesta envio1 ", data);
                                                if (typeof Correos[1] !== 'undefined' && Correos[1].length > 0 ) {
                                                    console.log("correo2 ")
                                                    console.log(typeof Correos[1])

                                                    email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[1],obj.status_factura,obj.emisor_nombrecomercial || obj.emisor_nombre).then(data => {

                                                        if (typeof Correos[2] !== 'undefined' && Correos[2].length > 0) {
                                                            console.log("correo 3")
                                                            console.log("respuesta envio2 ", data);

                                                            email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[2],obj.status_factura,obj.emisor_nombrecomercial || obj.emisor_nombre).then(data => {
                                                                console.log("respuesta envio3 ", data);
                                                                console.log("correo 3 enviado")
                                                               // res.status(200).json({message: 'Correos enviados :)'})
                                                            }).
                                                            catch(err => {
                                                                console.log("cayó en el error de enviar el correo 3");
                                                                console.log(err);
                                                            });
                                                        } else {
                                                            console.log("correo 2 enviado")
                                                            //res.status(200).json({message: 'Correos enviados :)'})
                                                        }
                                                    }).
                                                    catch(err =>{ 
                                                        console.log("cayó en el error de enviar el correo 2");
                                                        console.log(err);
                                                      });
                                                } 
                                            }).
                                            catch(err => {
                                                console.log("cayó en el error de enviar el correo 1");
                                                console.log(err);
                                                res.status(500).json({
                                                message: 'El envío de correos ha fallado'
                                            })});
                                            
                                        } else {
                                            res.status(500).json({
                                                message: 'Debe ingresar al menos un correo válido'
                                            })
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.status(500).json({
                                            message: 'No se pudo obtener la informacion de los archivos XML'
                                        })
                                    })

                                //-------------------------------------------------------------------------
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                            message: err
                        })});
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: err
                    })
                })
        } else {
            consulta.crearReporteSinReceptor(ordenes, obj)
                .then(response => {
                    crearPDF(response, obj.clavenumerica,altura)
                        .then(data => {
                            console.log("llegó 2")
                            if (tipoFuncion == '01') {
                                console.log("descargar pdf")
                                    //descargar el pdf
                                const archivo = '../pdf/' + obj.clavenumerica + '.pdf';
                                descargar(archivo, res)
                                    .then(response => {
                                        //res.status(200).json({ message: 'descargado :)' });
                                    })
                                    .catch(err => { console.log(err) });
                            }
                            if (tipoFuncion == '02') { //enviar el correo
                                //---------------------------------------------------------------
                                //obtener los xml de comprobante y acuse 
                                console.log("enviar id de obtenerXml ", obj.id);
                                Xml.obtenerXML({idfactura: obj.id, tipo}).then(datosRespuestaXML => {

                                        const { xml, acuseXml } = datosRespuestaXML[0];
                                        const textoComprobante = xml;
                                        const textoAcuseXml = acuseXml;
                                        const nombreComprobanteXml = obj.clavenumerica + '.xml';
                                        const nombreAcuseXml = 'Respuesta_' + obj.clavenumerica + '.xml';
                                        const ruta = '../pdf/' + obj.clavenumerica + '.pdf';
                                        const root = path.join(__dirname, ruta);
                                        //const correoEmisor = obj.emisor_correo;
                                        //const correoReceptor = obj.datosCliente.cliente_correo;
                                        const nombrePDF = obj.clavenumerica;
                                        const rutaPDF = root
                                        const Correos = listaCorreos.split(','); // 3 correos
                                        if (typeof Correos[0] !== 'undefined') {
                                            
                                                email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[0],obj.status_factura,obj.emisor_nombrecomercial || obj.emisor_nombre).then(data => {
                                                    if (typeof Correos[1] !== 'undefined') {
                                                        email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[1],obj.status_factura,obj.emisor_nombrecomercial || obj.emisor_nombre).then(data => {
                                                            if (typeof Correos[2] !== 'undefined') {
                                                                email.enviarCorreo('', '', nombreComprobanteXml, textoComprobante, nombreAcuseXml, textoAcuseXml, rutaPDF, nombrePDF, Correos[2],obj.status_factura,obj.emisor_nombrecomercial || obj.emisor_nombre).then(data => {
                                                                    if(respuestaHttp) {
                                                                        res.status(200).json({
                                                                            message: 'Correos enviados :)'
                                                                        })
                                                                    }
                                                                }).
                                                                catch(err => {
                                                                    console.log(err);
                                                                    res.status(500).json({
                                                                    message: 'El envío de correos ha fallado'
                                                                })});
                                                            } else {
                                                                if(respuestaHttp) {
                                                                    res.status(200).json({
                                                                        message: 'Correos enviados :)'
                                                                    })
                                                                }
                                                            }
                                                        }).
                                                        catch(err => {
                                                            console.log(err);
                                                            res.status(500).json({
                                                            message: 'El envío de correos ha fallado'
                                                        })});
                                                    } else {
                                                        if(respuestaHttp) {
                                                            res.status(200).json({
                                                                message: 'Correos enviados :)'
                                                            })
                                                        }
                                                    }
                                                }).
                                                catch(err => {
                                                    console.log(err);
                                                    res.status(500).json({
                                                    message: 'El envío de correos ha fallado'})});
                                            
                                        } else {
                                            res.status(500).json({
                                                message: 'Debe ingresar al menos un correo válido'
                                            })
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.status(500).json({
                                            message: 'No se pudo obtener la informacion de los archivos XML'
                                        })
                                    })
                                    //-----------------------------------------------------------------------
                            }
                        })
                        .catch(err => res.status(500).json({
                            message: err
                        }));
                })
                .catch(err => {
                    res.status(500).json({
                        message: err
                    })
                })
        }
       } catch (error) {
            res.status(500).json({
                message: 'El envío de correos ha fallado'
            }) 
       }
    })
}

exports.guardarFactura = (req, res) => {

    const authHeader = req.get('Authorization').split(' ')[1];
    const token = authHeader;
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { tipoProforma } = req.body.factura;
    
    if(tipoProforma.toString() === 'profActualizar'){
        actualizarProforma(req)
        .then(response => {
            
            const {idfactura} = response;
            console.log("idfactura ",idfactura);

            return res.status(202).json({
                idfactura,
                message: 'Proforma actualizada'
            });
        })  
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Ha ocurrido un error en el servidor'});
        });
    } 
    
    if(tipoProforma.toString() === 'profGuadar') {

        guardar(req)
        .then(response => {
            
            const {idfactura} = response;
            console.log("idfactura ",idfactura);
            
            return res.status(201).json({
                idfactura,
                message: 'Proforma guardada'
            });
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Ha ocurrido un error en el servidor'});
        });
    }
}

exports.descargarReporteProforma = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idfactura} = req.params;

    Emisor.obtenerTipoReporte(idemisor).then(async response => {

        const {pos} = response[0];

        if(response[0]){
            if(pos === 1){ // reporte de tipo POS
                Factura.obtenerDatosEncabezadoReportePos({
                    idfactura,
                    idemisor
                }).then( datosFactura => {
                
                    FacturaDetalle.obtenerOrdenesReportePos(idfactura).then(datosOrdenes => {
                        consulta.crearReportePos(datosFactura[0],datosOrdenes).then(resportePOS => {
                            let altura = 0;
                            if(datosOrdenes.length > 1){
                                altura = (datosOrdenes.length) * 15;
                            }
                            const ruta = __dirname +'/../pdf/'+datosFactura[0].num_documento+'.pdf';
                            consulta.generarPDFDeComprobantePOS(resportePOS,ruta,altura).then(pdf => {
                                res.download(ruta); 
                                
                                if(datosFactura[0].datosReceptor){
                                    
                                    /*const pdf = datosFactura[0].num_documento+'.pdf';
                                    const correo = datosFactura[0].datosReceptor.correo;
                                    email.enviarCorreo('','','','','','',ruta,pdf,correo).then(emailResponse => {
                                        console.log(emailResponse);
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })*/
                
                                    // ---- GENERAR EL REPORTE QUE SE VA ENVIAR POR CORREO
                                    //id, tipo, idemisor
                                    
                                    const obj = {
                                        tipo: '01',
                                        id: idfactura,
                                        idemisor
                                    }
                            
                                    encabezadoReporteFactura(obj)
                                    .then(factura => {
                                        const obj = {
                                            tipo: '01',
                                            idfactura,
                                            idemisor
                                        }
                                        FacturaDetalle.obtenerOrdenesPorFactura(obj)
                                            .then(ordenes => {
                                                consulta.crearReporteProformaTipoFactura(ordenes,factura[0]).then( html => {
                                                    consulta.generarPDFDeComprobante(html,ruta).then(response => {
                                                        const correo = datosFactura[0].datosReceptor.correo;
                                                        const pdf = datosFactura[0].num_documento+'.pdf';
                                                        const nombreEmisor = (factura[0].emisor_nombrecomercial) ? factura[0].emisor_nombrecomercial : factura[0].emisor_nombre;
                
                                                        console.log("Emisor ",nombreEmisor);
                                                        /*email.enviarCorreo('','','','','','',ruta,pdf,correo,factura[0].status_factura,nombreEmisor).then(emailResponse => {
                                                            console.log(emailResponse);
                                                        })*///CAMBIO SYN SOLICITUD RELLACSA
                                                    })
                                                })
                                                .catch(err => res.status(500).json({ message: 'Error en el servidor' }));
                                            })
                                            .catch(err => res.status(500).json({ err }));
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.status(500).json({ err })
                                    });
                                } 
                            })
                        })
                    })
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({message: 'Ha ocurrido un error en el servidor'});
                }); 
            } else { // reporte de tipo FACTURA CARTA   
                try {
                    const dataFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
                    let ruta = __dirname +'/../pdf/';

                    const factura = await Factura.encabezadoReporteFactura({id: dataFactura[0].id, tipo: dataFactura[0].tipo_factura, idemisor});
                    const lineas = await FacturaDetalle.obtenerOrdenesPorFactura({ idfactura: dataFactura[0].id, tipo: dataFactura[0].tipo_factura,idemisor });
                    
                    ruta += factura[0].num_documento + '.pdf';
    
                    //if(factura[0].tipo_factura == '04') factura[0].tipo_factura = 'Tiquete Electrónico';
                    //else if(factura[0].tipo_factura == '01') factura[0].tipo_factura = 'Factura Electrónica';
    
                    let reporteFactura = '';
                    reporteFactura = await consulta.crearReporteProformaTipoFactura(lineas,factura[0]);
                    
                    console.log("reporte", reporteFactura);
                    
                    await consulta.generarPDFDeComprobante(reporteFactura,ruta);
                    res.download(ruta); 

                    if(factura[0].datosCliente){
                                    
                        /*const pdf = datosFactura[0].num_documento+'.pdf';
                        const correo = datosFactura[0].datosReceptor.correo;
                        email.enviarCorreo('','','','','','',ruta,pdf,correo).then(emailResponse => {
                            console.log(emailResponse);
                        })
                        .catch(err => {
                            console.log(err);
                        })*/
    
                        // ---- GENERAR EL REPORTE QUE SE VA ENVIAR POR CORREO
                        //id, tipo, idemisor
                        
                        const obj = {
                            tipo: '01',
                            id: idfactura,
                            idemisor
                        }
                
                        encabezadoReporteFactura(obj)
                        .then(factura => {
                            const obj = {
                                tipo: '01',
                                idfactura,
                                idemisor
                            }
                            FacturaDetalle.obtenerOrdenesPorFactura(obj)
                                .then(ordenes => {
                                    consulta.crearReporteProformaTipoFactura(ordenes,factura[0]).then( html => {
                                        consulta.generarPDFDeComprobante(html,ruta).then(response => {
                                            const correo =factura[0].datosCliente.cliente_correo;
                                            const pdf =factura[0].num_documento+'.pdf';
                                            const nombreEmisor = (factura[0].emisor_nombrecomercial) ? factura[0].emisor_nombrecomercial : factura[0].emisor_nombre;
    
                                            console.log("Emisor ",nombreEmisor);
                                            /*email.enviarCorreo('','','','','','',ruta,pdf,correo,factura[0].status_factura,nombreEmisor).then(emailResponse => {
                                                console.log(emailResponse);
                                            })*/ //CAMBIO SYN SOLICITUD RELLACSA
                                        })
                                    })
                                    .catch(err => res.status(500).json({ message: 'Error en el servidor' }));
                                })
                                .catch(err => res.status(500).json({ err }));
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ err })
                        });
                    } 
                } catch(err) {

                    console.log(err);
                    res.status(500).json({
                        message: 'Error al descargar el reporte'
                    })
                }
            }
        } else { // reporte TIPO FACTURA
            try {
                const dataFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
                let ruta = __dirname +'/../pdf/';

                const factura = await Factura.encabezadoReporteFactura({id: dataFactura[0].id, tipo: dataFactura[0].tipo_factura, idemisor});
                const lineas = await FacturaDetalle.obtenerOrdenesPorFactura({ idfactura: dataFactura[0].id, tipo: dataFactura[0].tipo_factura,idemisor });
                
                ruta += factura[0].num_documento + '.pdf';

                //if(factura[0].tipo_factura == '04') factura[0].tipo_factura = 'Tiquete Electrónico';
                //else if(factura[0].tipo_factura == '01') factura[0].tipo_factura = 'Factura Electrónica';

                let reporteFactura = '';
                reporteFactura = await consulta.crearReporteProformaTipoFactura(lineas,factura[0]);
                
                console.log("reporte", reporteFactura);
                
                await consulta.generarPDFDeComprobante(reporteFactura,ruta);
                res.download(ruta); 

                if(datosFactura[0].datosReceptor){
                                
                    /*const pdf = datosFactura[0].num_documento+'.pdf';
                    const correo = datosFactura[0].datosReceptor.correo;
                    email.enviarCorreo('','','','','','',ruta,pdf,correo).then(emailResponse => {
                        console.log(emailResponse);
                    })
                    .catch(err => {
                        console.log(err);
                    })*/

                    // ---- GENERAR EL REPORTE QUE SE VA ENVIAR POR CORREO
                    //id, tipo, idemisor
                    
                    const obj = {
                        tipo: '01',
                        id: idfactura,
                        idemisor
                    }
            
                    encabezadoReporteFactura(obj)
                    .then(factura => {
                        const obj = {
                            tipo: '01',
                            idfactura,
                            idemisor
                        }
                        FacturaDetalle.obtenerOrdenesPorFactura(obj)
                            .then(ordenes => {
                                consulta.crearReporteProformaTipoFactura(ordenes,factura[0]).then( html => {
                                    consulta.generarPDFDeComprobante(html,ruta).then(response => {
                                        const correo = datosFactura[0].datosReceptor.correo;
                                        const pdf = datosFactura[0].num_documento+'.pdf';
                                        const nombreEmisor = (factura[0].emisor_nombrecomercial) ? factura[0].emisor_nombrecomercial : factura[0].emisor_nombre;

                                        console.log("Emisor ",nombreEmisor);
                                        email.enviarCorreo('','','','','','',ruta,pdf,correo,factura[0].status_factura,nombreEmisor).then(emailResponse => {
                                            console.log(emailResponse);
                                        })
                                    })
                                })
                                .catch(err => res.status(500).json({ message: 'Error en el servidor' }));
                            })
                            .catch(err => res.status(500).json({ err }));
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ err })
                    });
                } 
            } catch(err) {

                console.log(err);
                res.status(500).json({
                    message: 'Error al descargar el reporte'
                })
            }
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al descargar el reporte'
        })
    })
    
}

const guardar = (req) => {

    return new Promise(async (resolve,reject) => {

        try {

            const authHeader = req.get('Authorization').split(' ')[1];
            const token = authHeader;
            const decodedToken = jwt.verify(token,process.env.KEY);
            const idemisor = decodedToken.id;
            const idusuario = decodedToken.uid;
           // const permiso = decodedToken.permiso;
            const { factura, ordenes, objOrdenes } = req.body;
            const fecha_factura = fecha();

            let objProforma= {};
            let { idcliente, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos,notas,plazo_credito,autorizado } = factura;

            let tipoCambioActual = '';

            if(!tipocambio || tipocambio == '' || Number(tipocambio) === 1){
                const obtenerTipoCambio = await TipoCambioController.obtenerTipoCambio(fecha_factura.substr(0,10));
                tipoCambioActual = obtenerTipoCambio[0].tipocambio;
            } else {
                tipoCambioActual = tipocambio;
            }

            const bodegaPrincipal = await obtenerBodegaPrincipal(idemisor);

            if(autorizado){
                const cliente = await ClienteController.obtenerIdAutoriza(idcliente);
                const idautoriza = cliente[0].idautoriza;
                objProforma = { idusuario,idcliente, idbodega: bodegaPrincipal.length === 0 ? null : bodegaPrincipal[0].id,  idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipoCambioActual, tipo_factura, prefactura, otrosCargos ,notas,plazo_credito,idautoriza };
            } else {
               objProforma = { idusuario,idcliente, idbodega: bodegaPrincipal.length === 0 ? null : bodegaPrincipal[0].id, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipoCambioActual, tipo_factura, prefactura, otrosCargos ,notas,plazo_credito, idautoriza: null };
            }

            //let datetimenow = Date.now();
            //const fechaEmision = moment(datetimenow).toISOString(true);
        
            const respuesta = await Factura.guardarProforma(objProforma);

            const { insertId, affectedRows } = respuesta;
            let idfactura = insertId;

            if(affectedRows > 0) {

                let num_documento = idfactura;            
                Factura.actualizarNumeroDocumento({idemisor,idfactura,num_documento }).then(responseActualizado => {

                    const {affectedRows} = responseActualizado;

                    if(affectedRows > 0) {
                        let i = 0;
                        let o = 0;
                        for (const id in ordenes) {

                            o++;
                            ordenes[id].idfactura = idfactura;
                            ordenes[id].numerodocumento = o;
                            ordenes[id].tipo_factura = tipo_factura;
                            FacturaDetalle.insertarDetalle(ordenes[id])
                                .then(response => {
                                
                                const { affectedRows } = response;
                                if (affectedRows > 0) {
                                    i++;
                                    if (i == ordenes.length) {
                                        const objJSON = {
                                            id: idfactura,
                                            json: JSON.stringify(objOrdenes),
                                            tipo_factura
                                        }

                                        OBJ.guardarJSON(JSON.stringify(objJSON)).then(data => {
                                            const { affectedRows } = data;
                                            ClienteController.innhabilitarEstadoAutorizado({idcliente,idemisor}).then(estadoAutorizado => {
                                                if(parseInt(estadoAutorizado.affectedRows === 0)){
                                                    reject('No se pudo actualizar el estado autorizado del cliente');
                                                } else {

                                                    
                                                    resolve({idfactura});
                                                }
                                            }).catch(err =>{
                                                console.log(err);
                                                reject('Ocurrió un error al actualizar el estado autorizado del cliente');
                                            })                                          
                                        })

                                        FacturaDetalle.eliminarLineasTemporales({idemisor,idusuario})
                                        .then(({affectedRows}) => {
                                            if(affectedRows === 0) {
                                                console.log("NO se borraron las lineas");
                                            } else {
                                                console.log("Se borraron las lineas");
                                            }
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                    }   
                                }
                            })
                        }
                    } else {
                        reject('Ocurrió un error al guardar la proforma')
                    }
                })  

            } else {
                reject('No se pudo guardar la proforma');
            }

        } catch (error) {
            reject(error)
        }
    })
}

const actualizarProforma = (req) => {
    return new Promise((resolve,reject) => {

        try {

            const authHeader = req.get('Authorization').split(' ')[1];
            const token = authHeader;
            const decodedToken = jwt.verify(token,process.env.KEY);
            const idemisor = decodedToken.id;
            const idusuario = decodedToken.uid;
            const { factura, ordenes, objOrdenes } = req.body;
            const fecha_factura = fecha();

            let { id,idcliente, condicion_venta, medio_pago, porcentaje_descuento_total, num_documento,monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos,notas,plazo_credito  } = factura;
            let idfactura = id;
            
            FacturaDetalle.eliminarLineasProforma(idfactura).then(responseLineasEliminadas => {
                const {affectedRows} = responseLineasEliminadas;

                if(affectedRows > 0){

                    Factura.actualizarProforma({ id,idusuario,idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, num_documento,porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos,notas,plazo_credito }).then(responseProforma => {
                    
                        const {affectedRows } = responseProforma;

                        if(affectedRows > 0){

                            let i = 0;
                            let o = 0;
                            for (const id in ordenes) {

                                o++;
                                ordenes[id].idfactura = idfactura;
                                ordenes[id].numerodocumento = o;
                                ordenes[id].tipo_factura = tipo_factura;
                                FacturaDetalle.insertarDetalle(ordenes[id])
                                    .then(response => {
                                    
                                    const { affectedRows } = response;
                                    if (affectedRows > 0) {
                                        i++;
                                        if (i == ordenes.length) {
                                            const objJSON = {
                                                id: idfactura,
                                                json: JSON.stringify(objOrdenes),
                                                tipo_factura
                                            }

                                            OBJ.guardarJSON(JSON.stringify(objJSON)).then(data => {
                                                const { affectedRows } = data;

                                                ClienteController.innhabilitarEstadoAutorizado({idcliente,idemisor}).then(estadoAutorizado => {
                                                    if(parseInt(estadoAutorizado.affectedRows === 0)){
                                                        reject('No se pudo actualizar el estado autorizado del cliente');
                                                    } else {
                                                        resolve({idfactura});
                                                    }
                                                }).catch(err =>{
                                                    reject('Ocurrió un error al actualizar el estado autorizado del cliente');
                                                }) 
                                                //resolve({idfactura});
                                            })
                                        }   
                                    }
                                })
                            }

                        } else  {
                            console.log("No se pudo actualizar la proforma")
                            reject("No se pudo actualizar la proforma");
                        }
                    })
                } else {
                    console.log("eror al actualizar la proforma")
                    reject('No se pudo actualizar la información de los detalles de la proforma');
                }
            })          

        } catch(error) {
            console.log(err);
            reject('Ha ocurrido un error en el servidor');
        }
    })

     //let datetimenow = Date.now();
            //const fechaEmision = moment(datetimenow).toISOString(true);
            /*
            const respuesta = await Factura.actualizarProforma({ id,idusuario,idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, num_documento,porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos });

            const {affectedRows } = respuesta;
            
            
                const authHeader = req.get('Authorization').split(' ')[1];
                const token = authHeader;
                const decodedToken = jwt.verify(token,process.env.KEY);
                const idemisor = decodedToken.id;
                const idusuario = decodedToken.uid;
                const { factura, ordenes, objOrdenes } = req.body;
                const fecha_factura = fecha();

                console.log(factura);
            
            */
}

exports.obtenerProforma = (req,res) => {
    
    const {idfactura } = req.body;
    
    if(typeof idfactura === 'number'){

        Factura.obtenerDatosFacturaProforma(idfactura).then( datosFactura => {

            if(datosFactura.length > 0){
                FacturaDetalle.obtenerOrdenesProforma(idfactura).then(datosOrdenes => {
            
                    return res.status(200).json({
                        factura: datosFactura[0],
                        lineas : datosOrdenes
                    });
                }).catch(err =>  {
                    console.log(err);
                    res.status(500).json({
                        message: 'Hubo un error en el servidor'
                    })
                })
            } else {
                return res.status(400).json({
                    message: 'No se pudo obtener la información de la proforma'
                })
            }
    
        }).catch(err =>  {
            console.log(err);
            res.status(500).json({
                message: 'Hubo un error en el servidor'
            })
        })
    } else {
        return res.status(400).json({
            message: 'El parámetro id no es válido'
        })
    }
}


exports.eliminarLineasTemporalPorId = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const {id} = req.params;

    FacturaDetalle.eliminarLineasTemporalesPorId({idemisor,idusuario,id})
        .then(({affectedRows}) =>{

            if(affectedRows === 0){
                return res.status(400).json({
                    message: 'No se pudo eliminar la linea'
                })
            } else {
                return res.status(200).json({
                    message: 'linea eliminada'
                })
            }
        })
        .catch(err => {
            console.log(err);    
            return res.status(500).json({
                message: 'Error al eliminar la linea'
            })
        });

}

//--------------------------------------------------------------
exports.eliminarLineasTemporales = async (req,res) => {

    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const numeroLineas = await FacturaDetalle.obtenerLineasTemporalesPorEmisorYAgente({idemisor,idusuario});
        
        if(numeroLineas.length > 0) {
            const affectedRows = await FacturaDetalle.eliminarLineasTemporales({idemisor,idusuario})
            if(affectedRows === 0) {
                console.log("No se eliminaron las lineas");
                return res.status(400).json({
                    message: 'No se pudieron eliminar las líneas'
                })
            }
            else {
                console.log("se eliminaron las lineas");
                return res.status(204).json();
            }
        } else {
            console.log("No hay lineas para eliminar")
            return res.status(204).json();
        }
        
    } catch (error) {
        console.log(err);    
        return res.status(500).json({
            message: 'Error al eliminar las lineas'
        })
    }
}

//--------------------------------------------------

exports.obtenerCorreoCliente = (req,res) => {
    const {id,tipo_factura } = req.params;

    obtenerCorreo(id,tipo_factura).then(response => {
        console.log(id,tipo_factura);
        if(response.length === 0){
            res.status(200).json({
                correo: ''
            })
        } else {
            res.status(200).json({
                correo: response[0].cliente_correo
            })
        }
    }).catch(err => {
        console.log(err);    
        res.status(500).json({message: 'No se pudo obtener el correo del cliente'});
    });
}


exports.obtenerFacturasOTiquetesAceptados = async (req, res) => {

    
    try {

        console.log(req.body);
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const {tipoDocumento, clave, consecutivo, fechaInicio, fechaFin} = req.body;

        const encabezados = await Factura.buscarFacturasOTiquetesAceptados(
            {tipoDocumento, clave, consecutivo, fechaInicio, fechaFin,idemisor}
        )

        const totales = await Factura.sumatoriaDeFacturasAgrupadasPorMoneda(
            {tipoDocumento, clave, consecutivo, fechaInicio, fechaFin,idemisor}
        )

        res.status(200).json({
            facturas: {
                encabezados,
                totales
            }
        })

    } catch(err){   
        res.status(500).json({
            message: 'Error al obtener las facturas'
        })
    }
}

//--------------------------------------Factura por tipo de pago--------------------

exports.obtenerFacturasPorMedioPago = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {medio_pago, fechaInicio, fechaFin} = req.body;

        const response = await Factura.buscarFacturasPorFormaDePago({medio_pago,idemisor, fechaInicio, fechaFin});
        const totales = await Factura.obtenerTotalesAgrupadosPorMedioPago({medio_pago,idemisor, fechaInicio, fechaFin});
    
        res.status(200).json({
            facturas: response,
            totales
        })
    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Ha ocurrido un error en el servidor'
        })     
    }
}

//-----------------------------------------------------------------------------------

exports.obtenerFacturasOTiquetesPorProducto = async (req,res) => {
   
    try {
         
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio,fechaFin,producto} = req.body;

        const response = await Factura.buscarFacturasPorProductosVendidos({
            fechaInicio,fechaFin,producto, idemisor 
        })

        const totales = await Factura.agruparTotalesFacturaPorProducto({
            fechaInicio,fechaFin,producto, idemisor 
        });

        for (let total of totales) {
       
            total.totalventa = Number(total.totalExonerado) + Number(total.totalexentos) + Number(total.totalgravado);
            total.totalventaneta = Number(total.totalventa) - Number(total.totaldescuentos)
        }

        console.log(totales);

        return;

        res.status(200).json({
            facturas: response,
            totales
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: 'Hubo un error'
        })
    }
}

exports.obtenerFacturasPorCliente = async (req, res) => {
   try {
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const {fechaInicio,fechaFin,cliente} = req.body;


        const response = await Factura.obtenerFacturasPorCliente({fechaInicio,fechaFin,cliente, idemisor})
        const totales = await Factura.obtenerTotalesAceptadosDeClientes({fechaInicio,fechaFin,cliente, idemisor});
            console.log(totales)
        res.status(200).json({
            facturas: response,
            totales
        })

   } catch (error) {
       console.log(error);
        res.status(500).json({
            error: 'Hubo un error en el servidor'
        })   
   }
}


exports.anularFacturaPorClave = (clave) => {
    return Factura.actualizarEstadoAnuladoPorClavenumerica(clave)
}

exports.cargarLineasTemporales = (req,res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const {id,uid} = decodedToken;

    FacturaDetalle.obtenerLineasTemporalesPorEmisorYAgente({idemisor: id, idusuario: uid})
        .then(response => res.status(200).json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar las lineas del comprobante'
            });
        })
}

const crearPDF = (texto, id,altura) => {
    return new Promise((resolve, reject) => {
        const ruta = 'pdf/' + id + '.pdf';
        consulta.generarPDFDeComprobante(texto, ruta,altura)
            .then(data => {
                resolve(data);
            })
            .catch(err => reject(err));
    })
}

exports.tipoCedula = (req, res) => {
    try {
        const tipoCedula = TipoCedula();

        res.status(200).json({
            tipoCedula
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un erorr en el servidor'
        })
    }
}

exports.obtenerEstadoFinalFactura = (req, res) => {
    const {id} = req.params;

    if(typeof id === 'undefined' && id == '') {
        return res.status(400).json({
            message: 'El id es necesario'
        })
    } else {
        console.log(id);
    }
}

exports.buscarFacturasOTiquetesAceptadosReported151 = (obj) => {

    return Factura.buscarFacturasOTiquetesAceptadosReported151(obj);
}

exports.obtenerTipoCambioFacturasParaActualizar = () => {
    
    return Factura.obtenerTipoCambioFacturasParaActualizar();
} 

exports.actualizarTipoCambio = (obj) => {
    
    return Factura.actualizarTipoCambio(obj);
} 

exports.obtenerTotalesFacturasAgrupadosPorTipoImpuestoPorLinea = async (req,res) => {

    try {
          
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio,fechaFin} = req.body;
        
        let descripcion= '';
        let subtotal= 0;
        let impMercancias= 0;
        let impServicios= 0;
        let subMercancias= 0;
        let subServicios= 0;
        let porcentaje =0;
        let objResumen = {
            descripcion: '',
            subtotal: 0,
            impMercancias: 0,
            impServicios: 0,
            subMercancias: 0,
            subServicios: 0,
        }

        let resumen = [];
        
        const totalesLineasMercancias = await Factura.obtenerSumatoriaLineasPorTarifaMercancias({fechaInicio,fechaFin,idemisor});
        const totalesLineasServicios = await Factura.obtenerSumatoriaLineasPorTarifaServicios({fechaInicio,fechaFin,idemisor});
        let totalesFacturas = await Factura.obtenerSubtotalesFactura({fechaInicio,fechaFin,idemisor});

        for(const totalMerc of totalesLineasMercancias){
            
            resumen.push({
                impMercancias :totalMerc.impuesto_neto,
                subMercancias :totalMerc.subtotal,
                descripcion :totalMerc.descripcion,
                porcentaje_impuesto: totalMerc.porcentaje_impuesto
            });
        }


        for(const totalServ of totalesLineasServicios){
            for(const res of resumen){

                if(totalServ.descripcion == res.descripcion){

                    res.subServicios = totalServ.subtotal;  
                    res.impServicios = totalServ.porcentaje_impuesto == 0 ? 0 :Number(res.subServicios / 100 * Number(totalServ.porcentaje_impuesto)).toFixed(2);                    
                    res.impMercancias = totalServ.porcentaje_impuesto == 0 ? 0 :Number(res.subMercancias / 100 * Number(totalServ.porcentaje_impuesto)).toFixed(2);
                }
            }
        }

        for(const total of totalesFacturas){
            for(const res of resumen){

                if(total.porcentaje_impuesto == res.porcentaje_impuesto){
                    res.subtotal = total.subtotal;
                }
            }
        }

        for(let res of resumen){
            subtotal+= Number(res.subtotal);
            impMercancias+= Number(res.impMercancias);
            impServicios+= Number(res.impServicios);
            subMercancias+= Number(res.subMercancias);
            subServicios+= Number(res.subServicios);
        }

        objResumen.impMercancias = Number(impMercancias).toFixed(2);
        objResumen.subMercancias = Number(subMercancias).toFixed(2);
        objResumen.impServicios = Number(impServicios).toFixed(2);
        objResumen.subServicios = Number(subServicios).toFixed(2);
        objResumen.subtotal = Number(subtotal).toFixed(2);

        //console.log("resumen ",resumen);

      /*let totalesLineas = await Factura.obtenerTotalesPorLineasAgrupadosPorMercanciasYServicios({fechaInicio,fechaFin,idemisor});
        let totalesFacturas = await Factura.obtenerSubtotalesFactura({fechaInicio,fechaFin,idemisor});
        
        let index =0;
        for(let total of totalesFacturas){
         
            let tarifaFactura = total.porcentaje_impuesto;   
            let opcioneslength = totalesLineas.filter(linea => linea.porcentaje_impuesto == tarifaFactura).length;         
            
            for(let totalLinea of totalesLineas){
                
                if(Number(tarifaFactura) === Number(totalLinea.porcentaje_impuesto)){
                    
                    subtotal = total.subtotal;
                    descripcion = totalLinea.descripcion;
                    porcentaje =  Number(total.porcentaje_impuesto);
                    if(totalLinea.codigo_servicio && totalLinea.codigo_servicio == 'Mercancía'){
                        impMercancias = totalLinea.impuesto_neto;
                        subMercancias = totalLinea.subtotal;
                    }
                    
                    if(totalLinea.codigo_servicio && totalLinea.codigo_servicio == 'Servicio'){
                        subtotal = totalLinea.impuesto_neto;
                        subServicios = totalLinea.subtotal;                         
                    }

                    opcioneslength--;

                    if(opcioneslength === 0){  
                        resumen[index].subtotal = subtotal;
                        resumen[index].descripcion = descripcion;
                        resumen[index].impMercancias =  porcentaje == 0 ? Number(subMercancias).toFixed(2) : 
                            Number(subMercancias / 100 * Number(porcentaje)).toFixed(2);
                        resumen[index].subMercancias = subMercancias;
                        resumen[index].impServicios = porcentaje == 0 ? Number(subServicios).toFixed(2): 
                            Number(subServicios / 100 * Number(porcentaje)).toFixed(2);
                        resumen[index].subServicios = subServicios;
                        resumen[index].porcentaje = porcentaje;
                    }
                }
            } 
               
            index++;
        }

        subtotal= 0;
        impMercancias= 0;
        impServicios= 0;
        subMercancias= 0;
        subServicios= 0;

   
        for(let totalLinea of totalesLineas){
            console.log(totalLinea);
           if(totalLinea.codigo_servicio && totalLinea.codigo_servicio == 'Mercancía'){
                impMercancias += Number(totalLinea.impuesto_neto);
                subMercancias += Number(totalLinea.subtotal);
                subtotal+= Number(totalLinea.subtotal);
            }
        
            if(totalLinea.codigo_servicio && totalLinea.codigo_servicio == 'Servicio'){
                impServicios += Number(totalLinea.impuesto_neto);
                subServicios += Number(totalLinea.subtotal);
                subtotal+= Number(totalLinea.subtotal);                         
            }
        }
        
        objResumen.impMercancias = Number(impMercancias).toFixed(2);
        objResumen.subMercancias = Number(subMercancias).toFixed(2);
        objResumen.impServicios = Number(impServicios).toFixed(2);
        objResumen.subServicios = Number(subServicios).toFixed(2);
        objResumen.subtotal = Number(subtotal).toFixed(2);
        console.log(objResumen);*/
        resumen.sort(((a,b) => a.porcentaje_impuesto - b.porcentaje_impuesto)); // ordenar array de objetos por porcentaje impuesto

       res.status(200).json({resumen,totales: objResumen});
    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Hubo un error al cargar la informacion del reporte'
        })
    }
}

exports.agregarLineasTemporales = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const {idproducto, precio_linea, 
        cantidad, descripcioDetalle, porcentajedescuento, 
        montodescuento, naturalezadescuento, numerolineadetalle, 
        subtotal, montototal, codigo, codigo_tarifa, 
        tarifa, monto, baseimponible, impuesto_neto, SinDescu,
        numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos, 
        PorcentajeExonerado,idlinea,idcliente } = req.body;

    FacturaDetalle.insertarLineaTemporal({ 
        idemisor,idusuario, idproducto, precio_linea, 
        cantidad, descripcioDetalle, porcentajedescuento, 
        montodescuento, naturalezadescuento, numerolineadetalle, 
        subtotal, montototal, codigo, codigo_tarifa, 
        tarifa, monto, baseimponible, impuesto_neto, SinDescu,
        numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos, 
        PorcentajeExonerado,idlinea,idcliente 
    }).then(({affectedRows}) => {
        if(affectedRows > 0){
            res.status(201).json({
                message: 'Linea agregada'
            })
        } else {
            res.status(400).json({
                message: 'No se pudo agregar la linea'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar la linea'
        });
    })
}

exports.eliminarFacturas = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const {numeroInternoInicio,numeroInternoFin} = req.query;
        const esSuperUsuaurio = await UsuarioController.esSuperUsuario({idemisor,idusuario});
        
        if(esSuperUsuaurio[0].descripcion !== 'superusuario'){
            return res.status(401).json({
                message: 'Usted no esta autorizado para ejecutar esta accion'
            });
        } 
        else {
            
            const lineasEliminadas = await FacturaDetalle.eliminarLineasFacturaYXml({numeroInternoInicio,numeroInternoFin,idemisor})
            const facturasEliminadas = await Factura.eliminarFacturas({numeroInternoInicio,numeroInternoFin,idemisor});
            
            if(
                numeroInternoInicio && numeroInternoInicio.toString() !== '' 
                && numeroInternoFin && numeroInternoFin.toString() !== '' 
            ){
                console.log(lineasEliminadas);
                if(lineasEliminadas.affectedRows === 0){
                    return res.status(400).json({
                        message: 'No hay facturas en ese rango de numeros internos'
                    })
                }
                if(facturasEliminadas.affectedRows === 0){
                    return  res.status(400).json({
                        message: 'No hay facturas en ese rango de numeros internos'
                    })
                }
            } else {
                console.log(lineasEliminadas);
                if(lineasEliminadas.affectedRows === 0){
                    return res.status(400).json({
                        message: 'No se encontraron facturas'
                    })
                }
                console.log(facturasEliminadas);
                if(facturasEliminadas.affectedRows === 0){
                    return  res.status(400).json({
                        message: 'No se encontraron facturas'
                    })
                }
            }
            return res.status(200).json({
                message: 'Las facturas han sido eliminadas'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Hubo un error al eliminar las facturas'
        })
    }
}

const enviarCorreo = (obj) => {

    return new Promise((resolve, reject) => {
        console.log("objeto de datos para enviar el correo", obj);
        const { correoEmisor, correoReceptor, nombrePDF } = obj;
        const ruta = 'pdf/' + nombrePDF + '.pdf';
        email.enviarCorreo(correoEmisor, correoReceptor, '', '', nombrePDF, ruta)
            .then(response => {
                console.log(response)
                resolve(response);
            })
            .catch(err => reject(err));
    })
}

const obtenerCorreo = (idfactura,tipo_factura) => {
    return Factura.obtenerCorreoCliente(idfactura,tipo_factura);
}

const descargar = (archivo, res) => {
    return new Promise((resolve, reject) => {

        res.download(path.join(__dirname, archivo), (err) => { // el archivo se descarga
            if (err) {
                console.log(err);
                return reject(err)
            };
            return resolve(true);

        })
    })
}

exports.procesarComprobanteElectronico = (req,res) => {

    let { factura, ordenes, objOrdenes } = req.body;
    let { idcliente, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas,plazo_credito,medio_pago2,idbodega } = factura; 

    const fecha_factura = fecha();
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const permiso = decodedToken.permiso;

   
    Factura.obtenerUltimoIdInsertado(idemisor).then((response) => {
        
        const idfactura = response[0].id;
        const objJSON = {
            id: idfactura,
            json: JSON.stringify(objOrdenes),
            tipo_factura
        }
        ;
        OBJ.guardarJSON(JSON.stringify(objJSON)).then(data => {
      
            const { affectedRows } = data;
            if (affectedRows > 0) {
    
                const data = {
                    idfactura,
                    tipo_factura
                }
                
                console.log("data ", data);
                Factura.obtenerDatosFactura(data)
                    .then(dataFactura => {
                        console.log("lineas",{
                            tipo: tipo_factura,
                            idfactura,
                            idemisor: idemisor
                        })
                        FacturaDetalle.obtenerOrdenesPorFactura({
                            tipo: tipo_factura,
                            idfactura,
                            idemisor: idemisor
                        })
                            .then(dataOrdenes => {
    
                                const { tipo_factura, key_username_hacienda, key_password_hacienda, TOKEN_API, Client_ID,file_p12,pin_p12 } = dataFactura[0];
    
                                FA.crearXML(dataFactura[0], dataOrdenes, tipo_factura, file_p12,pin_p12, idfactura)
                                    .then(response => {
    
                                        
    
                                        
                                        const xmlFirmado = response;
                                        const userAgent = req.headers["user-agent"];
                                        const objToken = {
                                            userHacienda: key_username_hacienda,
                                            passHacienda: key_password_hacienda,
                                            TOKEN_API,
                                            Client_ID,
                                            userAgent,
                                        }
    
                                        let tipoIdentificacion = ''
                                        let numeroCliente = ''
                                        if (dataFactura[0].datosCliente != null) {
                                            tipoIdentificacion = dataFactura[0].datosCliente.cliente_tipo_identificacion;
                                            numeroCliente = dataFactura[0].datosCliente.cedula_cliente;
                                        } else {
                                            tipoIdentificacion = null;
                                            numeroCliente = null;
                                        }
    
                                        const objSendComprobante = {
                                            "clave": dataFactura[0].clavenumerica,
                                            "fecha": dataFactura[0].fecha_factura,
                                            "emisor": {
                                                "tipoIdentificacion": dataFactura[0].emisor_tipo_identificacion,
                                                "numeroIdentificacion": dataFactura[0].numero_emisor
                                            },
                                            "receptor": {
                                                "tipoIdentificacion": tipoIdentificacion,
                                                "numeroIdentificacion": numeroCliente
                                            },
                                            "comprobanteXml": xmlFirmado,
                                            "API": dataFactura[0].API,
                                            userAgent,
                                        }
    
                                        const objData = {
                                            objToken,
                                            objSendComprobante
                                        }
    
                                        FA.enviarDoc(objData)
                                            .then(response => {
                                                const { codigo, token } = response;
    
                                                if (codigo === 202) {
                                                    FA.obtenerEstadoComprobante(dataFactura[0].clavenumerica, token, dataFactura[0].API, userAgent, idfactura,tipo_factura).then(data => {
                                                            console.log("data final ",data);
                                                            if(tipo_factura == '01'){ //FACTURA ELECTRONICA
                                                                if(data == 'rechazado'){
                                                                    const obj = {
                                                                        tipo_factura,
                                                                        clave: dataFactura[0].clavenumerica,
                                                                        status: data,
                                                                        idemisor
                                                                    }
    
                                                                    console.log("obj actualizar estado ",obj);
                                                                    actualizarEstado(obj)
                                                                        .then(  data => {
                                                                            console.log("Comprobante generado")
                                                                            res.status(200).json({ mesasage: 'Comprobante generado'});
                                                                    })
                                                                } if(data == 'aceptado') {                                                                    
                                                                    const obj = {
                                                                        tipo_factura,
                                                                        clave: dataFactura[0].clavenumerica,
                                                                        status: data,
                                                                        idemisor
                                                                    }
    
                                                                    actualizarEstado(obj)
                                                                        .then( async data => {
                                                                            //enviar el correeo
                                                                            res.status(204).json();
                                                                            /*

                                                                            const obj = {
                                                                                tipo: tipo_factura,
                                                                                id: idfactura,
                                                                                idemisor
                                                                            }

                                                                            encabezadoReporteFactura(obj)
                                                                                .then(facturaRespone => {
                                                                                    console.log("respopnse ", facturaRespone);
                                                                                    const obj = {
                                                                                        tipo: tipo_factura,
                                                                                        idfactura
                                                                                    }
                                                                                    FacturaDetalle.obtenerOrdenesPorFactura(obj)
                                                                                        .then(lineasResponse => {
                                                                                            const cliente = dataFactura[0].datosCliente;
                                                                                            
                                                                                            //arrayCorreo.push();                                                                                    
                                                                                            generarReportePdf(facturaRespone[0], lineasResponse, '02', res, cliente.cliente_correo+','.toString(),idemisor);
                                                                                        })
                                                                                        .catch(err => {
                                                                                            console.log(err);
                                                                                            res.status(500).json({ err })});
                                                                                })
                                                                                .catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(500).json({ err })
                                                                                });
                                                                            */

                                                                        })
                                                                        .catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).json(err)}) 
                                                                }
                                                            } 
                                                            else if(tipo_factura == '04') { // TIQUETE ELECTRONICO
                                                                const obj = {
                                                                    tipo_factura,
                                                                    clave: dataFactura[0].clavenumerica,
                                                                    status: data
                                                                }
                                                                
                                                                console.log("obj actualizar estado ",obj);
    
                                                                actualizarEstado(obj)
                                                                    .then(  data => {
                                                                        res.status(204).json();
                                                                })
                                                            }
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                            res.status(200).json({ mesasage: 'Comprobante generado'});
                                                            //res.status(500).json(err)
                                                        });
                                                }
    
                                            })
                                            .catch(err => {
                                                console.log(err);
    
                                                if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                                    Emisor.actualizarEstado({estado: 2,idemisor}).then(response => {
                                                        if(response.affectedRows > 0) {
                                                            console.log("estado emisor actualizado")
                                                        } else {
                                                            console.log("No se pudo actualizar el estado del emisor")
                                                        }
                                                    }) .catch(err => console.log(err));
                                                }
                                                res.status(500).json({
                                                    err
                                                })
                                            })
                                    })
                                    .catch(err => {
                                        console.log("error de firmado de facturas", err);
                                        res.status(500).json({
                                            err
                                        })
                                    })
                            }).catch(err => {
                                console.log("ERROR DESDE NUEVA Factura ",err)
                                res.status(500).json({
                                    err
                                })
                            })
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            err
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            err: 'No se pudo obtener la informacion de la factura generada'
                        })
                    })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ err: 'Error al insertar el objeto JSON' })
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({ err: 'Error procesar el comprobante' })
    }) 
}

exports.descargarReporteFacturaPDF = async (req,res) => {

    try {
        
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        //const {idfactura} = req.params;
        let ruta = __dirname +'/../pdf/';
    
        const dataFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
        const factura = await Factura.encabezadoReporteFactura({id: dataFactura[0].id, tipo: dataFactura[0].tipo_factura, idemisor});
        const lineas = await FacturaDetalle.obtenerOrdenesPorFactura({ idfactura: dataFactura[0].id, tipo: dataFactura[0].tipo_factura,idemisor });
        const response = await Emisor.obtenerTipoReporte(idemisor);
        ruta += factura[0].num_documento + '.pdf';

        //if(factura[0].tipo_factura == '04') factura[0].tipo_factura = 'Tiquete Electrónico';
        //else if(factura[0].tipo_factura == '01') factura[0].tipo_factura = 'Factura Electrónica';

        let reporteFactura = '';
        const idfactura = dataFactura[0].id;

        if(response[0] && response[0].pos == 1) {
            if(factura[0].datosCliente) {
                reporteFactura = await consulta.crearReporteConReceptor(lineas,factura[0])
            }else {
                reporteFactura = await consulta.crearReporteSinReceptor(lineas,factura[0])
            }
            
            console.log("reporte", reporteFactura);
    
            let  altura = (lineas.length) * 5;
    
            if(factura[0].notas_emisor && factura[0].notas_emisor.length > 0) {
                altura+= 20;
            }
            
            await consulta.generarPDFDeComprobantePOS(reporteFactura,ruta,altura);
            return res.download(ruta); 
        } else {

            if(factura[0].datosCliente) {
                reporteFactura = await consulta.crearReporteConReceptor(lineas,factura[0])
            }else {
                reporteFactura = await consulta.crearReporteSinReceptor(lineas,factura[0])
            }
            
            console.log("reporte", reporteFactura);
    
            let  altura = (lineas.length) * 5;
    
            if(factura[0].notas_emisor && factura[0].notas_emisor.length > 0) {
                altura+= 20;
            }
            
            await consulta.generarPDFDeComprobante(reporteFactura,ruta,altura);
            return res.download(ruta); 
        }

        /*if(factura[0].datosCliente){
                        
            const pdf = datosFactura[0].num_documento+'.pdf';
            const correo = datosFactura[0].datosReceptor.correo;
            email.enviarCorreo('','','','','','',ruta,pdf,correo).then(emailResponse => {
                console.log(emailResponse);
            })
            .catch(err => {
                console.log(err);
            })

            // ---- GENERAR EL REPORTE QUE SE VA ENVIAR POR CORREO
            //id, tipo, idemisor
            
            const obj = {
                tipo: '01',
                id: idfactura,
                idemisor
            }
    
            
            const correo =factura[0].datosCliente.cliente_correo;
            const pdf =factura[0].num_documento+'.pdf';
            const nombreEmisor = (factura[0].emisor_nombrecomercial) ? factura[0].emisor_nombrecomercial : factura[0].emisor_nombre;

            console.log("Emisor ",nombreEmisor);
            const emailResponse = await email.enviarCorreo('','','','','','',ruta,pdf,correo,factura[0].status_factura,nombreEmisor);

            console.log({emailResponse});
            
        } */
    } catch(err) {

        console.log(err);
        res.status(500).json({
            message: 'Error al descargar el reporte'
        })
    }
    
}

/*const descargar = (obj, res) => {
    const source = fs.createReadStream('./xml/' + listaArchivos[1].nombre);
    const dest = fs.createWriteStream('/path/to/dest');

    source.pipe(dest);
    source.on('end', function() { });
    source.on('error', function(err) {  });

    //crear los archivos en las carpetas respectivas y una que se llama documento, luego comprimir la carpeta y descargar
    //https://stackoverflow.com/questions/52501072/how-to-download-zip-folder-from-node-js-server
    //https://www.iteramos.com/pregunta/57084/como-puedo-mover-archivos-en-nodejs
}*/

/*
    parametros de conexion al servidor de sql server
    server : 201.191.122.55
    login: sql
    pass: sql
    //Take That - Back for Good 
    server type: DATABASE ENGINE
    instalar sql server managment 2014 
    backup desde consola MYSQL
    mysqldump --user=root --password=Nvm231191--@ SisFac> bd.sql
*/

/*const existeImpuesto = (objCodigos,indice, objReporte) => {
    
    if(indice == objCodigos.length - 1){
    
      return arrayReporte;

    } else {
      if(objCodigos[indice].codigo_impuesto == objResumen.codigo_impuesto){
        objResumen.codigo_impuesto = objCodigos[indice].descripcion
      } 

      indice++;
      return existeImpuesto(objResumen,indice, arrayReporte,existe,arrayReporte);
    }
}*/