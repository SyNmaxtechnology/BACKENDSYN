const Emisor = require("../models/Emisor");
const multer = require('multer');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { google } = require("googleapis");
//const _ = require("underscore");
const cloudinary = require("cloudinary");
const readline = require("readline");
const axios = require("axios");
const Jimp = require('jimp');
const { validarExpiracionArchivoP12, generarAuthToken } = require("../functions/FacturaElectronica")
const UsuarioController = require("./UsuariosController");
const TipoImpuestoController = require("./TipoImpuestoController");
const { obtenerBodegaPorIdUsuario } = require("./BodegaController");

//const { reject } = require("underscore");

require("dotenv").config({ path: './../variables.env' });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});

const recortarImagen = (entrada, salida) => {

    return new Promise((resolve, reject) => {
        Jimp.read(entrada, (err, lenna) => {
            if (err) return reject(err);
            lenna
                .resize(50, 50) // resize
                .quality(60) // set JPEG quality
                .write(salida); // save

            resolve(salida);
        });
    })
}

const subirImagenCloudinary = (ruta) => {

    return new Promise((resolve, reject) => {

        cloudinary.uploader.upload(ruta, (result, err) => {
            if (err) {
                console.log("error cloudinary :")
                console.log(err);
                reject(new Error('No se pudo cargar la imagen en el servidor'));
            } else {
                console.log("result ", result);
                const { secure_url, public_id } = result;
                resolve({ secure_url, public_id })
            }
        }, {
            folder: process.env.LOGO_UPLOAD_PATH,
            use_filename: true
        })
    })
}

exports.subirFileP12 = (req, res, next) => {
    upload(req, res, function (error) {


        if (typeof req.files.file_p12 === 'undefined') {
            return res.status(400).json({
                message: 'El archivo de extensión p12 es necesario para la firma de los comprobantes electrónicos'
            })
        } else {

            if (error) {
                if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            err: 'El tamaño es demasiado grande. Máximo 1 MB'
                        })
                    } else {
                        return res.status(500).json({ 'err': error.message });
                    }

                } else if (error.hasOwnProperty('message')) {
                    // no es un error del multer
                    return res.status(500).json({
                        'error': error.message
                    })
                }

            } else {
                console.log(req.file);
                return next();
            }
        }
    })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "file_p12") {

            cb(null, __dirname + '/../public/p12_files/')
        }
        else {
            cb(null, __dirname + '/../public/img_productos/')
        }
    },
    filename: (req, file, next) => {
        console.log("cedula", req);
        if (file.fieldname === "file_p12") {
            let filename = Date.now();
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo

            filename = filename + '.p12';
            next(null, filename);
        }
        else {

            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo
            let filename = 'LogoEmisor_' + Date.now();
            filename = filename + '.' + ext;

            next(null, filename);
        }
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, next) => {
        checkFileType(file, next);
    }
}).fields(
    [
        {
            name: 'file_p12',
            maxCount: 1
        },
        {
            name: 'logo', maxCount: 1
        }
    ]
);

function checkFileType(file, next) {
    if (file.fieldname === "file_p12") {
        const ext = file.mimetype.split('/')[1]; //
        if (ext === 'x-pkcs12') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para llave criptográfica'), false);
        }
    }
    else {
        const ext = file.mimetype.split('/')[1]; //

        if (ext === 'jpeg' || ext === 'png') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para imagen'), false);
        }
    }

}

exports.subirFileP12Actualizar = (req, res, next) => {
    upload(req, res, function (error) {

        if (!req.files) {
            return next();
        } else {

            if (error) {
                if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            err: 'El tamaño es demasiado grande. Máximo 1 MB'
                        })
                    } else {
                        return res.status(500).json({ 'err': error.message });
                    }

                } else if (error.hasOwnProperty('message')) {
                    // no es un error del multer
                    return res.status(500).json({
                        'error': error.message
                    })
                }

            } else {
                console.log(req.file);
                return next();
            }
        }
    })
}

//____________________________________________FIN FUNCIONES PARA SUBIR ARCHIVO P12 ______________________________________________


//____________________________________________ FIN DE FUNCIONES PARA SUBIR IMAGEN DE EMISOR____________________________

