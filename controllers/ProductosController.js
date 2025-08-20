const Producto = require('../models/Producto');
const RecetaController = require("./RecetaController");
const Articulo = require("../models/Articulo");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const shortId = require("shortid");
const fs = require("fs");
const TipoImpuesto = require("../models/TipoImpuesto");
const Existencia = require("../models/Existencia");
const Bodega = require("../models/Bodega");
const Receta = require("../models/Receta");
const Jimp = require('jimp');
require("dotenv").config({ path: './../variables.env'});
const cloudinary = require("cloudinary");

const { reject } = require('bcrypt/promises');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});

const configImage = {
    limits: { fileSize: 100000 }, //limitar tamaño de imagen a 100 kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { // donde se va subir la imagen
            console.log("entró")
            next(null, __dirname + '/../public/img_productos/');
        },
        filename: (req, file, next) => {

            let filename = shortId.generate();
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo

            filename = filename + '.'+ext;
            console.log(filename);
            next(null, filename);
        }
    }),
    //filtrar formatos de imagen
    fileFilter: (req, file, next) => {
        console.log(file);
        const ext = file.mimetype.split('/')[1]; //
        console.log("ext",ext);
        if (ext === 'jpeg' || ext === 'png') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para llave criptográfica'), false);
        }
    }
}

const uploadImage = multer(configImage).single('imagen');

const recortarImagen = (entrada, salida) => {

    return new Promise((resolve,reject) => {
        Jimp.read(entrada, (err, lenna) => {
            if (err) reject( err);
            lenna
            .resize(100,100) // resize
            .quality(60) // set JPEG quality
            .write(salida); // save

            resolve(salida);
        });
    })
}

const subirImagenCloudinary = (ruta)  => {

    return new Promise((resolve,reject) => {

        cloudinary.uploader.upload(ruta,(result,err) => {
            if(err){
                console.log("error cloudinary :")
                console.log(err);
                reject(new Error('No se pudo cargar la imagen en el servidor'));
            } else {
                console.log("result ",result);
                const {secure_url,public_id} = result;
                resolve({secure_url,public_id})
            }
        },{
        folder: process.env.IMAGES_UPLOAD_PATH,
        use_filename: true
        })
    })
}

const eliminarImagenCloudinary = (public_id) => { // no funciona este metodo
    console.log(public_id);
    return new Promise((resolve,reject) => {
        cloudinary.uploader.destroy( // eliminar imagen de cloudinary
            public_id,
            {
                invalidate: true
            }, 
            function(result,err) {
                if(err){
                    console.log("Error al eliminar la imagen de cloudinary")
                    console.log(err);
                    reject(new Error('No se pudo actualizar la imagen'));
                } else {
                    console.log("Imagen eliminada ");
                    console.log(result)
                    
                    resolve(result);
                }
            }
        );
    })
}
exports.subirImagen = (req,res, next) => {
    
    
    uploadImage(req, res, function(error) {
        
        if(typeof req.file === 'undefined'){
            return next();
        } else {

        if (error) {
            if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                if (error.code === 'LIMIT_FILE_SIZE') {
                    console.log("error c",error)
                    return res.status(500).json({
                        err: 'El tamaño es demasiado grande. Máximo 50KB'
                    })
                } else {
                    console.log("error m ",error)
                    return res.status(500).json({ 'err': 'aqui ' + error.message });
                }

            } else if (error.hasOwnProperty('message')) { // si el objeto error contiene la propiedad
                //message.
                console.log("error ",error)
                return res.status(500).json({
                    'error': error.message
                })
            }

        } else {
            return next();
        }
    }
    }) 
}

