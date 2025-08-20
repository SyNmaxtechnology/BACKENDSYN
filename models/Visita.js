const pool = require("../db/config");
const axios = require("axios");
const { reject } = require("async");
require('dotenv').config({ path: 'variables.env' });
const agregarVisita = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor,idusuario,idcliente, tipo_movimiento,fecha, ubicacion:{lat,lng},visita,razon,idlinea,distancia} = obj;
        let parametros = [];
        let sql = '';

        if(tipo_movimiento == 'SALIDA'){
            parametros = [idemisor,idusuario,idcliente, tipo_movimiento, fecha,lat,lng,visita,razon,razon.length > 0 ? false: true,distancia];
            sql = `INSERT INTO Visitas(idemisor,idusuario,idcliente,tipo_movimiento,fecha,localizacion,visita,razon,venta,distancia) 
            VALUES(?,?,?,?,?,geomfromtext('point(? ?)'),?,?,?,?)`;
        } else {
            parametros = [idemisor,idusuario,idcliente, tipo_movimiento, fecha,lat,lng,idlinea];
            sql= `INSERT INTO Visitas(idemisor,idusuario,idcliente,tipo_movimiento,fecha,localizacion,idlinea) 
            VALUES(?,?,?,?,?,geomfromtext('point(? ?)'),?)`
        }

        pool.query(sql,parametros,
            (err,rows,fields) => {
                const rowsSalida = rows;
            if(err){
                return reject(err);
            }
            if(tipo_movimiento == 'SALIDA'){
                obtenerUltimoIdEntrada(idemisor).then(response => {
                    const {id,idlinea} = response[0];
                    actualizarEstadoVisita({id,idemisor,visita}).then(() => {
                        console.log("actualizado estado")
                        
                        actualizarIdLinea({id: rowsSalida.insertId,idemisor,idlinea}).then(responseLinea => {
                        
                            resolve(responseLinea);
                        })
                        .catch(err => {
                            console.log("error linea",err);
                            reject(err);
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    })
                })
            } else {
                resolve(rows);
            }
        })
    })
}

const habilitarTipoMovimientoVisita = (idusuario) => {

    return new Promise((resolve,reject) => {

        pool.query('SELECT tipo_movimiento,idcliente FROM Visitas WHERE idusuario = ? ORDER BY fecha DESC LIMIT 1', [idusuario],
        (err, rows, fields) => {
            if(err){
                return reject(err);
            } 
            console.log(rows);
            if(rows.length === 0){
                resolve({ tipo: 'ENTRADA'});
            } else {
                resolve({tipo: rows[0].tipo_movimiento, cliente: rows[0].idcliente})
            } 
        })
    })
}


