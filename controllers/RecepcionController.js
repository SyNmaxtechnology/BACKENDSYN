const ProveedorController = require("./ProveedorController"); //comentario123456fsdfsdfdsfsdfsfsdfdsdsf1234d11111111111111111111
const EntradaController = require("./EntradaController");
const FacturaFunciones = require("../functions/Factura");
const Factura = require("../models/Factura");
const Articulo = require("../models/Articulo");
const Existencia = require("../models/Existencia");
//const Entrada = require("")
const TipoImpuestoController = require("../models/TipoImpuesto");
const EntradaDetalleController = require("./EntradaDetalleController");
const FA = require("../functions/FacturaElectronica");
const Xml = require("../functions/Xml");
const multer = require("multer");
const shortid = require("shortid");
const convert = require('xml-js');
const fs = require("fs");
const jwt = require("jsonwebtoken");
const EmisorController = require("./EmisorController");
const Email = require("../functions/Email");
const base64 = require("file-base64");
const root = require("path");
const Producto = require("../models/Producto");
const ExistenciaController = require("./ExistenciaController");
const RecetaController = require("./RecetaController");
const RecepcionesNoEnviadas = require("./RecepcionesNoEnviadasController");
const Bodega = require("../models/Bodega");
const { OPENSSL_VERSION_NUMBER } = require("constants");
const imaps = require('imap-simple');
const RecepcionesNoEnviadasController = require("./RecepcionesNoEnviadasController");
const { reject } = require("bcrypt/promises");
const MedioPago = require("../ServiciosWeb/MedioPago");
const CondicionVenta = require("../ServiciosWeb/CondicionVenta");
const UnidadesMedidaServicios = ['Al', 'Alc', 'Cm', 'I', 'Os', 'Sp', 'Spe', 'St', 'd', 'h', 's'];

//const Logs = fs
// Os
//const UnidadesMedidaServicios = ['Al','Alc','Cm','I','Os','Sp','Spe','St','m','kg','s','A','K','mol','cd','m²','m³'];


const configFileXml = {
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { // donde se va subir la imagen
            next(null, __dirname + '/../recepcion/');
        },
        filename: (req, file, next) => {
            
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo
            let filename = shortid.generate()+'.'+ext;
            //filename = filename + '.xml';
            next(null, filename);
        }
    }),
    //filtrar formatos de imagen
    fileFilter: (req, file, next) => {
      
        const ext = file.mimetype.split('/')[1]; //
                if (ext === 'xml') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para archivo de recepción'), false);
        }
    }
}

const uploadXml = multer(configFileXml).single('imagen');

exports.subirXML = (req, res, next ) => {
    uploadXml(req, res, function(error) {

        if (error) {
            if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(500).json({
                        err: 'El tamaño es demasiado grande. Máximo 50KB'
                    })
                } else {
                    return res.status(500).json({ 'err': 'aqui ' + error.message });
                }

            } else if (error.hasOwnProperty('message')) { // si el objeto error contiene la propiedad
                //message.
                return res.status(500).json({
                    'error': error.message
                })
            }

        } else {
            next();
        }
    })
}

exports.visualizarRespuesta = (req,res) => {
    const {id} = req.params;
    Xml.obtenerRespuestaMensajeAceptacion(id)
        .then(response => {
            if(response.length == 0){
                res.status(500).json({
                    message: 'Ha ocurrido un error en la visualización'
                })
            } else {
                res.status(200).json({
                    respuesta: Buffer.from(response[0].respuestaMensajeAceptacion, "base64").toString("ascii")
                });
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en la visualización'
        })
    })
}

exports.descargarXml = (req, res) => {
    const {idfactura} = req.query;
    EntradaController.obtenerDatosDescarga(idfactura)
        .then(response =>  {
            if(response.length == 0){
                return res.status(404).json({
                    message: 'No se encontró la respuesta para el mensaje de aceptación'
                })
            } else {
                const {clavenumerica, estadoHacienda, respuestaMensajeAceptacion} = response[0];
                const path = __dirname + '/../respuestaRecepcion/RespuestaHacienda_'+clavenumerica+'_'+estadoHacienda+'.xml';
                let existe = true;
                fs.access(path,(err) => {
                    if(err){
                        existe = false;
                    } 

                    if(existe){
                        const pathDescarga = '../respuestaRecepcion/RespuestaHacienda_'+clavenumerica+'_'+estadoHacienda+'.xml';
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
                    
                        const comprobante = Buffer.from(respuestaMensajeAceptacion, "base64").toString("ascii");
                        const raiz = root.resolve(__dirname);
                        const path = raiz + '/../respuestaRecepcion/RespuestaHacienda_'+clavenumerica+'_'+estadoHacienda+'.xml';
                        
                        FacturaFunciones.generarArchivoXML({path,comprobante})
                            .then(generado => {
                                const pathDescarga = '../respuestaRecepcion/RespuestaHacienda_'+clavenumerica+'_'+estadoHacienda+'.xml';
                                res.download(root.join(__dirname, pathDescarga), (err) => { // el archivo se descarga
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).json({
                                            message: 'Ha ocurrido un error en la descarga'
                                        })
                                    };
                    
                                    console.log("creado y descargado");
                                })
                            })
                        .catch(err =>  {
                            console.log(err);
                            return res.status(500).json({
                                message: 'Ha ocurrido un error en la descarga'
                            })
                        })
                    }
                })
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en la descarga'
        })
    })
}

const leerArchivoXml = (ruta) => {

    return new Promise((resolve,reject) => {

        fs.readFile(ruta, 'utf8', (err,data) => {
            if(err){
                reject("read_xmlFile_fail");
            } else {
                resolve(data);
            }
        })
    })
}
const convertirXmlAJson =(xml) => {

    return new Promise((resolve,reject) => {

        try {
            resolve(convert.xml2json(xml, {compact: true, spaces: 4}))
        } catch (error) {
            reject('convert_xml_to_data_fail')
        }
    })
}


/*

//Puntos a mejorar
1- si un emisor tiene varias sucursales y el estado multisucursal esta en 1, traer todas las facturas asociadas al emisor
    con el mismo numero de cedula aunque sean de sucursales distintas
    2- al genera una recepcion de un emisor multisucursal actualizar el idemisor en la tabla de recepciones 
    para saber de cual sucursal del mismo emisor pertenece la factura
*/

//actualizacion

/*const procesarFacturasARecepciones =async(facturas,index,identradaActualArr,emisorArr,consecutivoActualArr,llaveP12,passP12,req,index) => {
    for(let factura1 of facturas){
        const respuestaDatosMensaje = await EntradaController.obtenerDatosMensajeAceptacion(identradaActualArr[index])
        if(respuestaDatosMensaje.length > 0){
         
         const objMensaje = {
             clavenumerica: respuestaDatosMensaje[0].clavenumerica,
             fecha_factura :respuestaDatosMensaje[0].fecha_factura,
             status_factura :respuestaDatosMensaje[0].status_factura,
             codicion_impuesto :respuestaDatosMensaje[0].codicion_impuesto,
             totalcomprobante :respuestaDatosMensaje[0].totalcomprobante,
             totalimpuesto :respuestaDatosMensaje[0].totalimpuesto,
             codigo_actividad :respuestaDatosMensaje[0].codigo_actividad,
             cedula_proveedor :respuestaDatosMensaje[0].cedula_proveedor,
             cedula_emisor :respuestaDatosMensaje[0].cedula_emisor,
             consecutivo: consecutivoActualArr[index] 
         } 

         // objMensaje,{},'05',llave,clave,insertId
         const objXml = {
             objMensaje,
             detalles: {},
             tipo_factura:'05',
             llave: llaveP12,
             clave: passP12,
             identrada: identradaActualArr[index]
         }

         const xmlGenerado = await generarXmlRecepcion(objXml);
         const emisorCredenciales = await EmisorController.obtenerCredencialesParaRecepcion(identradaActualArr[index])
         if(emisorCredenciales.length > 0){

             const obj = {
                 objToken : {
                     userHacienda: emisorCredenciales[0].key_username_hacienda, 
                     passHacienda: emisorCredenciales[0].key_password_hacienda, 
                     TOKEN_API: emisorCredenciales[0].TOKEN_API, 
                     Client_ID: emisorCredenciales[0].Client_ID, 
                     userAgent: req.get('user-agent')
                 }
             }
             
             console.log("obj credenciales ",obj);

             const dataToken = await generarToken(obj);
             const {access_token} = dataToken; 

             const jsonRecepcion = {
                 clave: objMensaje.clavenumerica,
                 fecha: objMensaje.fecha_factura,
                 emisor: {
                     tipoIdentificacion: emisorArr[index].tipo,//PROVEEDOR
                     numeroIdentificacion: emisorArr[index].numero
                 },
                 receptor: {
                     tipoIdentificacion: receptorActual.tipo,//EMISOR DEL SISTEMA
                     numeroIdentificacion: receptorActual.numero
                 },
                 consecutivoReceptor: consecutivoActualArr[index],
                 comprobanteXml: xmlGenerado,
                 API: emisorCredenciales[0].API,
                 userAgent: req.get('user-agent'),
                 token: access_token
             }

             console.log("obj jsonRecepcion ",jsonRecepcion);

             const respuestaEnvio = await enviarRecepcion(jsonRecepcion);
             console.log("respuesta envio ", respuestaEnvio)
             const objActualizarEstadoEntrada = {
                 codigo_estado: respuestaEnvio,
                 idemisor, 
                 identrada: identradaActualArr[index]
             }
             const responseCodigo = await actualizarCodigoEstadoEntrada(objActualizarEstadoEntrada);

             if(responseCodigo.affectedRows == 0){
                 console.log("No se actualizó el codigo de estado")
             } else {
                 console.log("Se ha actualizado el codigo de estado");
             }

             const objEstadoMensaje = {
                 API: emisorCredenciales[0].API,
                 token: access_token,
                 userAgent: req.get('user-agent'),
                 clave: objMensaje.clavenumerica+'-'+consecutivoActualArr[index]
             }

             const idfactura = identradaActualArr[index];
             let emisorActual = emisorArr[index];
             // obtener la respuesta de hacienda y actualizar la bd

             setTimeout(async () => {

                 const respuestaEstado = await obtenerEstado(objEstadoMensaje)
                 const estado=respuestaEstado.data['ind-estado'];
                 const respuesta = respuestaEstado.data['respuesta-xml'];
                 
                 console.log("idfactura", idfactura); 
                 const tipo = '05RH';
                 if(estado != 'rechazado' && estado != 'aceptado' ){
                     console.log("recepcion generada pero rechazada");
                 } else {
                     
                     const response = await guardarXML({id: idfactura, 
                         xml: respuesta, 
                         tipo_factura: tipo});
                     

                     const {affectedRows} = response;
                     if(affectedRows > 0){
                         
                         const responseEstadoActualizado =  await actualizarEstadoHacienda({idfactura,estado })
                      
                         if(responseEstadoActualizado.affectedRows > 0){
                             console.log("Estado del mensaje actualizado")
                         } else {
                             console.log("Estado del mensaje no ha sido actualizado")
                         }

                         const responsAactualizarEstadoEnviado= await RecepcionesNoEnviadas.actualizarEstadoEnviado({idemisor,idfactura:factura1.id,estado:2});

                         if(responsAactualizarEstadoEnviado.affectedRows > 0){
                            console.log("estado enviada ha sido actualizado")
                            } else {
                                console.log("estado enviada no ha sido actualizado")
                            }

                         const objEnvioCorreo = {
                             clave: objMensaje.clavenumerica, 
                             idfactura, 
                             tipo: 'RME', 
                             estado, 
                             correo: emisorActual.correo,
                             emisor: emisorActual.nombre
                         };
                             
                         await enviarReporteRecepcionPorCorreo(objEnvioCorreo)

                             console.log('Se ha generado la recepción del comprobante');
                             //})//envio correo
                         // }) // actualizarEstadoHacienda
                     } else {
                         console.log("No pudo pudo guardar la respuesta del mensaje de aceptacion");
                         throw new Error('not_saved_hacienda_response');
                     }

                     // }) //guardar el xml de respuesta 
                 }
             }, 9000);

         } else {
             throw new Error("get_data_emisor_credentials_fail");
         }

        } else {
            throw new Error("get_data_message_fail");
        }

        index++;
     }
}*/

/*const agregarFacturas = async (idemisor,facturas,identradaActualArr,emisorArr,consecutivoActualArr,index ) => {

    for(let factura of facturas){
        const {id,estadoDoc, condicionDoc} = factura;

        //actualizar el id de emisor en recepciones cuando el emisor es multisucursal

        if(multi_sucursal === true){
            console.log("entro")
            await RecepcionesNoEnviadasController.actualizarIdEmisorPorIdComprobante({idemisor,idfactura: id})
        }

        console.log("No entro")

        //actualizar el estado enviado de las recepciones

        await RecepcionesNoEnviadas.actualizarEstadoEnviado({idemisor,idfactura:id,estado:1});

        const recepcion = await RecepcionesNoEnviadasController.obtenerFacturaRecepcion({idemisor,id});
  
        if(recepcion.length > 0){
            const result = convert.xml2json(recepcion[0].xml, {compact: true, spaces: 4});
            const dataParseado = JSON.parse(result);

            let dataFactura = {};
            let objFactura = {};

            if(!(typeof dataParseado.FacturaElectronica === 'undefined')){
                dataFactura = dataParseado.FacturaElectronica;
                tipoDoc = 'F';
            }

            if(!(typeof dataParseado.NotaCreditoElectronica === 'undefined')){
                dataFactura = dataParseado.NotaCreditoElectronica;
                tipoDoc = 'N';
            }

            const objEncabezadoProcesar = {
                clavenumerica: dataFactura.Clave,
                Emisor: dataFactura.Emisor,
                Receptor: dataFactura.Receptor,
                codigoActividad: dataFactura.CodigoActividad,
                consecutivo: dataFactura.NumeroConsecutivo,
                fecha: dataFactura.FechaEmision,
                condicionVenta: dataFactura.CondicionVenta,
                medioPago: dataFactura.MedioPago,
                plazoCredito: dataFactura.PlazoCredito
            }

            let arrLineasProcesar = [];
            const detallesFactura = dataFactura.DetalleServicio.LineaDetalle;
            const resumenProcesar = dataFactura.ResumenFactura;
            if(typeof detallesFactura.length === 'undefined'){ // es una linea 
                arrLineasProcesar.push(detallesFactura);
            } else { //2 o mas lineas
                for(let linea of detallesFactura){
                    arrLineasProcesar.push(linea);
                }
            }

            encabezado = await validarEncabezadoFactura(objEncabezadoProcesar,id);
            

            const {
                emisor,
                receptor,
                codigoActividad,
                consecutivo,
                fecha,
                condicionVenta,
                medioPago,
                clavenumerica,
                plazoCredito 
            } = encabezado;

            lineas = await validarLineasFactura(arrLineasProcesar,clavenumerica);
            resumen = await validarResumenFactura(dataFactura,clavenumerica);

            emisorArr.push(emisor);
            receptorActual = receptor;

            const respuestaBusqueda = await ProveedorController.buscarProveedor(emisor.numero);
            console.log("Busqueda ",respuestaBusqueda)
            if(respuestaBusqueda.length == 0){
                
                

                if(emisor.numero.length == 11){
                    numeroProveedor = '0'+String(emisor.numero);
                } else if(emisor.numero.length == 10) {
                    numeroProveedor = '00'+String(emisor.numero);
                } else if(emisor.numero.length == 9){
                    numeroProveedor = '000'+String(emisor.numero);
                } else {
                    numeroProveedor = String(emisor.numero);
                }

                const objProveedor = {

                    idemisor, 
                    proveedor_nombre: emisor.nombre,
                    proveedor_nombre_comercial: emisor.nombrecomercial ,
                    proveedor_tipo_identificacion: emisor.tipo,
                    cedula_proveedor: emisor.numero,
                    numero_proveedor: numeroProveedor,
                    codigo_actividad: codigoActividad,
                    identificacion_extranjero: emisor.IdentificacionExtranjero,
                    proveedor_barrio: emisor.barrio,
                    otras_senas: emisor.otras_senas,
                    otras_senas_extranjero : emisor.OtrasSenasExtranjero  ,
                    proveedor_telefono_codigopais: emisor.codigoPaisTel,
                    proveedor_telefono_numtelefono: emisor.numTelefono,
                    proveedor_fax_codigopais: '',
                    proveedor_fax_numtelefono: '',
                    proveedor_correo: emisor.correo
                }

                console.log("objeto proveedor", objProveedor);

                const respestaProveedor = await ProveedorController.insertarProveedor(objProveedor);
                if(respestaProveedor.affectedRows > 0 ) {
                    idproveedor = respestaProveedor.insertId;
                } else {
                    throw new Error("proveedor_save_fail");
                } 
                
            } else { // si el proveedor existe entonces le asgino el id para poder insertar la nueva entrada
                idproveedor = respuestaBusqueda[0].id;
                console.log("Existe");
            }

            const idFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
                
            if(idFactura.length == 0){
                idultimo = 1;  
            } else {
                idultimo = idFactura[0].id;
            }

            const respuestaConsecutivo = await FacturaFunciones.new_consecutivo('05',idultimo,idemisor);
            const  { nuevoConsecutivo,llave,clave,numeroInterno } = respuestaConsecutivo;
            consecutivoActualArr.push(nuevoConsecutivo);
            llaveP12 = llave;
            passP12 = clave;
            const {

                porcentaje_descuento_total,
                monto_descuento_total,
                subtotal,
                totalservgravados,
                totalservexentos,
                totalservexonerado,
                totalmercanciasgravadas,
                totalmercanciasexentas,
                totalmercanciaexonerada,
                totalgravado,
                totalexento,
                totalexonerado,
                totalventa,
                totaldescuentos,
                totalventaneta,
                totalimpuesto,
                totalcomprobante,
                totalIVADevuelto,
                TotalOtrosCargos, 
                codigomoneda,
                tipocambio
            } = resumen;

            const objEntrada = {
                idproveedor,
                idemisor,
                idusuario,
                clavenumerica,
                consecutivo,
                numero_interno: tipoDoc + String(numeroInterno),
                num_documento: Number(numeroInterno),
                consecutivo_receptor : nuevoConsecutivo,
                fecha_factura: fecha,
                tipo_factura: '05',
                condicion_venta: condicionVenta,
                medio_pago: medioPago,
                plazo_credito: plazoCredito,
                condicion_impuesto: condicionDoc,//condicionImpuesto,
                porcentaje_descuento_total ,
                monto_descuento_total ,
                subtotal,
                totalservgravados,
                totalservexentos,
                totalservexonerado,
                totalmercanciasgravadas,
                totalmercanciasexentas,
                totalmercanciaexonerada,
                totalgravado,
                totalexento,
                totalexonerado,
                totalventa,
                totaldescuentos ,
                totalventaneta ,
                totalimpuesto,
                totalcomprobante,
                totalIVADevuelto,
                TotalOtrosCargos, //ResumenFactura.TotalMercExonerada._text
                codigomoneda,
                tipocambio,
                status_factura: estadoDoc //estadoAceptacion 
            }

            console.log("objeto entrada ",objEntrada);

            const respuestaEntrada = await EntradaController.nuevaEntrada(objEntrada); //
            const {affectedRows, insertId} = respuestaEntrada;
            if(respuestaEntrada.affectedRows > 0){
                identradaActualArr.push(insertId);
                for(let linea of lineas){ // aqui se vam a insertar las lineas de detalle 
                    const objLinea = linea;
                    
                    objLinea.identrada = insertId;
                    objLinea.numerodocumento = insertId;
                    if(tipoDoc == 'F'){
                        
                        if(permiso !== 'integrador'){ // se agrega la parte de inventarios
                            const response = await Existencia.existeArticulo({
                                descripcion: objLinea.descripcioDetalle, 
                                idemisor
                            });

                            if(response.length === 0){ // no existe
                                //insertar el articulo 
                                let idImpuesto = 0;
                                const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                    idemisor,
                                    codigo: objLinea.codigo_tarifa
                                })

                                if(impuesto.length === 0){
                                    idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                                } else {
                                    idImpuesto =  impuesto
                                }

                                let codigo_servicio = '', tipo_servicio ='', stock ;
                                const unidadMedida = objLinea.unidad_medida;
                                //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;
    
                                let precioProductoFinal = Number( objLinea.precio_linea);
                                let impuestoAplicado = 0;
                                if(!(typeof linea.Impuesto === 'undefined')){
                                    impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                    precioProductoFinal = precioProductoFinal +impuestoAplicado;
                                } 

                                if(UnidadesMedidaServicios.includes(unidadMedida)){
                                    // es un servicio
                                    codigo_servicio = 'Servicio';
                                    tipo_servicio = '01';
                                    stock =false;
                                } else {
                                    // es una mercancia
                                    codigo_servicio = 'Mercancía';
                                    tipo_servicio = '02';
                                    stock =true;
                                }

                                const objArticulo = {
                                    idemisor,
                                    tipo_impuesto: idImpuesto[0].id,
                                    idcategoria: 1,
                                    descripcion: objLinea.descripcioDetalle,
                                    codigobarra_producto: objLinea.codigobarra_producto,
                                    precio_articulo: Number(objLinea.precio_linea),
                                    precio_final: precioProductoFinal.toFixed(2),
                                    costo_unitario: 1,
                                    unidad_medida: unidadMedida,
                                    unidad_medida_comercial: '',
                                    tipo_servicio,
                                    codigo_servicio
                                }

                                const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                    
                                    const {affectedRows,insertId} = responseNuevoArticulo;
                                    
                                    if(affectedRows > 0){
                                        objLinea.idarticulo = insertId;
                                        await insertarLineas(objLinea)
                                        const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                        //{cantidad, idarticulo}
                                        if(stock == true){
                                            const responseArticulo = await Existencia.actualizarStock({
                                                idarticulo: insertId,
                                                cantidad: Number(objLinea.cantidad),
                                                idemisor,
                                                idbodega: idBodega[0].idbodega
                                            })
                                            
                                            console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                        }
                                    
                                    } else {
                                        console.log("No se pudo agregar el articulo")
                                    }

                            } else  {
                                let stock;
                                const idarticulo = Number(response[0].id)
                                const cantidad = Number(objLinea.cantidad);
                                const unidadMedida = objLinea.unidad_medida;
                                objLinea.idarticulo = idarticulo;
                                await insertarLineas(objLinea)
                                const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                if(UnidadesMedidaServicios.includes(unidadMedida)){
                                    // es un servicio
                                    codigo_servicio = 'Servicio';
                                    tipo_servicio = '01';
                                    stock =false;
                                } else {
                                    // es una mercancia
                                    codigo_servicio = 'Mercancía';
                                    tipo_servicio = '02';
                                    stock =true;
                                }

                                if(stock == true){
                                    const responseArticulo = await Existencia.actualizarStock({
                                        idarticulo: idarticulo,
                                        cantidad: cantidad,
                                        idemisor: Number(idemisor),
                                        idbodega: idBodega[0].idbodega
                                    })
                                    
                                    console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                }
                            }
                            
                        } else {
                            objLinea.idarticulo = null;
                            await insertarLineas(objLinea);
                        }
                        
                    } else { // nota de credito de recepcion
                        if(permiso !== 'integrador'){ 
                            Articulo.obtenerIdArticulo({
                                descripcion: objLinea.descripcioDetalle,
                                idemisor 
                            }).then( async responseArticuloSeleccionado => {
                                
                                if(responseArticuloSeleccionado.length > 0){

                                    objLinea.idarticulo = responseArticuloSeleccionado[0].id;
                                    let cantidadTotal = Number(objLinea.cantidad)
                                    await insertarLineas(objLinea)
                                    const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                    ExistenciaController.restarExistencia({
                                        idemisor,
                                        idarticulo: responseArticuloSeleccionado[0].id,
                                        cantidad: cantidadTotal,
                                        idbodega: idBodega[0].idbodega
                                    })
                                    .then(responseExistenciaArticulo => {
                                        console.log("Inventario de nota crédito actualizado ")
                                        console.log(responseExistenciaArticulo)
                                    }).catch(err => {
                                        console.log(err);
                                        console.log("No se pudo actualizar la existencia")
                                    })
                                }
                                
                            }).catch(err => {
                                console.log(err);
                                console.log("No se pudo obtener el idarticulo")
                            })
                        } else {
                            objLinea.idarticulo = null;
                            await insertarLineas(objLinea);
                        }
                    }
                } 

                const entradaProcesada = await RecepcionesNoEnviadasController.actualizarEstadoFacturaRecepcion(
                    {idemisor, 
                    id
                });
            
                if(entradaProcesada.affectedRows > 0) {
                    console.log("El campo procesada de la recepcion ha sido actualizado")
                } else {
                    console.log("El campo procesada de la recepcion no ha sido actualizado")
                }
            } else {
                throw new Error('entrada_save_fail')
            }
        }
        
    } //

}*/

