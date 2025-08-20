const Usuarios = require("../models/Usuario");
const multer = require("multer");
const shortid = require("shortid");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const Emisor = require("../models/Emisor");
const AccesosController = require("./AccesosController");
const crypto = require("crypto");
const EmisorController = require("../controllers/EmisorController");
// --------------------VALIDAR LAS IMAGENESS-------------------------- //

const configFileImage = {
    limits: { fileSize: 100000 }, //limitar tamaño de imagen a 100 kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { // donde se va subir la imagen
            
            next(null, __dirname + '/../public/imagenes/');
        },
        filename: (req, file, next) => {
                        
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo
            let filename =  shortid.generate();
            filename = filename + '.' + ext;
            next(null, filename); //
        
        }
    }),
    //filtrar formatos de imagen
    fileFilter: (req, file, next) => {
        
        const ext = file.mimetype.split('/')[1]; //
        if (ext === 'jpeg' || ext === 'png') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para imagen'), false);
        }
    }
}

const upload = multer(configFileImage).single('imagen');


exports.subirImagen = (req, res, next) => {
        upload(req, res, function(error) {
            console.log(error);
            if (error) {
                if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        console.log(error);
                        return res.status(500).json({
                            err: 'El tamaño es demasiado grande. Máximo 100KB'
                        });
                    } else {
                        console.log(error);
                        return res.status(500).json({
                            err: error.message
                        });
                    }
                } else if (error.hasOwnProperty('message')) { // si el objeto error contiene la propiedad
                    //message.
                    console.log(error);
                    return res.status(500).json({
                        err: error.message
                    });
                }
            } else {
                next();
            }
        })
    }
    // ------------------------------------------------- //

exports.nuevoUsuario = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { idpermiso, usuario, contrasena,idbodega,accesos } = req.body;


    if (typeof idpermiso === 'undefined' || typeof usuario === 'undefined' ||
        typeof contrasena === 'undefined') {
        res.status(400).json({
            message: 'Faltan parametros'
        })
    } else {
        //const { filename } = req.file;
        const obj = {
            idpermiso,
            idemisor,
            usuario,
            contrasena,
            imagen: '',
            idbodega
        }

        Usuario.registrarUsuario(obj)
        .then(response => {
            const { affectedRows, insertId } = response;
            if (affectedRows > 0) {
              
              return res.status(201).json({
                message: 'El usuario ha sido agregado'
              })
                /*
                if(!(typeof accesos === 'undefined')){
                    if(accesos.length > 0){
                        for(let acceso of accesos){
                            acceso.idusuario = insertId;
                            AccesosController.agregarAcceso(acceso).then(data => {
                                
                            })
                            .catch(err => res.status(500).json('Error al guardar los accesos'));
                        }
    
                        res.status(200).json({
                            message: 'El usuario ha sido registrado'
                        })
                    }
                } else {
                    res.status(200).json({
                        message: 'El usuario ha sido registrado'
                    })
                }
              */
                
            } else {
                res.status(400).json({
                    message: 'No se pudo agregar el usuario'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err })
        });
    }
}

exports.actualizarUsuario = (req, res) => {
   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
   const idemisor = decodedToken.id;
    const { idpermiso, usuario, contrasena,id,idbodega,accesos } = req.body;
   
   
    if (typeof idpermiso === 'undefined' || typeof usuario === 'undefined' ) {
        res.status(400).json({
            message: 'Faltan parametros'
        })
    } else {
        //const {filename} = req.file;
        const obj = { 
            id,
            idpermiso,
            idemisor,
            usuario,
            contrasena,
            imagen: '',
            idbodega
        }
        Usuario.actualizarUsuario(obj)
            .then(response => {
                const { affectedRows } = response;
                if (affectedRows > 0) {
                    
                    return res.status(200).json({
                        message: 'El usuario ha sido actualizado'
                    });
                    /*res.status(200).json({
                        message: 'El usuario ha sido registrado'
                    })
                    AccesosController.actualizarAccesosUsuario(accesos).then(response => {
                        res.status(200).json({
                            message: 'El usuario ha sido actualizado'
                        })
                    }).catch(err => {
                        res.status(500).json({
                            message: 'Se ha generado un error al actualizar el usuario'
                        })
                    }) */                   
                } else {
                    return res.status(200).json({
                        message: 'NO se pudo actualizar el usuario'
                    });
                }
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err: 'Error al actualizar el usuario' })
        });
    }
}

