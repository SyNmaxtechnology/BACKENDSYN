const pool = require("../db/config");
let MovimientosCxp = {};

MovimientosCxp.actualizarTotalesFacturas = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {idemisor,idproveedor,identrada,fecha_factura,factura, idmovimiento,saldoRestante,montototal,saldoactual} = obj;
        pool.query(`
            INSERT INTO movcxp(idemisor,idproveedor,identrada,fecha_factura,montototal,saldoactual,factura)
            VALUES(?,?,?,?,?,?,?)
        `,[idemisor,idproveedor,identrada,fecha_factura,saldoRestante,0,factura],(err,rows,fields) => {
            if(err){
                return reject(err);
            } else {
                pool.query(`
                    UPDATE movcxp SET saldoactual = saldoactual - ? WHERE idemisor = ? AND identrada = ? AND id = ? AND factura = 1
                `,[saldoRestante,idemisor,identrada,idmovimiento],(err,rows,fields) => {

                    if(err){
                        console.log(err);
                        throw new Error('error_save_buy');
                    }

                    resolve(rows);
                })
            }
        })
    })
}
MovimientosCxp.obtenerFacturasPorQuery = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, idproveedor} = obj;
        pool.query(`        
            SELECT e.numero_interno as numfactura, e.tipocambio, SUBSTRING(e.fecha_factura,1,10) as fecha,e.codigomoneda,
                m.id as idmovimiento,m.identrada, m.idproveedor,m.montototal, m.saldoactual FROM Entrada e, movcxp m, Proveedor c
            WHERE e.idemisor = ?
            AND e.idproveedor = ?
            AND e.idproveedor = c.id
            AND e.id = m.identrada
            AND m.idproveedor = c.id
            AND m.saldoactual > 0
            AND m.factura = 1
            AND e.estadoHacienda = 'aceptado'
            AND e.plazo_credito > 1
        `,[idemisor,idproveedor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

MovimientosCxp.listarProveedoresFacturasCredito = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`
        SELECT id, proveedor_nombre, cedula_proveedor FROM Proveedor WHERE idemisor = ?
        `,[idemisor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

MovimientosCxp.obtenerFacturasCreditoCanceladas = (obj) => {
    return new Promise((resolve,reject) => {
        
        const {idproveedor, fechaInicio, fechaFin,idemisor} = obj;
        
        let sql = 'SELECT m.id as idrecibo,em.id as identrada,SUBSTRING(m.fecha_factura,1,10) as fecha,m.factura as tipo, m.montototal, m.saldoactual,  p.proveedor_nombre ,em.numero_interno, em.codigomoneda FROM  movcxp m, Proveedor p, Entrada em, Emisor e WHERE em.id = m.identrada AND e.id= '+idemisor+' AND e.id = m.idemisor AND p.id = m.idproveedor';

        if(idproveedor && fechaInicio && fechaFin){
            sql += ' AND SUBSTRING(em.fecha_factura,1,10) >= "'+fechaInicio+'" AND SUBSTRING(em.fecha_factura,1,10) <= "'+fechaFin+'" AND p.id = '+idproveedor;
        }

        if(!idproveedor && fechaInicio  && fechaFin){
            sql += ' AND SUBSTRING(em.fecha_factura,1,10) >= "'+fechaInicio+'" AND SUBSTRING(em.fecha_factura,1,10) <= "'+fechaFin+'"';
        }
 
        sql+= ' ORDER BY em.numero_interno ASC';

        console.log(sql);
        
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = MovimientosCxp;