exports.obtenerProducto = async(req, res) => {
   

    try {

        const { query, type } = req.query;
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const obj = {
            idemisor,
            query, 
            type,
            idusuario
        }
        
        const respueta = await Producto.obtenerProducto(obj);

        if (type === 'equal') {
        
            if (!respueta[0]) return res.status(404).json({
                message: 'No hay resultados'
            })
        
            return res.status(200).json(respueta);
        
        } else if (type === 'like') {

            if (!respueta[0]) {
                return res.status(404).json([])
            } else {
                    
                console.log("respuesta ",respueta);
                

                if (!respueta[0]) return res.status(404).json({
                    message: 'No hay resultados'
                });
            
                return res.status(200).json(respueta);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

exports.obtenerExistenciaProducto = async (req, res) => {

    try {

        const { idproducto,idbodega} = req.params;
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
       // const idusuario = decodedToken.uid;
        const obj = {
            idemisor,
            idproducto
        }
        console.log(idbodega);
        const respuesta = await Producto.obtenerDescripcion(obj);
        //const idbodega = await Bodega.obtenerBodegaPorIdUsuario(idusuario);
        const existencia = await Existencia.obtenerExistenciaPorDescripcion({
            idbodega, 
            descripcion: respuesta[0].descripcion,
            idemisor
        });

        console.log(existencia);

    return res.status(200).json({existencia});  
    } catch(err){
        console.log("No se pudo obtener la existencia del producto")
    }
}

exports.actualizarProducto = async(req, res) => {
    
    const { id } = req.params;
    const { descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, precio_final } = req.body;
    let obj = { descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, precio_final,imagen: '', public_id: '',imagen_local:'' };
    let imagen = '';
    let imagenAnterior = null;
    let public_id = '';
    let imagen_local = '';


    try {
        if (req.body.codigo_barra && req.body.codigo_barra != '') {
            const { codigo_barra } = req.body;
            codigoBarra = codigo_barra;
        } else {
            codigoBarra = '';
        }
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;

        obj.codigoBarra = codigoBarra;
        obj.id = id;
        obj.idemisor = idemisor;
        console.log("imagen ",req.file);
  
        if(typeof req.file !== 'undefined'){ // si trae una imagen
            console.log("Viene imagen");
            console.log("id ",id)
            imagenAnterior = await Producto.obtenerImagen(id);
            if(!(imagenAnterior[0].imagen == null || imagenAnterior[0].imagen == '')){
                
                const ruta1 = __dirname + '/../public/img_productos/recortadas/' + imagenAnterior[0].imagen_local;
                const ruta2 = __dirname + '/../public/img_productos/' + imagenAnterior[0].imagen_local;

                fs.stat(ruta1, function(err) {
                
                    if(err){
                        if (err.code === 'ENOENT') {
                            console.log('La imagen no existe');
                        } else {
                            console.log('Error al eliminar la imagen anterior');
                        }
                    } else {
                        fs.unlink(ruta1,err => {
                            if(err){
                                console.log(err);
                                console.log(err)
                            } else {
                                console.log("imagen1 eliminada");
                            }
                        });
                    }
                });
    
                fs.stat(ruta2, function(err) {
                    if(err){
                        if (err.code === 'ENOENT') {
                            console.log('La imagen no existe');
                        } else {
                            console.log('Error al eliminar la imagen anterior');
                        }
                    } else {

                        fs.unlink(ruta2,err => {
                            if(err){
                                console.log(err);
                                throw new Error(err)
                            } else  {
                                console.log("imagen2 eliminada");
                            }
                        });
                    }
                });

            } // eliminar la imagen anterior

            cloudinary.uploader.destroy( // eliminar imagen de cloudinary
                imagenAnterior[0].public_id,
                {
                    invalidate: true
                }, 
                function(result,err) {
                    if(err){
                        console.log("Error al eliminar la imagen de cloudinary")
                        console.log(err);
                        throw new Error('No se pudo actualizar la imagen');
                    } else {
                        console.log("Imagen eliminada ");
                        console.log(result)
                    }
                }
            );

            console.log("Aqui")
            imagen = req.file.filename;
            const entrada = __dirname + '/../public/img_productos/'+imagen;
            const salida  = __dirname + '/../public/img_productos/recortadas/'+imagen;
            //const recortarImagenSalida = await recortarImagen(entrada,salida);

            imagenSubidaResponse = await subirImagenCloudinary(entrada);
            console.log("imagen subida ",imagenSubidaResponse);
            const {secure_url,public_id} = imagenSubidaResponse;
            console.log("secure ",secure_url);
            console.log("public_id ",public_id);

            obj.imagen = secure_url;
            obj.public_id = public_id;
            obj.imagen_local = imagen;


        }else {
            imagenAnterior = await Producto.obtenerImagen(id);
            obj.imagen = imagenAnterior[0].imagen;
            obj.public_id = imagenAnterior[0].public_id
            obj.imagen_local = imagenAnterior[0].imagen_local;
        }

        console.log(obj); 

        const respuesta = await Producto.actualizarProducto(obj);
        const { affectedRows } = respuesta;

        if (affectedRows > 0){ 
            return res.status(200).json({
                message: 'Producto actualizado correctamente'
            });
        } else {
            return res.status(400).json({
                message: 'No se pudo actualizar el producto'
            });
        }

    } catch (error) {
        console.log(error)
        const { errno } = error;

        if (errno == 1062) {

            res.status(500).json({
                message: 'Hay datos repetidos'
            })
        } else  {
            res.status(500).json({
                message: err
            })
        }
    }
}

exports.nuevoProducto = async(req, res) => {
   
    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        let imagenSubidaResponse = null;

        const { descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, precio_final } = req.body;
        let obj = { descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, precio_final,imagen: '',public_id: '',imagen_local:'' };
        let imagen = '';

        
        if (req.body.codigo_barra && req.body.codigo_barra != '') {
            const { codigo_barra } = req.body;
            codigoBarra = codigo_barra;
        } else {
            codigoBarra = '';
        }

        obj.codigoBarra = codigoBarra;
        obj.idemisor = idemisor;
        if(typeof req.file !== 'undefined'){
            imagen = req.file.filename;
            const entrada = __dirname + '/../public/img_productos/'+imagen;
            const salida  = __dirname + '/../public/img_productos/recortadas/'+imagen;
            
            const recortarImagenSalida = await recortarImagen(entrada,salida);
            imagenSubidaResponse = await subirImagenCloudinary(recortarImagenSalida);
            const {secure_url,public_id} = imagenSubidaResponse;
            obj.imagen_local = imagen;
            obj.imagen = secure_url;
            obj.public_id = public_id;
        }
        console.log("objeto insertar Producto ",obj);
        const respuesta = await Producto.nuevoProducto(obj);
        const { affectedRows, insertId } = respuesta;

        if (affectedRows > 0) {

            /*return res.status(200).json({
                message: 'Producto registrado correctamente',
                insertId
            })*/

            //CREAR EL ARTICULO con la receta

            const idImpuesto = await TipoImpuesto.obtenerImpuestoExento();

            Articulo.nuevoArticulo({
                idemisor,
                tipo_impuesto: idImpuesto[0].id,
                idcategoria: 1,
                descripcion: descripcion,
                codigobarra_producto: obj.codigoBarra,
                precio_articulo: precio_producto,
                precio_final: precio_final ,
                costo_unitario: costo_unitario,
                unidad_medida: 'Unid',
                unidad_medida_comercial,
                tipo_servicio,
                codigo_servicio
            }).then(response => {
                /**/
                const {affectedRows} = response;

                if(affectedRows > 0){
                   
                    RecetaController.guardarReceta({
                        idproducto: respuesta.insertId, 
                        idarticulo: response.insertId, 
                        costo: 1,
                        cantidad: 1,
                        idemisor
                    }).then(async responseReceta => {
                        const {affectedRows} = responseReceta;

                        if(affectedRows > 0){
                            const idBodega = await Bodega.obtenerIdBodegaPrincipal(idemisor);
                            Existencia.actualizarStock({ cantidad: 0,idarticulo: response.insertId 
                                ,idemisor, idbodega: idBodega[0].id})
                            .then(responseExistencia => {
                                const {OK } = responseExistencia[0][0];

                                if(OK == 'OK'){
                                     res.status(201).json({
                                            message: 'Producto guardado'
                                        })
                                } else {
                                    res.status(400).json({
                                        message: 'El articulo asociado no se pudo guardar en existencias'
                                    })
                                }
                            })

                        } else {
                            res.status(400).json({
                                message: 'No se pudo insertar la receta asociado'
                            })
                        }
                    }).catch(err => { 
                        console.log(err);
                        res.status(500).json({
                            message: 'Ha ocurrido un error en el servidor'
                        })
                    })
                } else {
                    res.status(400).json({
                        message: 'No se pudo insertar el articulo asociado'
                    })
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    message: 'Ha ocurrido un error en el servidor'
                })
            })

        } else {
            res.status(400).json({
                message: 'No se pudo insertar el producto'
            })
        }

    } catch (error) {
        console.log(error);
        const { errno } = error;

        if (errno == 1062) {

            res.status(500).json({
                message: 'Hay datos repetidos'
            })
        } else  {
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        }
    }
}


exports.obtenerProductoPorId = (req,res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idproducto} = req.params;
   
    Producto.obtenerProductoPorId({
        idemisor,
        idproducto
    }).then(response => {
        res.status(200).json({
            producto: response[0]
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            err: 'Error al obtener el producto'
        })
    })
}

exports.obtenerProductosPorIdEmisor = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Producto.obtenerProductosPorIdEmisor({idemisor,idusuario}).then(response => {
        res.status(200).json({
            productos: response
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            err: 'Hubo un error en el servidor'
        })
    })

}

