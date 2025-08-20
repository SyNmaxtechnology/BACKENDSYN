const pool = require("../db/config");
let Consecutivo = {};


//comen1
Consecutivo.agregarConsecutivosEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) 
            VALUES (${idemisor} ,'NC', '0000000001'),(${idemisor} ,'FA', '0000000001'),
            (${idemisor} ,'TK', '0000000001'),(${idemisor} ,'FC', '0000000001'),
            (${idemisor} ,'RE', '0000000001');
        `,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Consecutivo.agregarConsecutivo = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, tipoconse,consecutivo,tipoFuncion,id } = obj;
        let query = '';

        if(tipoFuncion == 'INSERTAR'){
            query = "INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES("+idemisor+",'"+tipoconse+"','"+consecutivo+"')";
        }

        if(tipoFuncion == 'ACTUALIZAR'){
            query = "UPDATE Consecutivos SET consecutivo = '"+consecutivo+"' WHERE tipoconse='"+tipoconse+"' AND idemisor="+idemisor+"";
        }
        console.log(query);
        pool.query(query,[], (err,rows, fields) => {
                if(err) {
                    return reject(err);
                }
                console.log(rows);
                return resolve(rows);
            })
    })
} 

Consecutivo.obtenerActualConsecutivo = (obj) => {
    
    return new Promise((resolve,reject) => {
        const {idemisor, tipoconse} = obj;

        pool.query('SELECT consecutivo FROM Consecutivos WHERE idemisor= ? AND tipoconse= ? ', 
            [idemisor,tipoconse], (err,rows, fields) => {
                if(err) {
                    return reject(err);
                }
                console.log(rows.length);
                return resolve(rows);
            })
    })
}

Consecutivo.existeTipoConsecutivo = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, tipoconse} = obj;
        console.log({idemisor, tipoconse} )
        pool.query('SELECT id FROM Consecutivos WHERE idemisor=? AND tipoconse= ?',
        [idemisor,tipoconse], (err, rows, fields) => {
            if(err) {
                return reject(err);
            }

            console.log(rows);

            resolve(rows);
        })
    })
}

Consecutivo.actualiarEmisorConsecutivo = (obj) => { //entra tipoconse y idemisor
    //idemisor, tipoconse,consecutivo 
    return new Promise((resolve,reject) => {
        
        let ceros = '0000000000';
        let nuevoConsecutivo = 0;
        let tipoFuncion = '';

        console.log("obj ",obj);

        Consecutivo.obtenerActualConsecutivo(obj)
        .then(consecutivo => {

            Consecutivo.existeTipoConsecutivo(obj)
                .then(existe => {

                    nuevoConsecutivo = Number(consecutivo[0].consecutivo) + 1; 
                   
                    if(existe.length == 0){
                        tipoFuncion = 'INSERTAR';  
                    } else {
                        tipoFuncion = 'ACTUALIZAR';
                    }
                    //SELECT key_username_hacienda,key_password_hacienda, pin_p12,file_p12 FROM Emisor WHERE id = 2;
                    ceros = ceros.substring(0, ceros.length - nuevoConsecutivo.toString().length);
                    nuevoConsecutivo = ceros + nuevoConsecutivo;
                    obj.consecutivo = nuevoConsecutivo;
                    obj.tipoFuncion = tipoFuncion;

                    Consecutivo.agregarConsecutivo(obj)
                    .then(data => {
                        const {affectedRows} = data;
                        if(affectedRows > 0) {
                        
                            resolve(nuevoConsecutivo);
                        }
                    })
                    .catch(err => {
                        console.log("Fallo en traer el consecutivo")
                        reject(err);
                    })
                })
            .catch(err => {
                console.log(err);
                reject(err);
            })
        })
        .catch(err => {
            console.log(err);
            console.log("Fallo en traer el consecutivo")
            reject(err);
        })
    })
}


module.exports = Consecutivo;


/*

console.log(consecutivo);
            if(consecutivo.length == 0){
                nuevoConsecutivo = 1;
                tipoFuncion = 'INSERTAR';  
            } else {
                nuevoConsecutivo = Number(consecutivo[0].consecutivo) + 1; 
               /// obj.id = consecutivo[0].id;
                tipoFuncion = 'ACTUALIZAR';
            }
            
            ceros = ceros.substring(0, ceros.length - nuevoConsecutivo.toString().length);
            nuevoConsecutivo = ceros + nuevoConsecutivo;
            obj.consecutivo = nuevoConsecutivo;
            obj.tipoFuncion = tipoFuncion;
            
            Consecutivo.agregarConsecutivo(obj)
                .then(data => {
                    const {affectedRows} = data;
                    if(affectedRows > 0) {
                       
                        resolve(nuevoConsecutivo);
                    }
                })
                .catch(err => {
                    console.log("Fallo en traer el consecutivo")
                    reject(err);
                })
*/
