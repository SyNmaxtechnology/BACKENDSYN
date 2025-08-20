const { Router } = require("express");
const middleware = require('../middleware/Auth');
const router = Router();
const { agregarRazon,
        actualizarRazon,
        obtenerRazonesPorEmisor,
        obtenerRazonPorId,
        eliminarRazon
} = require("../controllers/RazonNoVentaController");


module.exports = () => {

    router.post('/razon',middleware,agregarRazon);
    router.put('/actualizar-razon',middleware,actualizarRazon);
    router.get('/listar-razones/',middleware,obtenerRazonesPorEmisor);
    router.get('/razon/:id',middleware,obtenerRazonPorId);
    router.delete('/razon/:id',middleware,eliminarRazon);

    return router;
}
