const pool = require('../db/config');
const Emisor = require("./Emisor"); 
const jwt = require("jsonwebtoken");
let Categoria = {};

Categoria.nuevaCategoria = (obj) => {
    
    //const { descripcion, codigo, idemisor,codigoCabys,descripcioncodigo } = obj;
    //if (descripcion == undefined) { //AGREGADO X SYN
       // const { descripcion, codigo,codigocabys,descripcioncodigo } = obj.body; 
        
    //  }   
    
    return new Promise((resolve, reject) => {
        const { descripcion, codigo, idemisor,codigoCabys,descripcioncodigo } = obj;
        if (descripcion == undefined) { //AGREGADO X SYN
            const { descripcion, codigo,codigocabys,descripcioncodigo } = obj.body; 
            const authHeader = req.get('Authorization');
            const token = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(token,process.env.KEY);
            const idemisor = decodedToken.id;
        }

        if (idemisor != undefined){//AGREGADO X SYN
            
            Emisor.obtenerEstadoCodigosCabys(idemisor).then(estadoResponse  => {
                const {activaCabys} = estadoResponse[0];

            

                pool.query('INSERT INTO Categoria(idemisor,descripcion,codigo,codigoCabys,descripcionCodigoCabys) VALUES(?,?,?,?,?)', [idemisor,descripcion, codigo,codigoCabys,descripcioncodigo],
                    function(err, rows, fiedls) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }

                        return resolve(rows)
                    })

            })
            .catch(err => {
                return reject(err);
            })
        }
    })
}

Categoria.obtenerCategoria = (obj) => {

    return new Promise((resolve, reject) => {

        /*
        
            SELECT c.id, c.codigo, c.descripcion,c.estado_categoria, u.usuario FROM Categoria c, Emisor e, Usuario u 
            WHERE (descripcion=? OR codigo=?)
            AND c.idemisor= ?
            AND c.idemisor = e.id
            AND e.idusuario = u.id
        */
        const {query, idemisor, idusuario} = obj;
        pool.query(`SELECT c.id, c.codigo, c.descripcion,c.estado_categoria,e.emisor_nombre as usuario 
            FROM Categoria c,Emisor e  
            WHERE (descripcion=? OR codigo=?) 
            AND c.idemisor= ? 
            AND c.idemisor = e.id`, [query,query,idemisor],
            function(err, rows, fiedls) {
                if (err) {
                    
                    console.log(err);
                    return reject(err);
                }

                return resolve(rows)
            })
    })
}

Categoria.actualizarCategoria = (obj) => {
    return new Promise((resolve, reject) => {
        const { id, descripcion, codigo, idemisor, codigoCabys,descripcioncodigo } = obj;

        Emisor.obtenerEstadoCodigosCabys(idemisor).then(estadoResponse  => {
            const {activaCabys} = estadoResponse[0];

           /* if(activaCabys == 1){
                // descripcion, codigo, idemisor,codigoCabys,descripcionCodigoCabys
                pool.query('UPDATE Categoria SET idemisor=? ,descripcion=?, codigo=?, codigoCabys = ?,descripcionCodigoCabys = ? WHERE id=?', [idemisor,descripcion, codigo, codigoCabys,descripcionCodigoCabys,id],
                function(err, rows, fiedls) {
                    if (err) {
                        
                        console.log(err);
                        return reject(err);
                    }

                    return resolve(rows)
                })  
            } else {

                pool.query('UPDATE Categoria SET idemisor=? ,descripcion=?, codigo=? WHERE id=?', [idemisor,descripcion, codigo,id],
                function(err, rows, fiedls) {
                    if (err) {
                        
                        console.log(err);
                        return reject(err);
                    }

                    return resolve(rows)
                })  
            }*/

            pool.query('UPDATE Categoria SET idemisor=? ,descripcion=?, codigo=?, codigoCabys = ?,descripcionCodigoCabys = ? WHERE id=?', [idemisor,descripcion, codigo, codigoCabys,descripcioncodigo,id],
                function(err, rows, fiedls) {
                    if (err) {
                        
                        console.log(err);
                        return reject(err);
                    }

                    return resolve(rows)
                })  
        })
        .catch(err => {
            return reject(err);
        })
    })
}

