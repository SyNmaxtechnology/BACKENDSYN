const Entrada = require("../models/Entrada");
const Bodega = require("../models/Bodega");
const jwt = require("jsonwebtoken");
const TipoCedula = require("../ServiciosWeb/tipoCedula");
const FacturaFunciones = require("../functions/Factura");
const moment = require("moment-timezone");
const EntradaDetalleController = require("./EntradaDetalleController");
const Articulo = require("../models/Articulo");
const Existencia = require("../models/Existencia");
const TipoImpuestoController = require("../models/TipoImpuesto");
const FA = require("../functions/FacturaElectronica");
const Xml = require("../functions/Xml");
const consulta = require("../functions/consulta");
const fs = require("fs");
const root = require("path");
const base64 = require("file-base64");
const TipoImpuesto = require("../models/TipoImpuesto");
const UnidadesMedidaServicios = ['Al', 'Alc', 'Cm', 'I', 'Os', 'Sp', 'Spe', 'St', 'd', 'h', 's'];
const tipoCambioController = require("./TipoCambioController");
const fechaSistema = require("../db/fecha");
const { obetnerNombreEmisor } = require("./EmisorController");

const nuevaEntradaParaAnulacion = (obj) => {


}

const obtenerEntrada = async (req,res) => {

   try {
       
        const authHeader = req.get('Authorization');
        console.log(authHeader)
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        //const idusuario = decodedToken.uid;
        const patron=/^\d*$/;
        const {idfactura } = req.params;

        console.log(idfactura)

        if(!idfactura || typeof idfactura === 'undefined' || !patron.test(idfactura) ){

            return res.status(400).json({
                message: 'El parámetro de búsqueda es inválido'
            })
        }

        const dataFactura = await Entrada.obtenerEntradaAnulacion({idfactura,idemisor});
        const lineas = await EntradaDetalleController.obtenerLineasEntradaAactualizar(idfactura);

        if(dataFactura.length === 0){

            return res.status(404).json({
                message: 'No hay resultados'
            })
        }

        res.status(200).json({
            factura: dataFactura,
            lineas
        })

   } catch (error) {
     console.log(error);
     res.status(200).json({
         message: 'Error al obtener la compra'
     })
   }
}

const obtenerDatosGenerarJSONEnvioEntrada = (obj) => {
    return Entrada.obtenerDatosGenerarJSONEnvioEntrada(obj);
}

const nuevaEntrada = (obj) => {
    return Entrada.nuevaEntrada(obj);
}

const obtenerDatosMensajeAceptacion = (obj) => {
    return Entrada.obtenerDatosMensajeAceptacion(obj);
}
const existeEntrada = ({clavenumerica,idemisor}) => {
    return Entrada.existeEntrada({clavenumerica,idemisor});
}
const buscarEntradas = (req, res) => {

    const { tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = req.body;

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const obj = {
        tipoFactura,
        fechaInicio,
        fechaFin,
        consecutivo,
        claveNumerica,
        numeroInterno,
        nombreCliente,
        idemisor
    }

    Entrada.buscarEntradas(obj)
        .then(response => {
            res.status(200).json({
                entradas: response
            })
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en la búsqueda'
        })
    })
}
const obtenerDatosDescarga = (idfactura) => {
    return Entrada.obtenerDatosDescarga(idfactura);
}
const actualizarEstadoHacienda = (obj) => {
    return Entrada.actualizarEstadoHacienda(obj);
}

const encabezadoReporteEntrada = (obj) => {
    return Entrada.encabezadoReporteEntrada(obj);
}

const tipoCedulas = (req, res) => {
    try {
        res.status(200).json({
            tipoCedula: TipoCedula()
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Ha fallado la peticion'
        })
    }
}

const actualizarCodigoEstadoEntrada = (obj) => {
    return Entrada.actualizarCodigoEstadoEntrada(obj);
}

