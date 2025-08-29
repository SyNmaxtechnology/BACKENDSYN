const axios = require("axios");
const Entrada = require("../models/Entrada");
const EntradaDetalleController = require('../controllers/EntradaDetalleController'); 
const Factura = require("../models/Factura");
const FacturaElectronica = require("../functions/FacturaElectronica");
const Xml =  require("../functions/Xml");
const jwt = require("jsonwebtoken");
const FactuaDetalle = require("../models/FacturaDetalle");
const Emisor = require("../models/Emisor");
const chequearConexionAInternet = require("check-internet-connected");
const Email = require("../functions/Email");
const {CronJob} = require("cron");
const async = require("async");
const consulta = require("../functions/consulta");
const EmisorController = require("./EmisorController");
const path = require("path");
const FA = require("../functions/FacturaElectronica");
const EntradaController = require("./EntradaController");
const tipoCambioController = require("./TipoCambioController");
const FacturaController = require("./FacturaController");
//    const url = req.protocol+'://'+req.headers.host+'/home';
let NUMBER_CONCURRENT_JOBS = 1;
const config = {
    timeout: 5000, //timeout connecting to each try (default 5000)
    retries: 3,//number of retries to do before failing (default 5)
    domain: 'apple.com'//the domain to check DNS record of
}
console.log("controlador de procesos automaticos cargado")
let iniciar = 0;
global.desde = iniciar;
global.desde2 = iniciar;
global.desdeNotas = iniciar;
global.desdeCorreos = iniciar;
global.desdeEntradas = iniciar;


const actualizarTipoCambioFacturas = async () => {

    const facturas = await FacturaController.obtenerTipoCambioFacturasParaActualizar();

    for(let factura of facturas){
        const {fecha} = factura;
        const { venta } = await tipoCambioController.obtenerTipoCambioPorFecha(fecha);
        const response = await FacturaController.actualizarTipoCambio({fecha,tipocambio: venta});
        console.log(response);
    }
}

