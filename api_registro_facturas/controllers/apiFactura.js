const Factura = require("../../models/Factura");
const FacturaDetalle = require("../../models/FacturaDetalle");
const Cliente = require("../../models/Cliente");
const FA = require("../../functions/FacturaElectronica")
//const {obtenerTipoCambioActual} = require('../../models/TipoCambio');
const FuncionesFactura = require("../../functions/Factura");
//const fecha = require("../../db/fecha");
const xml = require("../../functions/Xml");
const Bodega = require("../../models/Bodega");
const UsuarioController = require('../../controllers/UsuariosController');
const { existeEmisor } = require("../../controllers/EmisorController");
const { obtenerIdClientePorCedula, nuevoCliente } = require("../../controllers/ClienteController");
const { obtenerIdPorCodigoBarra,nuevoProductoMetodo } = require("../../controllers/ProductosController");
const { obtenerImpuestoPorCodigo, obtenerImpuestoExento } = require("../../controllers/TipoImpuestoController");
const { nuevaCategoria,obtenerCategoriaPorCodigoCabys } = require("../../controllers/CategoriasController");
const UnidadesMedidaServicios = ['Al', 'Alc', 'Cm', 'I', 'Os', 'Sp', 'Spe', 'St', 'd', 'h', 's'];
const consulta = require("../../functions/consulta");
const { NULL } = require("mysql2/lib/constants/types");

//const RecetaController = require("../../controllers/RecetaController");
//const ExistenciaController = require("../../controllers/ExistenciaController");
//const Articulo = require("../../models/Articulo");


