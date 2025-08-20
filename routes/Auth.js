const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

module.exports = () => {//1

    router.post('/login', AuthController.autenticarUsuario);
    
    return router;
}