const generarRecepciones = async (llaveP12,passP12,req,idemisor,facturas,identradaActualArr,emisorArr,consecutivoActualArr,idusuario,permiso,multi_sucursal,paginaActual,res ) => {

    try {
       // const {facturas} = req.body;

        let encabezado = null;
        //let lineas = null;
        let resumen = null;
        let tipoDoc = '';
        let idproveedor= '',
            numeroProveedor = '',
            idultimo = 0;
   
        if(facturas.length === 0) return;
        let receptorActual = null;
        for(let factura of facturas){
            const {id,estadoDoc, condicionDoc} = factura;


            //actualizar el id de emisor en recepciones cuando el emisor es multisucursal

            if(multi_sucursal === true){
                console.log("entro")
                await RecepcionesNoEnviadasController.actualizarIdEmisorPorIdComprobante({idemisor,idfactura: id})
            }

            console.log("No entro")

            //actualizar el estado enviado de las recepciones

            await RecepcionesNoEnviadas.actualizarEstadoEnviado({idemisor,idfactura:id,estado:1});
            
            const recepcion = await  RecepcionesNoEnviadasController.obtenerFacturaRecepcion({idemisor,id});
                
            if(recepcion.length > 0){
                const result = convert.xml2json(recepcion[0].xml, {compact: true, spaces: 4});
                const dataParseado = JSON.parse(result);
                let dataFactura = {};
                let objFactura = {};

                if(!(typeof dataParseado.FacturaElectronica === 'undefined')){
                    dataFactura = dataParseado.FacturaElectronica;
                    tipoDoc = 'F';
                }

                if(!(typeof dataParseado.NotaCreditoElectronica === 'undefined')){
                    dataFactura = dataParseado.NotaCreditoElectronica;
                    tipoDoc = 'N';
                }

                const objEncabezadoProcesar = {
                    clavenumerica: dataFactura.Clave,
                    Emisor: dataFactura.Emisor,
                    Receptor: dataFactura.Receptor,
                    codigoActividad: dataFactura.CodigoActividad,
                    consecutivo: dataFactura.NumeroConsecutivo,
                    fecha: dataFactura.FechaEmision,
                    condicionVenta: dataFactura.CondicionVenta,
                    medioPago: dataFactura.MedioPago,
                    plazoCredito: dataFactura.PlazoCredito
                }

                let arrLineasProcesar = [];
                const detallesFactura = dataFactura.DetalleServicio.LineaDetalle;
                const resumenProcesar = dataFactura.ResumenFactura;
                if(typeof detallesFactura.length === 'undefined'){ // es una linea 
                    arrLineasProcesar.push(detallesFactura);
                } else { //2 o mas lineas
                    for(let linea of detallesFactura){
                        arrLineasProcesar.push(linea);
                    }
                }

                encabezado = await validarEncabezadoFactura(objEncabezadoProcesar,id);
                

                const {
                    emisor,
                    receptor,
                    codigoActividad,
                    consecutivo,
                    fecha,
                    condicionVenta,
                    medioPago,
                    clavenumerica,
                    plazoCredito 
                } = encabezado;

                const {lineas,otrosCargos} = await validarLineasFactura(arrLineasProcesar,clavenumerica);
                resumen = await validarResumenFactura(dataFactura,clavenumerica);

                emisorArr.push(emisor);
                receptorActual = receptor;

                const respuestaBusqueda = await ProveedorController.buscarProveedor(emisor.numero);
                console.log("Busqueda ",respuestaBusqueda)
                if(respuestaBusqueda.length == 0){
                    
                    

                    if(emisor.numero.length == 11){
                        numeroProveedor = '0'+String(emisor.numero);
                    } else if(emisor.numero.length == 10) {
                        numeroProveedor = '00'+String(emisor.numero);
                    } else if(emisor.numero.length == 9){
                        numeroProveedor = '000'+String(emisor.numero);
                    } else {
                        numeroProveedor = String(emisor.numero);
                    }

                    const objProveedor = {

                        idemisor, 
                        proveedor_nombre: emisor.nombre,
                        proveedor_nombre_comercial: emisor.nombrecomercial ,
                        proveedor_tipo_identificacion: emisor.tipo,
                        cedula_proveedor: emisor.numero,
                        numero_proveedor: numeroProveedor,
                        codigo_actividad: codigoActividad,
                        identificacion_extranjero: emisor.IdentificacionExtranjero,
                        proveedor_barrio: emisor.barrio,
                        otras_senas: emisor.otras_senas,
                        otras_senas_extranjero : emisor.OtrasSenasExtranjero  ,
                        proveedor_telefono_codigopais: emisor.codigoPaisTel,
                        proveedor_telefono_numtelefono: emisor.numTelefono,
                        proveedor_fax_codigopais: '',
                        proveedor_fax_numtelefono: '',
                        proveedor_correo: emisor.correo
                    }

                    console.log("objeto proveedor", objProveedor);

                    const respestaProveedor = await ProveedorController.insertarProveedor(objProveedor);
                    if(respestaProveedor.affectedRows > 0 ) {
                        idproveedor = respestaProveedor.insertId;
                    } else {
                        throw new Error("proveedor_save_fail");
                    } 
                    
                } else { // si el proveedor existe entonces le asgino el id para poder insertar la nueva entrada
                    idproveedor = respuestaBusqueda[0].id;
                    console.log("Existe");
                }

                const idFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
                    
                if(idFactura.length == 0){
                    idultimo = 1;  
                } else {
                    idultimo = idFactura[0].id;
                }

                const respuestaConsecutivo = await FacturaFunciones.new_consecutivo('05',idultimo,idemisor);
                const  { nuevoConsecutivo,llave,clave,numeroInterno } = respuestaConsecutivo;
                consecutivoActualArr.push(nuevoConsecutivo);
                llaveP12 = llave;
                passP12 = clave;
                const {

                    porcentaje_descuento_total,
                    monto_descuento_total,
                    subtotal,
                    totalservgravados,
                    totalservexentos,
                    totalservexonerado,
                    totalmercanciasgravadas,
                    totalmercanciasexentas,
                    totalmercanciaexonerada,
                    totalgravado,
                    totalexento,
                    totalexonerado,
                    totalventa,
                    totaldescuentos,
                    totalventaneta,
                    totalimpuesto,
                    totalcomprobante,
                    totalIVADevuelto,
                    TotalOtrosCargos, 
                    codigomoneda,
                    tipocambio
                } = resumen;

                const objEntrada = {
                    idproveedor,
                    idemisor,
                    idusuario,
                    clavenumerica,
                    consecutivo,
                    numero_interno: tipoDoc + String(numeroInterno),
                    num_documento: Number(numeroInterno),
                    consecutivo_receptor : nuevoConsecutivo,
                    fecha_factura: fecha,
                    tipo_factura: '05',
                    condicion_venta: condicionVenta,
                    medio_pago: medioPago,
                    plazo_credito: plazoCredito,
                    condicion_impuesto: condicionDoc,//condicionImpuesto,
                    porcentaje_descuento_total ,
                    monto_descuento_total ,
                    subtotal,
                    totalservgravados,
                    totalservexentos,
                    totalservexonerado,
                    totalmercanciasgravadas,
                    totalmercanciasexentas,
                    totalmercanciaexonerada,
                    totalgravado,
                    totalexento,
                    totalexonerado,
                    totalventa,
                    totaldescuentos ,
                    totalventaneta ,
                    totalimpuesto: Number(totalimpuesto) - Number(otrosCargos),
                    totalcomprobante,
                    totalIVADevuelto,
                    TotalOtrosCargos: Number(TotalOtrosCargos) + Number(otrosCargos), //ResumenFactura.TotalMercExonerada._text
                    codigomoneda,
                    tipocambio,
                    status_factura: estadoDoc //estadoAceptacion 
                }

                console.log("objeto entrada ",objEntrada);

                const respuestaEntrada = await EntradaController.nuevaEntrada(objEntrada); //
                const {affectedRows, insertId} = respuestaEntrada;
                if(respuestaEntrada.affectedRows > 0){
                    identradaActualArr.push(insertId);
                    for(let linea of lineas){ // aqui se vam a insertar las lineas de detalle 
                        const objLinea = linea;
                        
                        objLinea.identrada = insertId;
                        objLinea.numerodocumento = insertId;
                        if(tipoDoc == 'F'){
                            
                            if(permiso !== 'integrador'){ // se agrega la parte de inventarios
                                const response = await Existencia.existeArticulo({
                                    descripcion: objLinea.descripcioDetalle, 
                                    idemisor
                                });

                                if(response.length === 0){ // no existe
                                    //insertar el articulo 
                                    let idImpuesto = 0;
                                    const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                        idemisor,
                                        codigo: objLinea.codigo_tarifa
                                    })

                                    if(impuesto.length === 0){
                                        idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                                    } else {
                                        idImpuesto =  impuesto
                                    }

                                    let codigo_servicio = '', tipo_servicio ='', stock ;
                                    const unidadMedida = objLinea.unidad_medida;
                                    //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;
        
                                    let precioProductoFinal = Number( objLinea.precio_linea);
                                    let impuestoAplicado = 0;
                                    if(!(typeof linea.Impuesto === 'undefined')){
                                        impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                        precioProductoFinal = precioProductoFinal +impuestoAplicado;
                                    } 

                                    if(UnidadesMedidaServicios.includes(unidadMedida)){
                                        // es un servicio
                                        codigo_servicio = 'Servicio';
                                        tipo_servicio = '01';
                                        stock =false;
                                    } else {
                                        // es una mercancia
                                        codigo_servicio = 'Mercancía';
                                        tipo_servicio = '02';
                                        stock =true;
                                    }

                                    const objArticulo = {
                                        idemisor,
                                        tipo_impuesto: idImpuesto[0].id,
                                        idcategoria: 1,
                                        descripcion: objLinea.descripcioDetalle,
                                        codigobarra_producto: objLinea.codigobarra_producto,
                                        precio_articulo: Number(objLinea.precio_linea),
                                        precio_final: precioProductoFinal.toFixed(2),
                                        costo_unitario: 1,
                                        unidad_medida: unidadMedida,
                                        unidad_medida_comercial: '',
                                        tipo_servicio,
                                        codigo_servicio
                                    }

                                    const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                        
                                        const {affectedRows,insertId} = responseNuevoArticulo;
                                        
                                        if(affectedRows > 0){
                                            objLinea.idarticulo = insertId;
                                            await insertarLineas(objLinea)
                                            const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            //{cantidad, idarticulo}
                                            if(stock == true){
                                                const responseArticulo = await Existencia.actualizarStock({
                                                    idarticulo: insertId,
                                                    cantidad: Number(objLinea.cantidad),
                                                    idemisor,
                                                    idbodega: idBodega[0].idbodega
                                                })
                                                
                                                console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                            }
                                        
                                        } else {
                                            console.log("No se pudo agregar el articulo")
                                        }

                                } else  {
                                    let stock;
                                    const idarticulo = Number(response[0].id)
                                    const cantidad = Number(objLinea.cantidad);
                                    const unidadMedida = objLinea.unidad_medida;
                                    objLinea.idarticulo = idarticulo;
                                    await insertarLineas(objLinea)
                                    const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                    if(UnidadesMedidaServicios.includes(unidadMedida)){
                                        // es un servicio
                                        codigo_servicio = 'Servicio';
                                        tipo_servicio = '01';
                                        stock =false;
                                    } else {
                                        // es una mercancia
                                        codigo_servicio = 'Mercancía';
                                        tipo_servicio = '02';
                                        stock =true;
                                    }

                                    if(stock == true){
                                        const responseArticulo = await Existencia.actualizarStock({
                                            idarticulo: idarticulo,
                                            cantidad: cantidad,
                                            idemisor: Number(idemisor),
                                            idbodega: idBodega[0].idbodega
                                        })
                                        
                                        console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                    }
                                }
                                
                            } else {
                                objLinea.idarticulo = null;
                                await insertarLineas(objLinea);
                            }
                            
                        } else { // nota de credito de recepcion
                            if(permiso !== 'integrador'){ 
                                Articulo.obtenerIdArticulo({
                                    descripcion: objLinea.descripcioDetalle,
                                    idemisor 
                                }).then( async responseArticuloSeleccionado => {
                                    
                                    if(responseArticuloSeleccionado.length > 0){

                                        objLinea.idarticulo = responseArticuloSeleccionado[0].id;
                                        let cantidadTotal = Number(objLinea.cantidad)
                                        await insertarLineas(objLinea)
                                        const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                        ExistenciaController.restarExistencia({
                                            idemisor,
                                            idarticulo: responseArticuloSeleccionado[0].id,
                                            cantidad: cantidadTotal,
                                            idbodega: idBodega[0].idbodega
                                        })
                                        .then(responseExistenciaArticulo => {
                                            console.log("Inventario de nota crédito actualizado ")
                                            console.log(responseExistenciaArticulo)
                                        }).catch(err => {
                                            console.log(err);
                                            console.log("No se pudo actualizar la existencia")
                                        })
                                    }
                                    
                                }).catch(err => {
                                    console.log(err);
                                    console.log("No se pudo obtener el idarticulo")
                                })
                            } else {
                                objLinea.idarticulo = null;
                                await insertarLineas(objLinea);
                            }
                        }
                    } 

                    const entradaProcesada = await RecepcionesNoEnviadasController.actualizarEstadoFacturaRecepcion(
                        {idemisor, 
                        id
                    });
                
                    if(entradaProcesada.affectedRows > 0) {
                        console.log("El campo procesada de la recepcion ha sido actualizado")
                    } else {
                        console.log("El campo procesada de la recepcion no ha sido actualizado")
                    }
                } else {
                    throw new Error('entrada_save_fail')
                }
            }
        } 

        //poner mensaje de vuelta al cliente
        if(paginaActual == 1){
            res.status(201).json({
                message: 'Los comprobantes han sido procesados'
            })
        }

        // este for envia las recepciones a hacienda y envia los correos
        let index = 0;
        for(let factura1 of facturas){
           const respuestaDatosMensaje = await EntradaController.obtenerDatosMensajeAceptacion(identradaActualArr[index])
           if(respuestaDatosMensaje.length > 0){
            
            const objMensaje = {
                clavenumerica: respuestaDatosMensaje[0].clavenumerica,
                fecha_factura :respuestaDatosMensaje[0].fecha_factura,
                status_factura :respuestaDatosMensaje[0].status_factura,
                codicion_impuesto :respuestaDatosMensaje[0].codicion_impuesto,
                totalcomprobante :respuestaDatosMensaje[0].totalcomprobante,
                totalimpuesto :respuestaDatosMensaje[0].totalimpuesto,
                codigo_actividad :respuestaDatosMensaje[0].codigo_actividad,
                cedula_proveedor :respuestaDatosMensaje[0].cedula_proveedor,
                cedula_emisor :respuestaDatosMensaje[0].cedula_emisor,
                consecutivo: consecutivoActualArr[index] 
            } 

            // objMensaje,{},'05',llave,clave,insertId
            const objXml = {
                objMensaje,
                detalles: {},
                tipo_factura:'05',
                llave: llaveP12,
                clave: passP12,
                identrada: identradaActualArr[index]
            }

            const xmlGenerado = await generarXmlRecepcion(objXml);
            const emisorCredenciales = await EmisorController.obtenerCredencialesParaRecepcion(identradaActualArr[index])
            if(emisorCredenciales.length > 0){

                const obj = {
                    objToken : {
                        userHacienda: emisorCredenciales[0].key_username_hacienda, 
                        passHacienda: emisorCredenciales[0].key_password_hacienda, 
                        TOKEN_API: emisorCredenciales[0].TOKEN_API, 
                        Client_ID: emisorCredenciales[0].Client_ID, 
                        userAgent: req.get('user-agent')
                    }
                }
                
                console.log("obj credenciales ",obj);

                const dataToken = await generarToken(obj);
                const {access_token} = dataToken; 

                const jsonRecepcion = {
                    clave: objMensaje.clavenumerica,
                    fecha: objMensaje.fecha_factura,
                    emisor: {
                        tipoIdentificacion: emisorArr[index].tipo,//PROVEEDOR
                        numeroIdentificacion: emisorArr[index].numero
                    },
                    receptor: {
                        tipoIdentificacion: receptorActual.tipo,//EMISOR DEL SISTEMA
                        numeroIdentificacion: receptorActual.numero
                    },
                    consecutivoReceptor: consecutivoActualArr[index],
                    comprobanteXml: xmlGenerado,
                    API: emisorCredenciales[0].API,
                    userAgent: req.get('user-agent'),
                    token: access_token
                }

                console.log("obj jsonRecepcion ",jsonRecepcion);

                const respuestaEnvio = await enviarRecepcion(jsonRecepcion);
                console.log("respuesta envio ", respuestaEnvio)
                const objActualizarEstadoEntrada = {
                    codigo_estado: respuestaEnvio,
                    idemisor, 
                    identrada: identradaActualArr[index]
                }
                const responseCodigo = await actualizarCodigoEstadoEntrada(objActualizarEstadoEntrada);

                if(responseCodigo.affectedRows == 0){
                    console.log("No se actualizó el codigo de estado")
                } else {
                    console.log("Se ha actualizado el codigo de estado");
                }

                const objEstadoMensaje = {
                    API: emisorCredenciales[0].API,
                    token: access_token,
                    userAgent: req.get('user-agent'),
                    clave: objMensaje.clavenumerica+'-'+consecutivoActualArr[index]
                }

                const idfactura = identradaActualArr[index];
                let emisorActual = emisorArr[index];
                // obtener la respuesta de hacienda y actualizar la bd

                setTimeout(async () => {

                    const respuestaEstado = await obtenerEstado(objEstadoMensaje)
                    const estado=respuestaEstado.data['ind-estado'];
                    const respuesta = respuestaEstado.data['respuesta-xml'];
                    
                    console.log("idfactura", idfactura); 
                    const tipo = '05RH';
                    if(estado != 'rechazado' && estado != 'aceptado' ){
                        console.log("recepcion generada pero rechazada");
                    } else {
                        
                        const response = await guardarXML({id: idfactura, 
                            xml: respuesta, 
                            tipo_factura: tipo});
                        

                        const {affectedRows} = response;
                        if(affectedRows > 0){
                            
                            const responseEstadoActualizado =  await actualizarEstadoHacienda({idfactura,estado })

                            await RecepcionesNoEnviadas.actualizarEstadoEnviado({idemisor,idfactura:factura1.id,estado:2});
                            if(responseEstadoActualizado.affectedRows > 0){
                                console.log("Estado del mensaje actualizado")
                            } else {
                                console.log("Estado del mensaje no ha sido actualizado")
                            }
                            const objEnvioCorreo = {
                                clave: objMensaje.clavenumerica, 
                                idfactura, 
                                tipo: 'RME', 
                                estado, 
                                correo: emisorActual.correo,
                                emisor: emisorActual.nombre
                            };
                                
                            await enviarReporteRecepcionPorCorreo(objEnvioCorreo)

                                console.log('Se ha generado la recepción del comprobante');
                                //})//envio correo
                            // }) // actualizarEstadoHacienda
                        } else {
                            console.log("No pudo pudo guardar la respuesta del mensaje de aceptacion");
                            throw new Error('not_saved_hacienda_response');
                        }

                        // }) //guardar el xml de respuesta 
                    }
                }, 9000);

            } else {
                throw new Error("get_data_emisor_credentials_fail");
            }

           } else {
               throw new Error("get_data_message_fail");
           }

           index++;
        }

    } catch(err){
        console.log(err);

        if(err.message.toString().indexOf("encabezado") >= 0){
            const id = err.message.toString().substr(10,err.message.toString().length);
            res.status(400).json({
                message: 'La factura con id '+id+ ' presenta un error en el encabezado'
            })
        }else if(err.message.toString().length == 51){ // lineas
            const clave = err.message.toString().substr(0,err.message.toString().length - 1);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en las lineas de detalle'
            })
        } else if(err.message.toString().length == 52){// resumen
            const clave = err.message.toString().substr(0,err.message.toString().length - 2);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en el resumen del comprobante'
            })
        }else if(err.message.toString() === 'proveedor_save_fail'){
            res.status(400).json({
                message: 'Hubo un error al guardar un proveedor'
            })
        }else if(err.message.toString() === 'entrada_save_fail'){
            res.status(400).json({
                message: 'Hubo un error al guardar un el comprobante'
            })
        }   
    }
} 

