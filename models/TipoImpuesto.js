const pool = require('../db/config');

let TipoImpuesto = {};

TipoImpuesto.nuevoImpuesto = (obj) => {

    return new Promise((resolve, reject) => {

        const { descripcion, porcentaje, codigo, idemisor } = obj;
        pool.query('INSERT INTO Tipo_Impuesto(idemisor,descripcion,porcentaje_impuesto,codigo_impuesto) VALUES(?,?,?,?)', [idemisor,descripcion, porcentaje, codigo], function(err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            } //comentario de prueba

            return resolve(rows)
        })
    })
}

TipoImpuesto.obtenerImpuesto = (obj) => {
    return new Promise((resolve, reject) => {
        
        const {query,idemisor} = obj;
        pool.query('SELECT id,descripcion,porcentaje_impuesto,codigo_impuesto FROM Tipo_Impuesto WHERE (descripcion= ? OR codigo_impuesto=?) AND idemisor=?', [query, query, idemisor], function(err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            } //affectedRows

            return resolve(rows)
        });
    });
}

TipoImpuesto.actualizarImpuesto = (obj) => {
    return new Promise((resolve, reject) => {
        
        const { descripcion, porcentaje, id, codigo, idemisor } = obj;
      
        pool.query('UPDATE Tipo_Impuesto SET idemisor=? ,descripcion=?, porcentaje_impuesto=?, codigo_impuesto=? WHERE id=?', [idemisor,descripcion, porcentaje, codigo, id], function(err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            } //affectedRows

            return resolve(rows)
        })
    })
}


TipoImpuesto.obtenerImpuestos = (idemisor) => {
    return new Promise((resolve, reject) => {
        
        pool.query('SELECT id,descripcion,porcentaje_impuesto,codigo_impuesto FROM Tipo_Impuesto WHERE idemisor = ?', [idemisor],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                } //affectedRows

                return resolve(rows)
            })
    })
}


TipoImpuesto.listarImpuestos = (idemisor) => {
  return  new Promise((resolve,reject) => {
      pool.query( `
        SELECT ti.id, ti.descripcion, ti.porcentaje_impuesto, ti.codigo_impuesto,ti.estado_impuesto, e.emisor_nombre as usuario 
            FROM Tipo_Impuesto ti, Emisor e
            WHERE ti.idemisor = e.id
            AND e.id =  ${idemisor}
      `,[],(err,rows,fields) => {
        if (err) {
            console.log(err);
            return reject(err);
        } //affectedRows

        return resolve(rows)
    })
  })
}


TipoImpuesto.obtenerImpuestoPorId = (id) => {
    return new Promise((resolve,reject) => {
        
        pool.query( `
            SELECT ti.id, ti.descripcion, ti.porcentaje_impuesto, ti.codigo_impuesto, u.usuario 
                FROM Tipo_Impuesto ti, Usuario u, Emisor e
                WHERE ti.id = ${id} 
                AND ti.idemisor = e.id
                AND e.id = u.idemisor
      `,[],(err,rows,fields) => {
        if (err) {
            console.log(err);
            return reject(err);
        } //affectedRows

        return resolve(rows)
      })
    })
}

TipoImpuesto.actualizarEstado = (obj) => {
    return new Promise((resolve,reject) => {
        
        const {estado, idimpuesto} = obj;
        pool.query(`
            UPDATE Tipo_Impuesto SET estado_impuesto = ${estado} WHERE id = ${idimpuesto}
        `, [],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            } //affectedRows
    
            return resolve(rows)
        })
    })
}

TipoImpuesto.obtenerImpuestoPorQuery = (obj) => {
    return new Promise((resolve,reject) => {
        const {query} = obj;

        pool.query('SELECT ti.id, ti.descripcion, ti.porcentaje_impuesto, ti.codigo_impuesto, u.usuario  FROM Tipo_Impuesto ti, Usuario u, Emisor e WHERE (ti.descripcion=? OR codigo_impuesto = ? ) AND ti.idemisor = e.id AND e.id = u.idemisor',
        [   query,query], (err,rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            } //affectedRows
    
            return resolve(rows)  
        })
    })
}

TipoImpuesto.obtenerImpuestoPorCodigo = (obj) => {
    return new Promise((resolve,reject) => {
        const {codigo, idemisor} = obj;

        pool.query("SELECT ti.id FROM Tipo_Impuesto ti WHERE ti.codigo_impuesto = ? ",[codigo],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })  
}

TipoImpuesto.obtenerImpuestoExento = () => {
    return new Promise((resolve,reject) => {
        pool.query("SELECT id FROM Tipo_Impuesto WHERE codigo_impuesto= '01'",[],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


TipoImpuesto.listarImpuestosResumenIVA = (idemisor) => {
    return  new Promise((resolve,reject) => {
        pool.query( `
          SELECT ti.descripcion, ti.codigo_impuesto FROM Tipo_Impuesto ti, Emisor e
              WHERE ti.idemisor = e.id
              AND e.id =  ${idemisor}
              ORDER BY ti.codigo_impuesto ASC
        `,[],(err,rows,fields) => {
          if (err) {
              console.log(err);
              return reject(err);
          } //affectedRows
  
          return resolve(rows)
      })
    })
  }

  TipoImpuesto.agregarImpuestosEmisor = (idemisor) =>  {

    return new Promise((resolve,reject) => {
        pool.query(`
        
            INSERT INTO Tipo_Impuesto (idemisor,codigo_impuesto,descripcion,porcentaje_impuesto)
            VALUES (${idemisor},'01','Exento','0'), (${idemisor},'02','Tarifa Reducida 1%','1'),
            (${idemisor},'03','Tarifa Reducida 2%','2'),(${idemisor},'04','Tarifa Reducida 4%','4'),
            (${idemisor},'05','Transitorio 0%','0'),(${idemisor},'06','Transitorio 4%','4'),
            (${idemisor},'07','Transitorio 8%','8'),(${idemisor},'08','General%','13')
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            } //affectedRows
    
            return resolve(rows)
        })
    })
  }
  

module.exports = TipoImpuesto;