const rutaNuevaEntrada = async (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    let { ordenes } = req.body.factura;
    const { factura } = req.body;
    const status_factura = '';

    let { 
        idproveedor, clavenumerica,consecutivo,numero_interno,num_documento,consecutivo_receptor,fecha_factura,
        tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto ,porcentaje_descuento_total,
        monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,
        totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,
        totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,fecha,notas
    } = factura;

    
    const fechaEmision = fecha+fechaSistema().substring(10,fechaSistema().length);
    tipo_factura = '08';
    fecha_factura = fechaEmision;

    if(!tipocambio || tipocambio == '' || Number(tipocambio) === 1){
        const obtenerTipoCambio = await tipoCambioController.obtenerTipoCambio(fecha_factura.substr(0,10));
        tipoCambioActual = obtenerTipoCambio[0].tipocambio;
    } else {
        tipoCambioActual = tipocambio;
    }

    Entrada.nuevaEntrada({idusuario,idproveedor,idemisor, clavenumerica,consecutivo,numero_interno,num_documento,consecutivo_receptor,fecha_factura,
        tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto ,porcentaje_descuento_total,
        monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,
        totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,
        totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio: tipoCambioActual,status_factura,
        notas: !notas || notas.length === 0 || notas == 'null'? '': notas})
        .then(async response =>{
            const { affectedRows,insertId } = response;

        if(affectedRows > 0) {
            
            //actualizar los campos de claves y consecutivos de la factura
            /*
                clavenumerica: '',// valor geneado en el backend
                consecutivo: '',// valor geneado en el backend
                numero_interno: '',// valor geneado en el backend
                num_documento: '',// valor geneado en el backend
                consecutivo_receptor: '',// valor geneado en el backend

                tanto campo consecutivo como consecutivo receptor en Factura de compra tienen el mismo valor,
                en recepcion el consecutivo es el consecutivo de la factura que se sube
            */

            if(condicion_venta == '02' && plazo_credito != '' && plazo_credito > 0){
                //agregar la entrada como credito

                const identradaCredito = await Entrada.agregarEntradaACredito({
                    idemisor,idproveedor,identrada: insertId,
                    fecha_factura,
                    montototal: totalcomprobante,
                    saldoactual: totalcomprobante,
                    factura: 1
                });

                if(identradaCredito.affectedRows > 0){
                    console.log("Entrada a credito se ha insertado")
                } else {
                    return res.status(400).json({
                        message: 'No se pudo agregar la factura con condición de recibo crédito'
                    })
                }
            }

           const situacionComprobante = '00000000000000000000000000000000000000000000000000';
            FacturaFunciones.generacion_clave_numerica(situacionComprobante,tipo_factura,insertId,idemisor).then(responseClave => {
                const {
                    claveNumerica,
                    nuevoConsecutivo,
                    id,
                    llave,
                    clave,
                    numeroInterno
                } = responseClave;

                const consecutivoReceptor = nuevoConsecutivo;
                const numeroDocumento = id;

                const obj = {
                    clavenumerica: claveNumerica,
                    consecutivo: nuevoConsecutivo,
                    numero_interno: numeroInterno,
                    num_documento: numeroDocumento, 
                    consecutivo_receptor: consecutivoReceptor,
                    id
                }
                
                Entrada.actualizarClavesEntrada(obj).then(response => {
                    const {affectedRows} = response;
                    console.log("Aqui");
                    if(affectedRows > 0) {
                        //insertas las lineas de la entrada
                        let indice = 0;
                        let tamano = 1;
                        for(const i in ordenes){
                            indice++;
                            ordenes[i].numerolineadetalle = indice;
                            ordenes[i].identrada = insertId;
                            ordenes[i].numerodocumento = insertId;
                            const objLinea = ordenes[i];
                            EntradaDetalleController.insertarDetalle(ordenes[i]).then( responseOrden => {

                                Existencia.existeArticulo({
                                    id: objLinea.idarticulo, 
                                    idemisor
                                }).then(async responseIdArticulo => {
                                    if(responseIdArticulo.length === 0){ // no existe
                                        //insertar el articulo 
                                        let idImpuesto = 0;
                                        
                                        const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                            idemisor,
                                            codigo: objLinea.codigo_tarifa
                                        })

                                        if(impuesto.length === 0){
                                            idImpuesto = await TipoImpuesto.obtenerImpuestoExento();
                                        } else {
                                            idImpuesto = impuesto;
                                        }

                                            let codigo_servicio = '', tipo_servicio ='',cantidad = 0;
                                            const unidadMedida = objLinea.unidad_medida;
                                            const precioProductoFinal = (Number(objLinea.precio_articulo) * Number(objLinea.tarifa)) /100;
                                            let stock;
                                            if(UnidadesMedidaServicios.includes(unidadMedida)){
                                                // es un servicio
                                                codigo_servicio = 'Servicio';
                                                tipo_servicio = '01';
                                                stock = false;
                                            } else {
                                                // es una mercancia
                                                codigo_servicio = 'Mercancía';
                                                tipo_servicio = '02';
                                                cantidad = Number(objLinea.cantidad);
                                                stock = true;
                                            }

                                            const objArticulo = {
                                                idemisor,
                                                tipo_impuesto: idImpuesto[0].id,
                                                idcategoria: 1,
                                                descripcion: objLinea.descripcioDetalle,
                                                codigobarra_producto: objLinea.codigobarra_producto,
                                                precio_articulo: Number(objLinea.precio_articulo),
                                                precio_final: precioProductoFinal.toFixed(2),
                                                costo_unitario: 1,
                                                unidad_medida: unidadMedida,
                                                unidad_medida_comercial: '',
                                                tipo_servicio,
                                                codigo_servicio
                                            }

                                            const responseExiste = await Articulo.nuevoArticulo(objArticulo)
                                                
                                                const {affectedRows,insertId} = responseExiste;

                                                if(affectedRows > 0){
                                                    //{cantidad, idarticulo}
                                                    if(stock == true){
                                                        const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                                        const responseArticulo = await Existencia.actualizarStock({
                                                            idarticulo: insertId,
                                                            cantidad: cantidad,
                                                            idemisor,
                                                            idbodega: idbodegaPrincipal[0].idbodega
                                                        })
                                                        
                                                        console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                                    }
                                                
                                                } else {
                                                    res.status(500).json({
                                                        message: "No se pudo agregar el artículo"
                                                    });
                                                }   
                                    } else  {

                                        const idarticulo = Number(responseIdArticulo[0].id)
                                        let cantidad = 0; 
                                        const unidadMedida = objLinea.unidad_medida;
                                        let stock;
                                        if(UnidadesMedidaServicios.includes(unidadMedida)){
                                            // es un servicio
                                            codigo_servicio = 'Servicio';
                                            tipo_servicio = '01';
                                            stock = false;
                                        } else {
                                            // es una mercancia
                                            codigo_servicio = 'Mercancía';
                                            tipo_servicio = '02';
                                            cantidad = Number(objLinea.cantidad);
                                            stock = true;
                                        }
                                        
                                        if(stock == true){
                                            const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            const responseArticulo = await Existencia.actualizarStock({
                                                idarticulo: idarticulo,
                                                cantidad: cantidad,
                                                idemisor,
                                                idbodega: idbodegaPrincipal[0].idbodega
                                            })
                                            
                                            console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                        }
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        message: 'Ha ocurrido un error en el servidor'
                                    });
                                })

                                if(tamano === ordenes.length){
                                    
                                    Entrada.obtenerDatosEncabezadoYTotalesEntrada(insertId).then(responseDatosFactura => {
                                       
                                        if(responseDatosFactura.length == 0){
                                            console.log("No se encontró una factura asociada al id "+ insertId);
                                            res.status(500).json({
                                                message: 'Hubo un error al generar la entrada'
                                            })
                                        } else {

                                            const identrada = insertId;
                                            EntradaDetalleController.obtenerLineasEntrada(identrada).then(responseLineas => {
                                                const objFactura = responseDatosFactura[0];
                                                console.log("objeto entrada",objFactura);
                                                const ordenes = responseLineas;
                                                FA.crearXML(objFactura,ordenes,tipo_factura,llave,clave,identrada).then(xmlFirmado => {
                                                    const xml = xmlFirmado; // esto se debe enviar a hacienda

                                                    const objToken = {
                                                        userHacienda: objFactura.key_username_hacienda, 
                                                        passHacienda: objFactura.key_password_hacienda, 
                                                        TOKEN_API: objFactura.TOKEN_API, 
                                                        Client_ID: objFactura.Client_ID, 
                                                        userAgent: ''
                                                    }

                                                    const objSendComprobante = {
                                                        API: objFactura.API, 
                                                        emisor: {
                                                            "tipoIdentificacion": objFactura.proveedor_tipo_identificacion,
                                                            "numeroIdentificacion": objFactura.numero_proveedor
                                                        }, 
                                                        receptor: {
                                                            "tipoIdentificacion": objFactura.emisor_tipo_identificacion,
                                                            "numeroIdentificacion": objFactura.numero_emisor
                                                        }, 
                                                        clave: objFactura.clavenumerica, 
                                                        fecha: objFactura.fecha_factura, 
                                                        userAgent: '', 
                                                        comprobanteXml: xml
                                                    }


                                                    FA.enviarFacturaCompra({objToken,objSendComprobante}).then(responseEnvioEntrada => {
                                                        const{codigo, token}  = responseEnvioEntrada;
                                                        
                                                        actualizarCodigoEstadoEntrada({
                                                            codigo_estado: codigo,
                                                            identrada,
                                                            idemisor
                                                        }).then(responseCodigoEstado => {
                                                            
                                                            const {affectedRows} = responseCodigoEstado;

                                                            if(affectedRows > 0){ //actualizado
                                                                setTimeout(() => {
                                                                    const objEstado = {
                                                                        clave: objFactura.clavenumerica, 
                                                                        token , 
                                                                        userAgent: '', 
                                                                        API: objFactura.API
                                                                    }
                                                                FA.obtenerEstado(objEstado).then(responseEstado => {
                                                                    const estado = responseEstado.data['ind-estado'];
                                                                    const acuseXml = responseEstado.data['respuesta-xml'];
                                                                    
                                                                    if(estado.toString() !== 'procesando'){
                                                                        Entrada.actualizarEstadoHacienda({
                                                                            idfactura: identrada, 
                                                                            estado
                                                                        }).then(responseActualizarEstado => {
                                                                            const { affectedRows} = responseActualizarEstado;
                                                                            if(affectedRows > 0){
                                                                                Xml.guardarAcuseFacturaCompra({
                                                                                    id: identrada,
                                                                                    acuseXml
                                                                                }).then( responseGuadarAcuse => {
                                                                                    const {affectedRows} = responseGuadarAcuse;
    
                                                                                    if(affectedRows > 0){
                                                                                        return res.status(200).json({
                                                                                            message: 'El comprobante de compra se ha generado'
                                                                                        });
                                                                                    } else {
                                                                                        return res.status(500).json({
                                                                                            message: 'NO se ha guardado el acuse del comprobante en la base de datos'
                                                                                        });
                                                                                    }
                                                                                }).catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(500).json({
                                                                                        message: 'Ha ocurrido un error al generar el comprobante'
                                                                                    })
                                                                                })
                                                                            } else {
                                                                                return res.status(404).json({
                                                                                    message: 'No se pudo obtener el estado final del comprobante'
                                                                                });
                                                                            }
                                                                        }).catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).json({
                                                                                message: 'No se pudo obtener el estado del comprobante'
                                                                            })
                                                                        })
                                                                    } else {
                                                                        res.status(201).json({
                                                                            message: 'El comprobante se ha generado'
                                                                        })
                                                                    }
                                                                }).catch(err => {
                                                                    console.log(err);
                                                                    res.status(500).json({
                                                                        message: 'No se pudo obtener el estado del comprobante'
                                                                    })
                                                                })
                                                            }, 9000)
                                                            } else {
                                                                console.log("Fallo al actualizar el codigo del estado de la entrada");
                                                                res.status(500).json({
                                                                    message: 'Hubo un error al generar la entrada'
                                                                })
                                                            }
                                                        })
                                                       
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
                                                            res.status(500).json({
                                                                message: err
                                                            })
                                                        }
                                                        else {
                                                            res.status(500).json({
                                                                message: 'Falló el envío del comprobante'
                                                            })
                                                        }
                                                    })
                                                }).catch(err => {
                                                    console.log(err);
                                                    res.status(500).json({
                                                        message: 'Hubo un error al generar la entrada'
                                                    })
                                                })
                                            }).catch(err => {
                                                console.log(err);
                                                console.log("Fallo al insertar la linea");
                                                res.status(500).json({
                                                    message: 'Hubo un error al generar la entrada'
                                                })
                                            })
                                        }
                                        
                                    }).catch(err => {
                                        console.log("error al obtener los datos de la factuta ",err);
                                        res.status(500).json({
                                            message: 'Hubo un error al generar la entrada'
                                        })
                                    })
                                }  

                                tamano++;
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Hubo un error al generar la entrada'
                                })
                            })
                        }

                    } else {
                        res.status(500).json({
                            message: 'Hubo un error al generar la entrada'
                        })
                    }
                })
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo insertar la entrada'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al generar la entrada'
        })
    })
}

