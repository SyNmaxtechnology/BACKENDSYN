const AccesosController = require("../controllers/AccesosController");
const router = require("express").Router();
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/acceso', middleware,AccesosController.agregarAcceso);    
    router.get('/acceso/:usuario', middleware,AccesosController.obtenerAccesos);
    router.get('/acceso/obtener-por-id/:id', middleware,AccesosController.obtenerAccesoPorId);
    router.put('/acceso/', middleware,AccesosController.actualizarAcceso);
    router.put('/acceso/estado/', middleware,AccesosController.actualizarEstadoAcceso);
    
    return router;
}