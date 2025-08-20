const express = require("express");
const router = express.Router();
const UsuariosController = require("../controllers/UsuariosController");
const middleware = require("../middleware/Auth");

module.exports = () => {

    router.post('/usuario', middleware, UsuariosController.nuevoUsuario); //, UsuariosController.nuevoUsuario
    router.post('/superusuario/autenticar/', middleware, UsuariosController.loginSuperUsuario);
    router.put('/usuario/:id', middleware,UsuariosController.actualizarUsuario);
    router.get('/usuario/:usuario', middleware, UsuariosController.obtenerUsuario);
    router.get('/permisos', middleware, UsuariosController.obtenerPermisos);
    router.get('/ususarios/', middleware, UsuariosController.obtenerUsuarios);
    router.get('/usuarios-por-emisor/', middleware, UsuariosController.obtenerPermisoPorIdEmisor);
    router.get('/usuarios/obtener-permisos/', middleware, UsuariosController.obtenerPermisosPorUsuario);
    router.get('/accesos/',middleware,UsuariosController.obtenerPermisosNull);
    router.get('/usuario/obtener-usuario-por-cliente/:idcliente',middleware,UsuariosController.obtenerUsuarioPorId);
    router.post('/usuario/sucursal/autenticar/', middleware, UsuariosController.loginSucursal);


    return router;
}   