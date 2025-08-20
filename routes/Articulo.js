const express = require("express");
const router = express.Router();
const ArticuloController = require("../controllers/ArticuloController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/articulo', middleware, ArticuloController.nuevoArticulo);
    router.post('/buscar-articulo/', middleware, ArticuloController.rutaObtenerArticuloPorQuery);
    router.put('/articulo/:id', middleware, ArticuloController.actualizarArticulo);
    router.get('/unidadesMedida', middleware, ArticuloController.unidadesMedida);
    router.get('/articulos/cargar-lista', middleware, ArticuloController.rutaBuscarArticulo);
    router.get('/articulo/', middleware, ArticuloController.rutaBuscarArticuloPorId);
    router.get('/listar-articulos/', middleware, ArticuloController.rutaObtenerArticulosPorIdEmisor);
    router.put('/articulo/actualizar/estado/', middleware, ArticuloController.rutaActualizarEstado);
    router.post('/articulos/listar/articulos-receta', middleware, ArticuloController.rutaObtenerArticulosReceta);
    router.post('/articulos/movimientos/obtener-articulos', middleware, ArticuloController.rutaObtenerArticulosMovimiento);
    return router;
}