const llamarProcesoRecepcion = (cantidadRegistrosPagina,paginaActual,totalActualFacturas,inicio,fin,totalPaginas,llaveP12,passP12,req,idemisor,facturas,identradaActualArr,emisorArr,consecutivoActualArr,idusuario,permiso,multi_sucursal,res) => {
   // console.log({facturas});
   console.log("facturas",facturas.length);
    console.log({totalPaginas})
    console.log({paginaActual})
    if(paginaActual <=  totalPaginas) {
        
        if(paginaActual === 1) {
            if(totalActualFacturas < cantidadRegistrosPagina){
                inicio = 0;
                fin = totalActualFacturas -1 ;
            } else {
                inicio = 0;
                fin = cantidadRegistrosPagina -1 ;
            }
        } else {
            if(totalActualFacturas < cantidadRegistrosPagina) {
                inicio += cantidadRegistrosPagina  ;
                fin += totalActualFacturas;
            } else {
                inicio += cantidadRegistrosPagina ;
                fin += cantidadRegistrosPagina ;
            }
        }
        totalActualFacturas-=cantidadRegistrosPagina;
       
        console.log({inicio});
        console.log({fin});
        console.log("Se llamó la funcion")    
        const recepciones = facturas.filter((el,i) => i >= inicio && i<= fin);     
        console.log(recepciones); 
        
        generarRecepciones(llaveP12,passP12,req,idemisor,recepciones,identradaActualArr,emisorArr,consecutivoActualArr,idusuario,permiso,multi_sucursal,paginaActual ,res);
        paginaActual ++;
        return llamarProcesoRecepcion(cantidadRegistrosPagina,paginaActual,totalActualFacturas,inicio,fin,totalPaginas,llaveP12,passP12,req,idemisor,facturas,identradaActualArr,emisorArr,consecutivoActualArr,idusuario,permiso,multi_sucursal);
    } else {
        return null;
    }
}


exports.visualizarRecepcion = async (req,res) => {

    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        let idemisor = decodedToken.id;
        let {idfactura} = req.params;
        let Receptor = null;
        let cuerpoFactura = null;
        let datosInformacionReferencia = null;
        let tipoDoc = '';
        let arrLineasProcesar = [];

        const dataFactura = await RecepcionesNoEnviadasController.obtenerFacturaRecepcion({idemisor,id:idfactura});

        if(dataFactura.length === 0){
            return res.status(404).json({
                message: 'No existe un comprobante con asociado con el id'+idfactura
            })
        }
        
        let xml = await convertirXmlAJson(dataFactura[0].xml);

        xml = JSON.parse(xml);

        if(typeof xml.NotaCreditoElectronica !== 'undefined'  ){
            if(typeof xml.NotaCreditoElectronica.Receptor !== 'undefined'){
                Receptor = xml.NotaCreditoElectronica.Receptor;
                cuerpoFactura = xml.NotaCreditoElectronica;
                datosInformacionReferencia = (cuerpoFactura.InformacionReferencia === 'undefined')? null :  cuerpoFactura.InformacionReferencia.Numero._text;
                tipoDoc = 'N';
            } 
        } else if(typeof xml.FacturaElectronica !== 'undefined'){
            if(typeof xml.FacturaElectronica.Receptor !== 'undefined'){
                Receptor = xml.FacturaElectronica.Receptor;
                cuerpoFactura = xml.FacturaElectronica;  
                tipoDoc = 'F';
            } 
        } 
       
        const detallesFactura = cuerpoFactura.DetalleServicio.LineaDetalle;
        const resumenProcesar = cuerpoFactura.ResumenFactura;
        if(typeof detallesFactura.length === 'undefined'){ // es una linea 
            arrLineasProcesar.push(detallesFactura);
        } else { //2 o mas lineas
            for(let linea of detallesFactura){
                arrLineasProcesar.push(linea);
            }
        }

       //cambio SyN 4.4
       if ( cuerpoFactura._attributes.xmlns.includes("4.4")){
            
        CodigoAct= cuerpoFactura.CodigoActividadEmisor;
        Mediodepagos = resumenProcesar.MedioPago.TipoMedioPago;
        
        }else { 
            CodigoAct= cuerpoFactura.CodigoActividad;
            Mediodepagos = cuerpoFactura.MedioPago;
        }

        const objEncabezadoProcesar = {
            clavenumerica: cuerpoFactura.Clave,
            Emisor: cuerpoFactura.Emisor,
            Receptor: cuerpoFactura.Receptor,
            codigoActividad: CodigoAct,
            consecutivo: cuerpoFactura.NumeroConsecutivo,
            fecha: cuerpoFactura.FechaEmision,
            condicionVenta: cuerpoFactura.CondicionVenta,
            medioPago: Mediodepagos,
            plazoCredito: cuerpoFactura.PlazoCredito
        }
        //fin cambio SyN

        const encabezado = await validarEncabezadoFactura(objEncabezadoProcesar);
        
        let {
            emisor,
            receptor,
            codigoActividad,
            consecutivo,
            fecha,
            condicionVenta,
            medioPago,
            clavenumerica,
            plazoCredito 
        } = encabezado;

        const {lineas,otrosCargos} = await validarLineasFactura(arrLineasProcesar,clavenumerica);
        const resumen = await validarResumenFactura(cuerpoFactura,clavenumerica);

        encabezado.medioPago = MedioPago().filter(medio => medioPago === medio.id)[0].medio;
        encabezado.condicionVenta = CondicionVenta().filter(condicion => condicionVenta === condicion.id)[0].condicion;
        
       res.status(200).json({
        factura: {
            tipo: tipoDoc === 'N'? 'Nota Crédito Electrónica': 'Factura Electrónica',
            encabezado,
            lineas,
            resumen,
            id:idfactura
        }
       });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error al cargar la factura de recepción'
        })
    }
}

exports.crearPDFFacturaRecepcion = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    let idemisor = decodedToken.id;
    let {clave} = req.params;

    


}