exports.guardarEmisor = async (req, res) => {

    try {


        const { emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo, pos, activaCabys, autorizaSaldo, cerca_perimetral, correo_administrativo, notas_emisor, token_emisor } = req.body;

        let obj = { emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, file_p12: '', pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, pos, logo: '', public_id: '', activaCabys, autorizaSaldo, cerca_perimetral: cerca_perimetral == 'null' || cerca_perimetral == '' || !cerca_perimetral ? 30 : cerca_perimetral, correo_administrativo: correo_administrativo.trim(), notas_emisor, token_emisor };

        if (req.files.file_p12) { //carga el archivo p12
            let file_p12 = '';
            file_p12 = req.files.file_p12[0].filename;

            //const rutaFileP12 = __dirname + '/../public/p12_files/'+file_p12;
            obj.file_p12 = file_p12;

            //const subirImagenCloudinaryResponse = await subirImagenCloudinary(rutaFileP12);
            //const {secure_url,public_id} =subirImagenCloudinaryResponse;

            // secure_urlp = secure_url;
            //public_idp = public_id;

            /*  fs.stat(rutaFileP12, function(err) {
                  
                  if(err){
                      if (err.code === 'ENOENT') {
                          console.log("EL archivo p12 anterior no existe")
                      } else {
                          console.log("Error al eliminar el archivo p12 anterior")
                      }
                  } else {
                      fs.unlink(rutaFileP12,err => {
                          if(err){
                              console.log(err);
                              throw new Error(err)
                          } else {
                              console.log("archivo p12 eliminado");
                          }
                      });
                      //const dataFile = fs.createReadStream(rutaFileP12);
                      //const Filename =file_p12;
                  
                      //authorize(auth,storeFiles,dataFile,Filename)
                      //console.log("pasó por aquí")   
                  }
              });   */
        }

        if (req.files.logo) {
            let logo = '';
            logo = req.files.logo[0].filename;
            const entrada = __dirname + '/../public/img_productos/' + logo;
            const salida = __dirname + '/../public/img_productos/recortadas/' + logo;
            //const recortarImagenSalida = await recortarImagen(entrada,salida);

            const imagenSubidaResponse = await subirImagenCloudinary(entrada);
            console.log("imagen subida ", imagenSubidaResponse);
            const { secure_url, public_id } = imagenSubidaResponse;

            obj.logo = secure_url;
            obj.public_id = public_id;

            fs.stat(entrada, function (err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('La imagen no existe');
                    } else {
                        console.log('Error al eliminar la imagen anterior');
                    }
                } else {

                    fs.unlink(entrada, err => {
                        if (err) {
                            console.log(err);
                            throw new Error(err)
                        } else {
                            console.log("imagen1 eliminada");
                        }
                    });
                }
            });

            fs.stat(salida, function (err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('La imagen no existe');
                    } else {
                        console.log('Error al eliminar la imagen anterior');
                    }
                } else {

                    fs.unlink(salida, err => {
                        if (err) {
                            console.log(err);
                            throw new Error(err)
                        } else {
                            console.log("imagen2 eliminada");
                        }
                    });
                }
            });
        }

        console.log(obj);
        const responseEmisor = await Emisor.guardarEmisor(obj);
        const impuestos = await TipoImpuestoController.agregarImpuestosEmisor(responseEmisor.insertId);

        console.log(responseEmisor);
        if (responseEmisor.affectedRows > 0) {

            console.log("creó el emisor")

            if (impuestos.affectedRows > 0)
                res.status(200).json({ message: 'La información del emisor se ha guardado correctamente' });
            else
                res.status(400).json({ message: 'No se crearon los impuestos asociados al emisor' });
        } else {
            res.status(400).json({ message: 'No se pudo agregar el nuevo emisor' });
        }

    } catch (error) {

        console.log(error);
        res.status(500).json({
            message: 'Error al agregar el emisor'
        })
    }
}

