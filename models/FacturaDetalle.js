const pool = require("../db/config");
const Factura = require("../functions/Factura");
const Emisor = require("./Emisor");
const Categoria = require("./Categoria");
const { reject } = require("async");
let FacturaDetalle = {};

FacturaDetalle.insertarDetalle = (obj) => {

    return new Promise((resolve, reject) => {
        
        const { idfactura, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, numerodocumento, montoitotallinea, tipo_factura, MontoExoneracion, idemisor,otrosCargos, PorcentajeExonerado } = obj;
        
        let campos =[];
        let query = '';
       
        if (tipo_factura != '03') { // factura o tiquete
            if (impuesto_neto !==undefined){ 
                query = "INSERT INTO Factura_Detalle(idfactura,idproducto,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,baseimponible,impuesto_neto,numerodocumento,montoitotallinea,MontoExoneracion,otroscargos,PorcentajeExonerado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                campos = [idfactura, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos,PorcentajeExonerado];
            }else{
                query = "INSERT INTO Factura_Detalle(idfactura,idproducto,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,baseimponible,impuesto_neto,numerodocumento,montoitotallinea,MontoExoneracion,otroscargos,PorcentajeExonerado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                campos = [idfactura, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, monto, numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos,PorcentajeExonerado];
            }
        } else { //Nota de credito
            if (impuesto_neto !==undefined){ ///AGREGADO X SYN
                query = "INSERT INTO NC_Detalle(idnotacredito,idproducto,idemisor,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,baseimponible,impuesto_neto,numerodocumento,montoitotallinea,MontoExoneracion,PorcentajeExonerado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                campos=  [idfactura, idproducto,idemisor, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, numerodocumento, montoitotallinea, MontoExoneracion, PorcentajeExonerado]
            }else{
                query = "INSERT INTO NC_Detalle(idnotacredito,idproducto,idemisor,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,baseimponible,impuesto_neto,numerodocumento,montoitotallinea,MontoExoneracion,PorcentajeExonerado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                campos=  [idfactura, idproducto,idemisor, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, monto, numerodocumento, montoitotallinea, MontoExoneracion, PorcentajeExonerado]    
            }
        }

        console.log("campos ",campos);
       
        pool.query(query,campos ,async function(err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

//--------------------------------------------------------------- agregar lineas proforma -------------------------------------------

FacturaDetalle.insertarLineaTemporal = (obj) => {
    console.log(obj);
    return new Promise((resolve, reject) => {
    
        const { idemisor,idusuario, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, SinDescu,numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos, PorcentajeExonerado,idlinea,idcliente } = obj;
       
        console.log(obj);
        
        let campos =[];        
        let query = '';
        
        query = "INSERT INTO Linea_Detalle_Temporal(idemisor,idusuario, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, SinDescu, numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos, PorcentajeExonerado,idlinea,idcliente) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        console.log(query);
        campos = [idemisor,idusuario, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, SinDescu,numerodocumento, montoitotallinea, MontoExoneracion,otrosCargos, PorcentajeExonerado,idlinea,idcliente];
    
        pool.query(query,campos ,function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(campos);
                return reject(err);
            }
            resolve(rows);
        })
    })
}


FacturaDetalle.eliminarLineasTemporales = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idusuario} = obj;

        pool.query('DELETE FROM linea_detalle_temporal WHERE idemisor = ? AND idusuario = ?',
        [idemisor,idusuario],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

FacturaDetalle.eliminarLineasTemporalesPorId = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idusuario,id} = obj;

        pool.query('DELETE FROM linea_detalle_temporal WHERE idemisor = ? AND idusuario = ? AND idlinea = ?',
        [idemisor,idusuario,id],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

FacturaDetalle.eliminarLineasTemporales = obj => {
    return new Promise((resolve,reject) => {

        const {idemisor,idusuario} = obj;

        pool.query('DELETE FROM linea_detalle_temporal WHERE idemisor = ? AND idusuario = ?',
        [idemisor,idusuario],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

FacturaDetalle.obtenerLineasTemporalesPorEmisorYAgente = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,idusuario} = obj;

        pool.query(`
            SELECT ldt.idcliente,ldt.idproducto, ldt.precio_linea, ldt.cantidad, ldt.descripcioDetalle, ldt.porcentajedescuento, ldt.montodescuento, ldt.SinDescu, ldt.naturalezadescuento, ldt.numerolineadetalle, ldt.subtotal, ldt.montototal, ldt.codigo, ldt.codigo_tarifa, ldt.tarifa, monto, ldt.baseimponible, ldt.impuesto_neto, ldt.numerodocumento, ldt.montoitotallinea, ldt.MontoExoneracion,ldt.otrosCargos, ldt.PorcentajeExonerado,ldt.idlinea, p.tipo_servicio, c.cliente_nombre 
            FROM linea_detalle_temporal ldt, Producto p, Cliente c 
            WHERE ldt.idemisor = ? AND ldt.idusuario = ? AND ldt.idproducto = p.id AND c.id = ldt.idcliente
        `,[idemisor,idusuario],(err,rows,fields) => {
            //falta el campo tipo servicio en las lineas temporales, ese campo se trae de la tabla de productos
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
            console.log(rows);
        })
    })
}
//------------------------------------------------------------------------------------------------------------------------------------

FacturaDetalle.obtenerOrdenesPorFactura = (obj) => {
    return new Promise((resolve, reject) => {

        const {tipo, idfactura,idemisor} = obj;
        Emisor.obtenerEstadoCodigosCabys(idemisor).then(estadoResponse => {
            
            const tipoQuery = tipo == '03';
            let query = '';
            
           if(estadoResponse[0]){
                const {activaCabys} = estadoResponse[0];   
                if(activaCabys == 1){ // trae el codigo cabys

                    if(tipoQuery){
                        query = 'SELECT ncd.idnotacredito,ncd.idproducto,p.id,p.codigobarra_producto,  p.unidad_medida as unidadMedida, p.unidad_medida_comercial as unidadMedidaComercial,p.tipo_servicio,ncd.precio_linea,ncd.cantidad, ncd.descripcioDetalle, ncd.porcentajedescuento,ncd.montodescuento,ncd.naturalezadescuento, ncd.numerolineadetalle, ncd.subtotal,ncd.montototal,ncd.codigo,ncd.codigo_tarifa,ncd.tarifa,ncd.monto,ncd.baseimponible, ncd.impuesto_neto, ncd.numerodocumento,ncd.montoitotallinea,e.tipo_codigo_servicio, ti.descripcion, ncd.MontoExoneracion,  ncd.PorcentajeExonerado, c.codigoCabys  FROM Nota_Credito nc, NC_Detalle ncd, Producto p, Emisor e, Tipo_Impuesto ti, Categoria c  WHERE ncd.idnotacredito = '+idfactura+' AND ncd.idnotacredito = nc.id  AND ncd.idproducto = p.id  AND nc.idemisor = e.id AND p.idcategoria = c.id  AND p.tipo_impuesto = ti.id ORDER BY ncd.numerolineadetalle ASC';
                    } else {
                        query = 'SELECT fa.idfactura,fa.idproducto,p.id,p.codigobarra_producto,  p.unidad_medida as unidadMedida,p.unidad_medida_comercial as unidadMedidaComercial, p.tipo_servicio,fa.precio_linea,fa.cantidad,fa.descripcioDetalle,fa.porcentajedescuento,fa.montodescuento, fa.naturalezadescuento,fa.numerolineadetalle,fa.subtotal,fa.montototal,fa.codigo,fa.codigo_tarifa, fa.tarifa,fa.monto,fa.baseimponible,fa.impuesto_neto,fa.numerodocumento,fa.montoitotallinea, e.tipo_codigo_servicio, ti.descripcion, fa.MontoExoneracion, fa.PorcentajeExonerado, c.codigoCabys FROM Factura f, Factura_Detalle fa, Producto p, Emisor e, Tipo_Impuesto ti, Categoria c  WHERE f.id = '+idfactura+' AND fa.idfactura = f.id AND fa.idproducto = p.id AND f.idemisor = e.id  AND p.tipo_impuesto = ti.id AND p.idcategoria = c.id ORDER BY fa.numerolineadetalle ASC';
                    }                                                                                                       

                } else {

                        if(tipoQuery){
                            query = ' SELECT DISTINCT nc.id, ncd.idnotacredito,ncd.idproducto,p.id,p.codigobarra_producto,  p.unidad_medida as unidadMedida, p.unidad_medida_comercial as unidadMedidaComercial,ncd.precio_linea,ncd.cantidad, ncd.descripcioDetalle, ncd.porcentajedescuento,ncd.montodescuento,ncd.naturalezadescuento, ncd.numerolineadetalle, ncd.subtotal,ncd.montototal,ncd.codigo,ncd.codigo_tarifa,ncd.tarifa,ncd.monto,ncd.baseimponible, ncd.impuesto_neto, ncd.numerodocumento,ncd.montoitotallinea,e.tipo_codigo_servicio, ti.descripcion, ncd.MontoExoneracion,  ncd.PorcentajeExonerado FROM Nota_Credito nc, NC_Detalle ncd, Producto p, Emisor e, Tipo_Impuesto ti WHERE ncd.idnotacredito ='+idfactura+' AND ncd.idnotacredito = nc.id   AND ncd.idproducto = p.id  AND nc.idemisor = e.id AND p.tipo_impuesto = ti.id ORDER BY ncd.numerolineadetalle ASC';
                        } else {
                            query = 'SELECT DISTINCT f.id, fa.idfactura,fa.idproducto,p.id,p.codigobarra_producto,  p.unidad_medida as unidadMedida, p.unidad_medida_comercial as unidadMedidaComercial, fa.precio_linea,fa.cantidad,fa.descripcioDetalle,fa.porcentajedescuento, fa.montodescuento, fa.naturalezadescuento,fa.numerolineadetalle,fa.subtotal,fa.montototal,fa.codigo,fa.codigo_tarifa,  fa.tarifa,fa.monto,fa.baseimponible,fa.impuesto_neto,fa.numerodocumento,fa.montoitotallinea, e.tipo_codigo_servicio,  ti.descripcion, fa.MontoExoneracion, fa.PorcentajeExonerado FROM Factura f, Factura_Detalle fa,  Producto p, Emisor e, Tipo_Impuesto ti WHERE fa.idfactura = '+idfactura+'  AND fa.idfactura = f.id    AND fa.idproducto = p.id    AND f.idemisor = e.id    AND p.tipo_impuesto = ti.id ORDER BY fa.numerolineadetalle ASC';
                        }
                }

                pool.query(query, [], async function(err, rows, fields) { // funcion de flecha
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    try {
                        //return resolve(rows);
                        if(activaCabys == 1){ 
                            const categoria = await Categoria.obtenerCodigoCabysCategoria1();
                            let lineas = rows;
                            for(linea of lineas){
                                //codigocabys
                                if(!linea.codigoCabys){
                                    linea.codigoCabys = categoria[0].codigocabys;
                                }
                            }
                            resolve(lineas);
                        } else {
                            resolve(rows);
                        }

                    } catch(err ){
                        throw err;
                    }
                }) 
           }
        })
        .catch(err => {
            return reject(err);
        })
    })
}

FacturaDetalle.obtenerOrdenesReportePos=(idfactura) => {
    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT fd.cantidad, fd.descripcioDetalle as descripcion, fd.monto, fd.montoitotallinea,fd.precio_linea
            FROM Factura_Detalle fd, Factura f
            WHERE f.id = ${idfactura}
            AND f.id = fd.idfactura;
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

FacturaDetalle.obtenerOrdenesProforma = (idfactura) => {

    return new Promise((resolve,reject) => {

        pool.query(`SELECT fd.precio_linea, fd.cantidad, fd.descripcioDetalle, fd.porcentajedescuento,
                        fd.montodescuento,fd.naturalezadescuento, fd.subtotal,fd.montototal, p.codigobarra_producto,
                        fd.codigo,fd.codigo_tarifa,p.codigo_servicio,p.tipo_servicio, fd.tarifa, p.unidad_medida as unidadMedida,
                        p.unidad_medida_comercial as unidadMedidaComercial,p.idcategoria,p.id as idproducto, fd.monto, fd.baseimponible,fd.impuesto_neto, fd.montoitotallinea,fd.numerolineadetalle,
                        fd.PorcentajeExonerado, fd.MontoExoneracion, fd.otrosCargos

                        FROM Factura_Detalle fd, Factura f, Producto p, Categoria c
                        WHERE f.id = ${idfactura}
                        AND fd.idfactura = f.id
                        AND fd.idproducto =p.id
                        AND c.id = p.idcategoria
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}


FacturaDetalle.eliminarLineasProforma = (idfactura) => {
    return new Promise((resolve,reject) => {

        pool.query(`
            DELETE FROM Factura_Detalle WHERE idfactura = ${idfactura}
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}


FacturaDetalle.obtenerLineasReporteFacturaDetallado = (obj) => {
    return new Promise((resolve,reject) => {    

        const {idemisor,fechaInicio,fechaFin} = obj;
        let sql = "SELECT idfactura,descripcioDetalle,cantidad,montototal,montodescuento,impuesto_neto,(montoitotallinea + otrosCargos) as montoitotallinea, otrosCargos FROM factura_detalle where idfactura in (select id from factura where idemisor="+idemisor+" AND status_factura= 'aceptado' AND anulada <> 1";

        if(typeof fechaInicio !== 'undefined' && typeof fechaFin !== 'undefined'){

            if(fechaInicio != '' && fechaFin != ''){
                sql += " AND SUBSTRING(fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(fecha_factura,1,10) <= '" + fechaFin + "'";
            }
        }
        sql+=")";
        pool.query(sql, [],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

FacturaDetalle.eliminarLineasFacturaYXml = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor,numeroInternoInicio,numeroInternoFin} = obj;
        const sql = `
            DELETE fd.*,x.*
                FROM Factura f, factura_detalle fd, Xml x
                WHERE f.idemisor = ${idemisor}
                AND f.status_factura <> 'aceptado'
                AND f.id = fd.idfactura
                AND f.id = x.idfactura
                AND f.proforma IS NULL 
                ${numeroInternoInicio && numeroInternoInicio.toString() !== '' 
                && numeroInternoFin && numeroInternoFin.toString() !== ''? `
                AND f.numero_interno >= ${numeroInternoInicio} 
                AND f.numero_interno <= ${numeroInternoFin};
                `: ''}
            `;

            console.log(sql);
        pool.query(sql,[],(err,rows) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

module.exports = FacturaDetalle;

