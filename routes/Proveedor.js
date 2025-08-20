const express = require("express");
const router = express.Router();
const ProveedorController = require("../controllers/ProveedorController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.post('/proveedor', middleware, ProveedorController.rutaInsertarProveedor);
    router.get('/consultar-actividad/:cedula', middleware, ProveedorController.rutaBuscarActividad);
    router.get('/buscar-proveedor/:query', middleware, ProveedorController.buscarProveedorPorCedulaONombre);
    router.get('/proveedores/', middleware, ProveedorController.obtenerProveedoresPorIdEmisor);
    router.get('/proveedor/:id', ProveedorController.obtenerProveedoresPorId);
    router.post('/proveedor/actualizar/estado/',middleware, ProveedorController.actualizarEstado)
    router.post('/buscar-proveedor/', middleware, ProveedorController.rutaBuscarProveedorPorQuery);
    router.put('/proveedor/:id', middleware, ProveedorController.rutaActualizarProveedor);
    router.get('/proveedores/obtener/:query', middleware, ProveedorController.obtenerProveedorPorCoincidencia);
    router.post('/proveedores/obtener-listado/facturar', middleware,ProveedorController.obtenerProveedoresFacturar);
    

    return router;
}