exports.obtenerUsuario = (req, res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    
    const { usuario } = req.params;
    if (typeof usuario === 'undefined') {
        return res.status(400).json({
            message: 'Parametro usuario es requerido'
        })
    } else {

        Usuario.obtenerUsuario({usuario,idemisor})
        .then(response => {
            if(response.length === 0){
                res.status(404).json({
                    message: 'El usuario no existe'
                })
            }else {
                res.status(200).json(response);
            }
            
        })
        .catch(err => res.status(500).json({ message: 'No se pudo obtener el usuario' }));
    }
}

exports.obtenerPermisos = (req, res) => {
    Usuarios.obtenerPermisos()
        .then(permisos => {
            console.log(permisos);
            res.json({ permisos })
        })
        .catch(err => res.status(500).json({
            message: 'No se pudo obtener los permisos'
        }))
}

exports.respuestaUsuarioActualizado = (req,res) => {
    res.status(200).json({
        message: 'El usuario ha sido actualizado'
    })
}


exports.obtenerUsuarios = (req, res) => {
    Usuario.obtenerUsuarios().then(response => {
        res.status(200).json({
            usuarios: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    })
}


exports.obtenerPermisoPorId = (idusuario) => {
    return Usuario.obtenerPermisoPorId(idusuario);
}

exports.loginSuperUsuario = async (req, res) => {
 

    try {

        const {idusuario, idemisor, permiso} = req.body;
        const consecutivo = crypto.randomBytes(50).toString('hex');
        const usuario = await Usuario.obtenerNombreUsuario(idusuario)

        const response = await Usuario.obtenerGrupoEnComun(idusuario);
        const {GrupoEnComun} = response[0]
        const sucursales = await Emisor.obtenerSurcursalesPorGrupoEnComun(GrupoEnComun);
        let logo = null;
        
        console.log(usuario);
        if(!usuario[0].logo || usuario[0].logo.length === 0){

            //sucursal.log = //http://localhost:5000/usuario.jpeg
            if(req.headers.host == 'localhost:5000') {
                logo = 'http://'+req.headers.host+'/usuario.jpeg'
            } else {
                logo = 'https://'+req.headers.host+'/usuario.jpeg'
            }
            
        }else {
            logo = usuario[0].logo;
        }
        
        const token = jwt.sign({
            fecha: Date.now(),
            id: idemisor,
            uid: idusuario,
            consecutivo,
            permiso,
            sucursales: sucursales.length
        }, process.env.KEY, { //luego se le pasa una llave secreta que va firmar el token,
            //la palabra secreta se usa tambien para verificar que cuando se hace una peticion 
            //al servidor, el token sea valido

            //luego se le indica el tiempo de validez del token

            expiresIn: '1h' //vencimiento en una hora
        });

        res.status(200).json({
            permiso,
            message: 'Autenticado',
            token,
            usuario: usuario[0].usuario,
            nombrecomercial: usuario[0].emisor_nombrecomercial,
            imagen: logo
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    }
}


exports.obtenerPermisoPorIdEmisor = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Usuario.obtenerUsuariosPorIdEmisor(idemisor)
        .then(usuarios => {
            res.status(200).json(usuarios);
        })
    .catch( err => {
        console.log(err);
        res.status(500).json({err:'Hubo un error al cargar los usuarios'});
    })

}

exports.obtenerPermisosPorUsuario = async (req,res) => {
    
    try {
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        console.log("token desde usuario ",token);
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idusuario = decodedToken.uid;
        console.log("token desde usuario controller ",decodedToken);
        let id = null;
        if(typeof idusuario === 'undefined'){
            id = await Usuario.obtenerId(decodedToken.usuario);
            id = id[0].id;
        } else {
            id = idusuario
        }

        Usuario.obtenerAccesosPorIdUsuario(id).then(permisos => { 
            res.status(200).json(permisos);
        })
    .catch( err => {
        console.log(err);
        res.status(500).json({err:'Hubo un error la información del usuario'});
    })
    } catch(err){
        console.log(err);
    }
}

exports.obtenerPermisosNull = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    //const idusuario = decodedToken.uid;

    Usuario.obtenerPermisosNull().then(permisos => res.status(200).json(permisos))
    .catch( err => {
        console.log(err);
        res.status(500).json({err:'Hubo un error la información del usuario'});
    })
}

exports.obtenerUsuarioPorId = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idcliente} = req.params;

    Usuario.obtenerUsuarioPorId({idemisor,idcliente})
        .then(response => res.status(200).json(response))
    .catch( err => {
        console.log(err);
        res.status(500).json({message: 'Error al cargar la información del usuario'});
    })
}

