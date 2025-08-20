const express = require("express");
const router = express.Router();
const EntradaController = require("../controllers/EntradaController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.get('/visualizar-compra/:id',middleware,EntradaController.visualizarEntrada);
    router.get('/descargar-compra/',EntradaController.descargarEntrada);
    return router;
}