const actualizarTipoCambioEntradas = async () => {

    try {
        const entradas = await EntradaController.obtenerEntradasParaActualizarTipoCambio();
        for(let entrada of entradas){
            let tc=1
            const {fecha} = entrada;
            console.log(fecha);
            const  venta  = await tipoCambioController.obtenerTipoCambioPorFecha(fecha);
            console.log(venta);
            if (venta){
                tc=venta.compra
            }
            const response = await EntradaController.actualizarTipoCambio({fecha, tipocambio:tc}) ;
            console.log(response);
        }   
    } catch (error) {
        console.log(error)
    }
}
const enviarEntradasSinEstado  =  () => {

    chequearConexionAInternet(config)
    .then(data => {
        let cantidad = 20;
        actualizarTipoCambioEntradas();
        Entrada.obtenerEntradasNoEnviadas({cantidad, desde: global.desdeEntradas}).then(async entradas => {
            //obtenerEntradasNoEnviadas
            //evitarEstadoSuspension(); //elmina syn por error de desconexion
            if(entradas.length === 0){
                global.desdeEntradas = 0;
            } else {
                for(entrada of entradas){
                    const {idemisor, identrada, codigo_estado, estadoHacienda, tipo_factura,clavenumerica} = entrada;

                    if(tipo_factura == '05'){ // factura de recepcion
                      
                       Xml.obtenerMensajeAceptacion(identrada).then( responseXml => {
                            if(responseXml.length === 0){ // no hay mensahe de aceptacion
                                 
                                Entrada.obtenerDatosMensajeAceptacionNoEnviadas(identrada).then(dataMensajeAceptacion => {
                                     console.log(dataMensajeAceptacion)

                                     const objMensaje = {
                                        clavenumerica: dataMensajeAceptacion[0].clavenumerica,
                                        fecha_factura :dataMensajeAceptacion[0].fecha_factura,
                                        status_factura :dataMensajeAceptacion[0].status_factura,
                                        codicion_impuesto :dataMensajeAceptacion[0].codicion_impuesto,
                                        totalcomprobante :dataMensajeAceptacion[0].totalcomprobante,
                                        totalimpuesto :dataMensajeAceptacion[0].totalimpuesto,
                                        codigo_actividad :dataMensajeAceptacion[0].codigo_actividad,
                                        cedula_proveedor :dataMensajeAceptacion[0].cedula_proveedor,
                                        cedula_emisor :dataMensajeAceptacion[0].cedula_emisor,
                                        consecutivo: dataMensajeAceptacion[0].consecutivo_receptor
                                    } 

                                    FA.crearXML(objMensaje,{},'05',dataMensajeAceptacion[0].llave,dataMensajeAceptacion[0].clave,identrada).then(responseXML => {
                                        console.log("xml de reepcion ha sido creador");
                                    })
                                    .catch(err => {
                                        global.desdeEntradas +=1 * cantidad;
                                        console.log(err);
                                    })
                                })
                                .catch(err => {
                                    console.log("error al obtener los datos para crear el mensaje de acepatacion", err);
                                })
                            
                            } else { // tiene el xml creado

                            

                                EmisorController.obtenerCredencialesParaRecepcion(identrada).then(responseCredenciales  => {
                                    const obj = {
                                        objToken : {
                                            userHacienda: responseCredenciales[0].key_username_hacienda, 
                                            passHacienda: responseCredenciales[0].key_password_hacienda, 
                                            TOKEN_API: responseCredenciales[0].TOKEN_API, 
                                            Client_ID: responseCredenciales[0].Client_ID, 
                                            userAgent: ''
                                        }
                                    }
                                    FacturaElectronica.generarAuthToken(obj).then(responseToken => {

                                        Entrada.obtenerDatosGenerarJSONEnvioEntrada({identrada,idemisor}).then(responseJSON => {
                                            const {access_token} = responseToken;
                                            if(codigo_estado == null){
                                                const jsonRecepcion = {
                                                    clave: responseJSON[0].clavenumerica,
                                                    fecha: responseJSON[0].fecha_factura,
                                                    emisor: {
                                                        tipoIdentificacion: responseJSON[0].proveedor_tipo_identificacion,//PROVEEDOR
                                                        numeroIdentificacion: responseJSON[0].cedula_proveedor
                                                    },
                                                    receptor: {
                                                        tipoIdentificacion: responseJSON[0].emisor_tipo_identificacion,//EMISOR DEL SISTEMA
                                                        numeroIdentificacion: responseJSON[0].cedula_emisor
                                                    },//mensajeAceptacion
                                                    consecutivoReceptor: responseJSON[0].consecutivo_receptor,
                                                    comprobanteXml: responseJSON[0].mensajeAceptacion,
                                                    API: responseJSON[0].API,
                                                    userAgent: '',
                                                    token: access_token
                                                }

                                                FA.enviarRecepcion(jsonRecepcion).then(respuestaEnvio => {
                                                    console.log(respuestaEnvio);

                                                    Entrada.actualizarCodigoEstadoEntrada({codigo_estado: respuestaEnvio ,idemisor, identrada})
                                                        .then(responseCodigo => {
                                                            console.log("codigo actualizad")
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                            console.log("No se pudo actualizar el codigo de la recepcion");
                                                        })
                                                    
                                                }).catch(async err => {
                                                    iniciar +=1; 
                                                    global.desdeEntradas +=iniciar;
                                                    console.log(err);
                                                    const responseCodigoEstado = await Entrada.entradasRebotadas({
                                                        codigo_estado: err,
                                                        identrada,
                                                        idemisor
                                                    })
                                                    if(responseCodigoEstado.affectedRows > 0){
                                                        console.log("Se ha actualizado el estado de la factura")
                                                    }
                                                    console.log("No se pudo enviar la recepcion")
                                                })
                                            } else {
                                                const objEstadoMensaje = {
                                                    API: responseJSON[0].API,
                                                    token: access_token,
                                                    userAgent: '',
                                                    clave: responseJSON[0].clavenumerica+'-'+responseJSON[0].consecutivo_receptor
                                                }

                                                setTimeout(() => {
                                                    FA.obtenerEstado(objEstadoMensaje)
                                                    .then(respuestaEstado => {
            
                                                        const estado=respuestaEstado.data['ind-estado'];
                                                        const respuesta = respuestaEstado.data['respuesta-xml'];
                                                        const idfactura = identrada;
                                                        const tipo = '05RH';
                                                        if(estado != 'rechazado' && estado != 'aceptado' ){
                                                            console.log("NO se ha obtenido el estado de la recepcion")
                                                        } else {
                                                            
                                                            Xml.guardarXML({id: idfactura, 
                                                                xml: respuesta, 
                                                                tipo_factura: tipo})
                                                            .then(response => {
            
                                                                const {affectedRows} = response;
                                                                if(affectedRows > 0){
                                                                    
            
                                                                    EntradaController.actualizarEstadoHacienda({idfactura,estado }).then(response => {
                                                                      
                                                                        const objEnvioCorreo = {
                                                                            clave: responseJSON[0].clavenumerica, 
                                                                            idfactura, 
                                                                            tipo: 'RME', 
                                                                            estado, 
                                                                            correo: responseJSON[0].proveedor_nombre,
                                                                            emisor: responseJSON[0].proveedor_correo
                                                                        };
                                                                       
                                                                        enviarReporteRecepcionPorCorreo(objEnvioCorreo)
                                                                        .then(respuestaCorreo => {
                                                                           console.log("La recepcion se ha generado con exito")
                                                                        }).catch( err => {
                                                                            
                                                                            console.log(err);
                                                                            console.log("falló el envío por correo de la recepcion")
                                                                        })
                                                                    })
                                                                    .catch( err => {
                                                                        console.log(err);
                                                                        console.log("No se pudo actualizar el estado de la recepcion")
                                                                    })
                                                                } else {
                                                                    console.log("No pudo pudo guardar la respuesta del mensaje de aceptacion");
                                                                    
                                                                }
                                                            })
                                                        }
                                                    })
                                                    .catch(err => {
                                                        global.desdeEntradas +=1 * cantidad;
                                                        console.log(err);
                                                        console.log("Error al obtener el estado de la recepción");
                                                    })
                                                }, 9000);
                                            }
                                        })
                                    })
                                    .catch(err => {
                                        console.log("error al obtener el token ", err);
                                        if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                            Emisor.actualizarEstado({estado: 2,idemisor}).then(response => {
                                                if(response.affectedRows > 0) {
                                                    console.log("estado emisor actualizado")
                                                } else {
                                                    console.log("No se pudo actualizar el estado del emisor")
                                                }
                                            }) .catch(err => console.log(err));
                                        }
                                    })
                                })
                                .catch(err => {
                                    console.log("error al obtener obtenerCredencialesParaRecepcion", err);
                                })
                        
                            }   
                       })
                       .catch(err => {
                        iniciar +=1; 
                        global.desdeEntradas +=iniciar;
                           console.log("error al obtener el mensaje de aceptacion", err);
                       })
                       
                    } else { //factura de compra
                        //Obtener la informacion de las entradas

                        try {
                            console.log("ientrada",identrada); 
                            const xml = await Xml.obtenerEntradaPorIdEntrada({idemisor,identrada});
                            console.log("xml",xml.length); 
                            let xmlObtenido = null;
                            let encabezadoEntrada = null;
                            let token = null;
                            if(xml.length === 0){
                                console.log("entro")
                                encabezadoEntrada = await Entrada.obtenerDatosEncabezadoYTotalesEntrada(identrada);
                                const lineasEntrada = await EntradaDetalleController.obtenerLineasEntrada(identrada);
                                xmlObtenido = await FacturaElectronica.crearXML(encabezadoEntrada[0],lineasEntrada,
                                    tipo_factura,encabezadoEntrada[0].file_p12,encabezadoEntrada[0].pin_p12,identrada);  
                                    console.log("xml generado",xmlObtenido)                                  
                            } else {
                                xmlObtenido = xml[0].Xml;
                                encabezadoEntrada = await Emisor.obtenerCredencialesLlaveCriptografica(idemisor,identrada,'01');
                                console.log("xml traido");
                            }

                            
                           if(codigo_estado == null){
                                
                                const objToken = {
                                    userHacienda: encabezadoEntrada[0].key_username_hacienda, 
                                    passHacienda: encabezadoEntrada[0].key_password_hacienda, 
                                    TOKEN_API: encabezadoEntrada[0].TOKEN_API, 
                                    Client_ID: encabezadoEntrada[0].Client_ID, 
                                    userAgent: ''
                                }

                                const objSendComprobante = {
                                    API: encabezadoEntrada[0].API, 
                                    emisor: {
                                        "tipoIdentificacion": encabezadoEntrada[0].proveedor_tipo_identificacion,
                                        "numeroIdentificacion": encabezadoEntrada[0].numero_proveedor
                                    }, 
                                    receptor: {
                                        "tipoIdentificacion": encabezadoEntrada[0].emisor_tipo_identificacion,
                                        "numeroIdentificacion": encabezadoEntrada[0].numero_emisor
                                    }, 
                                    clave: encabezadoEntrada[0].clavenumerica, 
                                    fecha: encabezadoEntrada[0].fecha_factura, 
                                    userAgent: '', 
                                    comprobanteXml: xmlObtenido
                                }

                                const{codigo, token} = await FacturaElectronica.enviarFacturaCompra({objToken,objSendComprobante})
                                const responseCodigoEstado = await Entrada.actualizarCodigoEstadoEntrada({
                                    codigo_estado: codigo,
                                    identrada,
                                    idemisor
                                })
                                const {affectedRows} = responseCodigoEstado;
                                
                                if(affectedRows > 0){ 
                                    console.log("actualizado el codigo de estado");
                                }
                                //global.desdeEntradas +=1 * cantidad;
                            }
                            
                            setTimeout(async() => {
                                // obtener el token token

                                const objToken = {
                                    userHacienda: encabezadoEntrada[0].key_username_hacienda, 
                                    passHacienda: encabezadoEntrada[0].key_password_hacienda, 
                                    TOKEN_API: encabezadoEntrada[0].TOKEN_API, 
                                    Client_ID: encabezadoEntrada[0].Client_ID, 
                                    userAgent: ''
                                }


                                FacturaElectronica.generarAuthToken({objToken}).then(({access_token}) => {
                                    const objEstado = {
                                        clave: clavenumerica, 
                                        token: access_token , 
                                        userAgent: '', 
                                        API: encabezadoEntrada[0].API
                                    }
                                    FacturaElectronica.obtenerEstado(objEstado).then(responseEstado => {
                                        const estado = responseEstado.data['ind-estado'];
                                        const acuseXml = responseEstado.data['respuesta-xml'];
                                        
                                        if(estado !='procesando'){
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
    
                                                        if(affectedRows > 0){//response.data['respuesta-xml']
                                                            console.log('El comprobante de compra se ha generado')
                                                        } else {
                                                            console.log('NO se ha guardado el acuse del comprobante en la base de datos')
                                                        }
                                                    }).catch(err => {
                                                        console.log(err);
                                                        console.log('Ha ocurrido un error al generar el comprobante');
                                                        iniciar += 1;
                                                        global.desdeEntradas =iniciar * cantidad;
                                                            
                                                    })
                                                } else {
                                                    console.log('No se pudo obtener el estado final del comprobante');
                                                    iniciar += 1;
                                                        global.desdeEntradas =iniciar * cantidad;
                                                        
                                                }
                                            }).catch(err => {
                                                console.log(err);
                                                console.log('No se pudo obtener el estado del comprobante')
                                                iniciar += 1;
                                                        global.desdeEntradas =iniciar * cantidad;
                                                    
                                            })
                                        } else {
                                            console.log("La factura no terminado de ser procesada por el ministerio de hacienda");
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                        console.log('No se pudo obtener el estado del comprobante')
                                        iniciar += 1;
                                                        global.desdeEntradas =iniciar * cantidad;
                                            
                                    })
                                })
                                .catch(err => {
                                    console.log("No se pudo obtener el token")
                                })
                            }, 9000)

                        } catch (error) {
                            //global.desdeEntradas +=1 * cantidad;
                            iniciar += 1;
                            global.desdeEntradas =iniciar * cantidad;
                            console.log("error al generar la entrada ", error);
                        }
                    }
                }
                iniciar += 1;
                global.desdeEntradas =iniciar ;
                console.log("Iniciar" , iniciar);
            }
        })
        .catch(err => {
            console.log("error al obtener las entradas sin enviar ",err)
        })
    })
    .catch(err => {
        console.log("Error en la conexion de internet")
        console.error(err)
    });
}