const agregarFactura = async (req,res) => {

    try {
        
        const {body: {detalles, factura}} = req;
        let { num_documento,condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, fecha_emision,
            totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, 
            totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta,
             totalimpuesto, totalcomprobante, codigomoneda, tipo_factura, otrosCargos, notas,plazo_credito,idemisor,cliente,tipocambio,TipodocRef,NumeroRef,FechaRef,CodigoRef,RazonRef
        } = factura;

        const fecha_factura = fecha_emision;
        let idcliente = null;
        let responseBUsquedaCliente = null;
        let responseFactura = null;
        let idfactura = null;
        let existenum = 0;

         ///AGREGA X SYN REVISION SI YA EXISTE DOCUMENTO 
        const existeDOC = await Factura.obtenerFacturaPordocumento({idemisor,num_documento});
        if(existeDOC[0]){claveN=existeDOC[0].clavenumerica}
        if(existeDOC[0]) return res.status(404).json({
            message: 'El DOCUMENTO '+num_documento+' con clave ' +claveN+ ' ya existe, revise por favor'
        })
      /*Factura.obtenerFacturaPordocumento({idemisor,num_documento}).then(factura => {*/
        
  
    //FIN AGREGA SYN
    
        const existe = await existeEmisor(idemisor);

        if(!existe[0]) return res.status(404).json({
            message: 'El idemisor '+idemisor+' no está asociado a ningún emisor registrado'
        })
    
        const responseUsuario = await UsuarioController.obtenerSuperUsuarioPorIdEmisor(idemisor);
        const idusuario = responseUsuario[0].id; //hkjkh   

        if(!cliente) {
            idcliente = '1';
        } else {
            responseBUsquedaCliente = await obtenerIdClientePorCedula(idemisor,cliente.cedula.trim());

            if(!responseBUsquedaCliente[0]) {
                
                let nuevoClienteObj = { };

                //crear el nuevo Cliente
                if(cliente.cedula.trim().length === 9) {
                    
                    nuevoClienteObj.cliente_tipo_identificacion = '01';
                    nuevoClienteObj.numero_cliente = '000' + cliente.cedula.trim();
                    nuevoClienteObj.cedula_cliente = cliente.cedula.trim();

                } else if(cliente.cedula.trim().length === 10){
                    
                    nuevoClienteObj.cliente_tipo_identificacion = '02';
                    nuevoClienteObj.numero_cliente = '00' + cliente.cedula.trim();
                    nuevoClienteObj.cedula_cliente = cliente.cedula.trim();

                } else if(cliente.cedula.trim().length === 11){
                    
                    nuevoClienteObj.cliente_tipo_identificacion = '03';
                    nuevoClienteObj.numero_cliente = '0' + cliente.cedula.trim();
                    nuevoClienteObj.cedula_cliente = cliente.cedula.trim();

                } else if(cliente.cedula.trim().length === 12){

                    nuevoClienteObj.cliente_tipo_identificacion = '04';
                    nuevoClienteObj.numero_cliente =  cliente.cedula.trim();
                    nuevoClienteObj.cedula_cliente = cliente.cedula.trim();   
               
                }

                nuevoClienteObj.cliente_barrio = '1010101';
                nuevoClienteObj.cliente_nombre = cliente.nombre;
                nuevoClienteObj.IdentificacionExtranjero = '';
                nuevoClienteObj.cliente_nombre_comercial = '';
                nuevoClienteObj.otras_senas = 'Señas'
                nuevoClienteObj.otrasotras_senas_extranjero_senas = '';
                nuevoClienteObj.cliente_telefono_codigopais = '';
                nuevoClienteObj.cliente_telefono_numtelefono = '';
                nuevoClienteObj.cliente_fax_codigopais = '';
                nuevoClienteObj.cliente_fax_numtelefono = '';
                nuevoClienteObj.plazo_credito = 0;
                nuevoClienteObj.descuento = 0;
                nuevoClienteObj.idemisor = idemisor;
                nuevoClienteObj.cliente_correo = cliente.correo;
                nuevoClienteObj.tipoExoneracion= cliente.tipoExoneracion;
                nuevoClienteObj.porcentajeExoneracion= cliente.porcentajeExoneracion;
                nuevoClienteObj.NombreInstitucion= cliente.NombreInstitucion;
                nuevoClienteObj.documentoExoneracion= cliente.documentoExoneracion;
                nuevoClienteObj.fechaEmision= cliente.fechaEmision;
               // console.log(cliente); return;
                const nuevoClienteResponse = await nuevoCliente(nuevoClienteObj)

                if(nuevoClienteResponse.affectedRows > 0) {

                    idcliente = nuevoClienteResponse.insertId;

                } else {

                    return res.status(400).json({
                        message: 'No se pudo agregar el cliente'
                    })
                }

            } else  {
                idcliente = responseBUsquedaCliente[0].id;
                //CAMBIO SYN    
                correo = cliente.correo;
                Cliente.actualizarcorreo({ idcliente, idemisor, correo }).then(response => {
                    const { affectedRows } = response;
            
                    /*if (affectedRows > 0) {
                        return res.status(200).json({ ok: true, message: 'Corrreo actualizado' });
                    } else {
                        return res.status(404).json({ message: 'No se actualizó el correo del cliente' });
                    }*/
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error al actualizar el correo del cliente'
                        })
                    });

            // fin cambio SyN
            }
        }

        if((tipo_factura == '01' || tipo_factura == '04') && existenum == 0 ) {
            const idbodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
            //CAMBIO CLIENTE PANAMA
            if(factura.InformacionReferencia){
                const {InformacionReferencia:{TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef}} = factura;

                responseFactura = await Factura.nuevaFactura({ idusuario,idcliente,idbodega: idbodega[0].idbodega, idemisor, fecha_factura: fecha_emision,num_documento, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipocambio? tipocambio: 1, tipo_factura,otrosCargos,notas, TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef, plazo_credito });

            }else{
                responseFactura = await Factura.nuevaFactura({ idusuario,idcliente,idbodega: idbodega[0].idbodega, idemisor, fecha_factura: fecha_emision,num_documento, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipocambio? tipocambio: 1, tipo_factura,otrosCargos,notas, plazo_credito });
            }
        } else if(tipo_factura == '03') {
           
            const {infoReferencia:{tipoDocReferencia, NumeroReferencia, fecha_emision, codigo, razon}} = factura;
            
            responseFactura = await Factura.insertarNotaCredito({ idusuario,idcliente, idemisor, fecha_factura, num_documento,condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio: tipocambio? tipocambio: 1, tipo_factura, tipoDocReferencia, NumeroReferencia, fecha_emision, codigo, razon,TotalOtrosCargos:otrosCargos,plazo_credito });
        }

        if(responseFactura.affectedRows > 0){

            idfactura = responseFactura.insertId;
            const situacionComprobante = '00000000000000000000000000000000000000000000000000';
            const data = await FuncionesFactura.generacion_clave_numerica(situacionComprobante, tipo_factura, idfactura, idemisor)                    
            const { llave, clave } = data;
  
            const objClave = {
                clave: data.claveNumerica,
                consecutivo: data.nuevoConsecutivo,
                id: idfactura,
                num_documento:num_documento,//CAMBIO SYN
                numeroInterno: data.numeroInterno, 
                //tipo_factura: tipo_factura == '03'? tipo_factura : undefined
                tipo_factura: tipo_factura //CAMBIO SYN
            }

            const responseClave = await Factura.guardarClaveNumerica(objClave);

            if(responseClave.affectedRows === 0) {
                return res.status(400).json({message: 'Error al actualizar los consecutivos del comprobante'})
            } else {

                let indice = 1;
                console.log("pasó el if")
                for (let lineaFactura of detalles) {
                    indice++;
                    let idproducto = null;

                    
///REVISAR EL CODGO DE BARRAR O CODIGO EXTERNO
                    const existeProducto = await obtenerIdPorCodigoBarra(idemisor,lineaFactura.codigoBarraProducto.trim());

                    if(!existeProducto[0]){
                        
                        let nuevoProductoObj = {};
                        /*
                            producto
                            idemisor,descripcion,precio_producto,costo_unitario,unidad_medida,
                            unidad_medida_comercial,tipo_servicio,codigo_servicio,
                            tipo_impuesto,idcategoria,codigobarra_producto, 
                            precio_final,imagen,public_id,imagen_local
                        */

                        /*
                            linea 

                            idfactura, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, numerodocumento, montoitotallinea, tipo_factura, MontoExoneracion, idemisor,otrosCargos, PorcentajeExonerado,unidad_medida

                        */

                        let idcategoria = null;

                        const existeCategoria = await obtenerCategoriaPorCodigoCabys({idemisor,codigoCabys: lineaFactura.codigoCabys});

                        if(!existeCategoria[0]) {

                            const categoriaObj = { 
                                descripcion: `Categoría  ${lineaFactura.codigoCabys}`, 
                                codigo: '', 
                                idemisor,
                                codigocabys: lineaFactura.codigoCabys,
                                descripcioncodigo: '' 
                            }

                            const nuevaCategoriaResponse = await nuevaCategoria(categoriaObj);

                            if(nuevaCategoriaResponse.affectedRows === 0) {
                                await FacturaDetalle.eliminarLineasProforma(idfactura);
                                return res.status(404).json({
                                    message: 'No se pudo agregar las líneas de detalle'
                                })                                
                            } 

                            console.log("Categoría agregada")

                            idcategoria = nuevaCategoriaResponse.insertId;

                        } else  {
                            idcategoria = existeCategoria[0].id;
                        }

                        nuevoProductoObj.idemisor = idemisor;
                        //nuevoProductoObj.idsuperusuario = idusuario;
                        nuevoProductoObj.idcategoria = idcategoria;
                        nuevoProductoObj.descripcion = lineaFactura.descripcioDetalle;
                        nuevoProductoObj.precio_producto = lineaFactura.precio_linea;
                        nuevoProductoObj.costo_unitario = 1;
                        nuevoProductoObj.precio_final = (Number(lineaFactura.precio_linea) + Number(lineaFactura.monto)).toFixed(2);
                        
                        
                        nuevoProductoObj.codigoBarra = lineaFactura.codigoBarraProducto.trim();

                        if(!UnidadesMedidaServicios.includes(lineaFactura.unidadMedida)) {

                            nuevoProductoObj.unidad_medida = lineaFactura.unidadMedida;
                            nuevoProductoObj.unidad_medida_comercial = '';
                            nuevoProductoObj.tipo_servicio = '02';
                            nuevoProductoObj.codigo_servicio = 'Mercancía';
                        } else {

                            nuevoProductoObj.unidad_medida = lineaFactura.unidadMedida;
                            nuevoProductoObj.unidad_medida_comercial = !lineaFactura.unidadMedidaComercial ? '': lineaFactura.unidadMedidaComercial;
                            nuevoProductoObj.tipo_servicio = '01';
                            nuevoProductoObj.codigo_servicio = 'Servicio';
                        }
                        
                        let impuesto = await obtenerImpuestoPorCodigo(idemisor,lineaFactura.codigo_tarifa);
                        if(impuesto[0]) {
                            nuevoProductoObj.tipo_impuesto = impuesto[0].id;
                        } else {
                            const responseImpuesto = await obtenerImpuestoExento();
                            nuevoProductoObj.tipo_impuesto = responseImpuesto[0].id;
                        }
                        const nuevoProductoResponse = await nuevoProductoMetodo(nuevoProductoObj);

                        if(nuevoProductoResponse.affectedRows === 0) {

                            await FacturaDetalle.eliminarLineasProforma(idfactura);
                            
                            return res.status(400).json({
                                message: 'Error al insertar las líneas de detalle'
                            });

                        } else {
                            idproducto = nuevoProductoResponse.insertId;
                        }

                    } else  {

                        idproducto = existeProducto[0].id;
                    }

                    lineaFactura.idfactura = idfactura;
                    lineaFactura.tipo_factura = tipo_factura;
                    lineaFactura.numerodocumento = indice;
                    lineaFactura.idproducto = idproducto;
                    lineaFactura.impuesto_neto = lineaFactura.impuesto_neto;
                    lineaFactura.impuesto = lineaFactura.monto;
                    lineaFactura.baseimponible = 0;
                    lineaFactura.MontoExoneracion = lineaFactura.MontoExoneracion;
                    lineaFactura.PorcentajeExonerado = lineaFactura.PorcentajeExonerado;

                    delete lineaFactura.codigoCabys;

                    let lineaResponse = null; 

                    if(tipo_factura == '03') {
                        //if (lineaFactura.impuesto_neto == 'undefined') {lineaFactura.impuesto_neto=0}
                        lineaFactura.idemisor = idemisor;
                        lineaResponse = await FacturaDetalle.insertarDetalle(lineaFactura);

                        if(lineaResponse.affectedRows === 0) {
                            await FacturaDetalle.eliminarLineasProforma(idfactura);
                            return res.status(400).json({
                                message: 'Error al insertar las líneas de detalle'
                            });
                        }

                    } else {

                        lineaResponse = await FacturaDetalle.insertarDetalle(lineaFactura);

                        if(lineaResponse.affectedRows === 0) {
                            await FacturaDetalle.eliminarLineasProforma(idfactura);
                            return res.status(400).json({
                                message: 'Error al insertar las líneas de detalle'
                            });
                        }
                    } 
                }

                // llamar funcion que descargue el pdf

                const [ dataFactura,lineasFactura,existeXml] = await Promise.all([ 
                    Factura.obtenerDatosFactura({idfactura,tipo_factura}),
                    FacturaDetalle.obtenerOrdenesPorFactura({tipo: tipo_factura,idfactura,idemisor: idemisor}),
                    xml.existeXMLPorIdFactura(idfactura)
                ]);

                let url = '';
                const rutaPdf = await generarLinkPdf(dataFactura[0],lineasFactura)
                if(req.headers.host == 'localhost:5000') {
                    url = 'http://'+req.headers.host+'/'+rutaPdf;
                } else {
                    url = 'https://'+req.headers.host+'/'+rutaPdf;
                }

                res.status(201).json({
                    data: {
                        url
                    }
                })

                if(!existeXml[0]){
                    
                    console.log("xml se esta creando")
                        //obtener el encabezado y lineas de factura
                   

                    const xmlCreado = await FA.crearXML(dataFactura[0],lineasFactura,tipo_factura,llave,clave,idfactura);
                    
                    console.log("xmlCreado", xmlCreado);

                    const { key_username_hacienda, key_password_hacienda, TOKEN_API, Client_ID } = dataFactura[0];

                    const userAgent = req.headers["user-agent"];
                    const objToken = {
                        userHacienda: key_username_hacienda,
                        passHacienda: key_password_hacienda,
                        TOKEN_API,
                        Client_ID,
                        userAgent,
                    }

                    let tipoIdentificacion = '';
                    let numeroCliente = '';
                    
                    if (dataFactura[0].datosCliente != null) {
                        tipoIdentificacion = dataFactura[0].datosCliente.cliente_tipo_identificacion;
                        numeroCliente = dataFactura[0].datosCliente.numero_cliente;
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
                        "receptor": tipo_factura == '01' || 
                            (tipo_factura == '03' && dataFactura[0].datosCliente) ? 
                            {
                                "tipoIdentificacion": tipoIdentificacion,
                                "numeroIdentificacion": numeroCliente
                            } : undefined,
                        "comprobanteXml": xmlCreado,
                        "API": dataFactura[0].API,
                        userAgent,
                    }

                    const objData = {
                        objToken,
                        objSendComprobante
                    }

                    //enviar el comprobante
                    const { codigo, token }  = await FA.enviarDoc(objData);
    
                    if (codigo === 202 || codigo === 400 ) {
                        const data = await FA.obtenerEstadoComprobante(
                                        dataFactura[0].clavenumerica, 
                                        token, dataFactura[0].API, 
                                        userAgent, idfactura,
                                        tipo_factura
                                    );
                        
                        const obj = {
                            idfactura:idfactura,
                            tipo_factura,
                            clave: dataFactura[0].clavenumerica,
                            status: data,
                            idemisor: idemisor
                        }

                        console.log("obj actualizar estado ",obj);
                        const estadoActualizadoResponse = await Factura.actualizarEstadoFactura(obj);

                        if(estadoActualizadoResponse.affectedRows > 0) {
                            console.log("estado del comprobante actualizado");

                            if(tipo_factura == '03') {
                               
                                const actualizarEstadoAnuladoResponse = await Factura.actualizarEstadoAnuladoPorClavenumerica(factura.infoReferencia.NumeroReferencia);

                                if(actualizarEstadoAnuladoResponse.affectedRows > 0) {
                                    console.log("Se ha anulado la factura con clavenumerica "+factura.infoReferencia.NumeroReferencia);
                                } else {
                                    console.log("No se pudo actualizar el estado anulado de la factura de referencia");
                                }
                            }
                        } else {
                            console.log("No se pudo actualizar el estado de factura")
                        }
                    }                                                       
                }

                return;
            }
        } else {
            return res.status(400).json({
                message: 'La factura no se pudo insertar'
            });
        }
    
    } catch (error) {
        console.log(error);
        if (error.message === 'err_pdf' || error === 'err_pdf') {
            return res.status(500).json({
                message: 'Error al generar el comprobante pdf'
            })
        } else {
            return res.status(500).json({
                message: 'Ocurrió un error en el servidor'
            });
        }
    }
}


