const { Router } = require("express");
const CuentasController = require("../controllers/CuentasController");
const middleware = require("../middleware/Auth");
const router = Router();


module.exports = () => {

    router.post('/cuenta', middleware, CuentasController.agregarCuenta);
    router.get('/cuenta/:id', middleware, CuentasController.buscarCuenta);
    router.put('/actualizar-cuenta', middleware, CuentasController.actualizarCuenta);
    router.put('/estado-cuenta', middleware, CuentasController.actualizarEstadoCuenta);
    router.get("/listar-cuentas",middleware, CuentasController.listarCuentas);
    router.get("/cuentas-movimientos",middleware, CuentasController.listarCuentasMovimientos);
    
    return router;
}