Categoria.obtenerCategorias = ({idemisor,idusuario}) => {

    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT c.id, c.codigo, c.descripcion,c.estado_categoria,e.emisor_nombre as usuario FROM Categoria c, Emisor e
            WHERE c.idemisor= ${idemisor}
            AND c.idemisor = e.id
        `, [],function(err, rows, fiedls) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                return resolve(rows)
            })
    })
}

Categoria.obtenerCategoriaPorId = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, idcategoria} = obj;
        let sql = '';

        Emisor.obtenerEstadoCodigosCabys(idemisor).then(estadoResponse  => { 
            const {activaCabys} = estadoResponse[0];
          /* if(activaCabys == 1){
            
            sql = `
                SELECT c.id, c.codigo, c.descripcion, c.codigoCabys, c.descripcionCodigoCabys as idcodigo FROM Categoria c, Emisor e
                WHERE c.id = ${idcategoria}
                AND c.idemisor = ${idemisor}
                AND c.idemisor = e.id`;
           
           } else {
            sql = `
                SELECT c.id, c.codigo, c.descripcion FROM Categoria c, Emisor e
                WHERE c.id = ${idcategoria}
                AND c.idemisor = ${idemisor}
                AND c.idemisor = e.id`;
           }*/

           sql = `
                SELECT c.id, c.codigo, c.descripcion, c.codigoCabys, c.descripcionCodigoCabys  FROM Categoria c, Emisor e
                WHERE c.id = ${idcategoria}
                AND c.idemisor = ${idemisor}
                AND c.idemisor = e.id`;

           pool.query(sql, [],function(err, rows, fiedls) {
            if (err) {
        
                console.log(err);
                return reject(err);
            }

                return resolve(rows)
            })
        })
    })
}

Categoria.actualizarEstado = (obj) => {
    return new Promise((resolve,reject) => {
        const {estado, idemisor, idcategoria} = obj;

        pool.query(`
            UPDATE Categoria SET estado_categoria = ${estado} WHERE idemisor = ${idemisor}
                AND id = ${idcategoria}`,[],(err,rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows)
        })
    })
}

Categoria.listarCategorias = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT c.id, c.descripcion FROM Categoria c, Emisor e
            WHERE e.id = ${idemisor}
            AND c.idemisor = e.id
        `, [],(err,rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows)
        })
    })
}

Categoria.obtenerCodigoCabysCategoria1 = () => {

    return new Promise((resolve,reject) => {

        pool.query('SELECT codigocabys  FROM Categoria WHERE id = 1;',[],(err,rows,fields) => {
            if(err){
                throw err;
            }

            resolve(rows);
        })
    })
}

Categoria.actualizarCodigoCabysPorIdCategoria = (obj) => {
    
    return new Promise((resolve,reject) => {

        const { idemisor, idcategoria, codigoCabys} = obj;

        pool.query('UPDATE Categoria SET codigoCabys = ? WHERE idemisor = ? AND id = ?',
        [codigoCabys,idemisor,idcategoria],(err,rows,fields) => {

            if(err){
                throw err;
            }

            resolve(rows);
        })
    })
}

Categoria.obtenerCodigoCabysPorId = (idcategoria) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT codigoCabys FROM Categoria WHERE id = ${idcategoria}
        `,[],(err,rows,fields) => {
            if(err){
                reject(err);
            }

            resolve(rows);
        })
    })
}

Categoria.obtenerCategoriaPorCodigoCabys = obj => {

    return new Promise((resolve,reject) => {

        const { idemisor, codigoCabys } = obj;
        pool.query(`SELECT id FROM categoria WHERE TRIM(codigoCabys) = ? AND idemisor = ?`, 
            [codigoCabys,idemisor],(err,rows,fields) => {

            if(err) return reject(err);
            resolve(rows);
        })
    })
}
module.exports = Categoria;
