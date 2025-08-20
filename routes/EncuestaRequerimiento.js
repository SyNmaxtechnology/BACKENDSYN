const { Router } = require("express");
const middleware = require("../middleware/Auth");
const EncuestaRequerimientoController = require('../controllers/EncuestaRequerimientoController');
const router = Router();

module.exports = () => {

    router.post('/pregunta-requerimiento',middleware,EncuestaRequerimientoController.agregarPregunta);
    router.put('/actualizar-pregunta-requerimiento',middleware,EncuestaRequerimientoController.actualizarPregunta);
    router.get('/pregunta-requerimiento/:id',middleware,EncuestaRequerimientoController.obtenerPreguntasPorId);
    router.get('/listar-preguntas-requerimiento',middleware,EncuestaRequerimientoController.obtenerPreguntasPorEmisor);
    router.get('/encuesta-requerimiento/preguntas-resultado',middleware,EncuestaRequerimientoController.obtenerPreguntasParaEncuesta); //para resultado de encuesta requerimiento
    router.delete('/encuesta-requerimiento/:id',middleware,EncuestaRequerimientoController.eliminarLinea); 

    return router;
}