exports.generarRecepcion = async (req,res) => {
    //LEER EL ARCHIVO XML ACTUAL
    
    try {

        const filename = req.file.filename;
        //const xml = fs.readFileSync( __dirname + '/../recepcion/'+filename, 'utf8');
        const xml = await leerArchivoXml( __dirname + '/../recepcion/'+filename);
        console.log("xml ", xml);
        const result = await convertirXmlAJson(xml);
        console.log("json ", result); 
        const dataFactura = JSON.parse(result);
        const { estadoAceptacion, condicionImpuesto} = req.body;
        let cuerpoFactura = null;
        let Receptor = null;
        let totalOtrosCargos = 0;
        let encabezado = null;
        //let lineas = null;
        let resumen = null;
        let tipoDoc = '';
        let idproveedor= '',
            numeroProveedor = '',
            idultimo = 0;
        let llaveP12 = '';
        let passP12 = '';
        let identradaActualArr = [];
        let consecutivoActualArr = [];
        let receptorActual = null;
        let datosInformacionReferencia;
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const permiso = decodedToken.permiso;
        
        if(typeof dataFactura.NotaCreditoElectronica !== 'undefined'  ){
            if(typeof dataFactura.NotaCreditoElectronica.Receptor !== 'undefined'){
                Receptor = dataFactura.NotaCreditoElectronica.Receptor;
                cuerpoFactura = dataFactura.NotaCreditoElectronica;
                tipoDoc = 'N';
                datosInformacionReferencia = (cuerpoFactura.InformacionReferencia === 'undefined')? null :  cuerpoFactura.InformacionReferencia.Numero._text;
            } else {
               return res.status(400).json({
                    message: 'El comprobante debe tener un receptor'
                })
            } 
        } else if(typeof dataFactura.FacturaElectronica !== 'undefined'){
            if(typeof dataFactura.FacturaElectronica.Receptor !== 'undefined'){
                Receptor = dataFactura.FacturaElectronica.Receptor;
                cuerpoFactura = dataFactura.FacturaElectronica;
                tipoDoc ='F';
            } else {
                return res.status(400).json({
                     message: 'El comprobante debe tener un receptor'
                 })
             }
        } else {
            return res.status(400).json({
                message: 'El comprobante debe ser Factura Electrónica o Nota de Crédito de Factura Electrónica'
            })
        }

       
        //OBEJTO XML DESARMADO PARA INSERTAR EN LA BD
        const objEncabezadoProcesar = {
            clavenumerica: cuerpoFactura.Clave,
            Emisor: cuerpoFactura.Emisor,
            Receptor: cuerpoFactura.Receptor,
            codigoActividad: cuerpoFactura.CodigoActividad,
            consecutivo: cuerpoFactura.NumeroConsecutivo,
            fecha: cuerpoFactura.FechaEmision,
            condicionVenta: cuerpoFactura.CondicionVenta,
            medioPago: cuerpoFactura.MedioPago,
            plazoCredito: cuerpoFactura.PlazoCredito
        }

        let arrLineasProcesar = [];
        const detallesFactura = cuerpoFactura.DetalleServicio.LineaDetalle;
        const resumenProcesar = cuerpoFactura.ResumenFactura;
        if(typeof detallesFactura.length === 'undefined'){ // es una linea 
            arrLineasProcesar.push(detallesFactura);
        } else { //2 o mas lineas
            for(let linea of detallesFactura){
                arrLineasProcesar.push(linea);
            }
        }

        encabezado = await validarEncabezadoFactura(objEncabezadoProcesar);
        

        const {
            emisor,
            receptor,
            codigoActividad,
            consecutivo,
            fecha,
            condicionVenta,
            medioPago,
            clavenumerica,
            plazoCredito 
        } = encabezado;

        const {lineas,otrosCargos} = await validarLineasFactura(arrLineasProcesar,clavenumerica);
        resumen = await validarResumenFactura(cuerpoFactura,clavenumerica);

   

         //validar que el comprobante ya fue procesado anteriormente
         const existeComprobante = await EntradaController.existeEntrada({clavenumerica,idemisor});
         if(existeComprobante.length > 0) return res.status(400).json({
             message: `El comprobante con clavenumérica ${clavenumerica} ya fue procesado anteriormente`
         });


         console.log(existeComprobante);
         //clavenumerica

        const dataCedulaEmisor = await EmisorController.existeEmisor(idemisor)
        if(dataCedulaEmisor.length > 0 && dataCedulaEmisor[0].cedula_emisor == receptor.numero){
            // si pertenece al emisor logueado
            const respuestaBusqueda = await ProveedorController.buscarProveedor({idemisor,cedula:emisor.numero});
            console.log("Busqueda ",respuestaBusqueda)
            if(respuestaBusqueda.length == 0){ // No existe el proveedor
                
                
    
                if(emisor.numero.length == 11){
                    numeroProveedor = '0'+String(emisor.numero);
                } else if(emisor.numero.length == 10) {
                    numeroProveedor = '00'+String(emisor.numero);
                } else if(emisor.numero.length == 9){
                    numeroProveedor = '000'+String(emisor.numero);
                } else {
                    numeroProveedor = String(emisor.numero);
                }
    
                const objProveedor = {
    
                    idemisor, 
                    proveedor_nombre: emisor.nombre,
                    proveedor_nombre_comercial: emisor.nombrecomercial ,
                    proveedor_tipo_identificacion: emisor.tipo,
                    cedula_proveedor: emisor.numero,
                    numero_proveedor: numeroProveedor,
                    codigo_actividad: codigoActividad,
                    identificacion_extranjero: emisor.IdentificacionExtranjero,
                    proveedor_barrio: emisor.barrio,
                    otras_senas: emisor.otras_senas,
                    otras_senas_extranjero : emisor.OtrasSenasExtranjero  ,
                    proveedor_telefono_codigopais: emisor.codigoPaisTel,
                    proveedor_telefono_numtelefono: emisor.numTelefono,
                    proveedor_fax_codigopais: '',
                    proveedor_fax_numtelefono: '',
                    proveedor_correo: emisor.correo
                }
    
                console.log("objeto proveedor", objProveedor);
    
                const respestaProveedor = await ProveedorController.insertarProveedor(objProveedor);
                if(respestaProveedor.affectedRows > 0 ) {
                    idproveedor = respestaProveedor.insertId;
                    console.log("PRoveedor creado");
                } else {
                    throw new Error("proveedor_save_fail");
                }     
            } else { // si el proveedor existe entonces le asgino el id para poder insertar la nueva entrada
                idproveedor = respuestaBusqueda[0].id;
                console.log("Existe");
            }

    
            const idFactura = await Factura.obtenerUltimoIdInsertado(idemisor); 
            if(idFactura.length == 0){
                idultimo = 1;  
            } else {
                idultimo = idFactura[0].id;
            }

            const respuestaConsecutivo = await FacturaFunciones.new_consecutivo('05',idultimo,idemisor);
            const  { nuevoConsecutivo,llave,clave,numeroInterno } = respuestaConsecutivo;

            llaveP12 = llave;
            passP12 = clave;

            const {

                porcentaje_descuento_total,
                monto_descuento_total,
                subtotal,
                totalservgravados,
                totalservexentos,
                totalservexonerado,
                totalmercanciasgravadas,
                totalmercanciasexentas,
                totalmercanciaexonerada,
                totalgravado,
                totalexento,
                totalexonerado,
                totalventa,
                totaldescuentos,
                totalventaneta,
                totalimpuesto,
                totalcomprobante,
                totalIVADevuelto,
                TotalOtrosCargos, 
                codigomoneda,
                tipocambio
            } = resumen;
            //estadoAceptacion, condicionImpuesto
            const objEntrada = {
                idproveedor,
                idemisor,
                idusuario,
                clavenumerica,
                consecutivo,
                numero_interno: tipoDoc + String(numeroInterno),
                num_documento: Number(numeroInterno),
                consecutivo_receptor : nuevoConsecutivo,
                fecha_factura: fecha,
                tipo_factura: '05',
                condicion_venta: condicionVenta,
                medio_pago: medioPago,
                plazo_credito: plazoCredito,
                condicion_impuesto: condicionImpuesto,//condicionImpuesto,
                porcentaje_descuento_total ,
                monto_descuento_total ,
                subtotal,
                totalservgravados,
                totalservexentos,
                totalservexonerado,
                totalmercanciasgravadas,
                totalmercanciasexentas,
                totalmercanciaexonerada,
                totalgravado,
                totalexento,
                totalexonerado,
                totalventa,
                totaldescuentos ,
                totalventaneta ,
                totalimpuesto: Number(totalimpuesto) - Number(otrosCargos),
                totalcomprobante,
                totalIVADevuelto,
                TotalOtrosCargos: Number(TotalOtrosCargos) + Number(otrosCargos), //Resume
                codigomoneda,
                tipocambio,
                status_factura: estadoAceptacion //estadoAceptacion 
            }

            console.log("objeto entrada ",objEntrada);
            const respuestaEntrada = await EntradaController.nuevaEntrada(objEntrada); //
            const {affectedRows, insertId} = respuestaEntrada;

            if(affectedRows === 0){
                return res.status(400).json({
                    message: 'No se pudo agregar la entrada'
                });
            } else {
                for(let linea of lineas){ // aqui se vam a insertar las lineas de detalle 
                    const objLinea = linea;
                    totalOtrosCargos += Number(linea.otrosCargos); 
                    objLinea.identrada = insertId;
                    objLinea.numerodocumento = insertId;
                    if(tipoDoc == 'F'){
                        
                        const response = await Articulo.obtenerIdArticulo({
                            descripcion: String(objLinea.descripcioDetalle).trim(),
                            idemisor 
                        });

                        if(response.length === 0){ // no existe
                            //insertar el articulo 
                            let idImpuesto = 0;
                            const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                idemisor,
                                codigo: objLinea.codigo_tarifa
                            })

                            if(impuesto.length === 0){
                                idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                            } else {
                                idImpuesto =  impuesto
                            }

                            let codigo_servicio = '', tipo_servicio ='', stock ;
                            const unidadMedida = objLinea.unidad_medida;
                            //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;

                            let precioProductoFinal = Number( objLinea.precio_linea);
                            let impuestoAplicado = 0;
                            if(!(typeof linea.Impuesto === 'undefined')){
                                impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                precioProductoFinal = precioProductoFinal +impuestoAplicado;
                            } 

                            if(UnidadesMedidaServicios.includes(unidadMedida)){
                                // es un servicio
                                codigo_servicio = 'Servicio';
                                tipo_servicio = '01';
                                stock =false;
                            } else {
                                // es una mercancia
                                codigo_servicio = 'Mercancía';
                                tipo_servicio = '02';
                                stock =true;
                            }

                            const objArticulo = {
                                idemisor,
                                tipo_impuesto: idImpuesto[0].id,
                                idcategoria: 1,
                                descripcion: objLinea.descripcioDetalle,
                                codigobarra_producto: objLinea.codigobarra_producto,
                                precio_articulo: Number(objLinea.precio_linea),
                                precio_final: precioProductoFinal.toFixed(2),
                                costo_unitario: 1,
                                unidad_medida: unidadMedida,
                                unidad_medida_comercial: '',
                                tipo_servicio,
                                codigo_servicio
                            }

                            const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                
                                const {affectedRows,insertId} = responseNuevoArticulo;
                                
                                if(affectedRows > 0){
                                    objLinea.idarticulo = insertId;
                                    await insertarLineas(objLinea)
                                    const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                    //{cantidad, idarticulo}
                                    if(stock == true){
                                        const responseArticulo = await Existencia.actualizarStock({
                                            idarticulo: insertId,
                                            cantidad: Number(objLinea.cantidad),
                                            idemisor,
                                            idbodega: idBodega[0].idbodega
                                        })
                                        
                                        console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                    }
                                
                                } else {
                                    console.log("No se pudo agregar el articulo")
                                }

                        } else  {
                            let stock;
                            const idarticulo = Number(response[0].id)
                            const cantidad = Number(objLinea.cantidad);
                            const unidadMedida = objLinea.unidad_medida;
                            objLinea.idarticulo = idarticulo;
                            await insertarLineas(objLinea)
                            const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                            if(UnidadesMedidaServicios.includes(unidadMedida)){
                                // es un servicio
                                codigo_servicio = 'Servicio';
                                tipo_servicio = '01';
                                stock =false;
                            } else {
                                // es una mercancia
                                codigo_servicio = 'Mercancía';
                                tipo_servicio = '02';
                                stock =true;
                            }

                            if(stock == true){
                                const responseArticulo = await Existencia.actualizarStock({
                                    idarticulo: idarticulo,
                                    cantidad: cantidad,
                                    idemisor: Number(idemisor),
                                    idbodega: idBodega[0].idbodega
                                })
                                
                                console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                            }
                        }
                        
                    } else { // nota de credito de recepcion

                        Articulo.obtenerIdArticulo({
                            descripcion: String(objLinea.descripcioDetalle).trim(),
                            idemisor 
                        }).then( async responseArticuloSeleccionado => {
                            
                            if(responseArticuloSeleccionado.length > 0){

                                objLinea.idarticulo = responseArticuloSeleccionado[0].id;
                                let cantidadTotal = Number(objLinea.cantidad)
                                await insertarLineas(objLinea)
                                const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                ExistenciaController.restarExistencia({
                                    idemisor,
                                    idarticulo: responseArticuloSeleccionado[0].id,
                                    cantidad: cantidadTotal,
                                    idbodega: idBodega[0].idbodega
                                })
                                .then(responseExistenciaArticulo => {
                                    console.log("Inventario de nota crédito actualizado ")
                                    console.log(responseExistenciaArticulo)
                                }).catch(err => {
                                    console.log(err);
                                    console.log("No se pudo actualizar la existencia")
                                })
                            } else {
                            
                                
                              let idImpuesto = 0;
                                const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                    idemisor,
                                    codigo: objLinea.codigo_tarifa
                                })

                                if(impuesto.length === 0){
                                    idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                                } else {
                                    idImpuesto =  impuesto
                                }

                                let codigo_servicio = '', tipo_servicio ='', stock ;
                                const unidadMedida = objLinea.unidad_medida;
                                //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;
    
                                let precioProductoFinal = Number( objLinea.precio_linea);
                                let impuestoAplicado = 0;
                                if(!(typeof linea.Impuesto === 'undefined')){
                                    impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                    precioProductoFinal = precioProductoFinal +impuestoAplicado;
                                } 

                                if(UnidadesMedidaServicios.includes(unidadMedida)){
                                    // es un servicio
                                    codigo_servicio = 'Servicio';
                                    tipo_servicio = '01';
                                    stock =false;
                                } else {
                                    // es una mercancia
                                    codigo_servicio = 'Mercancía';
                                    tipo_servicio = '02';
                                    stock =true;
                                }

                                const objArticulo = {
                                    idemisor,
                                    tipo_impuesto: idImpuesto[0].id,
                                    idcategoria: 1,
                                    descripcion: objLinea.descripcioDetalle,
                                    codigobarra_producto: objLinea.codigobarra_producto,
                                    precio_articulo: Number(objLinea.precio_linea),
                                    precio_final: precioProductoFinal.toFixed(2),
                                    costo_unitario: 1,
                                    unidad_medida: unidadMedida,
                                    unidad_medida_comercial: '',
                                    tipo_servicio,
                                    codigo_servicio
                                }
                                console.log(objArticulo);
                                const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                    
                                    const {affectedRows,insertId} = responseNuevoArticulo;
                                    
                                    if(affectedRows > 0){
                                        objLinea.idarticulo = insertId;
                                        
                                        const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                        //{cantidad, idarticulo}
                                        if(stock == true){
                                            
                                            const responseArticulo = await Existencia.actualizarStock({
                                                idarticulo: insertId,
                                                cantidad: -Number(objLinea.cantidad),
                                                idemisor,
                                                idbodega: idBodega[0].idbodega
                                            })
                                            
                                            console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                        }

                                        await insertarLineas(objLinea)
                                    
                                    } else {
                                        console.log("No se pudo agregar el articulo")
                                    }
                                
                            }
                            
                        }).catch(err => {
                            console.log(err);
                            console.log("No se pudo obtener el idarticulo")
                        })
                    }
                }

                //devolver respuesta al cliente

                //enviar la recepcion

                const respuestaDatosMensaje = await EntradaController.obtenerDatosMensajeAceptacion(respuestaEntrada.insertId);
                const objMensaje = {
                    clavenumerica: respuestaDatosMensaje[0].clavenumerica,
                    fecha_factura :respuestaDatosMensaje[0].fecha_factura,
                    status_factura :respuestaDatosMensaje[0].status_factura,
                    codicion_impuesto :respuestaDatosMensaje[0].codicion_impuesto,
                    totalcomprobante :respuestaDatosMensaje[0].totalcomprobante,
                    totalimpuesto :respuestaDatosMensaje[0].totalimpuesto,
                    codigo_actividad :respuestaDatosMensaje[0].codigo_actividad,
                    cedula_proveedor :respuestaDatosMensaje[0].cedula_proveedor,
                    cedula_emisor :respuestaDatosMensaje[0].cedula_emisor,
                    consecutivo: nuevoConsecutivo 
                } 
    
                // objMensaje,{},'05',llave,clave,insertId
                const objXml = {
                    objMensaje,
                    detalles: {},
                    tipo_factura:'05',
                    llave: llaveP12,
                    clave: passP12,
                    identrada: respuestaEntrada.insertId
                }

                const xmlGenerado = await generarXmlRecepcion(objXml);
                const emisorCredenciales = await EmisorController.obtenerCredencialesParaRecepcion(respuestaEntrada.insertId);

                const obj = {
                    objToken : {
                        userHacienda: emisorCredenciales[0].key_username_hacienda, 
                        passHacienda: emisorCredenciales[0].key_password_hacienda, 
                        TOKEN_API: emisorCredenciales[0].TOKEN_API, 
                        Client_ID: emisorCredenciales[0].Client_ID, 
                        userAgent: req.get('user-agent')
                    }
                }
                
                console.log("obj credenciales ",obj);

                const dataToken = await generarToken(obj);
                const {access_token} = dataToken; 

                const jsonRecepcion = {
                    clave: objMensaje.clavenumerica,
                    fecha: objMensaje.fecha_factura,
                    emisor: {
                        tipoIdentificacion: emisor.tipo,//PROVEEDOR
                        numeroIdentificacion: emisor.numero
                    },
                    receptor: {
                        tipoIdentificacion: receptor.tipo,//EMISOR DEL SISTEMA
                        numeroIdentificacion: receptor.numero
                    },
                    consecutivoReceptor: nuevoConsecutivo,
                    comprobanteXml: xmlGenerado,
                    API: emisorCredenciales[0].API,
                    userAgent: req.get('user-agent'),
                    token: access_token
                }

                console.log("obj jsonRecepcion ",jsonRecepcion);

                const respuestaEnvio = await enviarRecepcion(jsonRecepcion);
                console.log("respuesta envio ", respuestaEnvio)
                const objActualizarEstadoEntrada = {
                    codigo_estado: respuestaEnvio,
                    idemisor, 
                    identrada: respuestaEntrada.insertId
                }
                const responseCodigo = await actualizarCodigoEstadoEntrada(objActualizarEstadoEntrada);

                if(responseCodigo.affectedRows == 0){
                    console.log("No se actualizó el codigo de estado")
                } else {
                    console.log("Se ha actualizado el codigo de estado");
                }    

                res.status(201).json({
                    message: 'El comprobante se ha procesado'
                });

                const objEstadoMensaje = {
                    API: emisorCredenciales[0].API,
                    token: access_token,
                    userAgent: req.get('user-agent'),
                    clave: objMensaje.clavenumerica+'-'+nuevoConsecutivo
                }

                const idfactura = respuestaEntrada.insertId;
                let idemisorActual = idemisor;
                // obtener la respuesta de hacienda y actualizar la bd

                setTimeout(async () => {

                    const respuestaEstado = await obtenerEstado(objEstadoMensaje)
                    const estado=respuestaEstado.data['ind-estado'];
                    const respuesta = respuestaEstado.data['respuesta-xml'];
                    
                    console.log("idfactura", idfactura); 
                    const tipo = '05RH';
                    if(estado != 'rechazado' && estado != 'aceptado' ){
                        console.log("recepcion generada pero rechazada");
                    } else {
                        
                        const response = await guardarXML({id: idfactura, 
                            xml: respuesta, 
                            tipo_factura: tipo});
                        

                        const {affectedRows} = response;
                        if(affectedRows > 0){
                            
                            const responseEstadoActualizado =  await actualizarEstadoHacienda({idfactura,estado })
                            if(responseEstadoActualizado.affectedRows > 0){
                                console.log("Estado del mensaje actualizado")
                            } else {
                                console.log("Estado del mensaje no ha sido actualizado")
                            }
                            const objEnvioCorreo = {
                                clave: objMensaje.clavenumerica, 
                                idfactura, 
                                tipo: 'RME', 
                                estado, 
                                correo: emisor.correo,
                                emisor: emisor.nombre
                            };
                                
                            await enviarReporteRecepcionPorCorreo(objEnvioCorreo)

                                console.log('Se ha generado la recepción del comprobante');
                                //})//envio correo
                            // }) // actualizarEstadoHacienda
                        } else {
                            console.log("No pudo pudo guardar la respuesta del mensaje de aceptacion");
                            throw new Error('not_saved_hacienda_response');
                        }

                        // }) //guardar el xml de respuesta 
                    }
                }, 9000);
            }

        } else {
            throw new Error('data_receptor_fail')
        }
       
    } catch(err){
        console.log({err});//read_xmlFile_fail
        if(err.toString() === 'read_xmlFile_fail'){
            res.status(400).json({
                message: 'Ocurrió un error al leer el archivo xml'
            })
        } else if(err.toString() === 'convert_xml_to_data_fail'){
            res.status(400).json({
                message: 'El archivo xml presenta errores de estructura o sintaxis'
            })
        } else if(err.message && err.message.toString().indexOf("encabezado") >= 0){
            const id = err.message.toString().substr(10,err.message.toString().length);
            res.status(400).json({
                message: 'La factura con id '+id+ ' presenta un error en el encabezado'
            })
        }else if(err.message && err.message.toString().length == 51){ // lineas
            const clave = err.message.toString().substr(0,err.message.toString().length - 1);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en las lineas de detalle'
            })
        } else if(err.message && err.message.toString().length == 52){// resumen
            const clave = err.message.toString().substr(0,err.message.toString().length - 2);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en el resumen del comprobante'
            })
        }else if(err.message && err.message.toString() === 'proveedor_save_fail'){
            res.status(500).json({
                message: 'Hubo un error al guardar un proveedor'
            })
        }else if(err.message && err.message.toString() === 'entrada_save_fail'){
            res.status(500).json({
                message: 'Hubo un error al guardar un el comprobante'
            })
        }else if(err.message && err.message.toString() === 'data_receptor_fail'){
            res.status(400).json({
                message: 'Los números de cédula del receptor del comprobante y emisor actual no coinciden'
            })
        } else if(err.message && err.message.toString() === 'send_facture_fail') {
            res.status(500).json({
                message: 'Ocurrió un error al enviar la recepción al ministerio de hacienda'
            })
        } else if(err.message && err.message.toString() === 'not_saved_hacienda_response'){
            console.log("No se guardó la respuesta de hacienda");
        }else {
            res.status(500).json({
                message: 'Ocurrió un error interno del servidor'
            });
        }
    }
}
exports.procesarRecepciones = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const permiso = decodedToken.permiso;
        const {facturas} = req.body;

        let encabezado = null;
        //let lineas = null;
        let resumen = null;
        let tipoDoc = '';
        let idproveedor= '',
            numeroProveedor = '',
            idultimo = 0;
        let llaveP12 = '';
        let passP12 = '';
        let identradaActualArr = [];
        let consecutivoActualArr = [];
        let emisorArr = [];
        let receptorActual = null;
        
        const responseMultisucursal = await EmisorController.estadoMultiSucurusal(idemisor);
        const multi_sucursal = responseMultisucursal[0].multi_sucursal === 0 ? false: true;
        for(let factura of facturas){
            const {id,estadoDoc, condicionDoc} = factura;
            if(multi_sucursal === true){
                console.log("entro")
                await RecepcionesNoEnviadasController.actualizarIdEmisorPorIdComprobante({idemisor,idfactura: id})
            }
            const recepcion = await  RecepcionesNoEnviadasController.obtenerFacturaRecepcion({idemisor,id});

            if(recepcion.length > 0){
                const result = convert.xml2json(recepcion[0].xml, {compact: true, spaces: 4});
                const dataParseado = JSON.parse(result);
                let dataFactura = {};
                let objFactura = {};

                if(!(typeof dataParseado.FacturaElectronica === 'undefined')){
                    dataFactura = dataParseado.FacturaElectronica;
                    tipoDoc = 'F';
                }

                if(!(typeof dataParseado.NotaCreditoElectronica === 'undefined')){
                    dataFactura = dataParseado.NotaCreditoElectronica;
                    tipoDoc = 'N';
                }

         //cambio SyN 4.4
            if ( dataFactura._attributes.xmlns.includes("4.4")){
                    
                CodigoAct= dataFactura.CodigoActividadEmisor;
                Mediodepagos = dataFactura.ResumenFactura.MedioPago.TipoMedioPago;
                    
            }else { 
                CodigoAct= dataFactura.CodigoActividad;
                Mediodepagos =  dataFactura.MedioPago;
            }
                const objEncabezadoProcesar = {
                    clavenumerica: dataFactura.Clave,
                    Emisor: dataFactura.Emisor,
                    Receptor: dataFactura.Receptor,
                    codigoActividad: CodigoAct,
                    consecutivo: dataFactura.NumeroConsecutivo,
                    fecha: dataFactura.FechaEmision,
                    condicionVenta: dataFactura.CondicionVenta,
                    medioPago: Mediodepagos,
                    plazoCredito: dataFactura.PlazoCredito
                }
         // FIN DE CAMBIO SYN
             

                let arrLineasProcesar = [];
                const detallesFactura = dataFactura.DetalleServicio.LineaDetalle;
                const resumenProcesar = dataFactura.ResumenFactura;
                if(typeof detallesFactura.length === 'undefined'){ // es una linea 
                    arrLineasProcesar.push(detallesFactura);
                } else { //2 o mas lineas
                    for(let linea of detallesFactura){
                        arrLineasProcesar.push(linea);
                    }
                }

                encabezado = await validarEncabezadoFactura(objEncabezadoProcesar,id);
                

                const {
                    emisor,
                    receptor,
                    codigoActividad,
                    consecutivo,
                    fecha,
                    condicionVenta,
                    medioPago,
                    clavenumerica,
                    plazoCredito 
                } = encabezado;

                const {lineas,otrosCargos} = await validarLineasFactura(arrLineasProcesar,clavenumerica);
                resumen = await validarResumenFactura(dataFactura,clavenumerica);
                console.log(lineas);
                emisorArr.push(emisor);
                receptorActual = receptor;

                const respuestaBusqueda = await ProveedorController.buscarProveedor({idemisor,cedula:emisor.numero});
                console.log("Busqueda ",respuestaBusqueda)
                if(respuestaBusqueda.length == 0){
                    
                    

                    if(emisor.numero.length == 11){
                        numeroProveedor = '0'+String(emisor.numero);
                    } else if(emisor.numero.length == 10) {
                        numeroProveedor = '00'+String(emisor.numero);
                    } else if(emisor.numero.length == 9){
                        numeroProveedor = '000'+String(emisor.numero);
                    } else {
                        numeroProveedor = String(emisor.numero);
                    }

                    const objProveedor = {

                        idemisor, 
                        proveedor_nombre: emisor.nombre,
                        proveedor_nombre_comercial: emisor.nombrecomercial ,
                        proveedor_tipo_identificacion: emisor.tipo,
                        cedula_proveedor: emisor.numero,
                        numero_proveedor: numeroProveedor,
                        codigo_actividad: codigoActividad,
                        identificacion_extranjero: emisor.IdentificacionExtranjero,
                        proveedor_barrio: emisor.barrio,
                        otras_senas: emisor.otras_senas,
                        otras_senas_extranjero : emisor.OtrasSenasExtranjero  ,
                        proveedor_telefono_codigopais: emisor.codigoPaisTel,
                        proveedor_telefono_numtelefono: emisor.numTelefono,
                        proveedor_fax_codigopais: '',
                        proveedor_fax_numtelefono: '',
                        proveedor_correo: emisor.correo
                    }

                    console.log("objeto proveedor", objProveedor);

                    const respestaProveedor = await ProveedorController.insertarProveedor(objProveedor);
                    if(respestaProveedor.affectedRows > 0 ) {
                        idproveedor = respestaProveedor.insertId;
                        console.log("Proveedor creado");
                    } else {
                        throw new Error("proveedor_save_fail");
                    } 
                    
                } else { // si el proveedor existe entonces le asgino el id para poder insertar la nueva entrada
                    idproveedor = respuestaBusqueda[0].id;
                    console.log("Existe");
                }

                const idFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
                    
                if(idFactura.length == 0){
                    idultimo = 1;  
                } else {
                    idultimo = idFactura[0].id;
                }

                const respuestaConsecutivo = await FacturaFunciones.new_consecutivo('05',idultimo,idemisor);
                const  { nuevoConsecutivo,llave,clave,numeroInterno } = respuestaConsecutivo;
                consecutivoActualArr.push(nuevoConsecutivo);
                llaveP12 = llave;
                passP12 = clave;
                const {

                    porcentaje_descuento_total,
                    monto_descuento_total,
                    subtotal,
                    totalservgravados,
                    totalservexentos,
                    totalservexonerado,
                    totalmercanciasgravadas,
                    totalmercanciasexentas,
                    totalmercanciaexonerada,
                    totalgravado,
                    totalexento,
                    totalexonerado,
                    totalventa,
                    totaldescuentos,
                    totalventaneta,
                    totalimpuesto,
                    totalcomprobante,
                    totalIVADevuelto,
                    TotalOtrosCargos, 
                    codigomoneda,
                    tipocambio
                } = resumen;

                const objEntrada = {
                    idproveedor,
                    idemisor,
                    idusuario,
                    clavenumerica,
                    consecutivo,
                    numero_interno: tipoDoc + String(numeroInterno),
                    num_documento: Number(numeroInterno),
                    consecutivo_receptor : nuevoConsecutivo,
                    fecha_factura: fecha,
                    tipo_factura: '05',
                    condicion_venta: condicionVenta,
                    medio_pago: medioPago,
                    plazo_credito: plazoCredito,
                    condicion_impuesto: condicionDoc,//condicionImpuesto,
                    porcentaje_descuento_total ,
                    monto_descuento_total ,
                    subtotal,
                    totalservgravados,
                    totalservexentos,
                    totalservexonerado,
                    totalmercanciasgravadas,
                    totalmercanciasexentas,
                    totalmercanciaexonerada,
                    totalgravado,
                    totalexento,
                    totalexonerado,
                    totalventa,
                    totaldescuentos ,
                    totalventaneta ,
                    totalimpuesto: Number(totalimpuesto) - Number(otrosCargos),
                    totalcomprobante,
                    totalIVADevuelto,
                    TotalOtrosCargos: Number(TotalOtrosCargos) + Number(otrosCargos), //Resume
                    codigomoneda,
                    tipocambio,
                    status_factura: estadoDoc //estadoAceptacion 
                }

                console.log("objeto entrada ",objEntrada);

                const respuestaEntrada = await EntradaController.nuevaEntrada(objEntrada); //
                const {affectedRows, insertId} = respuestaEntrada;
                if(respuestaEntrada.affectedRows > 0){
                    identradaActualArr.push(insertId);
                    for(let linea of lineas){ // aqui se vam a insertar las lineas de detalle 
                        const objLinea = linea;
                        
                        objLinea.identrada = insertId;
                        objLinea.numerodocumento = insertId;
                        if(tipoDoc == 'F'){
                            
                            //if(permiso !== 'integrador'){// se agrega la parte de inventarios
                                const response = await Articulo.obtenerIdArticulo({
                                    descripcion: String(objLinea.descripcioDetalle).trim(),
                                    idemisor 
                                });
                                if(response.length === 0){ // no existe
                                    //insertar el articulo 
                                    let idImpuesto = 0;
                                    const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                        idemisor,
                                        codigo: objLinea.codigo_tarifa
                                    })

                                    if(impuesto.length === 0){
                                        idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                                    } else {
                                        idImpuesto =  impuesto
                                    }

                                    let codigo_servicio = '', tipo_servicio ='', stock ;
                                    const unidadMedida = objLinea.unidad_medida;
                                    //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;
        
                                    let precioProductoFinal = Number( objLinea.precio_linea);
                                    let impuestoAplicado = 0;
                                    if(!(typeof linea.Impuesto === 'undefined')){
                                        impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                        precioProductoFinal = precioProductoFinal +impuestoAplicado;
                                    } 

                                    if(UnidadesMedidaServicios.includes(unidadMedida)){
                                        // es un servicio
                                        codigo_servicio = 'Servicio';
                                        tipo_servicio = '01';
                                        stock =false;
                                    } else {
                                        // es una mercancia
                                        codigo_servicio = 'Mercancía';
                                        tipo_servicio = '02';
                                        stock =true;
                                    }

                                    const objArticulo = {
                                        idemisor,
                                        tipo_impuesto: idImpuesto[0].id,
                                        idcategoria: 1,
                                        descripcion: objLinea.descripcioDetalle,
                                        codigobarra_producto: objLinea.codigobarra_producto,
                                        precio_articulo: Number(objLinea.precio_linea),
                                        precio_final: precioProductoFinal.toFixed(2),
                                        costo_unitario: 1,
                                        unidad_medida: unidadMedida,
                                        unidad_medida_comercial: '',
                                        tipo_servicio,
                                        codigo_servicio
                                    }

                                    const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                        
                                        const {affectedRows,insertId} = responseNuevoArticulo;
                                        
                                        if(affectedRows > 0){
                                            objLinea.idarticulo = insertId;
                                            await insertarLineas(objLinea)
                                            const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            //{cantidad, idarticulo}
                                            if(stock == true){
                                                const responseArticulo = await Existencia.actualizarStock({
                                                    idarticulo: insertId,
                                                    cantidad: Number(objLinea.cantidad),
                                                    idemisor,
                                                    idbodega: idBodega[0].idbodega
                                                })
                                                
                                                console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                            }
                                        
                                        } else {
                                            console.log("No se pudo agregar el articulo")
                                        }

                                } else  {
                                    let stock;
                                    const idarticulo = Number(response[0].id)
                                    const cantidad = Number(objLinea.cantidad);
                                    const unidadMedida = objLinea.unidad_medida;
                                    objLinea.idarticulo = idarticulo;
                                    await insertarLineas(objLinea)
                                    const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                    if(UnidadesMedidaServicios.includes(unidadMedida)){
                                        // es un servicio
                                        codigo_servicio = 'Servicio';
                                        tipo_servicio = '01';
                                        stock =false;
                                    } else {
                                        // es una mercancia
                                        codigo_servicio = 'Mercancía';
                                        tipo_servicio = '02';
                                        stock =true;
                                    }

                                    if(stock == true){
                                        const responseArticulo = await Existencia.actualizarStock({
                                            idarticulo: idarticulo,
                                            cantidad: cantidad,
                                            idemisor: Number(idemisor),
                                            idbodega: idBodega[0].idbodega
                                        })
                                        
                                        console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                    }
                                }
                                
                            //} 
                            
                        } else { // nota de credito de recepcion
                            Articulo.obtenerIdArticulo({
                                descripcion: String(objLinea.descripcioDetalle).trim(),
                                //descripcion: objLinea.descripcioDetalle,
                                idemisor 
                            }).then( async responseArticuloSeleccionado => {
                                
                                if(responseArticuloSeleccionado.length > 0){

                                    objLinea.idarticulo = responseArticuloSeleccionado[0].id;
                                    let cantidadTotal = Number(objLinea.cantidad)
                                    await insertarLineas(objLinea)
                                    const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                    ExistenciaController.restarExistencia({
                                        idemisor,
                                        idarticulo: responseArticuloSeleccionado[0].id,
                                        cantidad: cantidadTotal,
                                        idbodega: idBodega[0].idbodega
                                    })
                                    .then(responseExistenciaArticulo => {
                                        console.log("Inventario de nota crédito actualizado ")
                                        console.log(responseExistenciaArticulo)
                                    }).catch(err => {
                                        console.log(err);
                                        console.log("No se pudo actualizar la existencia")
                                    })
                                } else {
                                
                                        let idImpuesto = 0;
                                        const impuesto = await TipoImpuestoController.obtenerImpuestoPorCodigo({
                                        idemisor,
                                        codigo: objLinea.codigo_tarifa
                                    })

                                    if(impuesto.length === 0){
                                        idImpuesto = await TipoImpuestoController.obtenerImpuestoExento(); 
                                    } else {
                                        idImpuesto =  impuesto
                                    }

                                    let codigo_servicio = '', tipo_servicio ='', stock ;
                                    const unidadMedida = objLinea.unidad_medida;
                                    //let precioProductoFinal = (Number( obj.precio_linea) * Number(obj.tarifa)) /100;
        
                                    let precioProductoFinal = Number( objLinea.precio_linea);
                                    let impuestoAplicado = 0;
                                    if(!(typeof linea.Impuesto === 'undefined')){
                                        impuestoAplicado =  (precioProductoFinal * Number(objLinea.tarifa)) /100;
                                        precioProductoFinal = precioProductoFinal +impuestoAplicado;
                                    } 

                                    if(UnidadesMedidaServicios.includes(unidadMedida)){
                                        // es un servicio
                                        codigo_servicio = 'Servicio';
                                        tipo_servicio = '01';
                                        stock =false;
                                    } else {
                                        // es una mercancia
                                        codigo_servicio = 'Mercancía';
                                        tipo_servicio = '02';
                                        stock =true;
                                    }

                                    const objArticulo = {
                                        idemisor,
                                        tipo_impuesto: idImpuesto[0].id,
                                        idcategoria: 1,
                                        descripcion: objLinea.descripcioDetalle,
                                        codigobarra_producto: objLinea.codigobarra_producto,
                                        precio_articulo: Number(objLinea.precio_linea),
                                        precio_final: precioProductoFinal.toFixed(2),
                                        costo_unitario: 1,
                                        unidad_medida: unidadMedida,
                                        unidad_medida_comercial: '',
                                        tipo_servicio,
                                        codigo_servicio
                                    }
                                    console.log(objArticulo);
                                    const responseNuevoArticulo = await Articulo.nuevoArticulo(objArticulo)
                                        
                                        const {affectedRows,insertId} = responseNuevoArticulo;
                                        
                                        if(affectedRows > 0){
                                            objLinea.idarticulo = insertId;
                                            
                                            const idBodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
                                            //{cantidad, idarticulo}
                                            if(stock == true){
                                                
                                                const responseArticulo = await Existencia.actualizarStock({
                                                    idarticulo: insertId,
                                                    cantidad: -Number(objLinea.cantidad),
                                                    idemisor,
                                                    idbodega: idBodega[0].idbodega
                                                })
                                                
                                                console.log("RESPONSE ACTUALIZAR STOCK",responseArticulo);
                                            }

                                            await insertarLineas(objLinea)
                                        
                                        } else {
                                            console.log("No se pudo agregar el articulo")
                                        }
                                }
                                
                            }).catch(err => {
                                console.log(err);
                                console.log("No se pudo obtener el idarticulo")
                            })
                        
                        }
                    } 

                    const entradaProcesada = await RecepcionesNoEnviadasController.actualizarEstadoFacturaRecepcion(
                        {idemisor, 
                        id
                    });
                
                    if(entradaProcesada.affectedRows > 0) {
                        console.log("El campo procesada de la recepcion ha sido actualizado")
                    } else {
                        console.log("El campo procesada de la recepcion no ha sido actualizado")
                    }
                } else {
                    throw new Error('entrada_save_fail')
                }
            }
        } 

        //poner mensaje de vuelta al cliente
        res.status(201).json({
            message: 'Los comprobantes se han procesado'
        })

        // este for envia las recepciones a hacienda y envia los correos
        let index = 0;
        for(let factura1 of facturas){
           const respuestaDatosMensaje = await EntradaController.obtenerDatosMensajeAceptacion(identradaActualArr[index])
           if(respuestaDatosMensaje.length > 0){
            
            const objMensaje = {
                clavenumerica: respuestaDatosMensaje[0].clavenumerica,
                fecha_factura :respuestaDatosMensaje[0].fecha_factura,
                status_factura :respuestaDatosMensaje[0].status_factura,
                codicion_impuesto :respuestaDatosMensaje[0].codicion_impuesto,
                totalcomprobante :respuestaDatosMensaje[0].totalcomprobante,
                totalimpuesto :respuestaDatosMensaje[0].totalimpuesto,
                codigo_actividad :respuestaDatosMensaje[0].codigo_actividad,
                cedula_proveedor :respuestaDatosMensaje[0].cedula_proveedor,
                cedula_emisor :respuestaDatosMensaje[0].cedula_emisor,
                consecutivo: consecutivoActualArr[index] 
            } 

            // objMensaje,{},'05',llave,clave,insertId
            const objXml = {
                objMensaje,
                detalles: {},
                tipo_factura:'05',
                llave: llaveP12,
                clave: passP12,
                identrada: identradaActualArr[index]
            }

            const xmlGenerado = await generarXmlRecepcion(objXml);
            const emisorCredenciales = await EmisorController.obtenerCredencialesParaRecepcion(identradaActualArr[index])
            if(emisorCredenciales.length > 0){

                const obj = {
                    objToken : {
                        userHacienda: emisorCredenciales[0].key_username_hacienda, 
                        passHacienda: emisorCredenciales[0].key_password_hacienda, 
                        TOKEN_API: emisorCredenciales[0].TOKEN_API, 
                        Client_ID: emisorCredenciales[0].Client_ID, 
                        userAgent: req.get('user-agent')
                    }
                }
                
                console.log("obj credenciales ",obj);

                const dataToken = await generarToken(obj);
                const {access_token} = dataToken; 

                const jsonRecepcion = {
                    clave: objMensaje.clavenumerica,
                    fecha: objMensaje.fecha_factura,
                    emisor: {
                        tipoIdentificacion: emisorArr[index].tipo,//PROVEEDOR
                        numeroIdentificacion: emisorArr[index].numero
                    },
                    receptor: {
                        tipoIdentificacion: receptorActual.tipo,//EMISOR DEL SISTEMA
                        numeroIdentificacion: receptorActual.numero
                    },
                    consecutivoReceptor: consecutivoActualArr[index],
                    comprobanteXml: xmlGenerado,
                    API: emisorCredenciales[0].API,
                    userAgent: req.get('user-agent'),
                    token: access_token
                }

                console.log("obj jsonRecepcion ",jsonRecepcion);

                const respuestaEnvio = await enviarRecepcion(jsonRecepcion);
                console.log("respuesta envio ", respuestaEnvio)
                const objActualizarEstadoEntrada = {
                    codigo_estado: respuestaEnvio,
                    idemisor, 
                    identrada: identradaActualArr[index]
                }
                const responseCodigo = await actualizarCodigoEstadoEntrada(objActualizarEstadoEntrada);

                if(responseCodigo.affectedRows == 0){
                    console.log("No se actualizó el codigo de estado")
                } else {
                    console.log("Se ha actualizado el codigo de estado");
                }

                const objEstadoMensaje = {
                    API: emisorCredenciales[0].API,
                    token: access_token,
                    userAgent: req.get('user-agent'),
                    clave: objMensaje.clavenumerica+'-'+consecutivoActualArr[index]
                }

                const idfactura = identradaActualArr[index];
                let emisorActual = emisorArr[index];
                // obtener la respuesta de hacienda y actualizar la bd

                setTimeout(async () => {

                    const respuestaEstado = await obtenerEstado(objEstadoMensaje)
                    const estado=respuestaEstado.data['ind-estado'];
                    const respuesta = respuestaEstado.data['respuesta-xml'];
                    
                    console.log("idfactura", idfactura); 
                    const tipo = '05RH';
                    if(estado != 'rechazado' && estado != 'aceptado' ){
                        console.log("recepcion generada pero rechazada");
                    } else {
                        
                        const response = await guardarXML({id: idfactura, 
                            xml: respuesta, 
                            tipo_factura: tipo});
                        

                        const {affectedRows} = response;
                        if(affectedRows > 0){
                            
                            const responseEstadoActualizado =  await actualizarEstadoHacienda({idfactura,estado })
                            if(responseEstadoActualizado.affectedRows > 0){
                                console.log("Estado del mensaje actualizado")
                            } else {
                                console.log("Estado del mensaje no ha sido actualizado")
                            }
                            const objEnvioCorreo = {
                                clave: objMensaje.clavenumerica, 
                                idfactura, 
                                tipo: 'RME', 
                                estado, 
                                correo: emisorActual.correo,
                                emisor: emisorActual.nombre
                            };
                                
                            await enviarReporteRecepcionPorCorreo(objEnvioCorreo)

                                console.log('Se ha generado la recepción del comprobante');
                                //})//envio correo
                            // }) // actualizarEstadoHacienda
                        } else {
                            console.log("No pudo pudo guardar la respuesta del mensaje de aceptacion");
                            throw new Error('not_saved_hacienda_response');
                        }

                        // }) //guardar el xml de respuesta 
                    }
                }, 9000);

            } else {
                throw new Error("get_data_emisor_credentials_fail");
            }

           } else {
               throw new Error("get_data_message_fail");
           }

           index++;
        }

    } catch(err){

        if(err.message.toString().indexOf("encabezado") >= 0){
            const id = err.message.toString().substr(10,err.message.toString().length);
            res.status(400).json({
                message: 'La factura con id '+id+ ' presenta un error en el encabezado'
            })
        }else if(err.message.toString().length == 51){ // lineas
            const clave = err.message.toString().substr(0,err.message.toString().length - 1);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en las lineas de detalle'
            })
        } else if(err.message.toString().length == 52){// resumen
            const clave = err.message.toString().substr(0,err.message.toString().length - 2);
            res.status(400).json({
                message: 'La factura con clave '+clave+' presenta un error en el resumen del comprobante'
            })
        }else if(err.message.toString() === 'proveedor_save_fail'){
            res.status(400).json({
                message: 'Hubo un error al guardar un proveedor'
            })
        }else if(err.message.toString() === 'entrada_save_fail'){
            res.status(400).json({
                message: 'Hubo un error al guardar un el comprobante'
            })
        }   
    }
}
/*exports.procesarRecepciones = async (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    let idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const permiso = decodedToken.permiso;
    let {facturas} = req.body;

    // let facturasPaginadas = [];
    const totalFacturas = facturas.length;  
    let totalActualFacturas = totalFacturas; // esto se va ir restando cada vez que se pagine
    const cantidadRegistrosPagina = 3;
    let totalPaginas = null //redondear hacia arriba
    let paginaActual = 1;
    let encabezado = null;
    let lineas = null;
    let resumen = null;
    let tipoDoc = '';
    let idproveedor= '',
        numeroProveedor = '',
        idultimo = 0;
    let llaveP12 = '';
    let passP12 = '';
    let identradaActualArr = [];
    let consecutivoActualArr = [];
    let emisorArr = [];
    let receptorActual = null;
    let inicio = 0,fin=0;

    const responseMultisucursal = await EmisorController.estadoMultiSucurusal(idemisor);
    const multi_sucursal = responseMultisucursal[0].multi_sucursal === 0 ? false: true;

    if(totalFacturas<cantidadRegistrosPagina){
        totalPaginas = 1;
    }else {
        totalPaginas =  Math.ceil(totalFacturas/cantidadRegistrosPagina);
    }       

    llamarProcesoRecepcion (cantidadRegistrosPagina,paginaActual,totalActualFacturas,inicio,fin,totalPaginas,llaveP12,passP12,req,idemisor,facturas,identradaActualArr,emisorArr,consecutivoActualArr,idusuario,permiso,multi_sucursal,res)
        
}*/

