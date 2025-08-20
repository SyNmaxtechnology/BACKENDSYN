const express = require('express');
const router = express.Router();
const clienteController = require("../controllers/ClienteController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/cliente', middleware, clienteController.nuevoClienteRuta);
    router.put('/actualizar-cliente/:id', middleware, clienteController.actualizarCliente);
    router.put('/cliente/facturas-credito/pagar/', middleware, clienteController.actualizarPagosFacturasCredito);
    router.get("/cliente/listado-clientes/actualizar", middleware, clienteController.obtenerClientes);
    router.get('/clientes', middleware, clienteController.obtenerClientePorIdEmisor);
    router.post('/cliente/estado/', middleware, clienteController.actualizarEstado);
    router.get('/cliente-id/:id', middleware, clienteController.obtenerClientePorId);
    router.get('/cliente/obtener/:query', middleware, clienteController.obtenerClientePorCoincidencia);
    router.get('/cliente/facturas-credito/listar/:idcliente', middleware, clienteController.obtenerFacturasCredito);
    router.get('/cliente/facturas-credito/obtener-clientes/', middleware, clienteController.cargarClientesFacturaCredito);
    router.post('/cliente/facturas-credito/canceladas', middleware, clienteController.obtenerFacturasCreditoPagadas);
    router.get('/cliente/estado-autorizado/:idcliente/proforma/', middleware, clienteController.obtenerEstadoAutorizado);
    router.post('/cliente/autorizar-cliente-proforma/', middleware, clienteController.autorizarClienteProforma);
    router.get('/cliente/inhabilitar-proforma/:idcliente/autorizado', middleware, clienteController.rutainnhabilitarEstadoAutorizado);
    router.get('/clientes/listado-clientes/facturar', middleware, clienteController.cargarClientesFacturar);
    router.get('/clientes/pos/', middleware, clienteController.obtenerClientePos);
    router.get('/cliente/visita/ubicacion/:idcliente', middleware, clienteController.obtenerUbicacionCliente);
    router.patch('/cliente/ubicacion/actualizar', middleware, clienteController.actualizarUbicacion);
    router.get('/cliente/listas/zonas', middleware, clienteController.cargarZonas);
    router.get('/cliente/estado-cuenta/envio-correo/:idcliente/:correo', middleware, clienteController.enviarEstadoCuentaPorCorreo);
    router.get('/cliente/pos/:query/vender', middleware, clienteController.obtenerClientePorQuery)

    return router;
}