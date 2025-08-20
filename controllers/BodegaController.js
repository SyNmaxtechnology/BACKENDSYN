const Bodega = require("../models/Bodega");
const jwt = require("jsonwebtoken");

const nuevaBodega = (obj) => { //comentario1
    return Bodega.nuevaBodega(obj) 
}

const obtenerBodegas = (obj) => {
   return Bodega.obtenerBodegasPorEmisor(obj);
}

const rutaObtenerBodegas = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    obtenerBodegas({idemisor}).then(response => {
        res.status(200).json({
            bodegas: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}

const rutaNuevaBodega = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {Principal, descripcion} = req.body;

    nuevaBodega({
        idemisor,
        descripcion,
        Principal
    }).then(response => {
        const {affectedRows} = response;

        if(affectedRows > 0){
            res.status(200).json({
                message: 'La bodega se ha guardado'
            }) 
        } else  {
            res.status(400).json({
                message: 'No se ha guardado la bodega'
            }) 
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}

const obtenerBodegaPrincipal = idemisor => Bodega.obtenerIdBodegaPrincipal(idemisor);
// ,asdkasjdhajsdsajdksajdajksdjkasdkjsda

const obtenerBodegaPorIdUsuario = idusuario=> Bodega.obtenerBodegaPorIdUsuario(idusuario);

module.exports = {
    nuevaBodega,
    rutaNuevaBodega,
    obtenerBodegas,
    rutaObtenerBodegas,
    obtenerBodegaPrincipal,
    obtenerBodegaPorIdUsuario
}