const visualizarEntrada = (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { id } = req.params;

    encabezadoReporteEntrada({
        id,
        idemisor
    }).then(datosFactura => {

       EntradaDetalleController.obtenerLineasEntrada(id).then(datosLineas => {
            res.status(200).json({
                factura: datosFactura,
                ordenes: datosLineas
            })
       })
       .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            }) 
        })
    }).catch(err => {
       console.log(err);
       res.status(500).json({
           message: 'Ha ocurrido un error en el servidor'
       }) 
    })

}

const descargarEntrada = (req, res) => {

    const { id, token } = req.query;
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    
    try{
        
        if (typeof token === 'undefined') { // sino se envia el token
            return res.status(403).json({ message: 'No autenticado' });
        }

        let verificarToken= jwt.verify(token, process.env.KEY);

        if (!verificarToken) { // si el token es valido pero tiene algun error
            const error = new Error('Sesion invalida');
            return res.status(401).json({
                error: 'La sesión ha expirado'
            })
        }

    } catch (error) { // cae en el catch si el token no es valido
        error.statusCode = 500;
        return res.status(500).json({
            error: 'Token inválido'
        })
    }

    encabezadoReporteEntrada({
        id,
        idemisor
    }).then(datosFactura => {
        

       EntradaDetalleController.obtenerLineasEntrada(id).then(datosLineas => {
            
              
        const clavenumerica = datosFactura[0].clavenumerica;
        const path = __dirname + '/../pdf/'+clavenumerica+'.pdf';
        const existe = fs.existsSync(path);
        
            if(existe){ //descargar si existe el archivo
                console.log("existe")
                const pathDescarga = '../pdf/'+clavenumerica+'.pdf';
                res.download(root.join(__dirname, pathDescarga), (err) => { // el archivo se descarga
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Ha ocurrido un error en la descarga'
                        })
                    };
                    console.log("Descargado")
                })
            } else {//

                consulta.crearReporteFacturaCompra(datosLineas,datosFactura[0]).then(responseReporte => {

                    console.log("no existe")
                    const comprobante = responseReporte;
                    const raiz = root.resolve(__dirname);
                    const path = raiz + '/../pdf/'+clavenumerica+'.pdf';
                    //const path = '../pdf/' + clavenumerica + '.pdf';
                    consulta.generarPDFDeComprobante(comprobante,path).then(responsePDF => { //root.join(__dirname, pathDescarga
                        const pathDescarga = '../pdf/'+clavenumerica+'.pdf';
                            res.download(root.join(__dirname, pathDescarga), (err) => { // el archivo se descarga
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        message: 'Ha ocurrido un error en la descarga'
                                    })
                                };

                                console.log("creado y descargado");
                            })
                    }).catch(err => {
                        console.log(err);
                        return res.status(500),json({ message: 'Error al genera el comprobante en PDF'});
                    })
                    .catch(err =>  {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Ha ocurrido un error en la descarga'
                        })
                    })
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Ha ocurrido un error en el servidor'
                    }) 
                })
            }   
            
       })
       .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            }) 
        })
    }).catch(err => {
       console.log(err);
       res.status(500).json({
           message: 'Ha ocurrido un error en el servidor'
       }) 
    })
}