const obtenerVisitas = (obj) => {

    return new Promise((resolve,reject) => {

        const{ idemisor,idcliente , fechaInicio , fechaFin,idusuario,visita,zona } = obj;
        //SUBSTRING(v.fecha,11,LENGTH(v.fecha)) as hora 
     /*   let sql = ` esta es la version anterior
            SELECT u.usuario, SUBSTRING(v.fecha,1,10) as fecha, c.cliente_nombre as cliente, 
            (CASE 
                WHEN v.visita = 1 THEN 'VALIDA'
                ELSE 'NO VALIDA'
            END ) AS visita, v.razon, z.d_zona
            FROM  Emisor e,Usuario u,Visitas v, Cliente c, Zonas z
            WHERE e.id = ${idemisor} 
            AND e.id = v.idemisor
            AND u.id = v.idusuario 
            AND e.id = u.idemisor 
            AND e.id = c.idemisor
            AND c.id = v.idcliente
            AND e.id = z.idemisor
            AND v.tipo_movimiento = 'SALIDA'
            AND z.c_zona = c.c_zona`;

        if(idusuario !== ''){

            sql+= ` AND u.id = ${idusuario}`;
        }

        if(idcliente !== ''){

            sql+= ` AND c.id = ${idcliente}`;
        }

        if(fechaInicio !== '' && fechaFin !== ''){
            sql +=" AND SUBSTRING(v.fecha,1,10) >= '" + fechaInicio + "' AND SUBSTRING(v.fecha,1,10) <= '" + fechaFin + "'"
        }

        if(visita){
            sql +=" AND v.visita = "+visita;
        }

        if(zona){
            sql +=" AND c.c_zona = "+zona;
        }

        sql+=';';*/

        let sql = `
            SELECT DISTINCT u.id as idusuario,u.usuario, v.fecha, v.distancia,c.cliente_nombre as cliente, v.tipo_movimiento, c.id as idcliente,
            (CASE 
                WHEN v.venta = 1 THEN 'SI'
                ELSE 'NO'
            END ) AS venta,               
            (CASE 
                WHEN v.visita = 1 THEN 'VALIDA'
                ELSE 'NO VALIDA'
            END ) AS visita, v.razon , z.d_zona,
            concat(st_x(v.localizacion),' ',st_y(v.localizacion)) as ubicacionSalida,
            c.ubicacion as ubicacionCliente
            FROM Emisor e,Usuario u,Visitas v, Cliente c , Zonas z
            WHERE e.id = ${idemisor} 
            AND e.id = u.idemisor
            AND z.idemisor = e.id 
            AND c.idemisor = e.id
            AND c.c_zona = z.c_zona
            
            AND e.id = v.idemisor
            AND u.id = v.idusuario
            AND c.id = v.idcliente
        `;

        if(idusuario !== ''){

            sql+= ` AND u.id = ${idusuario}`;
        }

        if(idcliente !== ''){

            sql+= ` AND c.id = ${idcliente}`;
        }

        if(fechaInicio !== '' && fechaFin !== ''){
            sql +=" AND SUBSTRING(v.fecha,1,10) >= '" + fechaInicio + "' AND SUBSTRING(v.fecha,1,10) <= '" + fechaFin + "'"
        }

        if(visita){
            sql +=" AND v.visita = "+visita +" AND v.venta <> ''";
        }

        if(zona){
            sql +=" AND c.c_zona = "+zona;
        }

        //sql+=" ORDER BY u.usuario"

        console.log(sql);

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerTotalFacturadoYProformadoPorCliente = obj => {
    return new Promise((resolve,reject) => {
        const{ idemisor,idcliente , fechaInicio , fechaFin,idusuario} = obj;
        let sql = `
        select c.agente as idusuario,f.proforma,sum(f.totalComprobante) Total 
        from factura F,cliente as c 
        where f.idemisor=${idemisor} 
        and f.idemisor=c.Idemisor 
        and f.idcliente=c.id  

        `;

        if(idusuario !== ''){

            sql+= ` AND c.agente = ${idusuario}`;
        }

        if(idcliente !== ''){

            sql+= ` AND c.id = ${idcliente}`;
        }

        if(fechaInicio !== '' && fechaFin !== ''){
            sql +=" AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "'"
        }
        sql += ' group by c.agente,f.proforma'

        console.log(sql)
        pool.query(sql, [],
        (err, rows, fields) => {
            if(err){
                return reject(err);
            } 
            
            resolve(rows)
        })
    })
}


const obtenerReporteRazonesNoCompra = obj => {

    return new Promise((resolve,reject) => {

        const { idrazon, idemisor, fechaInicio,fechaFin } = obj;

        const sql = `

            SELECT rnv.razon, COUNT(rnv.id) as vecesRazon 
            FROM razones_no_venta rnv, visitas v
            WHERE v.idemisor = ${idemisor}
            AND rnv.razon = v.razon

            ${idrazon ? `
                AND rnv.id = ${idrazon}
            `: ''}

            ${fechaInicio && fechaFin && fechaInicio.length > 0 && fechaFin.length > 0 ? " AND SUBSTRING(v.fecha,1,10) >= '" + fechaInicio + "' AND SUBSTRING(v.fecha,1,10) <= '" + fechaFin + "'": ''}

            GROUP BY rnv.razon;
        `;

        console.log(sql);

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerUltimoIdEntrada = (idemisor) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT id,idlinea FROM Visitas WHERE tipo_movimiento = 'ENTRADA' AND idemisor = ${idemisor} ORDER BY id DESC Limit 1;
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerDistanciaEntreLocalizaciones = (obj) => {

    return new Promise((resolve,reject) => {

        const {ubicacionCliente,ubicacionSalida} = obj;
        
        //latlong 1 ubicacioncliente 
        //latlong2 ubicacionsalida

        /*
            const sql = `
            SELECT (acos(sin(radians(${ubicacionCliente.lat})) * sin(radians(${ubicacionSalida.lat})) + 
            cos(radians(${ubicacionCliente.lat})) * cos(radians(${ubicacionSalida.lat})) * 
            cos(radians(${ubicacionCliente.lng}) - radians(${ubicacionSalida.lng}))) * 6371) * 1000 as 
            distancia;
        `;
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) =>{
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
        */
        const distancia = getDistance(ubicacionCliente,ubicacionSalida);
        resolve(distancia);
    })
}


const actualizarIdLinea = (obj) => {

    return new Promise((resolve,reject) => {
        console.log(obj);
        const {id,idemisor,idlinea} =obj;
        const sql = 'UPDATE Visitas SET idlinea = ? WHERE idemisor = ? AND id = ?'
        console.log(sql);
        pool.query(sql,
        [idlinea,idemisor,id],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

const actualizarEstadoVisita = (obj) => {

    return new Promise((resolve,reject) => {
        const {visita,idemisor,id} = obj;

        pool.query('UPDATE Visitas SET visita = ? WHERE idemisor = ? AND id = ?'
            ,[visita,idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            if(rows.affectedRows > 0){ 
                resolve()
            } else {
                reject('No se pudo actualiza la visita')
            }
            
        // resolve(rows);
        })
    })
}


const obtenerFechaUltimaVisitaPorCliente = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idcliente} = obj;
        const sql = `
            SELECT substring(fecha,1,10) as fecha FROM Visitas WHERE idemisor = ${idemisor} AND idcliente = ${idcliente} AND tipo_movimiento = 'SALIDA' 
            ORDER BY FECHA DESC LIMIT 1;
        `;

        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

const rad = (x) =>  {
 return x * Math.PI / 180;
};
 
const getDistance =(p1, p2) => {
    console.log({p1});
    console.log({p2})
 //	http://es.wikipedia.org/wiki/F{1f0778fe2e852b61c79949ce7b4bb677680b76fea251b03768a071033ace27eb}C3{1f0778fe2e852b61c79949ce7b4bb677680b76fea251b03768a071033ace27eb}B3rmula_del_Haversine
 var R = 6378137; //radio de la tierra en metros
 var dLat = rad(p2.lat - p1.lat);
 var dLong = rad(p2.lng - p1.lng);
 var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 var d = R * c;
 return d;
};
module.exports = {
    agregarVisita,
    habilitarTipoMovimientoVisita,
    obtenerVisitas,
    obtenerDistanciaEntreLocalizaciones,
    obtenerFechaUltimaVisitaPorCliente,
    obtenerTotalFacturadoYProformadoPorCliente,
    obtenerReporteRazonesNoCompra
}