const TipoImpuesto = require('../models/TipoImpuesto');
const jwt = require("jsonwebtoken");

exports.nuevoImpuesto = async(req, res) => {

    const { descripcion, porcentaje, codigo } = req.body;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    try {
        const respuesta = await TipoImpuesto.nuevoImpuesto({ descripcion, porcentaje, codigo,idemisor });
        const { affectedRows } = respuesta;

        if (affectedRows > 0) return res.status(200).json({
            message: 'Tipo de impuesto registrado correctamente'
        })

    } catch (error) {
        const { errno } = error;
        if (errno == 1062) return res.status(500).json({
            message: 'El tipo de impuesto ya está registrado, digite otro'
        })
    }
}

exports.obtenerImpuesto = async(req, res) => {
    
    const { query } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const obj = {
        idemisor,
        query
    }
    try {
        const respuesta = await TipoImpuesto.obtenerImpuesto(obj);

        if (!respuesta[0]) return res.status(200).json({
            message: 'No hay resultados'
        })
        return res.status(200).json(respuesta[0]);
    } catch (error) {
        console.log(error)
    }
}

exports.actualizarImpuesto = async(req, res) => {

    const { id } = req.params;
    const { descripcion, porcentaje, codigo } = req.body;
    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const obj = {
            id,
            descripcion,
            porcentaje,
            codigo,
            idemisor
        }
        const respuesta = await TipoImpuesto.actualizarImpuesto(obj);
        const { affectedRows } = respuesta;

        if (affectedRows > 0) return res.status(200).json({
            message: 'Tipo de impuesto actualizado correctamente'
        })
    } catch (error) {
        const { errno } = error;
        if (errno == 1062) return res.status(500).json({
            message: 'El tipo de impuesto ya está registrado, digite otro'
        });
    }
}


exports.obtenerImpuestos = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    TipoImpuesto.obtenerImpuestos(idemisor)
        .then(response => {
            console.log(response);
            if (response[0]) {
                res.status(200).json({
                    impuestos: response
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudieron obtener los impuestos'
            })
        })
}

exports.listarImpuestos = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    
    TipoImpuesto.listarImpuestos(idemisor).then(response => {
        res.status(200).json({
            impuestos: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })

}

exports.obtenerImpuestoPorId = (req, res) => {
    
    const {id} = req.params;

    TipoImpuesto.obtenerImpuestoPorId(id).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No se pudo obtener el impuesto'
            }) 
        } else {
            res.status(200).json({
                impuesto: response
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

exports.actualizarEstado = (req, res) => {
    const {idimpuesto, estado} = req.body;

    TipoImpuesto.actualizarEstado({
        idimpuesto, estado
    }).then(response => {
        const {affectedRows} = response;
        if(affectedRows > 0){
            
            res.status(200).json({
                message: 'Estado actualizado',
                ok: true
            })
             
        } else {
            res.status(400).json({
                message: 'No se pudo actualizar el estado del impuesto'
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

exports.obtenerImpuestoPorQuery = (req, res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {query} = req.params;

    TipoImpuesto.obtenerImpuestoPorQuery({
        query, idemisor
    }).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No se pudo obtener el impuesto'
            }) 
        } else {
            res.status(200).json({
                impuesto: response
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

exports.listarImpuestosResumenIVA = ( idemisor ) => {

    return TipoImpuesto.listarImpuestosResumenIVA(idemisor);
}
//
exports.agregarImpuestosEmisor = (idemisor) => TipoImpuesto.agregarImpuestosEmisor(idemisor); //obtenerImpuestoExento
exports.obtenerImpuestoPorCodigo = (idemisor,codigo_impuesto) => TipoImpuesto.obtenerImpuestoPorCodigo(idemisor,codigo_impuesto);
exports.obtenerImpuestoExento = () => TipoImpuesto.obtenerImpuestoExento();