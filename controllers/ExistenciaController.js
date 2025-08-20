const Existencia = require("../models/Existencia");
const jwt = require("jsonwebtoken");
const Bodega = require("../models/Bodega");

const rutaObtenerExistenciaPorArticulo = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    const {idbodega, descripcion} = req.body;

    obtenerExistenciaPorArticulo({idbodega, idemisor, descripcion}).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No hay resultados'
            })
        } else {    
            res.status(200).json({
                existencia: response
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

const rutObtenerExistenciaPorBodegayCategoria = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idbodega,idcategoria,articulo} = req.body;

    obtenerExistenciaPorBodega({
        idemisor,
        idcategoria,
        idbodega,
        articulo
    }).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No hay resultados'
            })
        } else {
            res.status(200).json({
                existencia: response
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

const rutaObtenerExistenciaPorIdArticulo = async (req, res) => {

    try {

        const {idarticulo} = req.params;
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;

        const idbodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
        const datosExistencia = await obtenerExistenciaPorIdArticulo({idarticulo, idemisor, idbodega: idbodega[0].idbodega});

        return res.status(200).json({
            existencia: datosExistencia
        })

    } catch(err){
        res.status(500).json({
            message: 'Error al obtener la existencia del artículo'
        })
    }
}

const obtenerExistenciaPorProducto = (obj) => {
    return Existencia.obtenerExistenciaPorDescripcion(obj);
}

const obtenerExistenciaPorBodega = (obj) =>{
    return Existencia.obtenerExistenciaPorBodegaYCategoria(obj);
}

const restarExistencia = (obj) => {
    return Existencia.restarExistencia(obj)
}


const sumarExistencia = (obj) => {
    return Existencia.actualizarStock(obj);
}

const obtenerExistenciaPorArticulo = (obj) => {
    return Existencia.obtenerExistenciaPorArticulo(obj);
}

const obtenerExistenciaPorIdArticulo = (obj) => {

    return Existencia.obtenerExistencia(obj)
}

module.exports = {
    restarExistencia,
    sumarExistencia,
    obtenerExistenciaPorArticulo,
    rutaObtenerExistenciaPorArticulo,
    rutObtenerExistenciaPorBodegayCategoria,
    obtenerExistenciaPorProducto,
    obtenerExistenciaPorIdArticulo,
    rutaObtenerExistenciaPorIdArticulo
}