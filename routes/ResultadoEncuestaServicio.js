const { Router } = require("express");
const router = Router();
const { agregarResultado,
        obtenerDatosReporteResultadosEncuestaServicio 
    } = require("../controllers/ResultadoEncuestaServicioController");
const middleware = require('../middleware/Auth');

module.exports = () => {

    router.post('/resultado',middleware,agregarResultado);
    router.post('/reporte-encuesta-servicio',middleware,obtenerDatosReporteResultadosEncuestaServicio);

    return router;
}