const descargarAcuseEntrada = (req, res) => {

    const { id, token } = req.query;
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    try{
        
        if (typeof token === 'undefined') { // sino se envia el token
            return res.status(403).json({ message: 'No autenticado' });
        }

        let verificarToken= jwt.verify(token, process.env.KEY);

        if (!verificarToken) { // si el token es valido pero tiene algun error
            const error = new Error('Sesion invalida');
            return res.status(401).json({
                error: 'La sesión ha expirado'
            })
        }

    } catch (error) { // cae en el catch si el token no es valido
        error.statusCode = 500;
        return res.status(500).json({
            error: 'Token inválido'
        })
    }
    
    Entrada.obtenerClaveNumerica(id).then(clave => {
        const clavenumerica = clave[0].clavenumerica;
        const path = __dirname + '/../AcuseRespuesta/Respuesta_'+clavenumerica+'.xml';
        const existe = fs.existsSync(path);
           if(existe){
            console.log("existe")
                const pathDescarga = '../AcuseRespuesta/Respuesta_'+clavenumerica+'.xml';
                res.download(root.join(__dirname, pathDescarga), (err) => { // el archivo se descarga
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Ha ocurrido un error en la descarga'
                        })
                    };
                    console.log("Descargado")
                })
           } else {
                Xml.obtenerAcuseFacturaCompra(id).then(response => {
                    const xml = Buffer.from(response[0].acuseXml, "base64").toString("ascii");
                
                    FacturaFunciones.generarArchivoXML({
                        path,
                    comprobante: xml}).then(() => {
                        const pathDescarga = '../AcuseRespuesta/Respuesta_'+clavenumerica+'.xml';
                        res.download(root.join(__dirname, pathDescarga), (err) => { // el archivo se descarga
                            if (err) {
                                console.log(err);
                                return res.status(500).json({
                                    message: 'Ha ocurrido un error en la descarga'
                                })
                            };
                            console.log("Descargado nuevo")
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Error en la descarga'
                    })
                })
           }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error en la descarga'
        })
    })
}

const obtenerEntradasAceptadas = async (req,res) => {
    
    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {clave,consecutivo,fechaInicio,fechaFin} = req.body;

        const encabezados = await  Entrada.obtenerEntradasAceptadas({clave,consecutivo,fechaInicio,fechaFin,idemisor});
        const totales = await Entrada.sumarEntradasPorCodigoMoneda({clave,consecutivo,fechaInicio,fechaFin,idemisor});
        
        res.status(200).json({
            facturas: {
                encabezados,
                totales
            }
        })
    } catch (err){
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar la información de las compras'
        })
    }
}

const obtenerEntradasPorArticulo = (req,res) => { 

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio,fechaFin, articulo} = req.body;

    Entrada.obtenerEntradasPorArticulo({
        fechaInicio,fechaFin, articulo,idemisor
    }).then(response => {
        res.status(200).json({
            facturas: response
        })
    }).catch(err => {
       console.log(err);
       res.status(500).json({
           message: 'Ha ocurrido un error en el servidor'
       }) 
    })
}

const obtenerEntradasPorProveedor = (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio,fechaFin, proveedor, moneda} = req.body;

    Entrada.obtenerEntradasPorProveedor({
        fechaInicio,fechaFin, proveedor,idemisor,moneda
    }).then(response => {
        res.status(200).json({
            facturas: response
        })
    }).catch(err => {
       console.log(err);
       res.status(500).json({
           message: 'Ha ocurrido un error en el servidor'
       }) 
    })
}

const obtenerEntradasAceptadasReporteD151 = (obj) => {

    return Entrada.obtenerEntradasAceptadasReporteD151(obj);
}

const obtenerEntradasParaActualizarTipoCambio = () => {
    return Entrada.obtenerEntradasParaActualizarTipoCambio();
}

const actualizarTipoCambio = (obj) => {

    return Entrada.actualizarTipoCambio(obj)
}

const obtenerTotalesComprobantesProveedores = (obj) => {

    return Entrada.obtenerTotalesComprobantesProveedores(obj);
}

const obtenerTotalesEntradasAgrupadosPorTipoImpuestoPorLinea = async (req,res) => {

    try {
    
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio,fechaFin,moneda} = req.body;

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
        const responseEmisor = await obetnerNombreEmisor(idemisor);
        const encabezado = {
            fechaInicio,
            fechaFin,
            nombre: responseEmisor[0].emisor_nombre
        }

        console.log(encabezado);
        
        let totalesLineasMercancias = await Entrada.obtenerSumatoriaLineasPorTarifaMercancias({fechaInicio,fechaFin,idemisor,moneda});
        let totalesLineasServicios = await Entrada.obtenerSumatoriaLineasPorTarifaServicios({fechaInicio,fechaFin,idemisor,moneda});
        let totalesFacturas = await Entrada.obtenerSubtotalesEntradas({fechaInicio,fechaFin,idemisor,moneda});

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
            if (res.subtotal){subtotal+= Number(res.subtotal); }
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
        /*let index =0;
        const totalesLineas = await Entrada.obtenerTotalesEntradasAgrupadosPorTipoImpuestoPorLinea({fechaInicio,fechaFin,idemisor});
        const totalesFacturas = await Entrada.obtenerSubtotalesEntradas({fechaInicio,fechaFin,idemisor});
    
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
                        impServicios = totalLinea.impuesto_neto;
                        subServicios = totalLinea.subtotal;                         
                    }

                    opcioneslength--;

                    if(opcioneslength === 0){  
                        resumen[index].subtotal = subtotal;
                        resumen[index].descripcion = descripcion;
                        resumen[index].impMercancias =  porcentaje == 0 ? Number(subMercancias).toFixed(2) : Number(subMercancias / 100 * Number(porcentaje)).toFixed(2);
                        resumen[index].subMercancias = subMercancias;
                        resumen[index].impServicios = porcentaje == 0 ? Number(subServicios).toFixed(2): Number(subServicios / 100 * Number(porcentaje)).toFixed(2);
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
        objResumen.subtotal = Number(subtotal).toFixed(2);*/

        resumen.sort(((a,b) => a.porcentaje_impuesto - b.porcentaje_impuesto)); // ordenar array de objetos por porcentaje impuesto     
        res.status(200).json({resumen,totales: objResumen,encabezado});   
   
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ha ocurrido un error al obtener la información del cliente'
        });
    }
}