exports.esSuperUsuario = (obj) => Usuario.esSuperUsuario(obj);
exports.obtenerSuperUsuarioPorIdEmisor = (idemisor) => Usuario.obtenerSuperUsuarioPorIdEmisor(idemisor);
exports.obtenerGrupoEnComun = (idusuario) => Usuario.obtenerGrupoEnComun(idusuario);

exports.loginSucursal = async (req, res) => {
 

    try {

        const authHeader = req.get('Authorization');
        const tokenAnterior = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(tokenAnterior,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const {idsucursal} = req.body;
       // const permiso = decodedToken.permiso;
        console.log("idemisor",idemisor);
        const consecutivo = crypto.randomBytes(50).toString('hex');
        const usuario = await Usuario.obtenerNombreUsuario(idusuario);
        const permiso = await Usuario.obtenerPermisoPorId(idusuario)
        const nombre = await EmisorController.obtenerNombreComercialPorId (idsucursal);

        const response = await Usuario.obtenerGrupoEnComun(idusuario);
        const {GrupoEnComun} = response[0]
        const sucursales = await Emisor.obtenerSurcursalesPorGrupoEnComun(GrupoEnComun);

        console.log("sucursales",sucursales.length)
        let logo = null;


        const token = jwt.sign({
            fecha: Date.now(),
            id: idsucursal,
            uid: idusuario,
            consecutivo,
            permiso: permiso[0].descripcion
        }, process.env.KEY, { //luego se le pasa una llave secreta que va firmar el token,
            //la palabra secreta se usa tambien para verificar que cuando se hace una peticion 
            //al servidor, el token sea valido

            //luego se le indica el tiempo de validez del token

            expiresIn: '2h' //vencimiento en una hora
        });

        /*
               if(!sucursal.logo || sucursal.logo.length === 0) {
                //sucursal.log = //http://localhost:5000/usuario.jpeg
                if(req.headers.host == 'localhost:5000') {
                    img = 'http://'+req.headers.host+'/usuario.jpeg'
                } else {
                    img = 'https://'+req.headers.host+'/usuario.jpeg'
                }
                sucursal.logo= img;

            }
        }
        
        */
        
        if(!usuario[0].logo || usuario[0].logo.length === 0){

            //sucursal.log = //http://localhost:5000/usuario.jpeg
            if(req.headers.host == 'localhost:5000') {
                logo = 'http://'+req.headers.host+'/usuario.jpeg'
            } else {
                logo = 'https://'+req.headers.host+'/usuario.jpeg'
            }
            
        }else {
            logo = usuario[0].logo;
        }
        res.status(200).json({
            permiso:permiso[0].descripcion,
            message: 'Autenticado',
            token,
            usuario: usuario[0].usuario,
            nombrecomercial: !nombre[0].emisor_nombrecomercial || nombre[0].emisor_nombrecomercial == ''? nombre[0].emisor_nombre: nombre[0].emisor_nombrecomercial ,
            imagen: logo,
            sucursales: sucursales.length
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    }
}
//obtenerGrupoEnComunFlogi