const facturasNoEnviadasPorCorreo = async () => {
    try {
            
        
        //evitarEstadoSuspension(); ////elmina syn por error de desconexion
        await Email.enviarCorreoMasivo();
        
    }catch(err) {
        console.log("Error en el job de correos",err);
    }
}
const notasCreditoNoEnviadas =  () => {
    let xml = null, cantidad = 40,indice=0;
    console.log("Antes de paginar Notas Credito");
    Factura.paginarNotasCreditoNoEnviadas(cantidad,global.desdeNotas).then(async responseNoEnviada => {
        let noEnviadas = responseNoEnviada;
        console.log("Paso por Notas Credito");
        if(noEnviadas.length === 0) {
            global.desdeNotas= 0;
            noEnviadas = await Factura.paginarNotasCreditoNoEnviadas(cantidad,global.desdeNotas);
        }

        for(const i in noEnviadas){
            indice++;
            
            Factura.obtenerInformacionFacturaNoEnviadas({id : noEnviadas[i].id, tipo_factura: noEnviadas[i].tipo_factura})
            .then(async datosFactura => {

                Xml.obtenerXML({ idfactura: noEnviadas[i].id, tipo: 'Nota de Crédito' })
                .then(async existe => {


                    if(existe.length === 0){
                        //crear el xml 
                        const obj = {idfactura: noEnviadas[i].id, tipo:  noEnviadas[i].tipo_factura};
                        xml = await  obtenerFacturasNoEnviadasSinXml(obj,noEnviadas[i].idemisor)
                    } else {
                        //Obtener el token y enviar el 
                        xml = existe[0].xml;
                    }


                    if(noEnviadas[i].codigo_estado == null){ //generar token y enviar 

                        const objToken = {
                            userHacienda: datosFactura[0].key_username_hacienda, 
                            passHacienda: datosFactura[0].key_password_hacienda, 
                            TOKEN_API: datosFactura[0].TOKEN_API, 
                            Client_ID: datosFactura[0].Client_ID, 
                            userAgent: ''
                        }
            
                        let objSendComprobante = {}
                        
                       
                        if(datosFactura[0].datosReceptor == null){
                            objSendComprobante = {
                                API: datosFactura[0].API, 
                                emisor: {
                                    "tipoIdentificacion": datosFactura[0].emisor_tipo_identificacion,
                                    "numeroIdentificacion": datosFactura[0].numero_emisor
                                }, 
                                clave: datosFactura[0].clavenumerica, 
                                fecha: datosFactura[0].fecha_factura, 
                                userAgent: '', 
                                comprobanteXml: xml,
                                idemisor : noEnviadas[i].idemisor
                            };
                        } else {
                        
                            objSendComprobante = {
                                API: datosFactura[0].API, 
                                emisor: {
                                    "tipoIdentificacion": datosFactura[0].emisor_tipo_identificacion,
                                    "numeroIdentificacion": datosFactura[0].numero_emisor
                                }, 
                                receptor: {
                                    "tipoIdentificacion": datosFactura[0].datosReceptor.tipoIdentificacion,
                                    "numeroIdentificacion": datosFactura[0].datosReceptor.numeroIdentificacion
                                }, 
                                clave: datosFactura[0].clavenumerica, 
                                fecha: datosFactura[0].fecha_factura, 
                                userAgent: '', 
                                comprobanteXml: xml,
                                idemisor : noEnviadas[i].idemisor
                            };
                        }

                        console.log({objToken, objSendComprobante});
                       
                        FacturaElectronica.enviarDoc({objToken, objSendComprobante}).then(respuesta => {

                            const {codigo,estado,access_token} = respuesta;
                            
                            //noEnviadas[i].tipo_factura    
                                console.log("nota de credito",{respuesta});
                                Factura.actualizarCodigoEstado({
                                    tipo_factura: noEnviadas[i].tipo_factura, status: codigo, clave: datosFactura[0].clavenumerica,emisor: noEnviadas[i].idemisor 
                                }).then( () => {
                                    FacturaElectronica.obtenerEstadoComprobante(datosFactura[0].clavenumerica,access_token,datosFactura[0].API,'',noEnviadas[i].id,noEnviadas[i].tipo_factura).then(estadoComprobante => {

                                        console.log("estado final ",estadoComprobante);

                                    });
                                }).catch(err => {
                                    console.log(err);
                                })
                
                            
                        }).catch(err => {
                            console.log(err);
                            //iniciar+=1;

                            if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                Emisor.actualizarEstado({estado: 2,idemisor: noEnviadas[id].idemisor}).then(response => {
                                    if(response.affectedRows > 0) {
                                        console.log("estado emisor actualizado")
                                    } else {
                                        console.log("No se pudo actualizar el estado del emisor")
                                    }
                                }) .catch(err => console.log(err));
                            }
                            global.desdeNotas +=1  * cantidad;
                        })        
            
                    } else { // obtener el estado y actualizar
                        const objToken = {
                            userHacienda: datosFactura[0].key_username_hacienda, 
                            passHacienda: datosFactura[0].key_password_hacienda, 
                            TOKEN_API: datosFactura[0].TOKEN_API, 
                            Client_ID: datosFactura[0].Client_ID, 
                            userAgent: ''
                        }

                        const obj = {
                            objToken
                        }
                        FacturaElectronica.generarAuthToken(obj).then(token => {
                        
                            const {access_token} = token;

                            FacturaElectronica.obtenerEstadoComprobante(datosFactura[0].clavenumerica,access_token,datosFactura[0].API,'',noEnviadas[i].id,noEnviadas[i].tipo_factura).then(estadoComprobante => {

                                
                                Factura.actualizarEstadoFactura({ idfactura:noEnviadas[i].id,tipo_factura: noEnviadas[i].tipo_factura, status: estadoComprobante, clave: datosFactura[0].clavenumerica, idemisor: noEnviadas[i].idemisor}).then(responseActualizarEstado => {    
                                    const { affectedRows } = responseActualizarEstado ;

                                    if(affectedRows > 0){
                                        if(estadoComprobante == 'aceptado'){
                                            //console.log(responseActualizarEstado)

                                            Factura.actualizarEstadoAnuladoPorClavenumerica(datosFactura[0].claveref)
                                            .then(responseAnulada => {

                                                const {affectedRows} = responseAnulada;
                                                
                                                if(affectedRows > 0){
                                                    console.log("Nota de creduito de anulacion aceptada y creada correctamente");
                                                } else {
                                                    console.log("NO se pudo actualizar el estado de anulacion de la nota de credito")
                                                }

                                            }).catch(err => {
                                                console.log(err);
                                            })
                                        } else {
                                            console.log("Nota de creduito de anulacion rechazada");
                                        }
                                    } else {
                                        console.log("No se pudo actualizar el estadi de la nota")
                                    }

                                }).catch(err => {
                                    console.log(err);
                                })

                            }).catch(err => {
                                console.log(err.err);
                            })

                        }).catch(err => {
                            console.log(err);
                            if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                Emisor.actualizarEstado({estado: 2,idemisor: noEnviadas[id].idemisor}).then(response => {
                                    if(response.affectedRows > 0) {
                                        console.log("estado emisor actualizado")
                                    } else {
                                        console.log("No se pudo actualizar el estado del emisor")
                                    }
                                }) .catch(err => console.log(err));
                            }
                        })   
                    }

                    console.log(xml);
                    if(indice === noEnviadas.length){
                        iniciar+=1;
                        global.desdeNotas = iniciar * cantidad;
                    }
                }).catch(err => {
                    console.log(err);
                })

            }).catch(err => {
                console.log(err);
            })
        }  
    }).catch(err => {
        console.log(err);
    })
    
}

