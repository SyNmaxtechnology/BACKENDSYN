const jwt = require("jsonwebtoken");
const Factura = require("../models/Factura");
const facturaDetalle = require("../models/FacturaDetalle");
const FuncionesFactura = require("../functions/Factura");
const Emisor = require("../models/Emisor");
const consulta = require("../functions/consulta");
const ExistenciaController = require("./ExistenciaController");
const RecetaController = require("./RecetaController");
const Bodega = require("../models/Bodega");
const fecha = require("../db/fecha");
const UnidadesMedidaServicios = ['Al', 'Alc', 'Cm', 'I', 'Os', 'Sp', 'Spe', 'St', 'd', 'h', 's'];

const nuevaVenta = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const fecha_factura = fecha();

        let { factura, ordenes, objOrdenes } = req.body;
        let { idcliente, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas } = factura;

        const respuesta = await Factura.nuevaFactura({ idusuario,idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura,otrosCargos,notas });            

        const { insertId, affectedRows } = respuesta;
        
        if(affectedRows > 0){

            let idfactura = insertId;
            const situacionComprobante = '00000000000000000000000000000000000000000000000000';
            const dataConsecutivos = await FuncionesFactura.generacion_clave_numerica(situacionComprobante, tipo_factura, idfactura, idemisor)
            let i = 0;
            const { llave, clave } = dataConsecutivos;
            const objClave = {
                clave: dataConsecutivos.claveNumerica,
                consecutivo: dataConsecutivos.nuevoConsecutivo,
                id: idfactura,
                numeroInterno: dataConsecutivos.numeroInterno
            }

            const dataConsecutivosActualizado = Factura.guardarClaveNumerica(objClave)
            const {affectedRows} = dataConsecutivosActualizado;
            if(affectedRows > 0){
                for(const orden of ordenes){
                    o++;
                    orden.idfactura = idfactura;
                    orden.numerodocumento = o;
                    orden.tipo_factura = tipo_factura;

                   await facturaDetalle.insertarDetalle(orden);

                   //restar existencia
                    //cantidad ,idarticulo ,idemisor ,idproducto
                   ExistenciaController.restarExistencia({ }).then(response => {
                       console.log("exixtencia ", response);
                   })
                   .catch(err => {
                       console.log("No se pudo restar la existencia : ",err);
                   })

                }

                //rebajar el stock

                // llamar la informacion de la factura generada


                const tipoFactura = await Emisor.obtenerTipoReporte(idemisor);
                

                //genera el reporte
                if(tipoFactura[0].pos == 1){

                } else {

                }

                //devulve la respuesta



                // el flujo sigue enviando la factura a hacienda


            } else {
                console.log("No se pudo actualizar los consecutivos")
                res.status(400).json({
                    message: 'No se pudo generar la venta'
                })
            }

        }else {
            console.log("No se pudo guardar la venta")
            res.status(400).json({
                message: 'No se pudo generar la venta'
            })
        }

    } catch(err) {

    }

}


const generarReporte = async (req,res) => {

    try {
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const response = await Emisor.obtenerTipoReporte(idemisor);
        const dataFactura = await Factura.obtenerUltimoIdInsertado(idemisor);
        let ruta = __dirname+ '/../pdf/';
        let host = '';
        let nombrePdf = Date.now();
        if(response[0]){
             // reporte tipo pos
            //Factura.encabezadoReporteFactura(obj)

            if(response[0].pos == 1){ // reporte tipo pos
                //idemisor,idfactura
                const factura = await Factura.obtenerDatosEncabezadoReportePos({idfactura: dataFactura[0].id, idemisor});
                const lineas = await facturaDetalle.obtenerOrdenesReportePos( dataFactura[0].id);
                console.log({factura})
                const reportePOS = await consulta.crearReportePos(factura[0],lineas);
                let  altura = (lineas.length) * 5;
                if(factura[0].notas_emisor && factura[0].notas_emisor.length > 0) {
                    altura+= 20;
                }
                ruta += factura[0].clavenumerica + '.pdf';
                console.log("reporte POS",reportePOS);
                await consulta.generarPDFDeComprobantePOS(reportePOS,ruta,altura);
               

                if(req.headers.host == 'localhost:5000') {
                    host = 'http://'+req.headers.host+'/'+factura[0].clavenumerica + '.pdf'
                } else {
                    host = 'https://'+req.headers.host+'/'+factura[0].clavenumerica + '.pdf'
                }
                //res.download(ruta); 
                console.log({host});
                return res.status(201).json({ path: host})
                
            } else { //reporte tipo factura sdkjsdsakjdjaksda
                
                console.log("factura ")
                const factura = await Factura.encabezadoReporteFactura({id: dataFactura[0].id, tipo: dataFactura[0].tipo_factura, idemisor});
                const lineas = await facturaDetalle.obtenerOrdenesPorFactura({ idfactura: dataFactura[0].id, tipo: dataFactura[0].tipo_factura,idemisor });
                
                ruta += factura[0].clavenumerica + '.pdf';

                if(factura[0].tipo_factura == '04') factura[0].tipo_factura = 'Tiquete Electrónico';
                else if(factura[0].tipo_factura == '01') factura[0].tipo_factura = 'Factura Electrónica';

                let reporteFactura = '';
                if(factura[0].datosCliente){
                    reporteFactura = await consulta.crearReporteConReceptor(lineas,factura[0])
                } else {
                    reporteFactura = await consulta.crearReporteSinReceptor(lineas,factura[0]);
                }

                console.log("reporte", reporteFactura);
                const  altura = (lineas.length) * 5;

                if(factura[0].notas_emisor && factura[0].notas_emisor.length > 0) {
                    altura+= 20;
                }
                await consulta.generarPDFDeComprobante(reporteFactura,ruta,altura);
                if(req.headers.host == 'localhost:5000') {
                    host = 'http://'+req.headers.host+'/'+factura[0].clavenumerica + '.pdf'
                } else {
                    host = 'https://'+req.headers.host+'/'+factura[0].clavenumerica + '.pdf'
                }

                //res.download(ruta); 
               return res.status(201).json({path: host})
            }   
        } else {
            return res.status(400).json({
                message: 'No se pudo obtener la información de la venta generada'
            })
        }

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    }
}

module.exports = {
    nuevaVenta ,
    generarReporte
}