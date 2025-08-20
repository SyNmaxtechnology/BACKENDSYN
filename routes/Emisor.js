const express = require('express');
const router = express.Router();
const emisorController = require("../controllers/EmisorController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post("/emisor", middleware, emisorController.subirFileP12, emisorController.guardarEmisor);
    router.get("/emisor/:query", middleware, emisorController.obtenerEmisor);
    router.put("/emisor/:id", middleware, emisorController.subirFileP12Actualizar, emisorController.actualizarEmisor);
    router.get("/cargar-emisor", middleware, emisorController.cargarEmisor);
    router.get('/lista-emisores', middleware, emisorController.obtenerEmisores);
    router.get('/emisores/listado-emisores/', middleware, emisorController.listarEmisores);
    router.post('/emisor/actualizar-estado', middleware, emisorController.actualizarEstado);
    router.get('/emisor/obtener/cerca-perimetral', middleware, emisorController.obtenerCercaPerimetral);
    router.get('/emisor/validar/archivo-p12', middleware, emisorController.validarExpiracionArchivoP12);
    router.get('/emisor/default/cargar-datos-default', middleware, emisorController.cargarDatosGlobales);
    router.get('/emisor/sucursales/listar-sucursales/', middleware, emisorController.obtenerSurcursalesPorId);
    router.get('/emisor/validacion-token/mostrar-mensaje-error', middleware, emisorController.validarDatosDeGeneracionDeToken);
    router.get('/emisor/bodegas/listar-bodegas', middleware, emisorController.obtenerBodegas);
    router.get('/emisor/actualizar-prioridad-envio-comprobantes/:prioridad', middleware, emisorController.actualizarPrioridad);

    return router;
}