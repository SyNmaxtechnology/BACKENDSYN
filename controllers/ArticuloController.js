const jwt = require("jsonwebtoken");
const UnidadesMedida = require("../ServiciosWeb/UnidadesMedida");
const Articulo = require("../models/Articulo");
const ExistenciaController = require("./ExistenciaController");
const Bodega = require("../models/Bodega");
const {actualizarCodigoCabysPorIdCategoria} = require("../controllers/CategoriasController");

const nuevoArticulo = (req, res) => {//
    
    const {
        tipo_impuesto,
        idcategoria,
        descripcion,
        codigobarra_producto,
        precio_articulo,
        precio_final,
        costo_unitario,
        unidad_medida,
        unidad_medida_comercial,
        tipo_servicio,
        codigo_servicio
    } = req.body;

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Articulo.nuevoArticulo({idemisor,tipo_impuesto,idcategoria,descripcion,codigobarra_producto,
        precio_articulo,precio_final,costo_unitario,unidad_medida,unidad_medida_comercial,
        tipo_servicio,codigo_servicio}). then( async response => {
            const {affectedRows,insertId} = response;
            if(affectedRows > 0){
                //aqui se guarda el articulo en la existencia
                const idBodega = await Bodega.obtenerIdBodegaPrincipal(idemisor);
               ExistenciaController.sumarExistencia({
                cantidad: 0,
                idarticulo: insertId,
                idemisor,
                idbodega: idBodega[0].id
               }).then(responseExistencia => {

                    const {OK } = responseExistencia[0][0];

                    if(OK === 'OK'){
                        return res.status(200).json({
                            message: 'Artículo guardado correctamente'
                        })
                    } else {
                        return res.status(400).json({
                            message: 'No se guardó el artículo'
                        })
                    }
               })
               .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: 'Hubo un error al insertar el artículo'
                })
            })

            } else {
                return res.status(400).json({
                    message: 'No se guardó el artículo'
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

const actualizarArticulo = async (req,res) => {
    
    try {
        
        const {id } = req.params;
        const {
            tipo_impuesto,
            idcategoria,
            descripcion,
            codigobarra_producto,
            precio_articulo,
            precio_final,
            costo_unitario,
            unidad_medida,
            unidad_medida_comercial,
            tipo_servicio,
            codigo_servicio,
            codigocabys
        } = req.body;

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        if(codigocabys && codigocabys.length > 0){

            const codigoCabysActualizado = await  actualizarCodigoCabysPorIdCategoria({idemisor,idcategoria,codigocabys});
            if(codigoCabysActualizado.affectedRows === 0){
                return res.status(400).json({
                    message: 'No se pudo actualizar el codigo cabys'
                })

            } else {

                console.log("codigo cabys actualizado desde el controlador de articulos")
            }
        }

        const response = await Articulo.actualizarArticulo({id,idemisor,tipo_impuesto,idcategoria,descripcion,codigobarra_producto,
            precio_articulo,precio_final,costo_unitario,unidad_medida,unidad_medida_comercial,tipo_servicio,
            codigo_servicio});

        const {affectedRows} = response;
        if(affectedRows > 0){
            return res.status(200).json({
                message: 'Artículo actualizado correctamente'
            })
        } else {
            return res.status(400).json({
                message: 'No se actualizó el artículo'
            })
        }
    
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al actualizar el artículo'
        })   
    }
}



const rutaObtenerArticulosPorIdEmisor = (req, res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    obtenerArticulosPorIdEmisor({idemisor, idusuario}).then(response => {
        res.status(200).json({
            articulos: response
        })
    })
    .catch(err =>  {
        console.log(err);
        res.status(500).json({
            message: 'Se ha producido un error en el servidor'
        })
    })
}   
const rutaBuscarArticulo = async (req, res) => {
    
    try {   
        
        const {query} = req.params;
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

       // const idbodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
        const articulo = await buscarArticulo({query,idemisor});
       
        return res.status(200).json({
            articulos: articulo
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar los artículos'
        })
    }
}


const rutaBuscarArticuloPorId = (req, res) => {
    
    const {idarticulo} = req.query;
   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    buscarArticuloPorId({idarticulo,idemisor}).then(response => {
        console.log(response);
        return res.status(200).json({
            articulo: response
        })
    })
    .catch(err =>  {
        console.log(err);
        res.status(500).json({
            message: 'Se ha producido un error al buscar el artículo'
        })
    })
}

const rutaActualizarEstado = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id, estado} = req.body;

    actualizarEstado({
        idemisor,
        estado,
        idarticulo: id
    }).then(response => {

        const {affectedRows} = response;
        
        if(affectedRows > 0){
           res.status(200).json({
               message: 'Articulo actualizado correctamente'
           })
        } else {
            res.status(400).json({
                message: 'No se pudo actualizar el articulo'
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


const rutaObtenerArticuloPorQuery = (req,res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const {query}  = req.body;

    obtenerArticuloPorQuery({
        idemisor,
        query,
        idusuario
    })
    .then(response => {
        res.status(200).json({
            articulo: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}


const rutaObtenerArticulosReceta = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {texto} = req.body;

    obtenerArticulosReceta({idemisor,texto}).then(response => {

        res.status(200).json({
            articulos: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}


const rutaObtenerArticulosMovimiento = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {descripcion } = req.body;

    obtenerArticulosMovimientos({
        idemisor,
        descripcion
    }).then(response => {
        
        res.status(200).json({
            articulos: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        });
    })
}

const obtenerArticulosMovimientos = (obj) => {

    return Articulo.obtenerArticuloMovimiento(obj);
}

const obtenerArticulosReceta = (idemisor) => {

    return Articulo.obtenerArticulosReceta(idemisor);
} 

const obtenerArticulosPorIdEmisor = (idemisor) => {
    return Articulo.obtenerArticulosPorIdEmisor(idemisor);
}

const buscarArticulo = (obj) => {
    return Articulo.buscarArticulo(obj);
}

const buscarArticuloPorId = (obj) =>{
    return Articulo.obtenerArticuloPorId(obj);
}

const unidadesMedida = (req, res) => {
    //obtenerUnidadesMedida
    try {

        res.status(200).json({
            unidades: UnidadesMedida()
        })
            
    } catch (err) {
        res.status(500).json({
            'message': 'El servicio web de unidades de medida ha fallado'
        })
    }
}

const actualizarEstado  =(obj) => {
    return Articulo.actualizarEstado(obj);
}

const obtenerArticuloPorQuery = (obj) => {
    return Articulo.obtenerArticuloPorQuery(obj);
}

module.exports = {
    nuevoArticulo,
    actualizarArticulo,
    unidadesMedida,
    rutaBuscarArticulo,
    rutaBuscarArticuloPorId,
    rutaObtenerArticulosPorIdEmisor,
    rutaActualizarEstado,
    rutaObtenerArticuloPorQuery,
    rutaObtenerArticulosReceta,
    rutaObtenerArticulosMovimiento
}