const enviarbk = (cantidad) => {
    chequearConexionAInternet(config)
        .then(data => {
        //evitarEstadoSuspension();////elmina syn por error de desconexion
        let facturas = null;
        let cant = 15;
        let desdeaca= 0;
            console.log("DESDE", global.desde);
            //actualizarTipoCambioFacturas();
            global.desde+=1;
            Factura.paginarFacturasNoEnviadas(cant,global.desde)
                .then(async response => {
                    console.log("Facturas ",facturas);
                    if(response.length == 0){
                        global.desde = 0;
                        iniciar= 0;
                        console.log("No hay Facturas");
                        facturas = await Factura.paginarFacturasNoEnviadas(cant,global.desde);
                    } else {
                        facturas = response;
                        console.log("Facturas ",facturas);
                    } 

                    if (facturas.length > 0) {
                        let f = 0; 
                        for (let id in facturas) {
                            f++;
                            const obj = {
                                idfactura: facturas[id].id,
                                tipo: facturas[id].tipo_factura
                            }
                            console.log("Documento",facturas[id].id);
                            console.log(global.desde);
                            Xml.obtenerXML(obj)
                            .then(async respuestaXml => {
                            try {
                                let xml = '';
                                if(respuestaXml.length === 0){
                                    const objFactura = {
                                        idemisor: facturas[id].idemisor,
                                        tipo: obj.tipo,
                                        idfactura: obj.idfactura
                                    }
                                    xml =  await obtenerFacturasNoEnviadasSinXml(objFactura,facturas[id].idemisor);
                                console.log(" await obtenerFacturasNoEnviadasSinXml")
                                } else {
                        
                                    xml = respuestaXml[0].xml;
                                }
                                const objFacturasNoEnvidas = {
                                    tipo_factura: facturas[id].tipo_factura,
                                    id: facturas[id].id
                                }
                        
                                console.log("id factura ",facturas[id].id)
                                console.log("XML GENERADO DESDE CRON JOB", xml);
                                const facturasNoEnviadas = await Factura.obtenerInformacionFacturaNoEnviadas(objFacturasNoEnvidas);
                                console.log(" await obtenerInformacionFacturaNoEnviadas")
                                //console.log("factura ",facturasNoEnviadas); return;
                                const codigoEstado = await Factura.obtenerCodigoEstado(objFacturasNoEnvidas)
                                if (codigoEstado[0].codigo_estado == null || codigoEstado[0].codigo_estado == '') {
                                    let data = {
                                        objToken: {
                                            userHacienda: facturasNoEnviadas[0].key_username_hacienda,
                                            passHacienda: facturasNoEnviadas[0].key_password_hacienda,
                                            TOKEN_API: facturasNoEnviadas[0].TOKEN_API,
                                            Client_ID: facturasNoEnviadas[0].Client_ID,
                                            userAgent: ''
                                        },
                        
                                        objSendComprobante: {
                                            API: facturasNoEnviadas[0].API,
                                            emisor: {
                                                "tipoIdentificacion": facturasNoEnviadas[0].emisor_tipo_identificacion,
                                                "numeroIdentificacion": facturasNoEnviadas[0].numero_emisor
                                            },
                                            receptor: {
                                                "tipoIdentificacion": null,
                                                "numeroIdentificacion": null
                                            },
                                            clave: facturasNoEnviadas[0].clavenumerica,
                                            fecha: facturasNoEnviadas[0].fecha_factura,
                                            userAgent: '',
                                            comprobanteXml: xml
                                        }
                                    }
                        
                                    if (facturasNoEnviadas[0].datosReceptor != null) {
                        
                                        data.objSendComprobante.receptor.tipoIdentificacion = facturasNoEnviadas[0].datosReceptor.tipoIdentificacion;
                        
                                        data.objSendComprobante.receptornumeroIdentificacion = facturasNoEnviadas[0].datosReceptor.numeroIdentificacion;
                                    }
                        
                                    FacturaElectronica.enviarDoc(data)
                                        .then(response => {
                                            const { status } = response;
                                            
                                            if ((status == '202') || status == '400') { //CAMBIO SYN
                                                FacturaElectronica.obtenerEstadoComprobante(facturasNoEnviadas[0].clavenumerica, access_token, facturasNoEnviadas[0].API, '', facturas[id].id)
                                                    .then(data => {
                                                        console.log("Estado final .............",data)
                        
                                                        Factura.actualizarEstadoFactura({idfactura:facturasNoEnviadas[0].id,status: data, clave:facturasNoEnviadas[0].clavenumerica, tipo_factura: facturas[id].tipo_factura }).then(actualizado => console.log("Actualizado desde recogiendo el status de la factura"))
                                                    })
                                                    .catch(err => console.log(data));
                                            }
                                        }).catch(err => {
                                            console.log("ERROR AL ENVIAR LA FACTURA SYN", err);
                                            if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                                Emisor.actualizarEstado({estado: 2,idemisor: facturas[id].idemisor}).then(response => {
                                                    if(response.affectedRows > 0) {
                                                        console.log("estado emisor actualizado")
                                                    } else {
                                                        console.log("No se pudo actualizar el estado del emisor")
                                                    }
                                                }) .catch(err => console.log(err));
                                            }
                                            console.log("ERROR AL ENVIAR LA FACTURA", err);
                                            //iniciar +=1;
                                            //global.desde +=1 * cantidad; //CAMBIO SYN
                                            //global.desde +=1 ;
                                        });
                                        console.log("Procesado id: ",facturas[id].id );
                                        // global.desde+=1;  //AGREGADO X SYN
                                        global.desde = facturas[id].id; //CAMBIO SYN
                                        global.desde+=1;  //AGREGADO X SYN
                                        console.log("Global desde envio:",global.desde);
                                } else {
                                    console.log("Enviar comprobante", facturasNoEnviadas);
                                    //obtener el estado de la factura
                        
                                    const obj = {
                                        objToken: {
                                            userHacienda: facturasNoEnviadas[0].key_username_hacienda,
                                            passHacienda: facturasNoEnviadas[0].key_password_hacienda,
                                            TOKEN_API: facturasNoEnviadas[0].TOKEN_API,
                                            Client_ID: facturasNoEnviadas[0].Client_ID,
                                            userAgent: ''
                                        }
                                    }
                        
                                    FacturaElectronica.generarAuthToken(obj)
                                        .then(respuestaToken => {
                                            const { access_token } = respuestaToken;
                        
                                            FacturaElectronica.obtenerEstadoComprobante(facturasNoEnviadas[0].clavenumerica,
                                                    access_token, facturasNoEnviadas[0].API, '', facturas[id].id)
                                                .then(data => {
                                                    console.log("Estado final ",data);
                                                    Factura.actualizarEstadoFactura({idfactura:facturasNoEnviadas[0].id,status: data, clave:facturasNoEnviadas[0].clavenumerica, tipo_factura: facturas[id].tipo_factura })
                                                    .then(actualizado => {
                                                        console.log("Actualizado id: ",facturas[id].id );
                                                       // global.desde+=1;  //AGREGADO X SYN
                                                       global.desde = facturas[id].id; //CAMBIO SYN
                                                       global.desde+=1;  //AGREGADO X SYN
                                                        console.log("Global desde1:",global.desde);
                                                    })
                                            })
                                            .catch(err => console.log(err));
                                    }).catch(err => {
                                        if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                            Emisor.actualizarEstado({estado: 2,idemisor: facturas[id].idemisor}).then(response => {
                                                if(response.affectedRows > 0) {
                                                    console.log("estado emisor actualizado")
                                                } else {
                                                    console.log("No se pudo actualizar el estado del emisor")
                                                }
                                            }) .catch(err => console.log(err));
                                        }
                                    })

                                }
                                /*
                                    if(indice === noEnviadas.length){
                                    iniciar+=1;
                                    global.desdeNotas = iniciar * cantidad;
                                }
                                */

                                /*if(f == facturas.length){
                                    console.log("F IGUAL QUE LENGTH id: ",facturas[id].id);

                                    iniciar +=1; // cambio syn
                                    //global.desde =0;//CAMBIO SYN
                                    
                                    //global.desde  = facturas[id].id  ;
                                    console.log("EN IF DENTRO FOR ", global.desde);
                                }*/
                            } catch(err){
                                console.log("cayo en el error",err);
                                    iniciar +=1;
                                    //global.desde = iniciar * cantidad;//CAMBIO SYN
                                    
                                    //global.desde  =  iniciar;
                            }
                            })
                            .catch(err => {
                                console.log("ERROR EN XML",err);
                                global.desde=0; ///AGREGADO X SYN
                            });
                            global.desde = facturas[id].id;
                            global.desde+=1;  //AGREGADO X SYN
                            // global.desde = facturas[cant].id;
                            console.log("Se actualizo FF global desde1 : ",global.desde)
                        }
                        console.log("ESTE ID OCUPO ", global.desde);
                        //global.desde=0; ///AGREGADO X SYN
                    }
            })
            .catch(err => {
                console.log(err);
                //global.desde=0; ///AGREGADO X SYN
            });
            //global.desde=0;
        })
        //.catch(err => console.error(err)); //cambio SYN
        .catch(err => {
            console.log("catch Envio",err)});
}