const obtenerEstadoFactura = (req,res) => {
    
    const {clave,idemisor,tipo_factura} = req.body;
    const patron = /^\d*$/; 

    if(!clave || clave == '') return res.status(400).json({ message: 'El parámetro de clavenumérica es requerido'});
    if(!patron.test(clave)) return res.status(400).json({message: 'El parámetro de clavenumérica debe ser de tipo numérico entero'});

    if(tipo_factura == '03') {

        Factura.obtenerNotaCreditoPorClave({idemisor,clave}).then(response => {
            if(response[0]) {
                Factura.obtenerEstadoNotaCreditoPorClave({idemisor,clave}).then(estadoResponse => {
                    if(estadoResponse[0] && estadoResponse[0].status_factura 
                        && String(estadoResponse[0].status_factura) !== ''){ 
                            const {status_factura,numeroReferencia} = estadoResponse[0];
                            return res.status(200).json({
                                clave,
                                estado: status_factura,
                                numeroReferencia
                            })
                        } else {
                            return res.status(200).json({
                                message: 'La factura con clavenumérica '+clave+' no ha sido procesada todavía por el ministerio de hacienda. Inténtelo más tarde'
                            })
                        }
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Error al obtener el estado de la factura'
                    });
                })
            } else  {
                return res.status(404).json({
                    message: 'No se encontraron resultados'
                })
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Error al obtener el estado de la factura'
            });
        })

    } else  {

        Factura.obtenerFacturaPorClave({idemisor,clave}).then(factura => {
            if(factura[0]){
                Factura.obtenerEstadoFacturaPorClave({idemisor,clave})
                    .then(response => {
                        if(response[0] && response[0].status_factura 
                            && String(response[0].status_factura) !== ''){//trae el estado
                            const {status_factura} = response[0];
                            return res.status(200).json({
                                clave,
                                estado:status_factura
                            })
                        } else {
                            return res.status(200).json({
                                message: 'La factura con clavenumérica '+clave+' no ha sido procesada todavía por el ministerio de hacienda. Inténtelo más tarde'
                            })
                        }
                    })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Error al obtener el estado de la factura'
                    });
                })
            } else {
                return res.status(404).json({
                    message: 'No se encontraron resultados'
                })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Error al obtener el estado de la factura'
            });
        })
    }
}