exports.actualizarEmisor = async (req, res) => {
    const { id } = req.params;
    const { emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo, pos, activaCabys, autorizaSaldo, cerca_perimetral, correo_administrativo, notas_emisor, token_emisor } = req.body;

    let file_p12 = '';
    if (req.file) { //si cargó una imagen, la actualiza 
        file_p12 = req.file.filename;
    }
    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        //const idusuario = decodedToken.uid;

        const obj = {
            // idusuario,
            emisor_nombre,
            emisor_nombrecomercial,
            emisor_tipo_identificacion,
            cedula_emisor,
            numero_emisor,
            emisor_barrio,
            emisor_otras_senas,
            emisor_telefono_codigopais,
            emisor_telefono_numtelefono,
            emisor_fax_codigopais,
            emisor_fax_numtelefono,
            emisor_correo,
            file_p12,
            pin_p12,
            key_username_hacienda,
            key_password_hacienda,
            casaMatriz,
            puntoVenta,
            codigo_actividad,
            tipo_codigo_servicio,
            codigo_servicio,
            Client_ID,
            API,
            TOKEN_API,
            numeroresolucion,
            fecharesolucion,
            logo,
            public_id: '',
            pos,
            activaCabys,
            autorizaSaldo,
            cerca_perimetral: cerca_perimetral == '' ? 30 : cerca_perimetral,
            correo_administrativo: correo_administrativo.trim(),
            notas_emisor,
            token_emisor,
            id
        }


        if (req.files.file_p12) { //carga el archivo p12cerca

            console.log(req.files.file_p12[0])
            let file_p12 = '';
            file_p12 = req.files.file_p12[0].filename;
            obj.file_p12 = file_p12;
            const p12Anterior = await Emisor.obtenerArchivoP12(id);

            if (p12Anterior) {

                const rutaFileP12 = __dirname + '/../public/p12_files/' + p12Anterior[0].file_p12;
                fs.stat(rutaFileP12, function (err) {

                    if (err) {
                        if (err.code === 'ENOENT') {
                            console.log("EL archivo p12 anterior no existe")
                        } else {
                            console.log("Error al eliminar el archivo p12 anterior")
                        }
                    } else {
                        fs.unlink(rutaFileP12, err => {
                            if (err) {
                                console.log(err);
                                throw new Error(err)
                            } else {
                                console.log("archivo p12 eliminado");
                            }
                        });
                    }
                });
            }
        } else {
            const p12Anterior = await Emisor.obtenerArchivoP12(id);
            obj.file_p12 = p12Anterior[0].file_p12;
        }

        if (req.files.logo) {

            const logoAnterior = await Emisor.obtenerPublicId(id);

            if (logoAnterior[0].public_id) {
                console.log("entró")
                cloudinary.v2.uploader.destroy( // eliminar imagen de cloudinary
                    logoAnterior[0].public_id,
                    {
                        invalidate: true
                    },
                    function (err, result) {
                        if (err) {
                            console.log("Error al eliminar la imagen de cloudinary")
                            console.log(err);
                            console.log('No se pudo actualizar la imagen');
                        } else {
                            console.log("Imagen eliminada ");
                            console.log(result)
                        }
                    }
                );
            }

            let logo = '';
            logo = req.files.logo[0].filename;
            const entrada = __dirname + '/../public/img_productos/' + logo;
            const salida = __dirname + '/../public/img_productos/recortadas/' + logo;
            //const recortarImagenSalida = await recortarImagen(entrada,salida);

            const imagenSubidaResponse = await subirImagenCloudinary(entrada);
            console.log("imagen subida ", imagenSubidaResponse);
            const { secure_url, public_id } = imagenSubidaResponse;

            obj.logo = secure_url;
            obj.public_id = public_id;

            fs.stat(entrada, function (err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('La imagen no existe');
                    } else {
                        console.log('Error al eliminar la imagen anterior');
                    }
                } else {

                    fs.unlink(entrada, err => {
                        if (err) {
                            console.log(err);
                            throw new Error(err)
                        } else {
                            console.log("imagen1 eliminada");
                        }
                    });
                }
            });

            fs.stat(salida, function (err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('La imagen no existe');
                    } else {
                        console.log('Error al eliminar la imagen anterior');
                    }
                } else {

                    fs.unlink(salida, err => {
                        if (err) {
                            console.log(err);
                            throw new Error(err)
                        } else {
                            console.log("imagen2 eliminada");
                        }
                    });
                }
            });

        } else {
            const logoAnterior = await Emisor.obtenerLogo(id);
            const public_id_anterior = await Emisor.obtenerPublicId(id);
            obj.logo = logoAnterior[0].logo;
            obj.public_id = public_id_anterior[0].public_id;
        }

        console.log(obj);

        const respuesta = await Emisor.actualizarEmisor(obj);
        const { affectedRows } = respuesta;

        if (affectedRows > 0) {
            return res.status(200).json({
                message: 'La información del emisor se ha actualizado correctamente'
            });
        } else {
            return res.status(400).json({
                message: 'No se pudo actualizar la informacion del emisor'
            })
        }

    } catch (error) {

        const { errno } = error;

        if (errno == 1048) {
            return res.status(500).json({
                message: 'Todos los campos son requeridos'
            })
        } else {
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        }
    }
}

