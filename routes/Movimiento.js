const express = require("express");
const router = express.Router();
const middleware = require("../middleware/Auth");
const MovimientoController = require("../controllers/MovimientoController");

module.exports = () => {
    
    router.post('/movimiento',middleware, MovimientoController.rutaNuevoMovimiento);
    router.get('/tipoMovimiento', middleware, MovimientoController.rutaTipoAjuste);
    router.post('/movimiento/obtener-ajustes', middleware, MovimientoController.rutaObtenerAJustes);
    
    return router;
}