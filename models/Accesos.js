const { reject } = require("bcrypt/promises");
const pool = require("./../db/config");
const Usuario = require("./Usuario");


const agregarAcceso = (obj) => { //comentario de prueba 12341

    return new Promise((resolve,reject) => {

        const {idusuario,modulo,submenu,activo} = obj;

        pool.query(`
            INSERT INTO Accesos(idusuario,modulo,submenu,activo) VALUES(?,?,?,?)
        `,[idusuario,modulo,submenu,activo],(err,rows,fields) => {
            if(err){
                throw new Error(err);
            }

            resolve(rows);
        })
    }) 
} 


const actualizarAcceso = (obj) => {

    return new Promise((resolve,reject) => {

        const {id,usuario,codigo,sistema} = obj;

        pool.query(`
            UPDATE Accesos SET login= ?, sistema=?, codigo=? WHERE id =? 
        `,[usuario,sistema,codigo,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    }) 
} 

const obtenerAccesos = (usuario) => {

    return new Promise((resolve,reject) => {
        pool.query(`
        SELECT id,codigo, sistema,activo FROM Accesos WHERE login = ?
        `,[usuario],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerAccesoPorId = (id) => {

    return new Promise((resolve,reject) => {
        pool.query(`
        SELECT id,codigo, sistema,login FROM Accesos WHERE id = ?
        `,[id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const existenAccesosPorIdUsuario = (idusuario) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT id FROM Accesos WHERE idusuario = ?
        `,[idusuario],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const actualizarEstadoAcceso = (obj) => {

    return new Promise((resolve,reject) => {
        const {id, activo, idusuario} = obj;

        pool.query(`
            UPDATE Accesos SET activo =  ? WHERE id = ? AND idusuario = ?
        `,[activo,id,idusuario],(err,rows,fields) => {
            if(err){
                throw new Error(err);
            }

            resolve(rows);
        })
    })
}

const actualizarAccesosUsuario = (array) => {
    
    return new Promise((resolve,reject) => {

        const {idusuario} = array[0];
        existenAccesosPorIdUsuario(idusuario).then( response => {
            if(response.length === 0){
                for(let arr of array){
                    agregarAcceso(arr).then(response => {
                        if(response.affectedRows === 0){
                            throw new Error('Hubo un error al guardar los accesos')
                        } else {
                            console.log("Acceso agregado")
                        }
                    }) .catch(err => {throw new Error(err)});
                }
                
                resolve(true)
            
            } else {
                for(let arr of array){
                    actualizarEstadoAcceso(arr).then(response => {
                        if(response.affectedRows === 0){
                            throw new Error('Hubo un error al guardar los accesos')
                        } else {
                            console.log("Acceso actualizado")
                        }
                    }) .catch(err => {throw new Error(err)});
                }

                resolve(true)
            }
        })
        .catch(err => reject(err));
    })

}

module.exports = {
    agregarAcceso,
    actualizarAcceso,
    obtenerAccesos,
    actualizarEstadoAcceso,
    obtenerAccesoPorId,
    actualizarAccesosUsuario
}
