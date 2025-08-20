const Accesos = require("../models/Accesos");


const agregarAcceso = (obj) => {

    return Accesos.agregarAcceso(obj);
}


const actualizarAcceso = (obj) => {

   return  Accesos.actualizarAcceso(obj);
}


const obtenerAccesos = (req,res) => {

    const {usuario} = req.params;

    Accesos.obtenerAccesos(usuario).then(response => {

        if(response.length === 0){
            res.status(404).json({
                message: 'No hay accesos asociados'
            })
        } else {
            res.status(200).json({
                accesos: response
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener los accesos'
        })
    });
}


const actualizarEstadoAcceso = (obj) => {

    return Accesos.actualizarEstadoAcceso(obj)
        
}

const obtenerAccesoPorId = (req,res) => {

    const { id } = req.params;

    Accesos.obtenerAccesoPorId(id).then(acceso => {
        if(acceso.length === 0){
            res.status(404).json({
                message: 'No se puedo obtener el acceso'
            })
        } else {    
            res.status(200).json(acceso);
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener el acceso'
        })
    });
}

const actualizarAccesosUsuario= (obj) => {
    return Accesos.actualizarAccesosUsuario(obj);
}

module.exports = {
    agregarAcceso,
    actualizarAcceso,
    obtenerAccesos,
    actualizarEstadoAcceso,
    obtenerAccesoPorId,
    actualizarAccesosUsuario
}
