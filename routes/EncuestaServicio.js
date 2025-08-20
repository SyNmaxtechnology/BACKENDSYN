const { Router } = require("express");
const middleware = require("../middleware/Auth");
const EncuestaServicioController = require('../controllers/EncuestaServicioController');
const router = Router();


module.exports = () => {

    router.post('/pregunta',middleware,EncuestaServicioController.agregarPregunta);
    router.put('/actualizar-pregunta',middleware,EncuestaServicioController.actualizarPregunta);
    router.get('/pregunta/:id',middleware,EncuestaServicioController.obtenerPreguntasPorId);
    router.get('/listar-preguntas',middleware,EncuestaServicioController.obtenerPreguntasPorEmisor);
    router.get('/encuesta-servicio-calificaciones',middleware,EncuestaServicioController.Calificaciones);
    router.get('/encuesta-servicio-calificaciones',middleware,EncuestaServicioController.Calificaciones);
    router.get('/encuesta-servicio/preguntas-resultado',middleware,EncuestaServicioController.obtenerPreguntasParaEncuesta);
    router.delete('/encuesta-servicio/:id',middleware,EncuestaServicioController.eliminarPregunta);

    return router;
}