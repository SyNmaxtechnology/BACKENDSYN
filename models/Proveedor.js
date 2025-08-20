const pool = require("../db/config");
const axios = require("axios");
let Proveedor = {};

Proveedor.insertarProveedor = (obj) => {
    return new Promise((resolve,reject) => {
        
        const {
            idemisor, 
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
        } = obj;

        pool.query('INSERT INTO Proveedor(idemisor, proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,cedula_proveedor,numero_proveedor,codigo_actividad,identificacion_extranjero,proveedor_barrio,otras_senas,otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,proveedor_fax_numtelefono,proveedor_correo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ', [idemisor, proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,cedula_proveedor,numero_proveedor,codigo_actividad,identificacion_extranjero,proveedor_barrio,otras_senas,otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,proveedor_fax_numtelefono,proveedor_correo],(err, rows, fiedls) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}



Proveedor.buscarProveedorPorClave = (obj) => {
    return new Promise((resolve,reject) => {
        const { idemisor,cedula} = obj;
        pool.query('SELECT id FROM Proveedor WHERE idemisor = ? AND cedula_proveedor =?', [idemisor,cedula],
        (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Proveedor.buscarActividad = (cedula) => {
    return new Promise((resolve,reject) => {
    
   
        const url= 'https://api.hacienda.go.cr/fe/ae?identificacion=' + cedula
        axios.get(url).then(response => {
            resolve(response.data.actividades[0]);
        })
        .catch(err => {
            console.log("err ", err) ;
            reject('Hubo un problema al consultar la actividad');
        })  
    })
}


Proveedor.buscarProveedor = (obj) => {
    return new Promise((resolve,reject) => {
        const { idemisor, query} = obj;
        pool.query('SELECT p.id,p.proveedor_nombre, p.proveedor_nombre_comercial, p.cedula_proveedor, p.proveedor_correo, p.proveedor_telefono_numtelefono from Proveedor p INNER JOIN Emisor e ON p.idemisor = e.id AND e.id = ? AND (p.proveedor_nombre = ? OR p.cedula_proveedor= ?)', [idemisor,query,query], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Proveedor.buscarProveedorPorId = (obj) => {
    
    return new Promise((resolve, reject) => {
        const {idemisor, idproveedor,idusuario} = obj;
        
        pool.query(`
            SELECT p.id, p.proveedor_nombre, p.proveedor_nombre_comercial, p.proveedor_tipo_identificacion,p.cedula_proveedor, 
            p.codigo_actividad, p.identificacion_extranjero, p.otras_senas, p.otras_senas_extranjero, 
            p.proveedor_telefono_codigopais,p.proveedor_telefono_numtelefono, p.proveedor_fax_codigopais, 
            p.proveedor_fax_numtelefono,p.proveedor_correo,b.provincia, b.canton, b.distrito, b.CodNew
            FROM Proveedor P, Barrios b, Emisor e
            WHERE p.id = ${idproveedor}
            AND p.idemisor = ${idemisor}
            AND p.idemisor = e.id
            AND p.proveedor_barrio = b.CodNew 
            `,[],(err, rows, fields) => {
                if(err){
                    return reject(err);
                }
    
                resolve(rows);
            })
    })
}

Proveedor.buscarProveedorPorQuery = (obj) => {
    
    return new Promise((resolve,reject) => {

        const {idemisor, query,idusuario} = obj;
        const sql = "SELECT p.id, p.proveedor_nombre,p.proveedor_tipo_identificacion,p.cedula_proveedor, p.proveedor_correo, p.estado_proveedor, e.emisor_nombre as usuario FROM Proveedor p, Emisor e WHERE p.idemisor = ? AND (p.cedula_proveedor = ? OR p.proveedor_nombre = ? OR p.proveedor_nombre_comercial= ?) AND p.idemisor = e.id";
        console.log(sql)
        pool.query(sql, [idemisor,query,query,query,idusuario],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Proveedor.buscarProveedorPorIdEmisor = ({idemisor, idusuario}) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT p.id, p.proveedor_nombre,p.proveedor_tipo_identificacion,p.cedula_proveedor,  
            p.proveedor_correo, p.estado_proveedor, e.emisor_nombre as usuario 
            FROM Proveedor p, Emisor e
            WHERE p.idemisor = ${idemisor}
            AND p.idemisor = e.id
            `, [],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Proveedor.actualizarEstado = (obj) => {
    return new Promise((resolve,reject) => {
        const {estado, idemisor, idproveedor} =obj;
        pool.query(`
            UPDATE Proveedor SET estado_proveedor = ${estado} WHERE idemisor =  ${idemisor} AND id = ${idproveedor}
        `,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Proveedor.actualizarProveedor = (obj) => {
    return new Promise((resolve,reject) => {
        const {
            idemisor, 
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
            proveedor_correo,
            id
        } = obj;

        pool.query('UPDATE Proveedor SET idemisor = ?, proveedor_nombre = ?,proveedor_nombre_comercial = ?,proveedor_tipo_identificacion = ?,cedula_proveedor = ?,numero_proveedor = ?,codigo_actividad = ?,identificacion_extranjero = ?,proveedor_barrio = ?,otras_senas = ?,otras_senas_extranjero = ?,proveedor_telefono_codigopais = ?,proveedor_telefono_numtelefono = ?,proveedor_fax_codigopais = ?,proveedor_fax_numtelefono = ?,proveedor_correo=? WHERE id= ?', [idemisor, proveedor_nombre,proveedor_nombre_comercial,proveedor_tipo_identificacion,cedula_proveedor,numero_proveedor,codigo_actividad,identificacion_extranjero,proveedor_barrio,otras_senas,otras_senas_extranjero,proveedor_telefono_codigopais,proveedor_telefono_numtelefono,proveedor_fax_codigopais,proveedor_fax_numtelefono,proveedor_correo,id],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Proveedor.buscarProveedorPorCoincidencia = (obj) => {
    
    return new Promise((resolve,reject) => {

        const {idemisor, query} = obj;
        const sql = "SELECT p.id, p.proveedor_nombre,p.proveedor_tipo_identificacion,p.cedula_proveedor, p.proveedor_correo, p.estado_proveedor, e.emisor_nombre as usuario FROM Proveedor p, Emisor e WHERE p.idemisor = "+idemisor+" AND (p.cedula_proveedor LIKE '%"+query+"%' OR p.proveedor_nombre LIKE '%"+query+"%' OR p.proveedor_nombre_comercial LIKE '%"+query+"%') AND p.idemisor = e.id";
        console.log(sql)
        pool.query(sql, [],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Proveedor.obtenerProveedoresFacturar = (obj) => { 

    return new Promise((resolve,reject)  => {

        const {idemisor} = obj;
        const sql = "SELECT p.id, p.proveedor_nombre,p.proveedor_tipo_identificacion,p.cedula_proveedor, p.proveedor_correo, p.estado_proveedor, e.emisor_nombre as usuario FROM Proveedor p, Emisor e WHERE p.idemisor = "+idemisor+" AND p.idemisor = e.id";

        pool.query(sql, [],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
       
    })
}

Proveedor.obtenerProveedorPorNombre = obj => {

    return new Promise((resolve,reject) => {

        const { idemisor,proveedor_nombre } = obj;
        
        pool.query(`SELECT proveedor_nombre FROM Proveedor WHERE idemisor = ? AND TRIM(proveedor_nombre)=?`,
            [idemisor,proveedor_nombre],(err,rows,fields) => {
                if(err){
                    return reject(err);
                }
    
                resolve(rows);
        })
    })
}

//avenger infinity war ver

module.exports = Proveedor;