exports.obtenerEmisor = (req, res) => {
    const { query } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idusuario = decodedToken.uid;
    const obj = {
        query
    }
    Emisor.obtenerEmisor(obj)
        .then(emisor => {
            console.log("LLEGO");
            console.log(emisor);
            if (emisor[0]) return res.status(200).json({ emisor });
            else return res.status(404).json({
                message: 'No hay resultados'
            });
        }).catch(err => {
            res.status(500).json({ err });
        });
}


exports.obtenerCredencialesParaRecepcion = (idfactura) => {
    return Emisor.obtenerCredencialesHaciendaParaRecepcion(idfactura);
}

exports.cargarEmisor = (req, res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    Emisor.cargarEmisor(idemisor).then(Emisor => {
        return res.status(200).json({
            emisor: Emisor[0]
        })
    })
        .catch(err => {
            console.log(err);

            return res.status(500).json({
                message: 'Error al cargar el emisor'
            })
        })
}

exports.existeEmisor = (id) => {
    return Emisor.existeEmisor(id);
}


exports.obtenerEmisores = (req, res) => {
    Emisor.obtenerEmisores().then(response => {
        console.log(response);
        res.status(200).json({
            emisores: response
        })
    })
        .catch(err => {
            console.log(err);

            return res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        })
}

exports.listarEmisores = (req, res) => {

    Emisor.listarEmisores().then(response => {
        res.status(200).json({
            emisores: response
        })
    })
        .catch(err => {
            console.log(err);

            return res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        })
}

exports.actualizarEstado = (req, res) => {

    const { estado, idemisor } = req.body;
    Emisor.actualizarEstado({
        idemisor,
        estado
    }).then(response => {
        if (response.length === 0) {
            res.status(400).json({
                message: 'No se pudo actualizar el estado'
            })
        } else {

            res.status(200).json({
                message: 'actualizado'
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

exports.obtenerIdEmisorPorCedula = (cedula) => {

    return Emisor.obtenerIdEmisorPorCedula(cedula);
}


exports.validarClaveActivacionProforma = (idemisor, clave) => {

    return Emisor.validarClaveActivacionProforma({ idemisor, clave });
}

exports.obtenerNombreEmisor = (idemisor) => {
    return Emisor.obetnerNombreEmisor(idemisor);
}

exports.obtenerCercaPerimetral = (req, res) => {
    console.log("cerca");
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    Emisor.obtenerCercaPerimetral(idemisor)
        .then(response => res.status(200).json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al obtener la cerca perimetral'
            })
        })
}

exports.validarExpiracionArchivoP12 = (req, res) => {
    console.log("validar archivo p12")
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    Emisor.obtenerCredencialesLlaveCriptograficaParaValidacion(idemisor).then(llave => {
        const { file_p12, pin_p12 } = llave[0];
        validarExpiracionArchivoP12(file_p12, pin_p12).then(({ expiresOn }) => {
            //const fechaExpiracion = expiresOn.substr(0,9).replace('T','');
            Emisor.actualizarEstado({ idemisor, estado: 1 }).then(response => {
                if (response.affectedRows === 0) {
                    console.log("No se pudo actualizar el estado del emisor")
                } else {
                    console.log("Se ha actualizado el estado del emisor que trae el p12")
                }
            }).catch(err => {
                console.log(err);
            })
            res.status(204).json();
        })
            .catch(err => {
                if (err === 'No se pudo obtener la informacion de la llave criptográfica') {
                    Emisor.actualizarEstado({ idemisor, estado: 2 }).then(response => {
                        if (response.affectedRows === 0) {
                            console.log("No se pudo actualizar el estado del emisor por falla del p12")
                        } else {
                            console.log("Se ha actualizado el estado del emisor")
                        }
                    })
                        .catch(err => {
                            console.log(err);
                        })
                }
                res.status(200).json({
                    message: err,
                    error: true
                })
            })
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al obtener la información de la llave criptográfica'
            })
        })
}

exports.obtenerCorreoAdministrativo = (idemisor) => Emisor.obtenerCorreoAdministrativo(idemisor);

exports.cargarDatosGlobales = (req, res) => {

    Emisor.cargarDatosGlobales().then(response => {

        res.status(200).json(response[0])
    })
        .catch(err => {

            console.log(err);

            res.status(500).json({
                message: 'Error al cargar los datos globales de la información del emisor'
            })
        })
}

exports.estadoMultiSucurusal = (idemisor) => Emisor.estadoMultisucursal(idemisor);
exports.obtenerIdEmisorPorNombreComercial = (idemisor) => Emisor.obtenerIdEmisorPorNombreComercial(nombreComercial);
exports.obtenerCedulaPorId = (idemisor) => Emisor.obtenerCedulaPorId(idemisor);

exports.obtenerSurcursalesPorId = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const response = await UsuarioController.obtenerGrupoEnComun(idusuario);
        const { GrupoEnComun } = response[0]
        const sucursales = await Emisor.obtenerSurcursalesPorGrupoEnComun(GrupoEnComun);

        let img = '';
        for (const sucursal of sucursales) {
            console.log(sucursal.logo)
            if (!sucursal.logo || sucursal.logo.length === 0) {
                //sucursal.log = //http://localhost:5000/usuario.jpeg
                if (req.headers.host == 'localhost:5000') {
                    img = 'http://' + req.headers.host + '/usuario.jpeg'
                } else {
                    img = 'https://' + req.headers.host + '/usuario.jpeg'
                }
                sucursal.logo = img;

            }
        }

        res.status(200).json(sucursales);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error al cargar las sucursales'
        })
    }
}

