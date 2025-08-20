const pool = require("../db/config");
let Movimiento = {};

Movimiento.nuevoMovimiento = (obj) => {
    return new Promise((resolve,reject) => {

        const { idusuario, idemisor, tipomovimiento, descripcionmovimiento, costoajuste} = obj;
        // fechadocumento

        pool.query(`
        
            INSERT INTO Ajuste(idusuario,idemisor,fechadocumento,tipomovimiento,descripcionmovimiento,
                costoajuste) VALUES(?,?,DEFAULT,?,?,?)
        `, [idusuario, idemisor, tipomovimiento, descripcionmovimiento, costoajuste],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Movimiento.obtenerAJustes = (obj) => {
    return new Promise((resolve,reject) => {

        const {fechaInicio, fechaFin, idcategoria, idbodega, idemisor,articulo, tipomovimiento} = obj;
        let sql = '';

        if(idcategoria == '' && idbodega == '' && articulo == ''){ // reporte deentradas en rango de fecha
            
            sql += `
                    SELECT a.id as idajuste, a.costoajuste as total, 
                    CASE 
                        WHEN a.tipomovimiento = '01' THEN 'Entrada' 
                        WHEN a.tipomovimiento = '02' THEN 'Salida'
                        ELSE 'Traslado'
                    END as tipoajuste, SUBSTRING(a.fechadocumento,1,10) as fecha,
                    a.descripcionmovimiento as descripcion
                    FROM Ajuste a, Emisor e

                    WHERE e.id =${idemisor}
                    AND a.idemisor = e.id
                `;
            
            if(tipomovimiento != ''){

                sql+=' AND a.tipomovimiento ="'+tipomovimiento+'"';
            }
            

            if(fechaInicio != '' && fechaFin != '' ){
                sql +=" AND SUBSTRING(a.fechadocumento,1,10) >= '"+fechaInicio+"' AND SUBSTRING(a.fechadocumento,1,10) <= '"+fechaFin+"'";
            }

            //sql += ``
        } else {
            sql += `SELECT SUM(ad.costolinea) as total, a.descripcionmovimiento as descripcion,
                    SUBSTRING(a.fechadocumento,1,10) as fecha, CASE 
                        WHEN a.tipomovimiento = '01' THEN 'Entrada' 
                        WHEN a.tipomovimiento = '02' THEN 'Salida'
                        ELSE 'Traslado'
                    END as tipoajuste, 
                    c.descripcion as categoria, b.descripcion as bodega, ar.descripcion as articulo
                    FROM Ajuste a , Categoria c ,Articulo ar, Emisor e, Ajuste_Detalle ad , Bodega b
                    
                    WHERE e.id = ${idemisor}
                    AND e.id = a.idemisor
                    AND ad.idajuste = a.id
                    AND ad.idarticulo = ar.id
                    AND ar.idcategoria = c.id
                    AND ad.idbodorigen = b.id`;

            if(fechaInicio != '' && fechaFin != ''){
                sql +=" AND SUBSTRING(a.fechadocumento,1,10) >= '"+fechaInicio+"' AND SUBSTRING(a.fechadocumento,1,10) <= '"+fechaFin+"'";
            }
            //a.tipomovimiento = '01'a.tipomovimiento = '01'
            if(idcategoria != ''){
                sql+= ' AND c.id='+idcategoria;
            }

            if(tipomovimiento != ''){
                sql+= ' AND a.tipomovimiento ="'+tipomovimiento+'"'; 
            }

            if(articulo != ''){
                sql+= ' AND (ar.descripcion="'+articulo+'" OR ar.codigobarra_producto="'+articulo+'")';
            }

            if(idbodega != ''){
                sql+= ' AND ad.idbodorigen='+idbodega;
            }

            sql += ' GROUP BY a.tipomovimiento, c.descripcion,b.descripcion, ar.descripcion, a.descripcionmovimiento,SUBSTRING(a.fechadocumento,1,10)';
        }

        console.log("sql", sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })  
    })
}

module.exports = Movimiento;