const express = require("express");
const router = express.Router();
const facturaController = require("../controllers/FacturaController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.post('/factura', middleware, facturaController.nuevaFactura);
    router.get('/tipoCambio', middleware, facturaController.tipoCambio);
    router.get('/tipoCedula', middleware, facturaController.tipoCedula);
    router.get('/monedas', middleware, facturaController.obtenerMonedas);
    router.get('/tipoDocumento', middleware, facturaController.TipoDocumento);
    router.get('/tipoDocumentoExoneracion', facturaController.tipoDocumentoExoneracion);
    router.get('/condicionVenta', middleware, facturaController.CondicionVenta);
    router.get('/medioPago', middleware, facturaController.MedioPago);
    router.get('/condicionImpuesto',  middleware, facturaController.condicionImpuesto);
    router.get('/estadoAceptacion',  middleware, facturaController.estadoAceptacion);
    router.post('/consecutivo', facturaController.obtenerConsecutivo);
    router.post('/consecutivo-actualizar', facturaController.actualizarConsecutivo);
    router.post('/facturas/buscar/', middleware, facturaController.buscarComprobantes);
    router.get('/reportes/facturas/', middleware, facturaController.reporteFactura);
    router.get('/reportes/factura/pdf/', facturaController.reportePDF);
    router.get('/factura/:idfactura', middleware, facturaController.obtenerFactura);
    router.post('/guardar-factura',middleware, facturaController.guardarFactura);
    router.get('/notacredito-anular/:id&:tipo_factura', middleware, facturaController.anularFactura);
    router.get('/factura/correo/:id&:tipo_factura', middleware, facturaController.obtenerCorreoCliente);  
    router.post('/factura/comprobantes/aceptados/', middleware, facturaController.obtenerFacturasOTiquetesAceptados);
    router.post('/factura/productos/total/aceptados/', middleware, facturaController.obtenerFacturasOTiquetesPorProducto);
    router.post('/factura/clientes/total/aceptados/', middleware, facturaController.obtenerFacturasPorCliente);
    router.post('/factura/clientes/total/medio-Pago/', middleware, facturaController.obtenerFacturasPorMedioPago);
    router.post('/factura/obtener-proforma/id/', middleware, facturaController.obtenerProforma);
    router.post('/factura/comprobantes/total/detallados/', middleware, facturaController.reporteFacturaDetallado);
    router.get('/factura/proforma/descargar-reporte/pos/:idfactura', middleware, facturaController.descargarReporteProforma);   
    router.post('/factura/reporte-iva/totales-por-linea/', middleware, facturaController.obtenerTotalesFacturasAgrupadosPorTipoImpuestoPorLinea);
    router.delete('/eliminar-facturas', middleware, facturaController.eliminarFacturas);
    router.post('/factura/linea-temporal/agregar-linea',middleware,facturaController.agregarLineasTemporales);
    router.get('/facturas/listar/obtener-lineas-temporales/',middleware,facturaController.cargarLineasTemporales);
    router.delete('/eliminar-lineas/:id',middleware,facturaController.eliminarLineasTemporalPorId);
    router.delete('/factura/eliminar-lineas',middleware,facturaController.eliminarLineasTemporales);
    router.get('/factura/descargar/reporte-pdf/:id', middleware, facturaController.descargarReporteFacturaPDF);
    router.post('/factura/procesar-comprobante-electronico/hacienda/', middleware, facturaController.procesarComprobanteElectronico);
    
    return router;
}