const enviar = (cantidad) => {
    chequearConexionAInternet(config)
        .then(data => {
       // evitarEstadoSuspension();////elmina syn por error de desconexion
        let facturas = null;
        let cant = 80;
            console.log("DESDE", global.desde);
            //actualizarTipoCambioFacturas();
            Factura.paginarFacturasNoEnviadas(cant,global.desde)
                .then(async response => {
                    console.log("Facturas ",facturas);
                    if(response.length == 0){
                        global.desde = 0;
                        console.log("No hay Facturas");
                        facturas = await Factura.paginarFacturasNoEnviadas(cant,global.desde);
                    } else {
                        facturas = response;
                    } 

                    if (facturas.length > 0) {
                        let f = 0; 
                        for (let id in facturas) {
                            f++;
                            const obj = {
                                idfactura: facturas[id].id,
                                tipo: facturas[id].tipo_factura
                            }
                            Xml.obtenerXML(obj)
                            .then(async respuestaXml => {
                            try {
                                let xml = '';
                                if(respuestaXml.length === 0){
                                    const objFactura = {
                                        idemisor: facturas[id].idemisor,
                                        tipo: obj.tipo,
                                        idfactura: obj.idfactura
                                    }
                                    xml =  await obtenerFacturasNoEnviadasSinXml(objFactura,facturas[id].idemisor);
                                console.log(" await obtenerFacturasNoEnviadasSinXml")
                                } else {
                        
                                    xml = respuestaXml[0].xml;
                                }
                                const objFacturasNoEnvidas = {
                                    tipo_factura: facturas[id].tipo_factura,
                                    id: facturas[id].id
                                }
                        
                                console.log("id factura ",facturas[id].id)
                                console.log("XML GENERADO DESDE CRON JOB", xml);
                                const facturasNoEnviadas = await Factura.obtenerInformacionFacturaNoEnviadas(objFacturasNoEnvidas);
                                console.log(" await obtenerInformacionFacturaNoEnviadas")
                                //console.log("factura ",facturasNoEnviadas); return;
                                const codigoEstado = await Factura.obtenerCodigoEstado(objFacturasNoEnvidas)
                                if (codigoEstado[0].codigo_estado == null || codigoEstado[0].codigo_estado == '') {
                                    let data = {
                                        objToken: {
                                            userHacienda: facturasNoEnviadas[0].key_username_hacienda,
                                            passHacienda: facturasNoEnviadas[0].key_password_hacienda,
                                            TOKEN_API: facturasNoEnviadas[0].TOKEN_API,
                                            Client_ID: facturasNoEnviadas[0].Client_ID,
                                            userAgent: ''
                                        },
                        
                                        objSendComprobante: {
                                            API: facturasNoEnviadas[0].API,
                                            emisor: {
                                                "tipoIdentificacion": facturasNoEnviadas[0].emisor_tipo_identificacion,
                                                "numeroIdentificacion": facturasNoEnviadas[0].numero_emisor
                                            },
                                            receptor: {
                                                "tipoIdentificacion": null,
                                                "numeroIdentificacion": null
                                            },
                                            clave: facturasNoEnviadas[0].clavenumerica,
                                            fecha: facturasNoEnviadas[0].fecha_factura,
                                            userAgent: '',
                                            comprobanteXml: xml,
                                            idemisor:facturasNoEnviadas[0].idemisor
                                        }
                                    }
                        
                                    if (facturasNoEnviadas[0].datosReceptor != null) {
                        
                                        data.objSendComprobante.receptor.tipoIdentificacion = facturasNoEnviadas[0].datosReceptor.tipoIdentificacion;
                        
                                        data.objSendComprobante.receptornumeroIdentificacion = facturasNoEnviadas[0].datosReceptor.numeroIdentificacion;
                                    }
                        
                                    FacturaElectronica.enviarDoc(data)
                                        .then(response => {
                                            const { status } = response;
                                            
                                            if (status == 202 || status == '400') { //CAMBIO SYN
                                                FacturaElectronica.obtenerEstadoComprobante(facturasNoEnviadas[0].clavenumerica, access_token, facturasNoEnviadas[0].API, '', facturas[id].id)
                                                    .then(data => {
                                                        console.log("Estado final .............",data)
                        
                                                        Factura.actualizarEstadoFactura({idfactura:facturas[id].id,status: data, clave:facturasNoEnviadas[0].clavenumerica, tipo_factura: facturas[id].tipo_factura, idemisor:facturasNoEnviadas[0].idemisor }).then(actualizado => console.log("Actualizado desde recogiendo el status de la factura"))
                                                    })
                                                    .catch(err => console.log(data));
                                            }
                                        }).catch(err => {
                                            if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                                Emisor.actualizarEstado({estado: 2,idemisor: facturas[id].idemisor}).then(response => {
                                                    if(response.affectedRows > 0) {
                                                        console.log("estado emisor actualizado")
                                                    } else {
                                                        console.log("No se pudo actualizar el estado del emisor")
                                                    }
                                                }) .catch(err => console.log(err));
                                            }
                                            console.log('ERROR AL ENVIAR LA FACTURA');
                                            //iniciar +=1;
                                            global.desde +=1 * cantidad;
                                        });
                                } else {
                                    console.log("Enviar comprobante", facturasNoEnviadas);
                                    //obtener el estado de la factura
                        
                                    const obj = {
                                        objToken: {
                                            userHacienda: facturasNoEnviadas[0].key_username_hacienda,
                                            passHacienda: facturasNoEnviadas[0].key_password_hacienda,
                                            TOKEN_API: facturasNoEnviadas[0].TOKEN_API,
                                            Client_ID: facturasNoEnviadas[0].Client_ID,
                                            userAgent: ''
                                        }
                                    }
                        
                                    FacturaElectronica.generarAuthToken(obj)
                                        .then(respuestaToken => {
                                            const { access_token } = respuestaToken;
                        
                                            FacturaElectronica.obtenerEstadoComprobante(facturasNoEnviadas[0].clavenumerica,
                                                    access_token, facturasNoEnviadas[0].API, '', facturas[id].id)
                                                .then(data => {
                                                    console.log("Estado final ",data);
                                                    Factura.actualizarEstadoFactura({idfactura:facturas[id].id,status: data, clave:facturasNoEnviadas[0].clavenumerica, tipo_factura: facturas[id].tipo_factura,idemisor:facturasNoEnviadas[0].idemisor })
                                                    .then(actualizado => {console.log("Actualizado")})
                                            })
                                            .catch(err => console.log(err));
                                    }).catch(err => {
                                        if(err == 'Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.') {
                                            Emisor.actualizarEstado({estado: 2,idemisor: facturas[id].idemisor}).then(response => {
                                                if(response.affectedRows > 0) {
                                                    console.log("estado emisor actualizado")
                                                } else {
                                                    console.log("No se pudo actualizar el estado del emisor")
                                                }
                                            }) .catch(err => console.log(err));
                                        }
                                    })

                                }
                                /*
                                    if(indice === noEnviadas.length){
                                    iniciar+=1;
                                    global.desdeNotas = iniciar * cantidad;
                                }
                                */

                                if(f == facturas.length){

                                    iniciar +=1;
                                    global.desde = iniciar * cantidad;
                                }
                            } catch(err){
                                console.log("cayo en el error",err);
                                    iniciar +=1;
                                    global.desde = iniciar * cantidad;
                            }
                            })
                            //.catch(err => console.log(err));
                            .catch(err => {
                                console.log("catch Envio",err)});
                        }
                    }
            })
            //.catch(err => console.log(err));
            .catch(err => {
                console.log("catch Envio",err)});
        })
        //.catch(err => console.log(err));
        .catch(err => {
            console.log("catch Envio",err)});
}

