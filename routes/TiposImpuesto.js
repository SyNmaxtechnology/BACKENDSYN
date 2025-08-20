const express = require('express');
const router = express.Router();
const tiposImpuestoController = require('../controllers/TipoImpuestoController');
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/tipoImpuesto', middleware, tiposImpuestoController.nuevoImpuesto);
    router.put('/tipoImpuesto/:id', middleware, tiposImpuestoController.actualizarImpuesto);
    router.put('/actualizar-impuesto/estado/', middleware, tiposImpuestoController.actualizarEstado);
    router.get('/tipoImpuesto/:query', middleware, tiposImpuestoController.obtenerImpuesto);
    router.get('/impuestos', middleware, tiposImpuestoController.obtenerImpuestos);
    router.get('/listar-impuestos', middleware, tiposImpuestoController.listarImpuestos);
    router.get('/obtener/impuesto/:id', middleware, tiposImpuestoController.obtenerImpuestoPorId);
    router.get('/obtener-impuesto/query/:query',middleware,tiposImpuestoController.obtenerImpuestoPorQuery);
    return router;

}