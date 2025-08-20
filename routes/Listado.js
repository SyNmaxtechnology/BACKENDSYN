const express = require("express");
const listadoFacturasController = require("../controllers/ListadoController");
const router = express.Router();

module.exports = () => {
    router.get('/comprobantes/:comprobantes', listadoFacturasController.cargarVistaComprobantes);

    return router;
}