const login = (req,res) => {

  const {contrasena,usuario} = req.body;

  if(!contrasena || !usuario) return res.status(400).json({
      message: 'Los campos de usuario y contraseña son requeridos'
  })

}

const generarLinkPdf = async (objFactura,objlineas) => {

    try {

        let ruta = ' ';

        if(objFactura.tipo_factura == '01' ) {

            const reporteHtml = await consulta.crearReporteConReceptor(objlineas,objFactura);
            ruta = __dirname +'./../../pdf/'+objFactura.clavenumerica +'.pdf';
            const  altura = (objlineas.length) * 5;
            await consulta.generarPDFDeComprobante(reporteHtml,ruta,altura)

        } else if(objFactura.tipo_factura == '04') {
            const reporteHtml = await consulta.crearReporteSinReceptor(objlineas,objFactura);
            ruta = __dirname +'./../../pdf/'+objFactura.clavenumerica +'.pdf';
            const  altura = (objlineas.length) * 5;
            await consulta.generarPDFDeComprobante(reporteHtml,ruta,altura)
        } else if(objFactura.tipo_factura === '03') {

            if(objFactura.datosCliente) {
                const reporteHtml = await consulta.crearReporteConReceptor(objlineas,objFactura);
                ruta = __dirname +'./../../pdf/'+objFactura.clavenumerica +'.pdf';
                const  altura = (objlineas.length) * 5;
                await consulta.generarPDFDeComprobante(reporteHtml,ruta,altura)
            } else {
                const reporteHtml = await consulta.crearReporteSinReceptor(objlineas,objFactura);
                ruta = __dirname +'./../../pdf/'+objFactura.clavenumerica +'.pdf';
                const  altura = (objlineas.length) * 5;
                await consulta.generarPDFDeComprobante(reporteHtml,ruta,altura)
            }
            console.log(ruta);
        }

        return objFactura.clavenumerica +'.pdf';

    } catch (error) {
        console.log(error)
        throw new Error("err_pdf");
    }

}
module.exports = {
    agregarFactura,
    obtenerEstadoFactura,
    login
}





