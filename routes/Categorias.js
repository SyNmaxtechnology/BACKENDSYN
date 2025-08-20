const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriasController');
const middleware = require("../middleware/Auth");

module.exports = () => {//comen

    router.get('/categoria/:query', middleware, CategoriaController.obtenerCategoria);
    router.post('/categoria', middleware, CategoriaController.nuevaCategoria); //CAMBIO SYN
    //router.put('/categoria', middleware, CategoriaController.nuevaCategoria);
    router.post('/obtener-categoria', middleware, CategoriaController.obtenerCategoriaPorId);
    router.put('/categoria/:id', middleware, CategoriaController.actualizarCategoria);
    router.put('/actualizar/estado/', middleware, CategoriaController.actualizarEstado);
    router.get('/categorias', middleware, CategoriaController.obtenerCategorias);
    router.get('/categorias/listar/pos', middleware, CategoriaController.listarCategorias);
    router.get('/categorias/codigos-cabys/listar', middleware, CategoriaController.obtenerCodigos);

    return router;
}