const obtenerFacturasNoEnviadasSinXml =(obj,idemisor) => {
   
    return new Promise((resolve,reject) => {
        Factura.obtenerDatosReporteFactura(obj)
        .then(datosFactura => {
            const objOrdenes = {
                idfactura: obj.idfactura,
                tipo: obj.tipo,
                idemisor
            }
        FactuaDetalle.obtenerOrdenesPorFactura(objOrdenes)
            .then(dataOrdenes => {

                Emisor.obtenerCredencialesLlaveCriptografica(idemisor,obj.idfactura,'02')
                        .then(dataLlave => {
                            const configLlave = dataLlave[0];
                            FacturaElectronica.crearXML(datosFactura[0],dataOrdenes,obj.tipo,configLlave.file_p12, configLlave.pin_p12,obj.idfactura)
                                .then(  xmlCreado => {
                                    console.log("XML creado", xmlCreado); 
                                    resolve(xmlCreado);
                                    
                                })
                                .catch(err => {
                                    console.log("catch crearXML")
                                    reject(err);
                                    
                                })
                    }).catch(err => {
                        console.log("catch crearXML")
                        reject(err)});
            }).catch(err => {
                console.log("catch crearXML")
                reject(err)});

        }).catch(err => {
            console.log("catch crearXML")
            reject(err)});
    })
}

