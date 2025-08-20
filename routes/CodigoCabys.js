const router = require("express").Router();
const codigosCabysController = require("../controllers/CodigoCabysController");
const middleware = require("../middleware/Auth");

module.exports = () => { //com

    router.post('/codigoCabys',middleware,codigosCabysController.agregarCodigoCabys);
    router.put('/codigoCabys',middleware,codigosCabysController.actualizarCodigoCabys);
    router.get('/codigoCabys-id/:id',middleware,codigosCabysController.obtenerCodigoPorId);
    router.get('/codigoCabys-codigo/:codigo',middleware,codigosCabysController.obtenerCodigoPorQuery);
    router.get('/codigosCabys-codigos/listar',middleware,codigosCabysController.obtenerCodigosPorEmisor);
    router.get('/codigosCabys-servicio-web-hacienda/:descripcion', middleware,codigosCabysController.servicioWebBusquedaCodigoCabysPorDescripcion);
    
    return router;
}
