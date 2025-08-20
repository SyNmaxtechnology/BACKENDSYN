const passport = require("passport");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const convert = require("xml-js");
const TipoCambioController = require("./TipoCambioController");
const fecha = require("../db/fecha");
const funciones = require("../functions/Factura");

require("dotenv").config({ path: '../variables.env' });

exports.autenticarUsuario = (req, res, next) => {

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            console.log(err);
            const { code, message } = err;

            if (code === 403) {
                return res.status(403).json({
                    message
                })
            }
            if (code === 401) {
                return res.status(401).json({
                    message
                })
            } else {

                return res.status(501).json({
                    message: err
                })
            }
        } else {


            //console.log("Entró a loguearse")
            funciones.obtenerTipoCambio()
            .then(async respose => {

                try {

                    const xml = respose;
                    const fechaSubstr = fecha().toString().substring(0,10) 
                    let dataTipoCambio = convert.xml2json(xml, {compact: true, spaces: 4});
                    let tipoCambioActual = 1;
                    let valorTipoCambio = '';
                    dataTipoCambio = JSON.parse(dataTipoCambio);
                    if(typeof dataTipoCambio.DataSet === 'undefined' || dataTipoCambio.DataSet == null ){
                        console.log("entró 1")
                        tipoCambioActual  = '1.00';
                    } else {
                        console.log("entró 2")
                        valorTipoCambio = dataTipoCambio.DataSet['diffgr:diffgram']['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']._text;
                        tipoCambioActual = Number(valorTipoCambio).toFixed(2);
                        
                    }
                    const nuevoTipoCambio = await TipoCambioController.agregarTipoCambio({
                        fecha: fechaSubstr,
                        tipocambio: tipoCambioActual});
                    
                    if(nuevoTipoCambio !== null){ // agregó el tipo de cambio
                        if(nuevoTipoCambio.affectedRows > 0){
                            console.log("Se ha agregado el tipo de cambio");
                        } else {
                            console.log("No se ha agregado el tipo de cambio");
                        }
                    } else {
                        console.log("Existe un tipo de cambio para la fecha actual")
                    }
                } catch(err){

                    console.log("err ",err);
                    console.log("error al insertar el tipo de cambio")
                }
            })
            .catch(err => {
                console.log(err);
                const fechaSubstr = fecha().toString().substring(0,10);
                
                TipoCambioController.agregarTipoCambio({tipocambio: '1.00', fecha: fechaSubstr}).then(response => {
                    if(response.affectedRows > 0){
                        console.log("tipo cambio agregado")
                    } else {
                        console.log("No se pudo agregar el tipo de cambio")
                    }    
                })
                .catch(err => {
                    console.log("error ", err);
                }) //error
            })

            if(user.permiso === 'superusuario'){

                //obtener los permisos de cada usuario
                console.log("Super usuario");
                const consecutivo = crypto.randomBytes(50).toString('hex');
                const token = jwt.sign({
                    fecha: Date.now(),
                    consecutivo,
                    usuario: user.usuario,
                    permiso: user.permiso
                }, process.env.KEY, { //luego se le pasa una llave secreta que va firmar el token,
                    //la palabra secreta se usa tambien para verificar que cuando se hace una peticion 
                    //al servidor, el token sea valido
                    //luego se le indica el tiempo de validez del token
                    expiresIn: '2h' //vencimiento en una hora
                });

                res.status(200).json({
                    message: 'Autenticado',
                    permiso: user.permiso,
                    usuario: user.usuario,
                    token,
                    imagen: user.imagen 
                })

            }  else {
                console.log("Integrador, facturador o ruteo1");
                //aqui se envia el token
                console.log("idusuario",user.usuario[0].id);
                

                const data = user;
                const consecutivo = crypto.randomBytes(50).toString('hex');
                console.log("idemisor",data.usuario[0].id);


                let logo = null;
        
                if(!user.imagen || user.imagen.length === 0){

                    //sucursal.log = //http://localhost:5000/usuario.jpeg
                    if(req.headers.host == 'localhost:5000') {
                        logo = 'http://'+req.headers.host+'/usuario.jpeg'
                    } else {
                        logo = 'https://'+req.headers.host+'/usuario.jpeg'
                    }
                    
                }else {
                    logo = user.imagen;
                }
                
                const token = jwt.sign({
                    fecha: Date.now(),
                    id: data.usuario[0].idemisor,
                    uid: data.usuario[0].id,
                    consecutivo,
                    permiso: data.usuario[0].permiso
                }, process.env.KEY, { //luego se le pasa una llave secreta que va firmar el token,
                    //la palabra secreta se usa tambien para verificar que cuando se hace una peticion 
                    //al servidor, el token sea valido

                    //luego se le indica el tiempo de validez del token

                    expiresIn: '2h' //vencimiento en dos horas
                });
                console.log("token ", token);
                console.log("imagen ", logo);
                res.status(200).json({
                    message: 'Autenticado',
                    token,
                    permiso: data.usuario[0].permiso,
                    imagen: data.usuario[0].imagen,
                    usuario: data.usuario[0].usuario,
                    nombrecomercial: data.usuario[0].emisor_nombrecomercial == null ? '' : data.usuario[0].emisor_nombrecomercial,
                    sucursales: data.sucursales.length,
                    imagen: logo
                })
            }
        }
    })(req, res, next);
}