/* else {

                        try {
                            const responseReceta = await RecetaController.obtenerDatosReceta({idemisor, idproducto: lineaFactura.idproducto});
                            
                            console.log("respuesta ",responseReceta)

                            if(responseReceta.length === 0){ // el producto no esta registrado en las existencias
                                console.log('No se pudo actualizar el stock')
                            } else {
                                
                                if(UnidadesMedidaServicios.includes(lineaFactura.unidad_medida) == false){ // no es un servicio
                                    const datosReceta = responseReceta;
                                    for(let linea of datosReceta){
                                        const {idproducto, idarticulo, cantidad} = linea;
                                        const cantidadTotal = Number(lineaFactura.cantidad) * cantidad;
                                                                                    
                                        const responseArticulo = await Articulo.obtenerUNidadMedida({
                                            idemisor,
                                            idarticulo
                                        });

                                        const unidadMedidaArticulo = responseArticulo[0].unidad_medida;
                                        
                                        if(UnidadesMedidaServicios.includes(unidadMedidaArticulo) == false){
                                            const responseExistencia = await ExistenciaController.restarExistencia({
                                                cantidad: cantidadTotal,idarticulo, idemisor,idbodega: idbodega[0].idbodega
                                            });
                                            
                                            if(typeof responseExistencia[0][0].mensaje !== 'undefined'  &&
                                            responseExistencia[0][0].mensaje != 'OK') {
                                                console.log('No se pudo actualizar el stock')
                                            }else {
                                                console.log('Stock actualizado')
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.log("error al actualizar las existencias ",error.message);
                        }
                    }*/    