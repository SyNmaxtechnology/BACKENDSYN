const passport = require("passport");
const localStrategy = require("passport-local");
const Emisor = require("../models/Emisor");
const Usuario = require("../models/Usuario"); //com111111111

passport.use(new localStrategy({
    usernameField: 'usuario',
    passwordField: 'contrasena'
}, async(email, password, done) => {

    try {
        
        const datos = await Usuario.obtenerPermisoYUsuario(email)
        if(datos.length === 0){
            return done({message: 'El usuario no existe',code: 403}, false);
        } else {

            const permiso = datos[0].permiso;
            const pwd = datos[0].contrasena;
            const usuario = datos[0].usuario;
            const imagen = datos[0].logo;

            if(permiso === 'superusuario' ){
                const match = await Usuario.compararContrasena(password, pwd);
                if(!match){
                    return done({message: 'Contraseña o usuario incorrectos',code: 401}, false);
                
                } else {
                    return done(null, {
                        usuario,
                        permiso,
                        imagen
                    });
                }
            } else {

                    const usuario = await Usuario.autenticarUsuario(email);
                    if (!usuario[0]) return done({message: 'El usuario no existe',code: 403}, false);
                    else {
                        const match = await Usuario.compararContrasena(password, usuario[0].contrasena);
                        if (!match) {
                            return done({message: 'Contraseña o usuario incorrectos',code: 401}, false)
                        } else {
                            console.log(usuario[0]);
                            if(usuario[0].estado_emisor === 1){
                                const response = await Usuario.obtenerGrupoEnComun(usuario[0].id);
                                if(response[0].GrupoEnComun && response[0].GrupoEnComun.toString().length > 0){
                                    const sucursales = await Emisor.obtenerSurcursalesPorGrupoEnComun(response[0].GrupoEnComun)
                                    delete usuario[0].contrasena;  // devolver la instancia del usuario logueado pero sin la contraseña
                                    return done(null, {usuario,sucursales});
                                } else {
                                    return done(null, {usuario,sucursales:[]});
                                }
                            } else {
                                return done({message: 'La cuenta no está habilitada',code: 403}, false);
                            }
                        }
                    }
                }
            }
    } catch(err){
        console.log("Se ha generado un error en el servidor ", err);
        return done({message: 'Ha ocurrido un error en el servidor',code: 500}, false);
    }
}))

module.exports = passport;
