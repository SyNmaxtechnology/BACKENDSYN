const express = require('express');
const router = express.Router();
const descuentoController = require('../controllers/DescuentosController');
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.post('/descuento', middleware, descuentoController.nuevoDescuento);
    router.post('/obtener-descuento/',middleware, descuentoController.obtenerDescuentoPorId);
    router.put('/descuento/:id', middleware, descuentoController.actualizarDescuento);
    router.get('/descuento/:query', middleware, descuentoController.obtenerDescuento);
    router.get('/descuentos', middleware, descuentoController.obtenerDescuentos);
    router.put('/actualizar-estado/',middleware,descuentoController.actualizarEstado);
    router.get('/obtener-descuentos/pos/',middleware, descuentoController.obtenerDescuentosPos);
    return router;

}