const entradaReemplazo = async (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    let { ordenes } = req.body.factura;
    const { factura } = req.body;
    const status_factura = '';
    
    let { 
        idproveedor, clavenumerica,consecutivo,numero_interno,num_documento,consecutivo_receptor,fecha_factura,
        tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto ,porcentaje_descuento_total,
        monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,
        totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,
        totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,fecha,notas,idfactura
    } = factura;
   
    const fechaEmision = fecha+fechaSistema().substring(10,fechaSistema().length);
    tipo_factura = '08';
    fecha_factura = fechaEmision;

    if(!tipocambio || tipocambio == '' || Number(tipocambio) === 1){
        const obtenerTipoCambio = await tipoCambioController.obtenerTipoCambio(fecha_factura.substr(0,10));
        tipoCambioActual = obtenerTipoCambio[0].tipocambio;
    } else {
        tipoCambioActual = tipocambio;
    }

    const datosReferencia = await Entrada.obtenerReferenciaPorId({idemisor,idfactura});


    const objFactura = {idusuario,idproveedor,idemisor, clavenumerica,consecutivo,numero_interno,num_documento,consecutivo_receptor,fecha_factura,
        tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto ,porcentaje_descuento_total: !monto_descuento_total || monto_descuento_total == '' || Number(monto_descuento_total) === 0 || Number(monto_descuento_total) < 1? 0: Number(((Number(monto_descuento_total) * 100)/Number(subtotal) ).toFixed(2)) ,
        monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,
        totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,
        totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio: tipoCambioActual,status_factura,
        notas: !notas || notas.length === 0 || notas == 'null'? '': notas,fechaReferencia: datosReferencia[0].fecha_factura
        ,claveReferencia: datosReferencia[0].clavenumerica};

    Entrada.entradaAnulacion(objFactura)
        .then(async response =>{
            const { affectedRows,insertId } = response;

        if(affectedRows > 0) {
            
            //actualizar los campos de claves y consecutivos de la factura
            /*
                clavenumerica: '',// valor geneado en el backend
                consecutivo: '',// valor geneado en el backend
                numero_interno: '',// valor geneado en el backend
                num_documento: '',// valor geneado en el backend
                consecutivo_receptor: '',// valor geneado en el backend

                tanto campo consecutivo como consecutivo receptor en Factura de compra tienen el mismo valor,
                en recepcion el consecutivo es el consecutivo de la factura que se sube
            */

            if(condicion_venta == '02' && plazo_credito != '' && plazo_credito > 0){
                //agregar la entrada como credito

                const identradaCredito = await Entrada.agregarEntradaACredito({
                    idemisor,idproveedor,identrada: insertId,
                    fecha_factura,
                    montototal: totalcomprobante,
                    saldoactual: totalcomprobante,
                    factura: 1
                });

                if(identradaCredito.affectedRows > 0){
                    console.log("Entrada a credito se ha insertado")
                } else {
                    return res.status(400).json({
                        message: 'No se pudo agregar la factura con condición de recibo crédito'
                    })
                }
            }

           const situacionComprobante = '00000000000000000000000000000000000000000000000000';
            FacturaFunciones.generacion_clave_numerica(situacionComprobante,tipo_factura,insertId,idemisor).then(responseClave => {
                const {
                    claveNumerica,
                    nuevoConsecutivo,
                    id,
                    llave,
                    clave,
                    numeroInterno
                } = responseClave;

                const consecutivoReceptor = nuevoConsecutivo;
                const numeroDocumento = id;

                const obj = {
                    clavenumerica: claveNumerica,
                    consecutivo: nuevoConsecutivo,
                    numero_interno: numeroInterno,
                    num_documento: numeroDocumento, 
                    consecutivo_receptor: consecutivoReceptor,
                    id
                }
                
                Entrada.actualizarClavesEntrada(obj).then(response => {
                    const {affectedRows} = response;
                    console.log("Aqui");
                    if(affectedRows > 0) {
                        //insertas las lineas de la entrada
                        let indice = 0;
                        let tamano = 1;
                        for(const i in ordenes){
                            indice++;
                            ordenes[i].numerolineadetalle = indice;
                            ordenes[i].identrada = insertId;
                            ordenes[i].numerodocumento = insertId;
                            const objLinea = ordenes[i];
                            EntradaDetalleController.insertarDetalle(ordenes[i]).then( responseOrden => {

                                Existencia.existeArticulo({
                                    id: objLinea.idarticulo, 
                                    idemisor
                                }).then(async responseIdArticulo => {
                                    if(responseIdArticulo.length === 0){ // no existe
                                        //insertar el articulo 
                                        let idImpuesto = 0;
                                        
                                        const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                            idemisor,
                                            codigo: objLinea.codigo_tarifa
                                        })

                                        if(impuesto.length === 0){
                                            idImpuesto = await TipoImpuesto.obtenerImpuestoExento();
                                        } else {
                                            idImpuesto = impuesto;
                                        }

                                            let codigo_servicio = '', tipo_servicio ='',cantidad = 0;
                                            const unidadMedida = objLinea.unidad_medida;
                                            const precioProductoFinal = (Number(objLinea.precio_articulo) * Number(objLinea.tarifa)) /100;
                                            let stock;
                                            if(UnidadesMedidaServicios.includes(unidadMedida)){
                                                // es un servicio
                                                codigo_servicio = 'Servicio';
                                                tipo_servicio = '01';
                                                stock = false;
                                            } else {
                                                // es una mercancia
                                                codigo_servicio = 'Mercancía';
                                                tipo_servicio = '02';
                                                cantidad = Number(objLinea.cantidad);
                                                stock = true;
                                            }

                                            const objArticulo = {
                                                idemisor,
                                                tipo_impuesto: idImpuesto[0].id,
                                                idcategoria: 1,
                                                descripcion: objLinea.descripcioDetalle,
                                                codigobarra_producto: objLinea.codigobarra_producto,
                                                precio_articulo: Number(objLinea.precio_articulo),
                                                precio_final: precioProductoFinal.toFixed(2),
                                                costo_unitario: 1,
                                                unidad_medida: unidadMedida,
                                                unidad_medida_comercial: '',
                                                tipo_servicio,
                                                codigo_servicio
                                            }

                                            const responseExiste = await Articulo.nuevoArticulo(objArticulo)
                                                
                                                const {affectedRows,insertId} = responseExiste;

                                                if(affectedRows > 0){
                                                    //{cantidad, idarticulo}
                                                    if(stock == true){
                                                        const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                                        const responseArticulo = await Existencia.actualizarStock({
                                                            idarticulo: insertId,
                                                            cantidad: cantidad,
                                                            idemisor,
                                                            idbodega: idbodegaPrincipal[0].idbodega
                                                        })
                                                        
                                                        console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                                    }
                                                
                                                } else {
                                                    res.status(500).json({
                                                        message: "No se pudo agregar el artículo"
                                                    });
                                                }   
                                    } else  {

                                        const idarticulo = Number(responseIdArticulo[0].id)
                                        let cantidad = 0; 
                                        const unidadMedida = objLinea.unidad_medida;
                                        let stock;
                                        if(UnidadesMedidaServicios.includes(unidadMedida)){
                                            // es un servicio
                                            codigo_servicio = 'Servicio';
                                            tipo_servicio = '01';
                                            stock = false;
                                        } else {
                                            // es una mercancia
                                            codigo_servicio = 'Mercancía';
                                            tipo_servicio = '02';
                                            cantidad = Number(objLinea.cantidad);
                                            stock = true;
                                        }
                                        
                                        if(stock == true){
                                            const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            const responseArticulo = await Existencia.actualizarStock({
                                                idarticulo: idarticulo,
                                                cantidad: cantidad,
                                                idemisor,
                                                idbodega: idbodegaPrincipal[0].idbodega
                                            })
                                            
                                            console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                        }
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        message: 'Ha ocurrido un error en el servidor'
                                    });
                                })

                                if(tamano === ordenes.length){
                                    
                                    Entrada.obtenerDatosEncabezadoYTotalesEntradaAnulacion(insertId).then(responseDatosFactura => {
                                       
                                        if(responseDatosFactura.length == 0){
                                            console.log("No se encontró una factura asociada al id "+ insertId);
                                            res.status(500).json({
                                                message: 'Hubo un error al generar la entrada'
                                            })
                                        } else {

                                            const identrada = insertId;
                                            EntradaDetalleController.obtenerLineasEntrada(identrada).then(responseLineas => {
                                                const objFactura = responseDatosFactura[0];
                                                console.log("objeto entrada",objFactura);
                                                const ordenes = responseLineas;
                                                FA.crearXML(objFactura,ordenes,'08R',llave,clave,identrada).then(xmlFirmado => {
                                                    const xml = xmlFirmado; // esto se debe enviar a hacienda

                                                    const objToken = {
                                                        userHacienda: objFactura.key_username_hacienda, 
                                                        passHacienda: objFactura.key_password_hacienda, 
                                                        TOKEN_API: objFactura.TOKEN_API, 
                                                        Client_ID: objFactura.Client_ID, 
                                                        userAgent: ''
                                                    }

                                                    const objSendComprobante = {
                                                        API: objFactura.API, 
                                                        emisor: {
                                                            "tipoIdentificacion": objFactura.proveedor_tipo_identificacion,
                                                            "numeroIdentificacion": objFactura.numero_proveedor
                                                        }, 
                                                        receptor: {
                                                            "tipoIdentificacion": objFactura.emisor_tipo_identificacion,
                                                            "numeroIdentificacion": objFactura.numero_emisor
                                                        }, 
                                                        clave: objFactura.clavenumerica, 
                                                        fecha: objFactura.fecha_factura, 
                                                        userAgent: '', 
                                                        comprobanteXml: xml
                                                    }


                                                    FA.enviarFacturaCompra({objToken,objSendComprobante}).then(responseEnvioEntrada => {
                                                        const{codigo, token}  = responseEnvioEntrada;
                                                        
                                                        actualizarCodigoEstadoEntrada({
                                                            codigo_estado: codigo,
                                                            identrada,
                                                            idemisor
                                                        }).then(responseCodigoEstado => {
                                                            
                                                            const {affectedRows} = responseCodigoEstado;

                                                            if(affectedRows > 0){ //actualizado
                                                                setTimeout(() => {
                                                                    const objEstado = {
                                                                        clave: objFactura.clavenumerica, 
                                                                        token , 
                                                                        userAgent: '', 
                                                                        API: objFactura.API
                                                                    }
                                                                FA.obtenerEstado(objEstado).then(responseEstado => {
                                                                    const estado = responseEstado.data['ind-estado'];
                                                                    const acuseXml = responseEstado.data['respuesta-xml'];
                                                                    
                                                                    if(estado.toString() !== 'procesando'){
                                                                        Entrada.actualizarEstadoHacienda({
                                                                            idfactura: identrada, 
                                                                            estado
                                                                        }).then(responseActualizarEstado => {
                                                                            const { affectedRows} = responseActualizarEstado;
                                                                            if(affectedRows > 0){
                                                                                Xml.guardarAcuseFacturaCompra({
                                                                                    id: identrada,
                                                                                    acuseXml
                                                                                }).then( async responseGuadarAcuse => {
                                                                                    const {affectedRows} = responseGuadarAcuse;
    
                                                                                    if(affectedRows > 0){

                                                                                        await Entrada.actualizarDatosReferencia({
                                                                                            idemisor,
                                                                                            claveReferencia: datosReferencia[0].clavenumerica,
                                                                                            fechaReferencia: datosReferencia[0].fecha_factura,
                                                                                            identrada:insertId
                                                                                        })

                                                                                        res.status(200).json({
                                                                                            message: 'El comprobante de compra se ha generado'
                                                                                        });
                                                                                        //estado.toString() === 'aceptado'
                                                                                        /*if(estado.toString() === 'aceptado'){
                                                                                            Entrada.actualizarEstadoAnulado({idemisor,clave: datosReferencia[0].clavenumerica,estado: 1})
                                                                                            .then(response => {
                                                                                                if(response.affectedRows > 0){
                                                                                                    console.log("actualizado estado anulado")
                                                                                                } else {
                                                                                                    console.log("no se ha actualizado el estado anulado")
                                                                                                }
                                                                                            }).catch(err => {
                                                                                                console.log(err);
                                                                                                console.log("Error al actualizar el estado anulado de la compra")
                                                                                            })
                                                                                        }*/ 
                                                                                    } else {
                                                                                        return res.status(500).json({
                                                                                            message: 'NO se ha guardado el acuse del comprobante en la base de datos'
                                                                                        });
                                                                                    }
                                                                                }).catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(500).json({
                                                                                        message: 'Ha ocurrido un error al generar el comprobante'
                                                                                    })
                                                                                })
                                                                            } else {
                                                                                return res.status(404).json({
                                                                                    message: 'No se pudo obtener el estado final del comprobante'
                                                                                });
                                                                            }
                                                                        }).catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).json({
                                                                                message: 'No se pudo obtener el estado del comprobante'
                                                                            })
                                                                        })
                                                                    } else {
                                                                        res.status(201).json({
                                                                            message: 'El comprobante se ha generado'
                                                                        })
                                                                    }
                                                                }).catch(err => {
                                                                    console.log(err);
                                                                    res.status(500).json({
                                                                        message: 'No se pudo obtener el estado del comprobante'
                                                                    })
                                                                })
                                                            }, 9000)
                                                            } else {
                                                                console.log("Fallo al actualizar el codigo del estado de la entrada");
                                                                res.status(500).json({
                                                                    message: 'Hubo un error al generar la entrada'
                                                                })
                                                            }
                                                        })
                                                       
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
                                                            res.status(500).json({
                                                                message: err
                                                            })
                                                        } else {
                                                            res.status(500).json({
                                                                message: 'Falló el envío del comprobante'
                                                            })
                                                        }
                                                        
                                                    })
                                                }).catch(err => {
                                                    console.log(err);
                                                    res.status(500).json({
                                                        message: 'Hubo un error al generar la entrada'
                                                    })
                                                })
                                            }).catch(err => {
                                                console.log(err);
                                                console.log("Fallo al insertar la linea");
                                                res.status(500).json({
                                                    message: 'Hubo un error al generar la entrada'
                                                })
                                            })
                                        }
                                        
                                    }).catch(err => {
                                        console.log("error al obtener los datos de la factuta ",err);
                                        res.status(500).json({
                                            message: 'Hubo un error al generar la entrada'
                                        })
                                    })
                                }  

                                tamano++;
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Hubo un error al generar la entrada'
                                })
                            })
                        }

                    } else {
                        res.status(500).json({
                            message: 'Hubo un error al generar la entrada'
                        })
                    }
                })
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo insertar la entrada'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al generar la entrada'
        })
    })
}



