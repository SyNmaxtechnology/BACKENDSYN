const express = require("express");
const router = express.Router();
const EntradaController = require("../controllers/EntradaController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/buscar-entradas', middleware, EntradaController.buscarEntradas);
    router.post('/entradas/', middleware, EntradaController.obtenerEntradasAceptadas);
    router.post('/entradas-por-articulo/', middleware, EntradaController.obtenerEntradasPorArticulo);
    router.post('/entradas-por-proveedor/', middleware, EntradaController.obtenerEntradasPorProveedor);
    router.get('/tipoCedula', middleware, EntradaController.tipoCedulas);
    router.post('/entrada', middleware, EntradaController.rutaNuevaEntrada);
    router.get('/descargar-acuse/',EntradaController.descargarAcuseEntrada);
    router.post('/entradas/resumen-iva/obtener-listado/', middleware,EntradaController.obtenerTotalesEntradasAgrupadosPorTipoImpuestoPorLinea);
    router.get('/entrada/obtener-entrada-actualizar/:idfactura', middleware,EntradaController.obtenerEntrada);
    router.post('/entrada/reemplazar-entrada', middleware,EntradaController.entradaReemplazo);
    router.get('/entrada/anular-entrada/:identrada', middleware,EntradaController.entradaAnulacion);
    
    return router;
}