let job = function(callback) {
    setTimeout(function() {
        console.log('JOB FC EXECUTED');
        enviar(5);
        callback();
    }, 120000);
} 


let job2 = function(callback) {
    setTimeout(async function() {
        console.log('JOB NC EXECUTED');
        notasCreditoNoEnviadas();
        callback();
    }, 120000);
}

let job3 = async (callback) => {
 // parametros de la funcion de enviar correos
 //nombreComprobante, textoComprobanteXML, nombreAcuse, textoAcuseXML, rutaPDF, pdf, correo
       setTimeout( () => {
        console.log('JOB EMAIL EXECUTED');   
        facturasNoEnviadasPorCorreo();
        callback();
       }, 120000)
}

let job4 = async (callback) => {

    setTimeout(() => {
        console.log('JOB ENT EXECUTED');
        enviarEntradasSinEstado();
        callback();
    }, 120000);
}


const crearPDF = (texto, id) => {
    console.log("Funcion de crear el pdf");
    return new Promise((resolve,reject) => {
        const path = 'pdf/'+id+'.pdf';
        consulta.generarPDFDeComprobante(texto,path)
            .then(respuesta => {
                resolve(respuesta);
            })
        .catch(err => reject(err));
    })
        
}
let q = async.queue(function(task, callback) {
    task(callback);
}, NUMBER_CONCURRENT_JOBS);


const enviarReporteRecepcionPorCorreo = (obj) => {
    
    return new Promise((resolve,reject) => {
        const {clave, idfactura, tipo, estado, correo,emisor} = obj;
    
        Xml.obtenerRespuestaMensajeAceptacion(idfactura)
        .then(respuestaXml => {
            console.log(respuestaXml);
            if(respuestaXml.length == 0){
                   reject('No se pudo obtener la respuesta de mensaje del receptor para el envio del reporte');
            } else {
                const nombreComprobante = 'Respuesta_'+clave+'.xml'; 
                const textoComprobante = respuestaXml[0].respuestaMensajeAceptacion;
            
                Email.enviarCorreo('','',nombreComprobante,textoComprobante,'','','','',correo,estado,emisor)
                    .then(responseCorreo => {
                        resolve(true);
                })
                .catch(err => {
                    console.log(err);
                    reject('No se pudo enviar el correo')});
            }       
        })
    })
}

const evitarEstadoSuspension = async () =>{
    try {
        const response = await axios.get("https://fewebbksf.herokuapp.com/home");
        const response1 = await axios.get("https://apifacturaelectronicapruebas.herokuapp.com/home");
        console.log("response fewebbksf ", response.data);
        console.log("response pruebas ", response1.data);
    } catch (error) {
        console.log("err heroku", error);
    }
}

//lista de jobs del api para enviar comprobantes en contingencia
/*
    new CronJob('* * * * * *', function() { // cron job de envio  de notas de credito de anulacion
        console.log('JOB REQUIRED2');
        q.push(job2);
    }, null, true, 'America/Costa_Rica');

    new CronJob('* * * * * *', function() { // cron job de envio  facturas
    console.log('JOB REQUIRED1');
    q.push(job);
}, null, true, 'America/Costa_Rica');

new CronJob('* * * * * *', function() { // cron job de envio  facturas
    console.log('JOB REQUIRED3');
    q.push(job3);
}, null, true, 'America/Costa_Rica');

new CronJob('* * * * * *', function() { // cron job de envio  de correos
    console.log('JOB REQUIRED4');
    q.push(job4);
}, null, true, 'America/Costa_Rica'); //comentario


*/