exports.cargarFacturas = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        let response = [];

        const responseMultisucursal = await EmisorController.estadoMultiSucurusal(idemisor);

        if(responseMultisucursal[0].multi_sucursal === 0){ // es un emisor de una sola sucursal
            response = await RecepcionesNoEnviadas.cargarFacturasProveedorPorIdEmisor(idemisor);
            console.log("Un emisor")
        }else {// es un emisor de varias sucursales
            //cargar las facturas de todas las sucursales del mismo emisor

            //obtener la cedula juridica por idemisor
            const responseCedula = await EmisorController.obtenerCedulaPorId(idemisor);
            response = await RecepcionesNoEnviadas.cargarFacturasProveedorPorIdCedulaJuridica(responseCedula[0].cedula_emisor,idemisor);
            console.log("Varios emisores")
        }
       
        let arrFacturas = [];

        console.log(response)


        if(response.length > 0){

            for(let factura of response){
                const result = convert.xml2json(factura.xml, {compact: true, spaces: 4});
                const dataParseado = JSON.parse(result);
                //console.log("Factura",dataParseado);
                let dataFactura = {};
                let objFactura = {};
                let clavenumerica = '';
                let tipoDoc = '';
                if(!(typeof dataParseado.FacturaElectronica === 'undefined')){
                    dataFactura = dataParseado.FacturaElectronica;
                    tipoDoc = 'Factura Electrónica';
                    //console.log("Factura",dataParseado);
                }

                if(!(typeof dataParseado.NotaCreditoElectronica === 'undefined')){
                    dataFactura = dataParseado.NotaCreditoElectronica;
                    tipoDoc = 'Nota Crédito Electrónica';
                    //console.log("NOta",dataParseado);
                }

                if(!(typeof dataFactura.Clave === 'undefined') 
                    && !(typeof dataFactura.Clave._text === 'undefined') ){
                    clavenumerica = dataFactura.Clave._text;
                }

                const existeEntrada = await EntradaController.existeEntrada({clavenumerica,idemisor});
                const existeEmisor = await EmisorController.existeEmisor(idemisor);

                if(existeEntrada.length === 0 && existeEmisor.length > 0){
                    
                    objFactura.id = factura.id;
                    objFactura.clavenumerica = dataFactura.Clave._text;
                    objFactura.tipoDoc = tipoDoc;
                    /*if(!(typeof dataFactura.clave === 'undefined') 
                        && !(typeof dataFactura.clave._text === 'undefined') ){
                        objFactura.clavenumerica = dataFactura.clave._text;
                    }*/
    
                    if(!(typeof dataFactura.FechaEmision === 'undefined') 
                        && !(typeof dataFactura.FechaEmision._text === 'undefined') ){
                        objFactura.fecha = dataFactura.FechaEmision._text;
                    }
    
                    if(!(typeof dataFactura.Emisor === 'undefined')){
                        if(!(typeof dataFactura.Emisor.NombreComercial === 'undefined')
                            && !(typeof dataFactura.Emisor.NombreComercial._text === 'undefined')){
                            objFactura.proveedor = dataFactura.Emisor.NombreComercial._text;
                        } else {
                            if(!(typeof dataFactura.Emisor.Nombre === 'undefined')
                            && !(typeof dataFactura.Emisor.Nombre._text === 'undefined')){
                                objFactura.proveedor = dataFactura.Emisor.Nombre._text;
                            }
                        }
    
                        if(!(typeof dataFactura.Emisor.Identificacion === 'undefined')
                            && !(typeof dataFactura.Emisor.Identificacion.Numero === 'undefined')
                            && !(typeof dataFactura.Emisor.Identificacion.Numero._text === 'undefined')){
                            objFactura.cedula_proveedor = dataFactura.Emisor.Identificacion.Numero._text;
                        }
                    }
    
                    if(!(typeof dataFactura.ResumenFactura === 'undefined')
                        && !(typeof dataFactura.ResumenFactura.TotalComprobante === 'undefined')
                        && !(typeof dataFactura.ResumenFactura.TotalComprobante._text === 'undefined')){
                        objFactura.totalcomprobante = dataFactura.ResumenFactura.TotalComprobante._text;
                    }
    
                    arrFacturas.push(objFactura);
                } else {
                    let id = factura.id;
                    const entradaProcesada = await RecepcionesNoEnviadasController.actualizarEstadoFacturaRecepcion(
                        {idemisor, 
                        id
                    });
                    console.log("Ya xiste la entrada",clavenumerica);
                }
            }
        }

        console.log(arrFacturas);

        res.status(200).json({
            facturas: arrFacturas
        })
        
    } catch (error) {

        console.log("error ", error);
        res.status(500).json({
            err : 'Ocurrió un error al cargar los comprobantes'
        })
    }
}

