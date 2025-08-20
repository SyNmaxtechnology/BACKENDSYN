const { Router } = require("express");
const { agregarMovimiento,listarTiposTransaccion,
        obtenerInformacionDepositos,
        obtenerInformacionTransferencias,
        obtenerInformacionMovimientosPorCuenta 
    } = require("../controllers/MovimientosBancosController");

const middleware = require("../middleware/Auth");
const router = Router();

module.exports = () => {

    router.post('/agregar-movimiento',middleware,agregarMovimiento);
    router.get('/tipo-transaccion',middleware,listarTiposTransaccion);
    router.post('/reporte-despositos',middleware,obtenerInformacionDepositos);
    router.post('/reporte-transferencias',middleware,obtenerInformacionTransferencias);
    router.post('/reporte-movimientos-cuenta',middleware,obtenerInformacionMovimientosPorCuenta);

    return router;
}