process.on('message', (message) => {
   //message = 'NotaCredito';
   //message = 'FacturasSinCorreo'; ///SOLO CORREOS SYN
    console.log(message)
    //AGREGADO PARA QUE SE PUEDA ACTUALIZAR LAS VARIABLE MESSAGE
  /*  for (var i = 1; i < 2; i++) {  //CAMBIO SYN DE 5 A 2
        if(i == 1) {
            message = 'Facturas';   
        }    
        else if(i == 2) {
            message = 'NotaCredito';
         
        } 
        else if(i == 3) {
            message = 'FacturasSinCorreo';
         
        } 
        else  {
            message = 'Entradas';
         
        }
        message = 'NotaCredito'; ///SOLO CORREOS SYN
        console.log(message)*/
 //FIN DE AGREGADO POR SYN   
        //message = 'Facturas'; ///SOLO CORREOS SYN
        console.log("Esto Trae el message: ",message);
        if (message == 'Facturas') {  
            enviar(5); ///eran 5 cambio SYN a 15
            console.log("Entro en Facturas");
            process.send('proceso de facturas completado');
        }
        if (message == 'Facturas2') {  
            enviar2(5); ///eran 5 cambio SYN a 15
            console.log("Entro en Facturas con codigo de estado");
            process.send('proceso de facturas completado');
        }
        else if(message == 'NotaCredito') {
            notasCreditoNoEnviadas();
            console.log("Entro en NC");
            process.send('proceso de notas de credito completado');
        }
        else if(message == 'FacturasSinCorreo') {
            facturasNoEnviadasPorCorreo();
            console.log("Entro en Correos");
            process.send('proceso de envío de correos completado');
        } else if(message == 'Entradas') {
            enviarEntradasSinEstado();
            console.log("Entro en Entradas");
            process.send('proceso de entradas completado');
        }
   // };
});
/*setInterval(async() => {
    try{
        const online = await Factura.mantenerOnlineLaBd();
        console.log("BD ONLINE");

    }catch(err){
        console.log(err);
        console.log("No hay conexion")
    }   
},10000);


//job4
//job5
module.exports = {
    enviar
}
//Investigar mas a fondo el child process para separar procesos en node, usar eso para montar en uno solo job los procesos de reenvio de comprobantes y correos
/**
 * 
 * const facturasNoEnviadasPorCorreo = async () => {
    try {
            
        let nombreComprobante = '';
        let textoComprobanteXML ='';
        let nombreAcuse = '';
        let textoAcuseXML= '';
        let rutaPDF = '';
        let PDF ='';
        let reporte = '';
        let indice = 0
        const cantidadCorreos =10;
       // evitarEstadoSuspension(); ////elmina syn por error de desconexion

        const idsFactura = await Factura.facturasAceptadasSinEnviarPorCorreo(global.desdeCorreos,cantidadCorreos); //lista
        //console.log(idsFactura);
        async.each(idsFactura, async (dataIdsFactura, callback) => {

            const objtoXml = {
                idfactura: dataIdsFactura.id,
                tipo: dataIdsFactura.tipo_factura
            }
           // console.log("correo ",factura[0].datosCliente.cliente_correo)
            const factura = await Factura.obtenerDatosReporteFactura(objtoXml); //una linea
            let ordenes = await FactuaDetalle.obtenerOrdenesPorFactura({idfactura: dataIdsFactura.id,
                tipo: dataIdsFactura.tipo_factura,idemisor: dataIdsFactura.idemisor });
            const clave = factura[0].clavenumerica;
            if(ordenes.length > 0){
                if(factura[0].datosCliente !== null){
                    reporte = await consulta.crearReporteConReceptor(ordenes,factura[0]);
                    crearPDF(reporte,clave)
                        .then(async response => {
                            const xml = await Xml.obtenerXML(objtoXml);
                            if(xml.length > 0){
                                if(typeof xml[0].acuseXml !== 'undefined' || xml[0].acuseXml != null){
                                    
                                    nombreComprobante = clave+'.xml';
                                    textoComprobanteXML = xml[0].xml;
                                    nombreAcuse = 'Respuesta_'+nombreComprobante;
                                    textoAcuseXML = xml[0].acuseXml;
                                    //rutaPDF = __dirname +'/../pdf/'+clave+'.pdf';
                                    const ruta = '../pdf/' + clave + '.pdf';
                                    const root = path.join(__dirname, ruta);
                                    rutaPDF = root;
                                    PDF= clave+'.pdf';
                                    const idfactura = dataIdsFactura.id;                  
                                    const expresion = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                                          console.log({corre_cliente: factura[0].datosCliente.cliente_correo})                                      
                                        if(expresion.test(factura[0].datosCliente.cliente_correo)){
                                            Email.enviarCorreoMasivo('','',nombreComprobante,textoComprobanteXML,nombreAcuse,textoAcuseXML,rutaPDF,PDF,factura[0].datosCliente.cliente_correo,factura[0].emisor_nombre || factura[0].emisor_nombrecomercial)
                                            .then(response => {
                                                
                                            // console.log("RESPUESTA CORREOS ENVIADOS",response);

                                                Factura.actualizarEstadoEnvioCorreo(idfactura)
                                                    .then(responseFactura => {
                                                        console.log("Factura enviada por correo ", responseFactura);

                                                        Factura.actualizarErrorEnvioCorreo({
                                                            idemisor: dataIdsFactura.idemisor,
                                                            idfactura: dataIdsFactura.id,
                                                            descripcion: null
                                                        }).then(responseActualizarEstadoError => {
                                                            if(responseActualizarEstadoError.affectedRows > 0){
                                                                console.log("El estado de error email ha sido actualizado")
                                                            } else {
                                                                console.log("El estado de error email no ha sido actualizado")
                                                            }
                                                        })
                                                        .catch(err => {
                                                            console.log("error correo",err);
                                                        }) 
                                                })
                                            })
                                            .catch(err => {
                                                console.log('no se envió el correo ');
                                                console.log(err);
                                                iniciar+=1;
                                                global.desdeCorreos = iniciar//;
                                            })
                                        } else {
                                            //actualizar el estado de envioCorreo
                                            console.log("El correo no es válido");
                                            Factura.actualizarErrorEnvioCorreo({
                                                idemisor: dataIdsFactura.idemisor,
                                                idfactura: dataIdsFactura.id,
                                                descripcion: 'El correo no es válido para el envío',
                                                estado: 1
                                            }).then(responseActualizarEstadoError => {
                                                if(responseActualizarEstadoError.affectedRows > 0){
                                                    console.log("El estado de error email ha sido actualizado")
                                                } else {
                                                    console.log("El estado de error email no ha sido actualizado")
                                                }
                                            })
                                            .catch(err => {
                                                console.log("error correo",err);
                                            }) 

                                        }
                                }else {
                                    console.log("No tiene xml")
                                    console.log(factura[0].datosCliente.cliente_correo)
                                }
                            }
                        }).catch(err => {
                            iniciar+=1;
                            global.desdeCorreos = iniciar//;
                            console.log("error al  generar el comporbante ", err);
                        });
                }
            }

            if(indice === idsFactura.length){
                iniciar+=1;
                global.desdeCorreos = iniciar * cantidadCorreos;
            }
        })
    }catch(err) {
        iniciar+=1;
        global.desdeCorreos = iniciar//;
        console.log("ERRORES........",err);
        console.log(err);
    }
}
 */