const entradaAnulacion = async (req,res) => {

   try {
    console.log("anular compra")
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const {params:{identrada}} = req;
    const status_factura = '';

    const entradaResponse = await Entrada.obtenerDatosEncabezadoYTotalesEntradaAnulacion(identrada);
    const ordenes = await  EntradaDetalleController.obtenerLineasEntrada(identrada);

    let tipoCambioActual = null;
    const fecha_factura = fechaSistema();

    if(!entradaResponse[0].tipocambio || entradaResponse[0].tipocambio == '' || Number(entradaResponse[0].tipocambio) === 1){
        const obtenerTipoCambio = await tipoCambioController.obtenerTipoCambio(fecha_factura.substr(0,10));
        tipoCambioActual = obtenerTipoCambio[0].tipocambio;
    } else {
        tipoCambioActual = entradaResponse[0].tipocambio;
    }

    const objFactura = {
        idusuario ,
        idproveedor:entradaResponse[0].idproveedor ,
        idemisor:entradaResponse[0].idemisor ,
        clavenumerica:'' ,
        consecutivo:'' ,
        numero_interno:'' ,
        num_documento:'' ,
        consecutivo_receptor:'',
        fecha_factura: fecha_factura,
        tipo_factura:entradaResponse[0].tipo_factura,
        condicion_venta:entradaResponse[0].condicion_venta,
        medio_pago:entradaResponse[0].medio_pago,
        plazo_credito:entradaResponse[0].plazo_credito,
        condicion_impuesto:'',
        porcentaje_descuento_total: entradaResponse[0].porcentaje_descuento_total,
        monto_descuento_total: entradaResponse[0].monto_descuento_total,
        subtotal: entradaResponse[0].subtotal,
        totalservgravados: entradaResponse[0].totalservgravados,
        totalservexentos: entradaResponse[0].totalservexentos,
        totalservexonerado: entradaResponse[0].totalservexonerado,
        totalmercanciasgravadas: entradaResponse[0].totalmercanciasgravadas,
        totalmercanciasexentas: entradaResponse[0].totalmercanciasexentas,
        totalmercanciaexonerada: entradaResponse[0].totalmercanciaexonerada,
        totalgravado: entradaResponse[0].totalgravado,
        totalexento: entradaResponse[0].totalexento,
        totalexonerado: entradaResponse[0].totalexonerado,
        totalventa: entradaResponse[0].totalventa,
        totaldescuentos: entradaResponse[0].totaldescuentos,
        totalventaneta: entradaResponse[0].totalventaneta,
        totalimpuesto: entradaResponse[0].totalimpuesto,
        totalcomprobante: entradaResponse[0].totalcomprobante,
        totalIVADevuelto: entradaResponse[0].totalIVADevuelto,
        TotalOtrosCargos: entradaResponse[0].TotalOtrosCargos,
        codigomoneda: entradaResponse[0].codigomoneda,
        tipocambio: tipoCambioActual,
        status_factura:'',
        notas: !entradaResponse[0].notas || entradaResponse[0].notas.length === 0 || entradaResponse[0].notas == 'null'? '': entradaResponse[0].notas,
        fechaReferencia: entradaResponse[0].fecha_factura,
        claveReferencia: entradaResponse[0].clavenumerica
    };
   // console.log(objFactura);
    const entradaAnulada = await Entrada.entradaAnulacion(objFactura);

    if(entradaAnulada.affectedRows > 0) {
        const situacionComprobante = '00000000000000000000000000000000000000000000000000';
        const responseClave = await FacturaFunciones.generacion_clave_numerica(situacionComprobante,objFactura.tipo_factura,entradaAnulada.insertId,idemisor);
        const {
            claveNumerica,
            nuevoConsecutivo,
            id,
            llave,
            clave,
            numeroInterno
        } = responseClave;

        const consecutivoReceptor = nuevoConsecutivo;
        const numeroDocumento = id;

        const obj = {
            clavenumerica: claveNumerica,
            consecutivo: nuevoConsecutivo,
            numero_interno: numeroInterno,
            num_documento: numeroDocumento, 
            consecutivo_receptor: consecutivoReceptor,
            id
        }
        
        const clavesActualizadas = await Entrada.actualizarClavesEntrada(obj);

        if(clavesActualizadas.affectedRows > 0) {
            let indice = 0;


            for (const i in ordenes){
                indice++;
                ordenes[i].numerolineadetalle = indice;
                ordenes[i].identrada = entradaAnulada.insertId;
                ordenes[i].numerodocumento = entradaAnulada.insertId;
                const objLinea = ordenes[i];
                EntradaDetalleController.insertarDetalle(ordenes[i]).then( responseOrden => {

                    Existencia.existeArticulo({
                        id: objLinea.idarticulo, 
                        idemisor
                    }).then(async responseIdArticulo => {
                        if(responseIdArticulo.length === 0){ // no existe
                            //insertar el articulo 
                            let idImpuesto = 0;
                            
                            const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                idemisor,
                                codigo: objLinea.codigo_tarifa
                            })

                            if(impuesto.length === 0){
                                idImpuesto = await TipoImpuesto.obtenerImpuestoExento();
                            } else {
                                idImpuesto = impuesto;
                            }

                                let codigo_servicio = '', tipo_servicio ='',cantidad = 0;
                                const unidadMedida = objLinea.unidad_medida;
                                const precioProductoFinal = (Number(objLinea.precio_articulo) * Number(objLinea.tarifa)) /100;
                                let stock;
                                if(UnidadesMedidaServicios.includes(unidadMedida)){
                                    // es un servicio
                                    codigo_servicio = 'Servicio';
                                    tipo_servicio = '01';
                                    stock = false;
                                } else {
                                    // es una mercancia
                                    codigo_servicio = 'Mercancía';
                                    tipo_servicio = '02';
                                    cantidad = Number(objLinea.cantidad);
                                    stock = true;
                                }

                                const objArticulo = {
                                    idemisor,
                                    tipo_impuesto: idImpuesto[0].id,
                                    idcategoria: 1,
                                    descripcion: objLinea.descripcioDetalle,
                                    codigobarra_producto: objLinea.codigobarra_producto,
                                    precio_articulo: Number(objLinea.precio_articulo),
                                    precio_final: precioProductoFinal.toFixed(2),
                                    costo_unitario: 1,
                                    unidad_medida: unidadMedida,
                                    unidad_medida_comercial: '',
                                    tipo_servicio,
                                    codigo_servicio
                                }

                                const responseExiste = await Articulo.nuevoArticulo(objArticulo)
                                    
                                    const {affectedRows,insertId} = responseExiste;

                                    if(affectedRows > 0){
                                        //{cantidad, idarticulo}
                                        if(stock == true){
                                            const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            const responseArticulo = await Existencia.actualizarStock({
                                                idarticulo: insertId,
                                                cantidad: -cantidad,
                                                idemisor,
                                                idbodega: idbodegaPrincipal[0].idbodega
                                            })
                                            
                                            console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                        }
                                    
                                    } else {
                                        res.status(500).json({
                                            message: "No se pudo agregar el artículo"
                                        });
                                    }   
                        } else  {

                            const idarticulo = Number(responseIdArticulo[0].id)
                            let cantidad = 0; 
                            const unidadMedida = objLinea.unidad_medida;
                            let stock;
                            if(UnidadesMedidaServicios.includes(unidadMedida)){
                                // es un servicio
                                codigo_servicio = 'Servicio';
                                tipo_servicio = '01';
                                stock = false;
                            } else {
                                // es una mercancia
                                codigo_servicio = 'Mercancía';
                                tipo_servicio = '02';
                                cantidad = Number(objLinea.cantidad);
                                stock = true;
                            }
                            
                            if(stock == true){
                                const idbodegaPrincipal = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                const responseArticulo = await Existencia.actualizarStock({
                                    idarticulo: idarticulo,
                                    cantidad: -cantidad,
                                    idemisor,
                                    idbodega: idbodegaPrincipal[0].idbodega
                                })
                                
                                console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                            }
                        }
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: 'Ha ocurrido un error en el servidor'
                        });
                    })

                })
            }


            //se envia el comprobante
           const responseDatosFactura = await Entrada.obtenerDatosEncabezadoYTotalesEntradaAnulacion(entradaAnulada.insertId)
           const responseLineas = await EntradaDetalleController.obtenerLineasEntrada(entradaAnulada.insertId);

           const lineas = responseLineas;
           const xmlFirmado = await FA.crearXML(responseDatosFactura[0],lineas,'08A',llave,clave,entradaAnulada.insertId)
            const xml = xmlFirmado; // esto se debe enviar a hacienda

            const objToken = {
                userHacienda: responseDatosFactura[0].key_username_hacienda, 
                passHacienda: responseDatosFactura[0].key_password_hacienda, 
                TOKEN_API: responseDatosFactura[0].TOKEN_API, 
                Client_ID: responseDatosFactura[0].Client_ID, 
                userAgent: ''
            }

            const objSendComprobante = {
                API: responseDatosFactura[0].API, 
                emisor: {
                    "tipoIdentificacion": responseDatosFactura[0].proveedor_tipo_identificacion,
                    "numeroIdentificacion": responseDatosFactura[0].numero_proveedor
                }, 
                receptor: {
                    "tipoIdentificacion": responseDatosFactura[0].emisor_tipo_identificacion,
                    "numeroIdentificacion": responseDatosFactura[0].numero_emisor
                }, 
                clave: responseDatosFactura[0].clavenumerica, 
                fecha: responseDatosFactura[0].fecha_factura, 
                userAgent: '', 
                comprobanteXml: xml
            }

            const responseEnvioEntrada = await FA.enviarFacturaCompra({objToken,objSendComprobante});
            const{codigo, token}  = responseEnvioEntrada;
            
            const responseCodigoEstado = await actualizarCodigoEstadoEntrada({
                codigo_estado: codigo,
                identrada: entradaAnulada.insertId,
                idemisor
            })

            if(responseCodigoEstado.affectedRows > 0){ //actualizado
                setTimeout( async () => {
                    const objEstado = {
                        clave: responseDatosFactura[0].clavenumerica, 
                        token , 
                        userAgent: '', 
                        API: responseDatosFactura[0].API
                    }

                    const responseEstado = await FA.obtenerEstado(objEstado);
                    const estado = responseEstado.data['ind-estado'];
                    const acuseXml = responseEstado.data['respuesta-xml'];
                    
                    if(estado.toString() !== 'procesando'){
                        const responseActualizarEstado = await Entrada.actualizarEstadoHacienda({
                            idfactura: entradaAnulada.insertId, 
                            estado
                        });

                        if(responseActualizarEstado.affectedRows > 0){
                            const responseGuadarAcuse = await Xml.guardarAcuseFacturaCompra({
                                id: entradaAnulada.insertId,
                                acuseXml
                            })

                            if(responseGuadarAcuse.affectedRows > 0){
                                res.status(201).json({
                                    message: 'El comprobante de compra se ha generado'
                                });

                                if(estado.toString() === 'aceptado'){
                                    const response = await Entrada.actualizarEstadoAnulado({idemisor,clave: entradaResponse[0].clavenumerica,estado: 1})
                                    if(response.affectedRows > 0){
                                        console.log("actualizado estado anulado")

                                        await Entrada.actualizarDatosReferencia({
                                            idemisor,
                                            claveReferencia: entradaResponse[0].clavenumerica,
                                            fechaReferencia: entradaResponse[0].fecha_factura,
                                            identrada:entradaAnulada.insertId
                                        })
                                    } else {
                                        console.log("no se ha actualizado el estado anulado")
                                    }
                                }
                            }
                        }           
                    } else {
                        res.status(200).json({
                            message: 'El comprobante de anulación ha sido procesado'
                        });
                            
                    }
                }, 9000)
            } else {
                res.status(500).json({
                    message: 'No se pudo actualizar el codigo de estado'
                });
            }
        } else {
            //sino se actualizan los contadores, clave y consecutivo, eliminar el registro
            await EntradaDetalleController.eliminarLineasEntrada(entradaAnulada.insertId);
            await Entrada.eliminarEntrada({idemisor,identrada: entradaAnulada.insertId});
            return res.status(500).json({
                message: 'Hubo un error al intentar anular la factura'
            })
        }
    } else {
        return res.status(400).json({
            message: 'No se pudo agregar el comprobante'
        })
    }
   } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al intentar anular la factura'
        })
   }

}
const obtenerEntradasPorClavenumerica = (obj) => Entrada.obtenerEntradasPorClavenumerica(obj);

module.exports = {
    nuevaEntrada,
    obtenerDatosMensajeAceptacion,
    existeEntrada,
    buscarEntradas,
    actualizarEstadoHacienda,
    obtenerDatosDescarga,
    tipoCedulas,
    rutaNuevaEntrada,
    visualizarEntrada,
    descargarEntrada,
    descargarAcuseEntrada,
    obtenerEntradasAceptadas,
    obtenerEntradasPorArticulo,
    obtenerEntradasPorProveedor,
    obtenerDatosGenerarJSONEnvioEntrada,
    actualizarCodigoEstadoEntrada,
    obtenerEntradasAceptadasReporteD151,
    obtenerEntradasParaActualizarTipoCambio,
    actualizarTipoCambio,
    obtenerTotalesComprobantesProveedores,
    obtenerTotalesEntradasAgrupadosPorTipoImpuestoPorLinea,
    obtenerEntrada,
    entradaReemplazo,
    obtenerEntradasPorClavenumerica,
    entradaAnulacion
}