exports.obetnerNombreEmisor = (idemisor) => Emisor.obetnerNombreEmisor(idemisor);
exports.obtenerNombreComercialPorId = (idemisor) => Emisor.obtenerNombreComercialPorId(idemisor);
exports.validarDatosDeGeneracionDeToken = async (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    try {

        const data = await Emisor.obtenerDatosDeToken(idemisor);
        data[0].userAgent = '';
        const obj = {
            objToken: data[0]
        }

        const response = await Emisor.actualizarEstado({ idemisor, estado: 1 });

        if (response.affectedRows === 0) {
            console.log("No se pudo actualizar el estado del emisor por falla de credenciales del token")
        } else {
            console.log("Se ha actualizado el estado del emisor")
        }

        await generarAuthToken(obj);

        res.status(204).json();
    } catch (error) {
        if (error.response.status === 401) {

            Emisor.actualizarEstado({ idemisor, estado: 0 }).then(response => {
                if (response.affectedRows === 0) {
                    console.log("No se pudo actualizar el estado del emisor por falla del p12")
                } else {
                    console.log("Se ha actualizado el estado del emisor")
                }
            })
                .catch(err => {
                    console.log(err);
                })

            return res.status(400).json({
                message: 'Los credenciales de generación de token para envío de comprobantes al ministerio de hacienda están incorrectos'
            });
        }

        return res.status(500).json({
            message: 'Hubo un error en el servidor'
        });
    }
}

exports.obtenerBodegas = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;

        const bodegas = await Emisor.obtenerBodegas(idemisor);
        const bodegausuario = await obtenerBodegaPorIdUsuario(idusuario);

        return res.status(200).json({
            bodegas,
            bodegaUsuario: bodegausuario[0].idbodega,
            idemisor
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    }
}


exports.obtenerTokenEmisor = token => Emisor.obtenerTokenEmisor(token); //obtenerIdEmisorPorPrioridadActivada
exports.obtenerIdEmisorPorPrioridadActivada = () => Emisor.obtenerIdEmisorPorPrioridadActivada(); //obtenerIdEmisorPorPrioridadActivada

exports.actualizarPrioridad = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;

        const { params: { prioridad } } = req;

        const { affectedRows } = await Emisor.actualizarPrioridad({ idemisor, prioridad });
        const prioridadResponse = await Emisor.obtenerEstadoPrioridadPorId(idemisor);
        console.log(affectedRows);
        if (affectedRows > 0) {
            return res.status(200).json({
                message: 'La prioridad del emisor ha sido actualizada',
                prioridad: prioridadResponse[0].prioridad
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo actualizar la prioridad del emisor'
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'No se pudo actualizar la prioridad del emisor' });
    }
}
//obtenerNombreComercialPorId
/*
    const configFileImage = {
    limits: { fileSize: 100000 }, //limitar tamaño de imagen a 100 kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { // donde se va subir la imagen
            next(null, __dirname + '/../public/logoEmisor/');
        },
        filename: (req, file, next) => {
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo
            let filename = 'LogoEmisor_' + req.body.cedula_emisor;
            filename = filename + '.' + ext;

            next(null, filename);
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

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {

        if (error) {
            if (error instanceof multer.MulterError) { // si el error es una instancia de MulterError
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(500).json({
                        err: 'El tamaño es demasiado grande. Máximo 100KB'
                    });
                } else {
                    return res.status(500).json({
                        err: error.message
                    });
                }
            } else if (error.hasOwnProperty('message')) { // si el objeto error contiene la propiedad
                //message.
                return res.status(500).json({
                    err: error.message
                });
            }
        } else {
            next();
        }
    })
}

const upload = multer(configFileImage).single('logo');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});


const subirImagenCloudinary = (ruta)  => {

    return new Promise((resolve,reject) => {

        cloudinary.uploader.upload(ruta,(err,result) => {
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
        folder: 'public/p12/',
        use_filename: true
        })
    })
}


*/


