const { Router } = require("express");
const router = Router();
const { agregarFactura,obtenerEstadoFactura,login } = require("../controllers/apiFactura");
const { validarAcesso,validarFactura } = require("../middleware/validador");
//ssdfsdfsdf33
module.exports = () => {

    router.post('/api/agregar-factura',validarAcesso,validarFactura,agregarFactura);
    router.post('/api/factura/estado',validarAcesso,obtenerEstadoFactura);
    router.post('/api/login',login);

    return router;
}//1
