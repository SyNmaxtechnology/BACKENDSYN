const express = require("express");
const router = express.Router();
const middleware = require("../middleware/Auth");
const viistasController = require("../controllers/VisitaController");
const VisitaController = require("../controllers/VisitaController");

module.exports = () => {

    router.post('/visita', middleware, VisitaController.agregarVisita);
    router.get('/visita/habilitar-movimiento', middleware, VisitaController.habilitarTipoMovimientoVisita);
    router.post('/obtener-visitas',middleware,VisitaController.obtenerVisitas);
    router.get('/visita/obtener-clientes/', middleware, viistasController.obtenerClientesVisita);
    router.get('/visita/obtener-usuarios/', middleware, viistasController.obtenerUsuariosVisitas);
    router.get('/visita/obtener-clientes-emisor/', middleware, viistasController.obtenerClientesPorIdEmisor);
    router.post('/visitas/reporte/razones-no-venta',middleware,VisitaController.obtenerReporteRazonesNoCompra);

    return router;
}