const { Router }  = require("express");
const middleware = require("../middleware/Auth");
const MovimientoCxpController = require("../controllers/MovimientoCxpController");
const router = Router();

module.exports = () => {

    router.post('/ajuste-entrada-credito',middleware,MovimientoCxpController.actualizarTotalesFacturasCredito);
    router.post('/movcxp/reporte-canceladas/',middleware,MovimientoCxpController.reporteFacturasCreditoCanceladas);
    router.get('/proveedores-credito',middleware,MovimientoCxpController.listarProveedoresFacturasCredito);
    router.get('/recibos-no-cancelados/:idproveedor',middleware,MovimientoCxpController.listarFacturasCreditoNoCanceladas);

    return router;
}