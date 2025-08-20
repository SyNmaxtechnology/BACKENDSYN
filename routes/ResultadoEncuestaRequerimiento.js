const { Router } = require("express");
const router = Router();
const ResultadoEncuestaRequerimientoController = require("../controllers/ResultadoEncuestaRequerimientoController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/agregar-resultado-requerimiento',middleware,ResultadoEncuestaRequerimientoController.agregarRespuesta);
    router.post('/reporte-encuesta-requerimiento',middleware,ResultadoEncuestaRequerimientoController.obtenerDatosReporteRequerimientos);
    //comnesdada
    return router;
}