exports.mostrarFacturaRecepcion = async (req,res) => {

    try{

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {idfactura} = req.params;

        const recepcion = await RecepcionesNoEnviadasController.obtenerFacturaRecepcion({idemisor,id:idfactura});
        const jsonXml = await convertirXmlAJson(recepcion[0].xml);

        const objFactura = {
            encabezado: {},
            lineas: [],
            detalle: {}
        }

        let cuerpoFactura = null;
        let arrLineasProcesar = [];
       // let lineas = null;
        let resumen = null;

        if(typeof jsonXml.NotaCreditoElectronica !== 'undefined'  ){
            if(typeof jsonXml.NotaCreditoElectronica.Receptor !== 'undefined'){
                //Receptor = jsonXml.NotaCreditoElectronica.Receptor;
                cuerpoFactura = jsonXml.NotaCreditoElectronica;
                //datosInformacionReferencia = (jsonXml.InformacionReferencia === 'undefined')? null :  jsonXml.InformacionReferencia.Numero._text;
                objFactura.clave = cuerpoFactura.NotaCreditoElectronica.Clave._text;
                objFactura.fecha_factura = cuerpoFactura.NotaCreditoElectronica.FechaEmision._text;
                objFactura.encabezado.proveedor = cuerpoFactura.NotaCreditoElectronica.Emisor.Nombre._text;
                objFactura.encabezado.cedula_proveedor = cuerpoFactura.NotaCreditoElectronica.Emisor.Numero._text;
    
                objFactura.tipo = 'Nota Crédito Electrónica';
                resumen = await validarResumenFactura(cuerpoFactura,objFactura.clave);
                objFactura.resumen = resumen;
                objFactura.detalle.numeroReferencia = jsonXml.InformacionReferencia.Numero._text;
                objFactura.detalle.fecha_emision = jsonXml.InformacionReferencia.FechaEmision._text;
            } 
        } else if(typeof jsonXml.FacturaElectronica !== 'undefined'){
            if(typeof jsonXml.FacturaElectronica.Receptor !== 'undefined'){
                //Receptor = jsonXml.FacturaElectronica.Receptor;
                objFactura.tipo = 'Factura Electrónica';
                cuerpoFactura = jsonXml.FacturaElectronica;
                objFactura.clave = cuerpoFactura.NotaCreditoElectronica.Clave._text;
                objFactura.fecha_factura = cuerpoFactura.FacturaElectronica.FechaEmision._text;
                objFactura.encabezado.proveedor = cuerpoFactura.FacturaElectronica.Emisor.Nombre._text;
                objFactura.encabezado.cedula_proveedor = cuerpoFactura.FacturaElectronica.Emisor.Numero._text;
                resumen = await validarResumenFactura(cuerpoFactura,objFactura.clave);
                objFactura.resumen = resumen;
            } 
        }

        const detallesFactura = cuerpoFactura.DetalleServicio.LineaDetalle;
        const resumenProcesar = cuerpoFactura.ResumenFactura;
        if(typeof detallesFactura.length === 'undefined'){ // es una linea 
            arrLineasProcesar.push(detallesFactura);
        } else { //2 o mas lineas
            for(let linea of detallesFactura){
                arrLineasProcesar.push(linea);
            }
        }

        const {lineas} = await validarLineasFactura(arrLineasProcesar,objFactura.clave);
        

        objFactura.lineas = lineas;
        

        res.status(200).json(objFactura);

    } catch(err){
        res.status(500).json({
            message: 'Error al cargar el comprobante'
        })
    }
}

