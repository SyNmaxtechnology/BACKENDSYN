const Descuento = require('../models/Descuento');
const jwt = require("jsonwebtoken");
exports.actualizarDescuento = async(req, res) => {

    const { id } = req.params;
    const { descripcion, porcentaje } = req.body;
  

    try {
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const obj = {
            id,
            descripcion,
            porcentaje,
            idemisor
        }
        const respuesta = await Descuento.actualizarDescuento(obj);

        const { affectedRows } = respuesta;
        if (affectedRows > 0) {
            return res.status(200).send({
                message: 'Descuento actualizado correctamente'
            })
        }
    } catch (error) {

        const { errno } = error;
        if (errno == 1048) return res.status(500).json({
            message: 'Ambos campos son requeridos'
        })
    }
}

exports.nuevoDescuento = async(req, res) => {
    
    const { descripcion, porcentaje } = req.body;
    
    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const respuesta = await Descuento.nuevoDescuento({ descripcion, porcentaje,idemisor });
        const { affectedRows } = respuesta;

        if (affectedRows > 0) {
            return res.status(200).send({
                message: 'Descuento registrado correctamente'
            })
        }
    } catch (error) {
        const { errno } = error;
        if (errno == 1048) return res.status(500).json({
            message: 'Ambos campos son requeridos'
        })
    }
}

exports.obtenerDescuento = async(req, res) => {

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
    try {
        const respuesta = await Descuento.obtenerDescuento(obj);
        if (!respuesta[0]) {
            return res.status(404).json({
                message: 'No hay resultados'
            })
        }

        res.json(respuesta)
    } catch (error) {
        console.log(error);
    }
}

exports.obtenerDescuentos = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Descuento.obtenerDescuentos({idemisor,
        idusuario
    })
        .then(response => {
            if (response[0]) {
                res.status(200).json({
                    descuentos: response
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudo obtener los descuentos'
            })
        })
}

exports.obtenerDescuentoPorId = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.body;
    Descuento.obtenerDescuentoPorId({idemisor,iddescuento: id})
        .then(response => {
            if(response.length > 0){
                res.status(200).json({
                    descuento: response
                })
            } else {
                res.status(400).json({
                    message: 'No se pudo obtener el descuento'
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

exports.actualizarEstado = (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {iddescuento, estado} = req.body;

    Descuento.actualizarEstado({
        iddescuento, estado,idemisor
    }).then(response => {

        const {affectedRows} = response;

        if(affectedRows > 0){
            return res.status(200).send({
                ok: true,
                message: 'Actualizado correctamente'
            })
        } else  {
            res.status(400).json({
                message: 'No se pudo actualizar el estado del descuento'
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

exports.obtenerDescuentosPos = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Descuento.obtenerDescuentosPos(idemisor).then(response => {
        res.status(200).send({
            descuentos: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    })
}