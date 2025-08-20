const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductosController');
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.get('/producto/', middleware, ProductoController.obtenerProducto);
    router.get('/productos/listar/pos/', middleware, ProductoController.obtenerProductosPos);
    router.put('/producto/:id', middleware,ProductoController.subirImagen, ProductoController.actualizarProducto);
    router.post('/producto', middleware,ProductoController.subirImagen, ProductoController.nuevoProducto);
    router.get('/unidades', middleware, ProductoController.UnidadesMedida);
    router.post('/producto/:idproducto', middleware, ProductoController.obtenerProductoPorId);
    router.get('/productos/listar/', middleware, ProductoController.obtenerProductosPorIdEmisor);
    router.post('/producto-estado/', middleware, ProductoController.modificarEstado);
    router.get('/productos/listar/categoria/:idcategoria', middleware, ProductoController.obtenerProductosPorCategoria);
    router.post('/productos/listar/productos-receta/', middleware, ProductoController.obtenerProductosReceta);
    router.get('/productos/buscar/productos-existencia/:idproducto/:idbodega', middleware, ProductoController.obtenerExistenciaProducto);
    router.get('/productos/obtener/listados-por-bodega/:idbodega/:existencia', middleware, ProductoController.obtenerProductosPorIdBodegaAsociados);
    
    return router;
}