const validarLineasFactura = (listaLineas,clavenumerica) => {

    return new Promise((resolve,reject) => {
   
         try{

            /*
                let obj = {
                identrada: '',precio_linea: '',cantidad: '',descripcioDetalle: '',
                porcentajedescuento: '',montodescuento: '',naturalezadescuento: '',
                numerolineadetalle: '',subtotal: '',montototal: '',codigo: '',
                codigo_tarifa: '',tarifa: '',monto: '',impuesto_neto: '',
                numerodocumento: '',montoitotallinea: '',baseimponible: '',
                MontoExoneracion: '',factorIVA: '', codigobarra_producto : '', unidad_medida: '',
                idarticulo: '',otrosCargos: 0
            };
            */

           let  identrada= '',precio_linea= '',cantidad= '',descripcioDetalle= '',
                porcentajedescuento= '',montodescuento= '',naturalezadescuento= '',
                numerolineadetalle= '',subtotal= '',montototal= '',codigo= '',
                codigo_tarifa= '',tarifa= '',monto= '',impuesto_neto= '',
                numerodocumento= '',montoitotallinea= '',baseimponible= '',
                MontoExoneracion= '', codigobarra_producto = '', unidad_medida= '',
                idarticulo= '',otrosCargos= 0;
    
            let lineas = [];
            for(let linea of listaLineas){

                //obj.identrada = respuestaEntrada.insertId;
                
                if(!(typeof linea.PrecioUnitario === 'undefined')
                && !(typeof linea.PrecioUnitario._text === 'undefined')
                && linea.PrecioUnitario._text.length > 0){
                    precio_linea = linea.PrecioUnitario._text
                } else {
                    console.log("cayo 1");
                    throw new Error(clavenumerica.toString()+'1');
                }  

                if(!(typeof linea.Cantidad === 'undefined') 
                && !(typeof linea.Cantidad._text === 'undefined')
                && linea.Cantidad._text.length > 0){
                    cantidad = linea.Cantidad._text;
                } else {
                    console.log("cayo 2");
                    throw new Error(clavenumerica.toString()+'1');
                }  
                // descripcioDetalle = linea.Detalle._text
                if(!(typeof linea.Detalle === 'undefined')
                    && !(typeof linea.Detalle._text === 'undefined')
                    && linea.Detalle._text.length > 0){
                    descripcioDetalle = linea.Detalle._text;
                } else {
                    console.log("cayo 3");
                    throw new Error(clavenumerica.toString()+'1');
                }  

                // <UnidadMedida>L</UnidadMedida> <MontoTotalLinea>10000.00000</MontoTotalLinea>

                if(!(typeof linea.UnidadMedida === 'undefined') 
                    && !(typeof linea.UnidadMedida._text === 'undefined')
                    && linea.UnidadMedida._text.length > 0){
                    unidad_medida = linea.UnidadMedida._text;
                } else {
                    console.log("cayo 4");
                    throw new Error(clavenumerica.toString()+'1');
                }

                if(!(typeof linea.MontoTotalLinea === 'undefined') 
                && !(typeof linea.MontoTotalLinea._text === 'undefined')
                && linea.MontoTotalLinea._text.length > 0) {
                    montoitotallinea = Number(Number(linea.MontoTotalLinea._text).toFixed(2));
                } else {
                    console.log("cayo 5");
                    throw new Error(clavenumerica.toString()+'1');
                }

                let descuento=0, naturalezadescuento = '';
                if(!(typeof linea.Descuento === 'undefined') 
                    && typeof linea.Descuento.length === 'undefined' 
                    && !(typeof linea.Descuento.MontoDescuento === 'undefined')
                    && !(typeof linea.Descuento.MontoDescuento._text === 'undefined')
                    && linea.Descuento.MontoDescuento._text.length > 0){
    
                    descuento = Number(linea.Descuento.MontoDescuento._text);
                    naturalezadescuento = 'Descuento aplicado';
    
                } else if(!(typeof linea.Descuento === 'undefined') 
                    && !(typeof linea.Descuento.length === 'undefined') 
                    && !(typeof linea.Descuento[0].MontoDescuento === 'undefined')
                    && !(typeof linea.Descuento[0].MontoDescuento._text === 'undefined')
                    && linea.Descuento[0].MontoDescuento._text.length > 0){
    
                    descuento = Number(linea.Descuento[0].MontoDescuento._text);
                    naturalezadescuento = 'Descuento aplicado';
                }else {
                    descuento = 0;
                    naturalezadescuento = '';
                }
                let codigoComercialProducto = '';
                let codigoLinea = ''
                if(!(typeof linea.CodigoComercial === 'undefined')
                    && !(typeof linea.CodigoComercial.Codigo === 'undefined')
                    && !(typeof linea.CodigoComercial.Codigo._text === 'undefined')
                    && linea.CodigoComercial.Codigo._text.length > 0){ // viene codigocomercial
                    //Codigo._text
                    codigoComercialProducto = linea.CodigoComercial.Codigo._text;
                } else {
                    codigoComercialProducto = ''; 
                }
    
                /*if(!(typeof linea.Codigo === 'undefined') && !(typeof linea.Codigo._text === 'undefined')){ // viene codigocomercial
                    //Codigo._text
                    console.log("codigo ",linea.Codigo._text)
                    codigoLinea = linea.Codigo._text;
                }*/
    
    
                montodescuento = descuento;
                naturalezadescuento = naturalezadescuento;
                //const montototal = Number(lineas[i].MontoTotal._text) < 1 ? 0 : Number(lineas[i].MontoTotal._text);
                let montototal = 0;
                if(!(typeof linea.MontoTotal === 'undefined')
                    && !(typeof linea.MontoTotal._text === 'undefined')
                    && linea.MontoTotal._text.length > 0){
                    montototal = Number(linea.MontoTotal._text);
                } else {
                    console.log("cayo 6");
                    throw new Error(clavenumerica.toString()+'1');
                }
                const porcentajeDesscuentoAplicado= montototal > 0 ? Number((descuento * 100) / montototal).toFixed(2) : 0;
                let MontoExoneracion = 0, factorIVA = 0;
                porcentajedescuento = porcentajeDesscuentoAplicado > 0? porcentajeDesscuentoAplicado: 0;
                //numerolineadetalle = linea.NumeroLinea._text;
                
                if(!(typeof linea.NumeroLinea === 'undefined')
                    && !(typeof linea.NumeroLinea._text === 'undefined')
                    && linea.NumeroLinea._text.length > 0){
                    numerolineadetalle = linea.NumeroLinea._text
                } else {
                    console.log("cayo 7");
                    throw new Error(clavenumerica.toString()+'1');
                }  
                codigobarra_producto = codigoComercialProducto;
                //subtotal = linea.SubTotal._text; throw new Error(clavenumerica.toString()+'1');

                if(!(typeof linea.SubTotal === 'undefined') 
                    && !(typeof linea.SubTotal._text === 'undefined')
                    && linea.SubTotal._text.length > 0 ){
                    subtotal = Number(Number(linea.SubTotal._text).toFixed(2));
                } else {
                    console.log("cayo 8");
                    throw new Error(clavenumerica.toString()+'1');
                } 

                montototal = montototal;

                if(!(typeof linea.Impuesto === 'undefined' ) && Array.isArray(linea.Impuesto)){
                    for (const elemento of linea.Impuesto) {
                    
                        if(!(typeof elemento === 'undefined')
                        && !(typeof elemento.Codigo === 'undefined') 
                        && !(typeof elemento.Codigo._text === 'undefined')
                        && elemento.Codigo._text.length > 0
                        && !(typeof elemento.CodigoTarifa === 'undefined')
                        && !(typeof elemento.CodigoTarifa._text === 'undefined')
                        && elemento.CodigoTarifa._text.length > 0
                        && !(typeof elemento.Tarifa === 'undefined')
                        && !(typeof elemento.Tarifa._text === 'undefined')
                        && elemento.Tarifa._text.length > 0
                        && !(typeof elemento.Monto === 'undefined')
                        && !(typeof elemento.Monto._text === 'undefined')
                        && elemento.Monto._text.length > 0){ 
                             
                            codigo = elemento.Codigo._text;
                            codigo_tarifa = elemento.CodigoTarifa._text;
                            tarifa = elemento.Tarifa._text;
                            monto = elemento.Monto._text;
                        
                        } else if(!(typeof elemento === 'undefined')
                            && !(typeof elemento.Codigo === 'undefined') 
                            && !(typeof elemento.Codigo._text === 'undefined')
                            && elemento.Codigo._text.length > 0
                            && !(typeof elemento.Tarifa === 'undefined')
                            && !(typeof elemento.Tarifa._text === 'undefined')
                            && elemento.Tarifa._text.length > 0
                            && !(typeof elemento.Monto === 'undefined')
                            && !(typeof elemento.Monto._text === 'undefined')
                            && elemento.Monto._text.length > 0) {
                            //console.log("Entró al if codigo")
                            if(String(elemento.Codigo._text) === '02') {
                                otrosCargos += Number(Number(elemento.Monto._text).toFixed(2));
                            }
                        } else  {
                            codigo = '01';
                            codigo_tarifa = '01';
                            tarifa = 0;
                            monto = 0;
                        }
                    }
                } else if(!(typeof linea.Impuesto === 'undefined')
                   && !(typeof linea.Impuesto.Codigo === 'undefined') 
                   && !(typeof linea.Impuesto.Codigo._text === 'undefined')
                   && linea.Impuesto.Codigo._text.length > 0
                   && !(typeof linea.Impuesto.CodigoTarifa === 'undefined')
                   && !(typeof linea.Impuesto.CodigoTarifa._text === 'undefined')
                   && linea.Impuesto.CodigoTarifa._text.length > 0
                   && !(typeof linea.Impuesto.Tarifa === 'undefined')
                   && !(typeof linea.Impuesto.Tarifa._text === 'undefined')
                   && linea.Impuesto.Tarifa._text.length > 0
                   && !(typeof linea.Impuesto.Monto === 'undefined')
                   && !(typeof linea.Impuesto.Monto._text === 'undefined')
                   && linea.Impuesto.Monto._text.length > 0){ // los nodos vienen y vienen con valores
                       
                    //viene el nodo de Impuesto
                    codigo = linea.Impuesto.Codigo._text;
                    codigo_tarifa = linea.Impuesto.CodigoTarifa._text;
                    tarifa = linea.Impuesto.Tarifa._text;
                    monto = linea.Impuesto.Monto._text;
    
                    if(!(typeof linea.Impuesto ===  'undefined') ){
                        
                        if(!(typeof linea.Impuesto.Exoneracion === 'undefined')
                            && !(typeof linea.Impuesto.Exoneracion.MontoExoneracion === 'undefined')
                            && !(typeof linea.Impuesto.Exoneracion.MontoExoneracion._text === 'undefined')
                            && linea.Impuesto.Exoneracion.MontoExoneracion._text.length > 0){
                            MontoExoneracion = linea.Impuesto.Exoneracion.MontoExoneracion._text;
                        }
                    }
    
                    if(!(typeof linea.Impuesto ===  'undefined' )){
                        if(!(typeof linea.Impuesto.FactorIVA === 'undefined') 
                        && !(typeof linea.Impuesto.FactorIVA._text === 'undefined')
                        && linea.Impuesto.FactorIVA._text.length > 0){
                            factorIVA = linea.Impuesto.FactorIVA._text;
                        }
                    }
    
                } else {
                    codigo = '01';
                    codigo_tarifa = '01';
                    tarifa = 0;
                    monto = 0;
                }
                let impuesto_neto = 0, baseimponible = 0;
                if(!(typeof linea.ImpuestoNeto === 'undefined') 
                    && !(typeof linea.ImpuestoNeto._text === 'undefined')
                    && linea.ImpuestoNeto._text.length > 0){
                    impuesto_neto= linea.ImpuestoNeto._text;
                }
    
                //BaseImponible
                if(!(typeof linea.BaseImponible ===  'undefined') 
                    && !(typeof linea.BaseImponible._text === 'undefined')
                    && linea.BaseImponible._text.length > 0){
                    baseimponible = linea.BaseImponible._text;
                }
    
                impuesto_neto = impuesto_neto;
                montoitotallinea = linea.MontoTotalLinea._text;
                //numerodocumento = respuestaEntrada.insertId; // el numero documento va ser el id dela entrada
               // factorIVA = factorIVA;
               // MontoExoneracion = MontoExoneracion;
                baseimponible = baseimponible;
                lineas.push({
                    identrada: '',precio_linea,cantidad,descripcioDetalle,
                    porcentajedescuento,montodescuento,naturalezadescuento,
                    numerolineadetalle,subtotal,montototal,codigo,
                    codigo_tarifa,tarifa,monto,impuesto_neto,
                    numerodocumento,montoitotallinea,baseimponible,
                    MontoExoneracion,factorIVA, codigobarra_producto , unidad_medida,
                    idarticulo: '',otrosCargos: 0
                });

            }
            //console.log(lineas);
            resolve({lineas,otrosCargos});
        } catch(err){
            console.log(err);
            throw new Error(clavenumerica.toString()+'1');
        }
    })
}

const validarEncabezadoFactura = (encabezado,id='') => {

    return new Promise((resolve,reject) => {

       try {
            let {clavenumerica,
                Emisor,
                Receptor,
                codigoActividad,
                consecutivo,
                fecha,
                condicionVenta,
                medioPago,
                plazoCredito
            } = encabezado;

            let objEncabezadoGenerado = {}; 
            let objReceptor = {};
            let objEmisor = {};

            if(!(typeof clavenumerica === 'undefined') 
                && !(typeof clavenumerica._text === 'undefined')
                && clavenumerica._text.length > 0){
                objEncabezadoGenerado.clavenumerica = clavenumerica._text;
            } else {
                console.log("cayó 1")
                throw new Error("encabezado"+id.toString());
            }

            if(!(typeof codigoActividad === 'undefined') 
                && !(typeof codigoActividad._text === 'undefined')
                && codigoActividad._text.length > 0){
                objEncabezadoGenerado.codigoActividad = codigoActividad._text;
            } else {
                console.log("cayó 2")
                throw new Error("encabezado"+id.toString());
            }

            if(!(typeof consecutivo === 'undefined') 
                && !(typeof consecutivo._text === 'undefined')
                && consecutivo._text.length > 0){
                objEncabezadoGenerado.consecutivo = consecutivo._text;
            } else {
                console.log("cayó 3")
                throw new Error("encabezado"+id.toString());
            }

            if(!(typeof fecha === 'undefined') 
                && !(typeof fecha._text === 'undefined')
                && fecha._text.length > 0){
                objEncabezadoGenerado.fecha = fecha._text;
            } else {
                console.log("cayó 4")
                throw new Error("encabezado"+id.toString());
            }
            
            if(!(typeof condicionVenta === 'undefined') 
                && !(typeof condicionVenta._text === 'undefined')
                && condicionVenta._text.length > 0){
                objEncabezadoGenerado.condicionVenta = condicionVenta._text;
            } else {
                console.log("cayó 5")
                throw new Error("encabezado"+id.toString());
            }

            

            if((typeof medioPago.length === 'undefined') // solo trae un medio de pago
                && !(typeof medioPago === 'undefined') 
                && !(typeof medioPago._text === 'undefined')
                &&  medioPago._text.length > 0){
                objEncabezadoGenerado.medioPago = medioPago._text;
            } else if(!(typeof medioPago.length === 'undefined') // solo varios medios de pago
                && !(typeof medioPago[0] === 'undefined') 
                && !(typeof medioPago[0]._text === 'undefined')
                && medioPago[0]._text.length > 0){
                    objEncabezadoGenerado.medioPago = medioPago[0]._text;
                //objEncabezadoGenerado.medioPago = medioPago._text
            } else {
                console.log("cayó 6")
                throw new Error("encabezado"+id.toString());
            }

            if((!(typeof plazoCredito === 'undefined') 
                && typeof plazoCredito.length === 'undefined') // es un objeto 
                && !(typeof plazoCredito._text === 'undefined')
                && plazoCredito._text.length > 0){ // trae solo un plazo de credito
                    objEncabezadoGenerado.plazoCredito = plazoCredito._text;
                    //!(typeof plazoCredito === 'undefined')
            } else if(!(typeof plazoCredito === 'undefined')
                && !(typeof plazoCredito.length === 'undefined') // es un array
                && !(typeof plazoCredito[0] === 'undefined')
                && !(typeof plazoCredito[0]._text === 'undefined')
                && plazoCredito[0]._text.length > 0){ // trae varios plazos de credito
                    objEncabezadoGenerado.plazoCredito = plazoCredito[0]._text;
            } else {
                objEncabezadoGenerado.plazoCredito = '';
            }

            if(!(typeof Emisor === 'undefined')){
            
                if(!(typeof Emisor.Nombre === 'undefined') 
                    && !(typeof Emisor.Nombre._text === 'undefined')
                    && Emisor.Nombre._text.length > 0){ // campo obligatorio
                    objEmisor.nombre = Emisor.Nombre._text;
                }else {
                    console.log("cayó  7")
                    throw new Error("encabezado"+id.toString());
                }

                if(!(typeof Emisor.Identificacion === 'undefined') 
                    && !(typeof Emisor.Identificacion.Tipo === 'undefined')
                    && !(typeof Emisor.Identificacion.Tipo._text === 'undefined')
                    && Emisor.Identificacion.Tipo._text.length > 0
                    && !(typeof Emisor.Identificacion.Numero === 'undefined')
                    && !(typeof Emisor.Identificacion.Numero._text === 'undefined')
                    && Emisor.Identificacion.Numero._text.length > 0
                ){ // campo obligaotrio
                    objEmisor.tipo = Emisor.Identificacion.Tipo._text;
                    objEmisor.numero = Emisor.Identificacion.Numero._text;
                } else {
                    console.log("cayó 8")
                    throw new Error("encabezado"+id.toString());
                }

                if(!(typeof Emisor.NombreComercial === 'undefined')
                    && !(typeof Emisor.NombreComercial._text === 'undefined')
                    && Emisor.NombreComercial._text.length > 0){
                    objEmisor.nombrecomercial =  Emisor.NombreComercial._text;
                } else {
                    objEmisor.nombrecomercial = '';
                }

                if(!(typeof Emisor.Telefono === 'undefined')
                    && (typeof Emisor.Telefono.length === 'undefined')
                    && !(typeof Emisor.Telefono.CodigoPais === 'undefined')
                    && !(typeof Emisor.Telefono.CodigoPais._text === 'undefined')
                    && Emisor.Telefono.CodigoPais._text.length > 0
                    && !(typeof Emisor.Telefono.NumTelefono === 'undefined')
                    && !(typeof Emisor.Telefono.NumTelefono._text === 'undefined')
                    && Emisor.Telefono.NumTelefono._text.length > 0
                ){
                    objEmisor.codigoPaisTel = Emisor.Telefono.CodigoPais._text;
                    objEmisor.numTelefono = Emisor.Telefono.NumTelefono._text;
                } else if(!(typeof Emisor.Telefono === 'undefined')
                    && !(typeof Emisor.Telefono.length === 'undefined')
                    && !(typeof Emisor.Telefono[0].CodigoPais === 'undefined')
                    && !(typeof Emisor.Telefono[0].CodigoPais._text === 'undefined')
                    && Emisor.Telefono[0].CodigoPais._text.length > 0
                    && !(typeof Emisor.Telefono[0].NumTelefono === 'undefined')
                    && !(typeof Emisor.Telefono[0].NumTelefono._text === 'undefined')
                    && Emisor.Telefono[0].NumTelefono._text.length > 0
                ){
                    objEmisor.codigoPaisTel = Emisor.Telefono[0].CodigoPais._text;
                    objEmisor.numTelefono = Emisor.Telefono[0].NumTelefono._text;
                } else {

                    objEmisor.codigoPaisTel = '';
                    objEmisor.numTelefono = '';
                }

                if(!(typeof Emisor.Ubicacion === 'undefined')){
                    if(!(typeof Emisor.Ubicacion.Provincia === 'undefined')
                        && !(typeof Emisor.Ubicacion.Provincia._text === 'undefined')
                        && Emisor.Ubicacion.Provincia._text.length > 0
                        && !(typeof Emisor.Ubicacion.Canton === 'undefined')
                        && !(typeof Emisor.Ubicacion.Canton._text === 'undefined')
                        &&  Emisor.Ubicacion.Canton._text.length > 0
                        && !(typeof Emisor.Ubicacion.Distrito === 'undefined')
                        && !(typeof Emisor.Ubicacion.Distrito._text === 'undefined')
                        && Emisor.Ubicacion.Distrito._text.length > 0
                        && (typeof Emisor.Ubicacion.Barrio === 'undefined')  
                        && !(typeof Emisor.Ubicacion.OtrasSenas === 'undefined')  
                        && !(typeof Emisor.Ubicacion.OtrasSenas._text === 'undefined') 
                        && Emisor.Ubicacion.OtrasSenas._text.length > 0
                    ){ //emisor_barrio

                        const provincia = Emisor.Ubicacion.Provincia._text.toString();
                        const canton = Emisor.Ubicacion.Canton._text.toString();
                        const distrito = Emisor.Ubicacion.Distrito._text.toString(); 
                        const barrio = '01';
                        objEmisor.barrio = provincia + canton + distrito + barrio;
                        objEmisor.otras_senas = Emisor.Ubicacion.OtrasSenas._text.toString();

                    } else if(!(typeof Emisor.Ubicacion.Provincia === 'undefined')
                        && !(typeof Emisor.Ubicacion.Provincia._text === 'undefined')
                        && Emisor.Ubicacion.Provincia._text.length > 0
                        && !(typeof Emisor.Ubicacion.Canton === 'undefined')
                        && !(typeof Emisor.Ubicacion.Canton._text === 'undefined')
                        &&  Emisor.Ubicacion.Canton._text.length > 0
                        && !(typeof Emisor.Ubicacion.Distrito === 'undefined')
                        && !(typeof Emisor.Ubicacion.Distrito._text === 'undefined')
                        && Emisor.Ubicacion.Distrito._text.length > 0
                        && !(typeof Emisor.Ubicacion.Barrio === 'undefined')  
                        && !(typeof Emisor.Ubicacion.Barrio._text === 'undefined') 
                        && Emisor.Ubicacion.Barrio._text.length > 0 
                        && !(typeof Emisor.Ubicacion.OtrasSenas === 'undefined')  
                        && !(typeof Emisor.Ubicacion.OtrasSenas._text === 'undefined')
                        && Emisor.Ubicacion.OtrasSenas._text.length > 0 ){
                            const provincia = Emisor.Ubicacion.Provincia._text.toString();
                            const canton = Emisor.Ubicacion.Canton._text.toString();
                            const distrito = Emisor.Ubicacion.Distrito._text.toString(); 
                            const barrio = Emisor.Ubicacion.Barrio._text;
                            objEmisor.barrio = provincia + canton + distrito + barrio;
                            objEmisor.otras_senas = Emisor.Ubicacion.OtrasSenas._text.toString();
                    } else {
                        console.log("cayó 9")
                        throw new Error("encabezado"+id.toString());
                    }

                    if(!(typeof Emisor.IdentificacionExtranjero === 'undefined')
                        && !(typeof Emisor.IdentificacionExtranjero._text === 'undefined')
                        && Emisor.IdentificacionExtranjero._text.length > 0
                        && !(typeof Emisor.OtrasSenasExtranjero === 'undefined')
                        && !(typeof Emisor.OtrasSenasExtranjero._text === 'undefined')
                        && Emisor.OtrasSenasExtranjero._text.length > 0
                        ){    
                        objEmisor.IdentificacionExtranjero = Emisor.IdentificacionExtranjero._text.toString();                    
                        objEmisor.OtrasSenasExtranjero = Emisor.OtrasSenasExtranjero._text.toString();
                    } else {
                        objEmisor.IdentificacionExtranjero = '';                    
                        objEmisor.OtrasSenasExtranjero = '';
                    }
                } else {
                    console.log("cayó 10")
                    throw new Error("encabezado"+id.toString());
                }

                if(!(typeof Emisor.CorreoElectronico === 'undefined')
                    && !(typeof Emisor.CorreoElectronico._text === 'undefined')
                    && Emisor.CorreoElectronico._text.length > 0){
                        objEmisor.correo = Emisor.CorreoElectronico._text;
                } else {
                    console.log("cayó correo emisor");
                    throw new Error("encabezado"+id.toString());
                }

            } else {
                console.log("cayó 11")
                throw new Error("encabezado"+id.toString());
            }

            if(!(typeof Receptor === 'undefined')){
                

                if(!(typeof Receptor.Nombre === 'undefined') 
                    && !(typeof Receptor.Nombre._text === 'undefined')
                    && Receptor.Nombre._text.length > 0){ // campo obligatorio
                    objReceptor.nombre = Receptor.Nombre._text;
                }else {
                    console.log("cayó 12")
                    throw new Error("encabezado"+id.toString());
                }

                if(!(typeof Receptor.Identificacion === 'undefined') 
                    && !(typeof Receptor.Identificacion.Tipo === 'undefined')
                    && !(typeof Receptor.Identificacion.Tipo._text === 'undefined')
                    && Receptor.Identificacion.Tipo._text.length > 0
                    && !(typeof Receptor.Identificacion.Numero === 'undefined')
                    && !(typeof Receptor.Identificacion.Numero._text === 'undefined')
                    && Receptor.Identificacion.Numero._text.length > 0
                ){ // campo obligaotrio
                    objReceptor.tipo = Receptor.Identificacion.Tipo._text;
                    objReceptor.numero = Receptor.Identificacion.Numero._text;
                } else {
                    console.log("cayó 13")
                    throw new Error("encabezado"+id.toString());
                }

                if(!(typeof Receptor.NombreComercial === 'undefined')
                    && !(typeof Receptor.NombreComercial._text === 'undefined')
                    && Receptor.NombreComercial._text.length > 0){
                    objReceptor.nombrecomercial =  Receptor.NombreComercial._text;
                } else {
                    objReceptor.nombrecomercial = '';
                }

                if(!(typeof Receptor.Telefono === 'undefined')
                    && (typeof Receptor.Telefono.length === 'undefined')
                    && !(typeof Receptor.Telefono.CodigoPais === 'undefined')
                    && !(typeof Receptor.Telefono.CodigoPais._text === 'undefined')
                    && Receptor.Telefono.CodigoPais._text.length > 0
                    && !(typeof Receptor.Telefono.NumTelefono === 'undefined')
                    && !(typeof Receptor.Telefono.NumTelefono._text === 'undefined')
                    && Receptor.Telefono.NumTelefono._text.length > 0
                ){
                    objReceptor.codigoPaisTel = Receptor.Telefono.CodigoPais._text;
                    objReceptor.numTelefono = Receptor.Telefono.NumTelefono._text;
                } else if(!(typeof Receptor.Telefono === 'undefined')
                    && !(typeof Receptor.Telefono.length === 'undefined')
                    && !(typeof Receptor.Telefono[0].CodigoPais === 'undefined')
                    && !(typeof Receptor.Telefono[0].CodigoPais._text === 'undefined')
                    && Receptor.Telefono[0].CodigoPais._text.length > 0
                    && !(typeof Receptor.Telefono[0].NumTelefono === 'undefined')
                    && !(typeof Receptor.Telefono[0].NumTelefono._text === 'undefined')
                    && Receptor.Telefono[0].NumTelefono._text.length > 0
                ){
                    objReceptor.codigoPaisTel = Receptor.Telefono[0].CodigoPais._text;
                    objReceptor.numTelefono = Receptor.Telefono[0].NumTelefono._text;
                } else {

                    objReceptor.codigoPaisTel = '';
                    objReceptor.numTelefono = '';
                }

                if(!(typeof Receptor.Ubicacion === 'undefined')){
                    if(!(typeof Receptor.Ubicacion.Provincia === 'undefined')
                        && !(typeof Receptor.Ubicacion.Provincia._text === 'undefined')
                        && Receptor.Ubicacion.Provincia._text.length > 0
                        && !(typeof Receptor.Ubicacion.Canton === 'undefined')
                        && !(typeof Receptor.Ubicacion.Canton._text === 'undefined')
                        && Receptor.Ubicacion.Canton._text.length > 0
                        && !(typeof Receptor.Ubicacion.Distrito === 'undefined')
                        && !(typeof Receptor.Ubicacion.Distrito._text === 'undefined')  
                        && Receptor.Ubicacion.Distrito._text.length > 0
                        && !(typeof Receptor.Ubicacion.OtrasSenas === 'undefined')  
                        && !(typeof Receptor.Ubicacion.OtrasSenas._text === 'undefined') 
                        && Receptor.Ubicacion.OtrasSenas._text.length > 0
                    ){ //emisor_barrio

                        const provincia = Receptor.Ubicacion.Provincia._text.toString();
                        const canton = Receptor.Ubicacion.Canton._text.toString();
                        const distrito = Receptor.Ubicacion.Distrito._text.toString(); 
                        const barrio = '01';
                        objReceptor.barrio = provincia + canton + distrito + barrio;
                        objReceptor.otras_senas = Receptor.Ubicacion.OtrasSenas._text.toString();

                    } else {
                        objReceptor.barrio = '1010101';
                        objReceptor.otras_senas = '';
                    }

                    if(!(typeof Receptor.IdentificacionExtranjero === 'undefined')
                        && !(typeof Receptor.IdentificacionExtranjero._text === 'undefined')
                        && Receptor.IdentificacionExtranjero._text.length > 0
                        && !(typeof Receptor.OtrasSenasExtranjero === 'undefined')
                        && !(typeof Receptor.OtrasSenasExtranjero._text === 'undefined')
                        && Receptor.OtrasSenasExtranjero._text.length > 0
                        ){    
                        objReceptor.IdentificacionExtranjero = Receptor.IdentificacionExtranjero._text.toString();                    
                        objReceptor.OtrasSenasExtranjero = Receptor.OtrasSenasExtranjero._text.toString();
                    } else {
                        objReceptor.IdentificacionExtranjero = '';                    
                        objReceptor.OtrasSenasExtranjero = '';
                    }

                } else {
                    console.log("cayó 16")
                    objEmisor.codigoPaisTel = '';
                    objEmisor.numTelefono = '';
                }

                if(!(typeof Receptor.CorreoElectronico === 'undefined')
                    && !(typeof Receptor.CorreoElectronico._text === 'undefined')
                    && Receptor.CorreoElectronico._text.length > 0){
                        objReceptor.correo = Receptor.CorreoElectronico._text;
                } else {
                    console.log("cayó 15")
                    objReceptor.correo = '';
                    // throw new Error("encabezado"+id.toString());
                }
            } else {
                console.log("cayó 17")
                throw new Error("encabezado"+id.toString());
            }

            resolve({
                emisor: objEmisor,
                receptor: objReceptor,
                codigoActividad: objEncabezadoGenerado.codigoActividad,
                consecutivo: objEncabezadoGenerado. consecutivo,
                fecha: objEncabezadoGenerado.fecha,
                condicionVenta: objEncabezadoGenerado.condicionVenta,
                medioPago: objEncabezadoGenerado.medioPago,
                clavenumerica: objEncabezadoGenerado.clavenumerica,
                plazoCredito: objEncabezadoGenerado.plazoCredito 
            })

    // aqui comienzan las validaciones 
       } catch(err){
           console.log(" err ", err);
         throw new Error("encabezado"+id.toString());
       }
    })
}

