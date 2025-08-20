const BodegaController = require("../controllers/BodegaController");
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/Auth");

module.exports = () => {//com

    router.post('/bodega', middleware, BodegaController.rutaNuevaBodega);
    router.get('/bodegas-listar/', middleware, BodegaController.rutaObtenerBodegas);
    
    return router;
}