/*const configFileP12 = {
    limits: { fileSize: 50000 }, //limitar tamaño de imagen a 100 kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { // donde se va subir la imagen
            next(null, __dirname + '/../public/p12_files/');
        },
        filename: (req, file, next) => {

            let filename = req.body.cedula_emisor;
            const ext = file.mimetype.split('/')[1]; // obtener tipo de archivo

            filename = filename + '.p12';
            next(null, filename);
        }
    }),
    //filtrar formatos de imagen
    fileFilter: (req, file, next) => {

        const ext = file.mimetype.split('/')[1]; //
        if (ext === 'x-pkcs12') {
            next(null, true); // el archivo se acepta
        } else {
            next(new Error('Formato no válido para llave criptográfica'), false);
        }
    }
}

const uploadFileP12 = multer(configFileP12).single('file_p12');
//.single porque solo se va subir una cosa a la vez y el texto imagen porque es el name
// del campo html donde viene la imagen






const auth = require("./../googleAPIConfig/credenciales.json").web;
const {client_secret, client_id, redirect_uris} = auth;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const jWTClient = new google.auth.OAuth2(
    client_secret, client_id, redirect_uris[0]
);
const TOKEN_PATH = 'token.json';
const drive = google.drive({ version: "v3", auth: jWTClient });

 function authorize(auth) {

    return new Promise((resolve,reject) => {

        const {client_secret, client_id, redirect_uris} =auth;
        const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

        fs.readFile(TOKEN_PATH, (err, token) => {
        if (err)
        {
            resolve(getAccessToken(oAuth2Client));

        }else {
            oAuth2Client.setCredentials(JSON.parse(token))
            resolve(oAuth2Client);
        }
        //callback(oAuth2Client,dataFile,Filename,obj);
        });
    })
  }



  function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    axios.get(authUrl).then(response => console.log("Response ",response));
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        console.log("code ",code);
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
          console.log(token);
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);

        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
        });
        console.log("GET TOKEN ",oAuth2Client );
        return oAuth2Client;
        //callback(oAuth2Client,dataFile,Filename);
      });
    });
  }


  function storeFiles(auth,dataFile,filename) {
    return new Promise((resolve,reject) => {
        console.log("auth", JSON.stringify(auth));
        console.log("dataFile ", dataFile);
        console.log("----------------------------------")
        console.log("filename ",filename);
        const drive = google.drive({version: 'v3', auth});
        const fileMetadata = {
            'name': Date.now()+'.p12',
            parents: ['1j-PfFqYF-YlolqA1v_Qs6zEIRVcPE709']
        };
        const media = {
            mimeType: 'application/x-pkcs12',
            body: dataFile
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                reject(err);
            } else {
                resolve(file.data.id);
            }
        });
    })
  }
//https://drive.google.com/file/d/ 1Y8gBTPIgM1wmfyWYlx89v_pYnxnYT0BW/view
// aqui cargo el id para obtener el archivo .p12
// ---------------------------------------------------------------------------------
const subirArchivosAGoogleDrive = (dataFile, Filename) => {
    console.log(" funcion google");
    drive.files.create({
            requestBody: {
                name: Filename,
                mimeType: 'application/x-pkcs12'
            },
            media:{
                mimetype: 'application/x-pkcs12',
                body: dataFile
            },
            resource: {
                // if you want to store the file in the root, remove this parents
                parents: [auth.folder_id]
            },
            fields: 'id'
    }).then(function (resp) {
        console.log("respuesta");
        console.log(resp,'resp');
    }).catch(function (error) {
        console.log("Error");
        console.log(error);
    })
}
*/



