const Proveedor = require("../models/Proveedor");
const jwt = require("jsonwebtoken");
const insertarProveedor = (obj) => {
    return Proveedor.insertarProveedor(obj);
}

const buscarProveedor = (obj) => {
    return Proveedor.buscarProveedorPorClave(obj);
}
//cabio
const rutaInsertarProveedor = async (req,res) => {
    
    try {
        let actividad = '';
        const { 
            proveedor_nombre,
            proveedor_nombre_comercial,
            proveedor_tipo_identificacion,
            cedula_proveedor,
            numero_proveedor,
            codigo_actividad,
            identificacion_extranjero,
            proveedor_barrio,
            otras_senas,
            otras_senas_extranjero,
            proveedor_telefono_codigopais,
            proveedor_telefono_numtelefono,
            proveedor_fax_codigopais,
            proveedor_fax_numtelefono,
            proveedor_correo
        } = req.body;
        if(codigo_actividad != ''){
            actividad = codigo_actividad
        }
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        const respuesta = await  Proveedor.insertarProveedor({idemisor,proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,
                cedula_proveedor,numero_proveedor,actividad,identificacion_extranjero,proveedor_barrio,otras_senas,
                otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,
                proveedor_fax_numtelefono,proveedor_correo})   

        const {affectedRows} = respuesta;
        console.log(affectedRows > 0)
        if(affectedRows> 0) {
            return res.status(200).json({
                message: 'El proveedor se ha insertado correctamente'
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo insertar el proveedor'
            });
        }

    } catch(err){
        console.log(err);
        res.status(500).json({
            message: 'No se pudo guardar el proveedor'
        })
    }

}
const buscarActividad = (cedula) => {
    return Proveedor.buscarActividad(cedula);
}

const rutaBuscarActividad = (req,res) => {
    const { cedula } = req.params;
    Proveedor.buscarActividad(cedula)
        .then(response => {
            res.status(200).json({
                response
            })
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: err
        });
    })
}

const buscarProveedorPorQuery = (obj) => {
    return Proveedor.buscarProveedorPorQuery(obj);
}
const rutaBuscarProveedorPorQuery = (req,res) => {
    
    const { query } = req.body;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;

    buscarProveedorPorQuery({
        query, idemisor, idusuario
    }).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No hay resultados'
            })
        } else {
            res.status(200).json({
                proveedor: response
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'No se pudo obtener el proveedor'
        })
    })

}


const rutaActualizarProveedor = (req,res) => {
    
    const {id} = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    const {proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,cedula_proveedor,numero_proveedor,codigo_actividad,identificacion_extranjero,proveedor_barrio,otras_senas,otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,proveedor_fax_numtelefono,proveedor_correo} = req.body;


    actualizarProveedor({idemisor, proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,cedula_proveedor,numero_proveedor,codigo_actividad,identificacion_extranjero,proveedor_barrio,otras_senas,otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,proveedor_fax_numtelefono,proveedor_correo,id}).then(response => {
        const { affectedRows } = response;

        if(affectedRows > 0){
            res.status(200).json({
                message: 'El proveedor ha sido actualizado'
            })
        } else {
            res.status(400).json({
                message: 'No se pudo actualizar el proveedor'
            })
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        });
    })
    
}
const buscarProveedorPorCedulaONombre = (req, res) => {

    const {query} = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Proveedor.buscarProveedor({query,idemisor})
    .then(response => {
        if(response.length == 0){
            return res.status(404).json({
                message: 'No hay resultados'
            })
        } else {
            return res.status(200).json({
                proveedor: response[0]
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'HUbo un problema al buscar el proveedor'
        })
    })
} 

const obtenerProveedoresPorIdEmisor = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Proveedor.buscarProveedorPorIdEmisor({idemisor,idusuario}).then(response => { 
        res.status(200).json({
            proveedores: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'HUbo un problema al cargar los proveedores'
        })
    })
}


const obtenerProveedoresPorId = (req,res) => {
    
    const {id} = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Proveedor.buscarProveedorPorId({
        idemisor,
        idproveedor: id,
        idusuario
    }).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No se encontró el proveedor'
            })
        } else {
            res.status(200).json({
                proveedor: response[0]
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'HUbo un problema obtener el proveedor'
        })
    })
}

const actualizarEstado = (req,res) => {

    const {estado, idproveedor} = req.body;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Proveedor.actualizarEstado({
        estado,
        idemisor,
        idproveedor
    }).then(response => {
        const {affectedRows} = response;

        if(affectedRows > 0) {
            res.status(200).json({
                message: 'El estado del proveedor ha sido actualizado',
                ok: true
            })
        } else {
            res.status(404).json({
                message: 'No se pudo actualizar el proveedor'
            })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'HUbo un error en el servidor'
        })
    })
}


const obtenerProveedorPorCoincidencia = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { query } = req.params;

    Proveedor.buscarProveedorPorCoincidencia({idemisor, query})
    .then(response => {

        if(response.length === 0){
            res.status(404).json({
                message: 'No hay resultados'
            })
        } else {    
            res.status(200).json({
                proveedores: response
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        });
    })

}


const actualizarProveedor = (obj) => {
    return Proveedor.actualizarProveedor(obj);
}

const obtenerProveedoresFacturar = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Proveedor.obtenerProveedoresFacturar({idemisor}).then(proveedores =>{ 
        console.log("obtenerProveedoresFacturar")
        res.status(200).json(proveedores)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al cargar la información de los proveedores'
        });
    })
}

const obtenerProveedorPorNombre = obj => Proveedor.obtenerProveedorPorNombre(obj);

module.exports = {
    insertarProveedor,
    buscarProveedor,
    rutaInsertarProveedor,
    buscarActividad,
    rutaBuscarActividad,
    buscarProveedorPorCedulaONombre,
    obtenerProveedoresPorIdEmisor,
    obtenerProveedoresPorId,
    actualizarEstado,
    rutaBuscarProveedorPorQuery,
    rutaActualizarProveedor,
    obtenerProveedorPorCoincidencia,
    obtenerProveedoresFacturar,
    obtenerProveedorPorNombre
}