exports.modificarEstado = (req,res) => {
   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {estado,idproducto} = req.body;
  
    Producto.actualizarEstado({
        estado,idproducto,idemisor
    }).then(response => {
        const {affectedRows} = response;

        if(affectedRows > 0){
            res.status(200).json({
                message: 'El estado ha sido actualizado',
                ok: true
            })
        } else {
            res.status(400).json({
                message: 'No se pudo actualizar el estado del producto'
            })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            err: 'Hubo un error en el servidor'
        })
    })
}

exports.UnidadesMedida = (req, res) => {
    //obtenerUnidadesMedida
    try {

        Producto.obtenerUnidadesMedida()
            .then(unidades => {
                res.status(200).json({
                    unidades
                })
            });
    } catch (err) {
        res.status(500).json({
            'message': 'El servicio web de unidades de medida ha fallado'
        })
    }
}

exports.obtenerProductosPos = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Producto.obtenerProductosPos(idemisor).then(response => {
        res.status(200).json({
            productos: response
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            err: 'Hubo un error en el servidor'
        })
    })
}

exports.obtenerProductosPorCategoria = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idcategoria} = req.params;
        
    Producto.obtenerProductosListadosPorCategorias({idcategoria, idemisor})
    .then(productos => {
        let host = null;
        for (let producto of productos) {
            
            if(!producto.imagen) {
                if(req.headers.host == 'localhost:5000') {
                    host = 'http://'+req.headers.host+'/noimagen.png';
                    producto.imagen = host;
                } else {
                    host = 'https://'+req.headers.host+'/noimagen.png';
                    producto.imagen = host;
                }
            }
        }

        res.status(200).json({
            productos: productos
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            err
        })
    })
}


exports.obtenerProductosReceta = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {query} = req.body;

    Producto.obtenerProductosReceta({idemisor,query}).then(response => {
        res.status(200).json({
            productos: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}


exports.obtenerProductosPorIdBodegaAsociados = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const {params:{idbodega,existencia}} = req;

        console.log({existencia})

        if(idemisor !== 41) {
            const productos = await Producto.obtenerProducto({
                idemisor,
                query:'', 
                type: 'like',
                idusuario});
            return res.status(200).json(productos);

        } else {

        const productos = await Producto.obtenerProductosPorIdBodegaAsociados({idbodega,idemisor,existencia});

        return res.status(200).json(productos);
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    }
}

exports.obtenerIdPorCodigoBarra = (idemisor,codigo_barra) => Producto.obtenerIdPorCodigoBarra(idemisor,codigo_barra);
exports.nuevoProductoMetodo = (obj) => Producto.nuevoProducto(obj);
// servicios exonerados = 1769.23077
//mercancia exonerada= 1000.00000