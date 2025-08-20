const CodigoCabys = require("../models/CodigoCabys");
const jwt = require("jsonwebtoken");

const agregarCodigoCabys = (req,res) => {//com
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {codigo,descripcion} = req.body;

    CodigoCabys.agregarCodigo({idemisor,codigo,descripcion}).then(response => {
        const {affectedRows} = response;

        if(affectedRows > 0){
            res.status(201).json({
                message: 'Código Cabys agregado'
            })
        } else {
            res.status(400).json({
                message: 'NO se pudo agregar el código'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar el código'
        })
    })
}

const actualizarCodigoCabys = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {codigo,id,descripcion} = req.body;

    CodigoCabys.editarCodigoCabys({idemisor,id,codigo,descripcion}).then(response => {
        
        const {affectedRows} = response;
        if(affectedRows > 0){
            res.status(201).json({
                message: 'Código Cabys actualizado'
            })
        } else {
            res.status(400).json({
                message: 'NO se pudo actualizar el código'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al actualizar el código'
        })
    })
}

const obtenerCodigoPorId = (req,res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.params;

    CodigoCabys.obtenerCodigosPorId({id,idemisor}).then(response => {
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener el código'
        })
    })
}


const obtenerCodigoPorQuery = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {codigo} = req.params;

    CodigoCabys.obtenerCodigosPorQuery({ idemisor,codigo}).then(response => {
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener el código'
        })
    })
}

const obtenerCodigosPorEmisor = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    CodigoCabys.obtenerCodigosPorEmisor(idemisor).then(response => {
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar los códigos'
        })
    })
}


const obtenerCodigosParaCategorias = (idemisor) => {
    return  CodigoCabys.obtenerCodigosParaCategorias(idemisor); // -> esto devuelve una promesa 
}

const servicioWebBusquedaCodigoCabysPorDescripcion = (req, res) => {

    const {descripcion} = req.params;


    CodigoCabys.servicioWebBusquedaCodigoCabysPorDescripcion(descripcion).then(response => {
        const {data} = response;
        return res.status(200).json(data.cabys);
    })
    .catch(err => {
       console.log("error en la busqueda de codigos cabys ", err);

       res.status(500).json({
           message: 'Se ha generado un error en el servicio de búsqueda para códigos cabys del ministerio de hacienda'
       })
    })
        
}

module.exports = {
    agregarCodigoCabys,
    actualizarCodigoCabys,
    obtenerCodigoPorId,
    obtenerCodigoPorQuery,
    obtenerCodigosPorEmisor,
    obtenerCodigosParaCategorias,
    servicioWebBusquedaCodigoCabysPorDescripcion
}