const validarResumenFactura = (cuerpoFactura,clavenumerica) => {
    
    return new Promise((resolve,reject) => {
        
        try {

            if(!(typeof cuerpoFactura.ResumenFactura === 'undefined')){
                let totalOtrosCargos = 0, montoDescuento = 0, totalVenta = 0;
                
                if(!(typeof cuerpoFactura.ResumenFactura.TotalDescuentos === 'undefined') 
                && !(typeof cuerpoFactura.ResumenFactura.TotalDescuentos._text === 'undefined')
                && cuerpoFactura.ResumenFactura.TotalDescuentos._text.length > 0){
                    montoDescuento = Number(Number(cuerpoFactura.ResumenFactura.TotalDescuentos._text).toFixed(2));
                }
                                     
                if(!(typeof cuerpoFactura.ResumenFactura.TotalVenta === 'undefined') 
                && !(typeof cuerpoFactura.ResumenFactura.TotalVenta._text === 'undefined')
                && cuerpoFactura.ResumenFactura.TotalVenta._text.length > 0){
                    totalVenta = Number(Number(cuerpoFactura.ResumenFactura.TotalVenta._text).toFixed(2));
                    
                }

               const porcentajeDescuento = Number(totalVenta) > 0 ? (Number(montoDescuento) * 100) / Number(totalVenta): 0;
               console.log("porcentajeDescuento ",porcentajeDescuento);
                if(!(typeof cuerpoFactura.OtrosCargos === 'undefined')
                    && !(typeof cuerpoFactura.OtrosCargos.MontoCargo === 'undefined')
                    && !(typeof cuerpoFactura.OtrosCargos.MontoCargo._text === 'undefined')
                    && cuerpoFactura.OtrosCargos.MontoCargo._text.length > 0) {
                    totalOtrosCargos = Number(Number(cuerpoFactura.OtrosCargos.MontoCargo._text).toFixed(2))
                }

                //cuerpoFactura.ResumenFactura.CodigoTipoMoneda.CodigoMoneda._text
                let codigo, tipocambio = 0;
                if(!(typeof cuerpoFactura.ResumenFactura.CodigoTipoMoneda === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.CodigoTipoMoneda.CodigoMoneda === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.CodigoTipoMoneda.CodigoMoneda._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.CodigoTipoMoneda.CodigoMoneda._text.length > 0
                    && !(typeof cuerpoFactura.ResumenFactura.CodigoTipoMoneda.TipoCambio === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.CodigoTipoMoneda.TipoCambio._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.CodigoTipoMoneda.TipoCambio._text .length > 0){ // no viene indefinido
                        codigo = cuerpoFactura.ResumenFactura.CodigoTipoMoneda.CodigoMoneda._text 
                    tipocambio = cuerpoFactura.ResumenFactura.CodigoTipoMoneda.TipoCambio._text
                } else {
                    codigo = 'CRC';
                    tipocambio = '1';
                }

                let subtotalFactura = 0, 
                    totalservgravados= 0, 
                    totalservexentos = 0,
                    totalservexonerado = 0,
                    totalmercanciasgravadas = 0,
                    totalmercanciasexentas = 0,
                    totalmercanciaexonerada = 0,
                    totalgravado = 0,
                    totalexento = 0,
                    totalexonerado = 0,
                    //totalventa = 0,
                    totalventaneta = 0,
                    totalimpuesto = 0,
                    totalcomprobante = 0;


                if(!(typeof cuerpoFactura.ResumenFactura.TotalVentaNeta === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalVentaNeta._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalVentaNeta._text.length > 0){
                    subtotalFactura = Number(Number(cuerpoFactura.ResumenFactura.TotalVentaNeta._text).toFixed(2));
                    
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalServGravados === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalServGravados._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalServGravados._text.length > 0){
                    totalservgravados = Number(Number(cuerpoFactura.ResumenFactura.TotalServGravados._text).toFixed(2));
                }


                if(!(typeof cuerpoFactura.ResumenFactura.TotalServExentos ==='undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalServExentos._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalServExentos._text.length > 0){
                    totalservexentos = Number(Number(cuerpoFactura.ResumenFactura.TotalServExentos._text).toFixed(2));
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalServExonerado ==='undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalServExonerado._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalServExonerado._text > 0){
                    totalservexonerado = Number(Number(cuerpoFactura.ResumenFactura.TotalServExonerado._text).toFixed(2));
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalMercanciasGravadas === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.TotalMercanciasGravadas._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalMercanciasGravadas._text.length > 0){
                    totalmercanciasgravadas = Number(Number(cuerpoFactura.ResumenFactura.TotalMercanciasGravadas._text).toFixed(2));
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalMercanciasExentas === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalMercanciasExentas._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalMercanciasExentas._text.length > 0){
                    totalmercanciasexentas = Number(Number(cuerpoFactura.ResumenFactura.TotalMercanciasExentas._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalMercExonerada === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalMercExonerada._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalMercExonerada._text.length > 0){
                    totalmercanciaexonerada = Number(Number(cuerpoFactura.ResumenFactura.TotalMercExonerada._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalGravado === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalGravado._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalGravado._text.length > 0){
                    totalgravado = Number(Number(cuerpoFactura.ResumenFactura.TotalGravado._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalExento === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.TotalExento._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalExento._text.length > 0){
                    totalexento = Number(Number(cuerpoFactura.ResumenFactura.TotalExento._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalExonerado === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.TotalExonerado._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalExonerado._text.length > 0){
                    totalexonerado = Number(Number(cuerpoFactura.ResumenFactura.TotalExonerado._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalVenta === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalVenta._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalVenta._text.length > 0){
                    totalventa = Number(Number(cuerpoFactura.ResumenFactura.TotalVenta._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalVentaNeta === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalVentaNeta._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalVentaNeta._text.length > 0){
                    totalventaneta = Number(Number(cuerpoFactura.ResumenFactura.TotalVentaNeta._text).toFixed(2)); 
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalImpuesto === 'undefined') 
                    && !(typeof cuerpoFactura.ResumenFactura.TotalImpuesto._text === 'undefined') 
                    && cuerpoFactura.ResumenFactura.TotalImpuesto._text.length > 0){
                    totalimpuesto = Number(Number(cuerpoFactura.ResumenFactura.TotalImpuesto._text).toFixed(2));
                }

                if(!(typeof cuerpoFactura.ResumenFactura.TotalComprobante === 'undefined')
                    && !(typeof cuerpoFactura.ResumenFactura.TotalComprobante._text === 'undefined')
                    && cuerpoFactura.ResumenFactura.TotalComprobante._text.length > 0){
                    totalcomprobante = Number(Number(cuerpoFactura.ResumenFactura.TotalComprobante._text).toFixed(2));
                }
                const totalIVADevuelto = 0; 
                const objResumenFactura = {
                    porcentaje_descuento_total: 0,//porcentajeDescuento.toFixed(2),
                    monto_descuento_total: montoDescuento,
                    subtotal: subtotalFactura,
                    totalservgravados: totalservgravados,
                    totalservexentos: totalservexentos,
                    totalservexonerado: totalservexonerado,
                    totalmercanciasgravadas: totalmercanciasgravadas,
                    totalmercanciasexentas: totalmercanciasexentas,
                    totalmercanciaexonerada: totalmercanciaexonerada,
                    totalgravado: totalgravado,
                    totalexento: totalexento,
                    totalexonerado: totalexonerado,
                    totalventa: totalVenta,
                    totaldescuentos: montoDescuento,
                    totalventaneta: totalventaneta,
                    totalimpuesto: totalimpuesto,
                    totalcomprobante: totalcomprobante,
                    totalIVADevuelto: totalIVADevuelto,
                    TotalOtrosCargos: totalOtrosCargos, 
                    codigomoneda: codigo,
                    tipocambio: tipocambio
                }

               return resolve(objResumenFactura);
            } else {
                console.log("cayó 1");
                throw new Error(clavenumerica.toString()+'1R');
            }
        
        } catch(err){
            console.log("err", err);
            //error de resumen de factura
            throw new Error(clavenumerica.toString()+'1R')
        }
    })
}

const insertarLineas = (obj) => {

    return EntradaDetalleController.insertarDetalle(obj);
}

const enviarRecepcion = (jsonRecepcion) => {

    try {
        return FA.enviarRecepcion(jsonRecepcion)
    } catch(err){
        console.log("error de envio de factura ",err);
        throw new Error("send_facture_fail");
    }
}

const enviarCorreoRecepcion = async () => {
    try {

    } catch(err){
        console.log("error de envio de correos ",err);
        throw new Error("send_email_fail");
    }
}

const generarToken = (obj) => {

    try {
        return FA.generarAuthToken(obj)
    } catch(err){
        console.log(" error en token ",err);
        throw new Error("get_token_fail")
    }
}
const generarXmlRecepcion = (obj) => {
    
    try {
        const { objMensaje,detalles,tipo_factura,llave,clave,identrada } = obj
        return FA.crearXML(objMensaje,detalles,tipo_factura,llave,clave,identrada );
    } catch(err){
        console.log(" error en token ",err);
        throw new Error("get_xml_fail")
    }
}

const actualizarCodigoEstadoEntrada = (obj) => {

    try {

       return EntradaController.actualizarCodigoEstadoEntrada(obj)

    } catch(err){
        console.log("error al actualizar el estado de la entrada err",err)
        throw new Error("update_state_facture_fail");
    }
}

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

const guardarXML = (obj) => {

    try {
        return Xml.guardarXML(obj);
    } catch(err){
       console.log("error al guardar la respuesta de hacienda ",err);
       throw new Error('saved_hacienda_response_facture'); 
    }
}

const obtenerEstado = (objEstadoMensaje) => {
    try {
        return FA.obtenerEstado(objEstadoMensaje)
    } catch(err){
        console.log("error al obtener el estado final del mensaje", err);
        throw new Error("get_state_facture_fail");
    }
}

const actualizarEstadoHacienda = (obj) => {

    try {
        return EntradaController.actualizarEstadoHacienda(obj);
    } catch(err){
        console.log("error al actualizar el estado de la factura", err);
        throw new Error("not_updated_facture_state");
    }
}

