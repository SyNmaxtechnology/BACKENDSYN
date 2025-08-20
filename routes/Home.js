const HomeController = require("../controllers/HomeController");
const router = require('express').Router();

module.exports = () =>{

    router.get('/home',HomeController.home);

    return router;
}