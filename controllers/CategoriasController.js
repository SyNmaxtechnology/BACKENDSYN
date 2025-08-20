const Categoria = require('../models/Categoria');
const CodigosCabysController = require("./CodigoCabysController");
const jwt = require("jsonwebtoken");

exports.nuevaCategoria = async(req, res) => {

    
    const { descripcion, codigo,  codigocabys,descripcioncodigo  } = req.body;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    const obj = {
        descripcion,
        codigo,
        idemisor,
        codigocabys,
        descripcioncodigo 
    }

    try {
        //const respuesta = await Categoria.nuevaCategoria(obj);
        const respuesta = await Categoria.nuevaCategoria(obj);
        const { affectedRows } = respuesta;
        if (affectedRows > 0) {
            return res.status(200).json({
            message: 'Categoría registrada correctamente'})
    }

    } catch (error) {
        console.log(error);
        const { errno } = error;
        if (errno == 1048) return res.status(500).json({
            message: 'El campo descripción es requerido'
        });

        if (errno == '1062') return res.status(500).json({
            message: 'La categoría ya está registrada, digite otra'
        })
    }
}


exports.actualizarCategoria = async(req, res) => {

    const { id } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    const { descripcion, codigo, codigocabys,descripcioncodigo } = req.body;

    try {
        const obj = {
            id,
            descripcion,
            codigo,
            idemisor,
            codigocabys,
            descripcioncodigo 
        }

        const respuesta = await Categoria.actualizarCategoria(obj);
        const { affectedRows } = respuesta;

        if (affectedRows > 0) return res.status(200).json({
            message: 'Categoría actualizada'
        })

    } catch (error) {

        const { errno } = error;
        if (errno == 1048) return res.status(500).json({
            message: 'La descripción es requerida'
        })

        if (errno == '1062') return res.status(500).json({
            message: 'La categoría ya está registrada, digite otra'
        })
    }
}

exports.obtenerCategoria = async(req, res) => {
    
    const { query } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const obj = {
        query,
        idemisor,
        idusuario
    }
    const respuesta = await Categoria.obtenerCategoria(obj);
    if (!respuesta.length) {
        return res.status(404).json({message: 'No hay resultados'});
    } else {
        res.status(200).json(respuesta);
    }

    
}

exports.obtenerCategorias = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;

    Categoria.obtenerCategorias({idemisor,idusuario})
        .then(response => {
            if (response[0]) {
                res.status(200).json({
                    categorias: response
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudo obtener las categorias'
            })
        })
}

exports.obtenerCategoriaPorId = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idcategoria} = req.body;

    Categoria.obtenerCategoriaPorId({
        idcategoria,idemisor
    }).then(response => {
        if(response.length === 0){
            res.status(400).json({
                message: 'No se pudo obtener la categoría'
            })
        } else {
            res.status(200).json({
                categoria: response
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    })
}

exports.actualizarEstado = (req,res) => {   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idcategoria, estado} = req.body;

    Categoria.actualizarEstado({
        idcategoria,idemisor, estado
    }).then(response => {
        const {affectedRows} = response;
        if(affectedRows > 0){
            res.status(200).json({
                message: 'Actualizado correctamente',
                ok: true
            })
        } else {
            res.status(400).json({
                message: 'No se pudo actualizar el estado de la categoria'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    })
}


exports.listarCategorias = (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Categoria.listarCategorias(idemisor).then(response => {
        res.status(200).json({
            categorias: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: err
        })
    })

}

exports.obtenerCodigos = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    CodigosCabysController.obtenerCodigosParaCategorias(idemisor).then(response => {
        res.status(200).json({codigos: response});
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: err
        })
    })
}

exports.actualizarCodigoCabysPorIdCategoria = (obj) => Categoria.actualizarCodigoCabysPorIdCategoria(obj);
exports.nuevaCategoria = obj => Categoria.nuevaCategoria(obj); //MODIFICADO X SYN
exports.obtenerCategoriaPorCodigoCabys = obj => Categoria.obtenerCategoriaPorCodigoCabys(obj);