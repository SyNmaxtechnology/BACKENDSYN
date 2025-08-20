const express = require("express");
const router = express.Router();
const middleware = require("../middleware/Auth");
const ExistenciaController = require("../controllers/ExistenciaController");

module.exports = () => {

    router.post('/obtener-existencia',middleware,ExistenciaController.rutaObtenerExistenciaPorArticulo);
    router.post('/obtener-existencia/bodega-categoria/',middleware,ExistenciaController.rutObtenerExistenciaPorBodegayCategoria);
    router.get('/existencia/articulo/:idarticulo',middleware,ExistenciaController.rutaObtenerExistenciaPorIdArticulo);

    return router;
}