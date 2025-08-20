const { reject } = require("async");
const pool = require("../db/config");
let Entrada = {};

Entrada.nuevaEntrada = (obj) => {
    return new Promise((resolve,reject) => {
        console.log("Objeto entrada" , obj);
        const {
            idusuario,
            idproveedor,
            idemisor,
            clavenumerica,
            consecutivo,
            numero_interno,
            num_documento,
            consecutivo_receptor,
            fecha_factura,
            tipo_factura,
            condicion_venta,
            medio_pago,
            plazo_credito,
            condicion_impuesto,
            porcentaje_descuento_total,
            monto_descuento_total,
            subtotal,
            totalservgravados,
            totalservexentos,
            totalservexonerado,
            totalmercanciasgravadas,
            totalmercanciasexentas,
            totalmercanciaexonerada,
            totalgravado,
            totalexento,
            totalexonerado,
            totalventa,
            totaldescuentos,
            totalventaneta,
            totalimpuesto,
            totalcomprobante,
            totalIVADevuelto,
            TotalOtrosCargos,
            codigomoneda,
            tipocambio,
            status_factura,
            notas,
        } = obj;

        
         querycom=  `SELECT id FROM Entrada WHERE clavenumerica = ? and idemisor = ?;`;
         pool.query(querycom, [clavenumerica,idemisor],(err, rows2, fields) => {
            console.log("resultado ",rows2);
           
            if(err){
                return reject(err);
            }
            
            console.log(rows2.length);
         
            if(rows2.length == 0){
                pool.query('INSERT INTO Entrada(idusuario,idproveedor,idemisor,clavenumerica,consecutivo,numero_interno,consecutivo_receptor,fecha_factura,tipo_factura,condicion_venta,medio_pago,plazo_credito,codicion_impuesto,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,status_factura,notas) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [idusuario,idproveedor,idemisor,clavenumerica,consecutivo,numero_interno,consecutivo_receptor,fecha_factura,tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,status_factura,notas], (err, rows, fields) => {
                    if(err){
                        console.log("error entradas",err)
                        return reject(err);
                    }

                    resolve(rows);
                })
            }
             
        })

           
    })
}

Entrada.agregarEntradaACredito = (obj) => {

    return new Promise((resolve,reject) => {

        const {
            idemisor,idproveedor,identrada,fecha_factura,montototal,saldoactual,factura 
        } = obj;

        pool.query(`
            INSERT INTO movcxp(idemisor,idproveedor,identrada,fecha_factura,montototal,saldoactual,factura)
            VALUES(?,?,?,?,?,?,?);
        `,[idemisor,idproveedor,identrada,fecha_factura,montototal,saldoactual,factura],(err,rows,fiedls) => {
            if(err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Entrada.obtenerDatosMensajeAceptacion = (idfactura) => {
    return new Promise((resolve,reject) => {
        
        pool.query('SELECT e.clavenumerica, e.fecha_factura, e.status_factura, e.codicion_impuesto, e.totalcomprobante,e.totalimpuesto,e.consecutivo_receptor,p.codigo_actividad, p.cedula_proveedor, em.cedula_emisor FROM Entrada e, Proveedor p, Emisor em WHERE e.id = ? AND e.idproveedor = p.id AND e.idemisor = em.id',
        [idfactura], (err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
} 


Entrada.obtenerDatosGenerarJSONEnvioEntrada = (obj) => {
    return new Promise((resolve,reject) => {    

        const {identrada,idemisor} = obj;

        pool.query(`
            SELECT e.clavenumerica, e.fecha_factura, e.consecutivo_receptor ,p.cedula_proveedor,p.proveedor_nombre, p.proveedor_correo,p.proveedor_tipo_identificacion,
            em.cedula_emisor, em.emisor_tipo_identificacion, em.API, x.mensajeAceptacion FROM Entrada e, Proveedor p, Emisor em, Xml x
            WHERE e.id = ?
            AND em.id = ?
            AND e.idemisor = em.id
            AND e.idproveedor = p.id
            AND x.identrada = e.id
        
        `,[identrada,idemisor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
} 

Entrada.actualizarClavesEntrada = (obj) => {
    return new Promise((resolve,reject) => {

        const {clavenumerica,consecutivo,numero_interno,num_documento, consecutivo_receptor, id} = obj;

        pool.query(`UPDATE Entrada SET clavenumerica= ?,consecutivo= ?,numero_interno= ?,num_documento= ?, consecutivo_receptor= ? WHERE id= ?`,[clavenumerica,consecutivo,numero_interno,num_documento, consecutivo_receptor, id],(err, rows, fiedls) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Entrada.existeEntrada = ({clavenumerica,idemisor}) => {
    return new Promise((resolve,reject) => {
        //pool.query('SELECT id FROM Entrada WHERE clavenumerica = ? AND idemisor = ?', [clavenumerica,idemisor] //CAMBIO SYN
        pool.query('SELECT id FROM Entrada WHERE clavenumerica = ? ', [clavenumerica]
            ,(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
            })
    })
}

Entrada.actualizarEstadoHacienda = (obj) => {
    return new Promise((resolve,reject) => {
        const {idfactura, estado} = obj;
        pool.query('UPDATE Entrada SET estadoHacienda= ?  WHERE id= ?',[estado,idfactura]
            ,(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}
Entrada.actualizarCodigoEstadoEntrada
Entrada.buscarEntradas =(obj) => {
    return new Promise((resolve,reject) => {
        const { idemisor,tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = obj;

        let consultaBase = "SELECT DISTINCT e.id,DATE(e.fecha_factura) as fecha, Date_Format(e.fecha_factura,'%H:%I:%S') as hora, e.clavenumerica, e.consecutivo,e.condicion_venta, e.medio_pago,e.fecha_factura, e.porcentaje_descuento_total,e.monto_descuento_total,e.subtotal,e.totalservgravados,e.totalservexentos,e.totalservexonerado,e.totalmercanciasgravadas,e.totalmercanciasexentas,e.totalmercanciaexonerada, e.totalgravado, e.totalexento,e.totalexonerado,e.totalventa,e.totaldescuentos,e.totalventaneta,e.totalimpuesto,e.totalcomprobante, e.codigomoneda, e.tipocambio,e.tipo_factura,e.TotalOtrosCargos,e.totalIVADevuelto,e.plazo_credito,e.estadoHacienda,e.numero_interno, e.codicion_impuesto, e.status_factura,e.consecutivo_receptor,p.cedula_proveedor, p.proveedor_nombre_comercial,p.proveedor_nombre,e.estadoHacienda, e.anulada,e.claveReferencia, e.Notas as notas FROM Entrada e, Proveedor p, emisor m where  e.idemisor = m.id AND e.idproveedor = p.id AND e.tipo_factura = '"+tipoFactura+"' AND e.idemisor ="+idemisor;

        if (typeof fechaInicio !== 'undefined') {
            consultaBase += " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }
        if (typeof consecutivo !== 'undefined') {
            consultaBase += " AND e.consecutivo='" + consecutivo + "'";
        }
        if (typeof claveNumerica !== 'undefined') {
            consultaBase += " AND e.clavenumerica='" + claveNumerica + "'";
        }
        if (typeof numeroInterno !== 'undefined') {
            consultaBase += " AND e.numero_interno='" + numeroInterno + "'";
        }
        if (typeof nombreCliente !== 'undefined') {
            consultaBase += " AND TRIM(p.proveedor_nombre)='" + nombreCliente.toUpperCase().trim() + "' OR TRIM(p.proveedor_nombre_comercial)='"+nombreCliente.toUpperCase().trim()+"'";
        }

        consultaBase += ' ORDER BY e.fecha_factura ASC';

        console.log(consultaBase)
        pool.query(consultaBase, [tipoFactura, fechaInicio, fechaFin], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}
Entrada.obtenerDatosDescarga = (idfactura) => {
    return new Promise((resolve,reject) => {
        pool.query("SELECT e.clavenumerica, e.estadoHacienda, x.respuestaMensajeAceptacion from Entrada e, Xml x WHERE e.id = ? AND x.identrada = e.id", [idfactura], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Entrada.obtenerClaveNumerica = (idfactura) => {
    return new Promise((resolve,reject) => {
        pool.query("SELECT clavenumerica FROM Entrada WHERE id = ?", [idfactura], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Entrada.obtenerDatosEncabezadoYTotalesEntrada = (idfactura) => {
    return new Promise((resolve,reject) => {

        const sql = `SELECT DISTINCT e.id, e.idemisor,e.idproveedor,e.clavenumerica, e.consecutivo,e.condicion_venta, e.medio_pago,
        e.fecha_factura, e.porcentaje_descuento_total,e.monto_descuento_total,e.subtotal,e.totalservgravados,e.totalservexentos,
         e.totalservexonerado,e.totalmercanciasgravadas,e.totalmercanciasexentas, e.totalmercanciaexonerada, e.totalgravado,
         e.totalexento, e.totalexonerado,e.totalventa,e.totaldescuentos,e.totalventaneta,e.totalimpuesto,e.totalcomprobante,
         e.codigomoneda, e.tipocambio,e.tipo_factura,e.TotalOtrosCargos,e.totalIVADevuelto,e.plazo_credito, em.emisor_nombre,
         em.emisor_nombrecomercial,  em.cedula_emisor, em.numero_emisor,em.emisor_tipo_identificacion, em.emisor_otras_senas,
         (SELECT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
         FROM Barrios b WHERE b.CodNew = em.emisor_barrio 
            AND e.idemisor =  em.id
            AND e.id=${idfactura} ) AS ubicacion_emisor, 
         em.emisor_otras_senas, 
         em.emisor_telefono_codigopais, em.emisor_telefono_numtelefono,em.emisor_fax_codigopais, em.emisor_fax_numtelefono,
         em.emisor_correo,em.key_username_hacienda, em.key_password_hacienda,em.tipo_codigo_servicio, em.codigo_servicio, 
         em.Client_ID, em.API, em.TOKEN_API,em.file_p12,em.pin_p12, em.numeroresolucion,em.fecharesolucion, em.codigo_actividad,p.proveedor_nombre, 
         p.proveedor_nombre_comercial, p.proveedor_tipo_identificacion, 
         p.cedula_proveedor, p.numero_proveedor, p.identificacion_extranjero,p.otras_senas,
         p.otras_senas_extranjero,p.proveedor_telefono_codigopais, p.proveedor_telefono_numtelefono,
         p.proveedor_fax_codigopais, p.proveedor_fax_numtelefono,p.proveedor_correo, p.otras_senas, otras_senas_extranjero,
        (SELECT DISTINCT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
         FROM Barrios b WHERE b.CodNew = p.proveedor_barrio 
            AND e.idemisor =  em.id
            AND e.idproveedor = p.id
            AND e.id=${idfactura}) AS ubicacion_proveedor
         FROM Entrada e, Emisor em ,Proveedor p
            WHERE e.idemisor=em.id 
            AND e.idproveedor = p.id
            AND e.id=${idfactura};`
            console.log(sql);
        pool.query(sql,[], (err, rows, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
    
                resolve(rows)
            })
    })
}


Entrada.actualizarCodigoEstadoEntrada = (obj) => {
    return new Promise((resolve,reject) => {
       const {codigo_estado,idemisor, identrada} = obj;
       console.log(obj); 
       pool.query('UPDATE Entrada SET codigo_estado=? WHERE idemisor=? AND id=?',
        [codigo_estado,idemisor, identrada], (err, rows, fiedls) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        }) 
    })  
}

Entrada.entradasRebotadas = (obj) => {
    
    return new Promise((resolve,reject) => {
        const {
            codigo_estado,
            identrada,
            idemisor
        } = obj;

        pool.query(`UPDATE Entrada SET codigo_estado=${codigo_estado}, estadoHacienda= 'rebotado' 
            WHERE idemisor=${idemisor} AND id=${identrada}`,
        [],(err, rows, fiedls) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Entrada.encabezadoReporteEntrada = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, id} = obj;
        
        pool.query(`SELECT DISTINCT e.id,e.clavenumerica, e.consecutivo,e.condicion_venta, e.medio_pago,e.fecha_factura,
        e.porcentaje_descuento_total,e.monto_descuento_total,e.subtotal,e.totalservgravados,e.totalservexentos,
        e.totalservexonerado,e.totalmercanciasgravadas,e.totalmercanciasexentas,e.totalmercanciaexonerada, e.totalgravado, 
        e.totalexento, e.totalexonerado,e.totalventa,e.totaldescuentos,e.totalventaneta,e.totalimpuesto,e.totalcomprobante,
        e.codigomoneda, e.tipocambio,e.tipo_factura,e.totalIVADevuelto,e.TotalOtrosCargos,em.emisor_nombre, e.Notas as notas,
        em.emisor_nombrecomercial, em.numero_emisor, em.emisor_telefono_numtelefono, em.emisor_fax_numtelefono,
        em.emisor_correo,(IF (e.idproveedor IS NOT NULL,(SELECT JSON_OBJECT('cliente_nombre',p.proveedor_nombre,
        'proveedor_nombre_comercial',p.proveedor_nombre_comercial,'numero_cliente', p.numero_proveedor,
        'identificacion_extranjero', p.identificacion_extranjero,'proveedor_telefono_numtelefono',
        p.proveedor_telefono_numtelefono,'proveedor_fax_numtelefono', p.proveedor_fax_numtelefono,'proveedor_correo',
        p.proveedor_correo, 'cedula_proveedor', p.cedula_proveedor,'otras_senas',p.otras_senas) 
            as datosCliente 
        FROM Proveedor p WHERE e.idproveedor=p.id),NULL)) AS datosCliente 
        FROM Entrada e, Emisor em , Proveedor p
        WHERE em.id = ?
        AND e.idemisor=em.id AND e.id = ?`, [idemisor,id], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}


Entrada.obtenerEntradasAceptadas = (obj) => {
    
    return new Promise((resolve,reject) => {
        
        const {clave, consecutivo, fechaInicio,fechaFin,idemisor} = obj;
        console.log(obj);
        let sql = "SELECT e.numero_interno,SUBSTRING(e.fecha_factura,1,10) as fecha, e.clavenumerica, p.proveedor_nombre, e.tipo_factura,e.medio_pago, e.codicion_impuesto,e.condicion_venta, e.totaldescuentos,e.totalservgravados, e.totalservexentos, e.totalservexonerado, e.totalmercanciasgravadas,  e.totalmercanciasexentas,e.totalmercanciaexonerada, e.totalgravado, e.totalexento,e.totalexonerado, e.totalventa, e.totalventaneta,e.subtotal, e.totalimpuesto ,e.TotalOtrosCargos, e.totalcomprobante, e.codigomoneda, e.tipocambio,e.anulada,e.claveReferencia FROM Entrada e, Proveedor p, Emisor em WHERE e.idemisor = "+idemisor+" AND e.idemisor = em.id AND e.idproveedor = p.id AND e.estadoHacienda = 'aceptado'";
        // -- AND e.estadoHacienda = 'aceptado'
        if( fechaInicio !== '' && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";

        } 
        
        if(clave !== ''){

            sql +=" AND e.clavenumerica = '"+clave+"'";

        } 
        
        if(consecutivo !== ''){

            sql +=" AND e.consecutivo = '"+consecutivo+"'";
        } 

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 
            console.log(rows);
            resolve(rows);
        })
    })
}

Entrada.sumarEntradasPorCodigoMoneda = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {clave, consecutivo, fechaInicio,fechaFin,idemisor} = obj;
        //AGREGA EL SUM DE NC+FC
        let sql ="SELECT codigomoneda, SUM(totaldescuentos) as totaldescuentos,SUM(totalservgravados) as totalservgravados,  SUM( totalservexentos) as totalservexentos, SUM(totalservexonerado) as totalservexonerado, SUM(totalmercanciasgravadas) as totalmercanciasgravadas,  SUM(totalmercanciasexentas) as totalmercanciasexentas, SUM(totalmercanciaexonerada) as totalmercanciaexonerada, SUM(totalgravado) as totalgravado, SUM(totalexento) as totalexento, SUM(totalexonerado) as totalexonerado , SUM(totalventa) as totalventa, SUM(totalventaneta) as totalventaneta, SUM(subtotal) as subtotal, SUM(totalimpuesto) as totalimpuesto ,SUM(TotalOtrosCargos) as TotalOtrosCargos, SUM(totalcomprobante) as totalcomprobante FROM ( ";

        //SOLO FACTURAS
        sql += "SELECT e.codigomoneda, SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados,  SUM( e.totalservexentos) as totalservexentos, SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas,  SUM(e.totalmercanciasexentas) as totalmercanciasexentas, SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, SUM(e.totalgravado) as totalgravado, SUM(e.totalexento) as totalexento, SUM(e.totalexonerado) as totalexonerado , SUM(e.totalventa) as totalventa, SUM(e.totalventaneta) as totalventaneta, SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto) as totalimpuesto ,SUM(e.TotalOtrosCargos) as TotalOtrosCargos, SUM(e.totalcomprobante) as totalcomprobante FROM Entrada e, Proveedor p, Emisor em  WHERE e.idemisor = "+idemisor+" AND e.idemisor = em.id AND e.idproveedor = p.id AND e.numero_interno like 'F%'";
        //-- AND e.estadoHacienda = 'aceptado'
        if( fechaInicio !== '' && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        
        if(clave !== ''){

            sql +=" AND e.clavenumerica = '"+clave+"'";
        } 
        
        if(consecutivo !== ''){

            sql +=" AND e.consecutivo = '"+consecutivo+"'";
        } 

        sql+=" GROUP BY e.codigomoneda";

        //AGREGA LAS NC

        sql+=" UNION ALL SELECT e.codigomoneda, SUM(e.totaldescuentos)*-1 as totaldescuentos,SUM(e.totalservgravados)*-1 as totalservgravados, SUM( e.totalservexentos)*-1 as totalservexentos, SUM(e.totalservexonerado)*-1 as totalservexonerado,SUM(e.totalmercanciasgravadas)*-1 as totalmercanciasgravadas,  SUM(e.totalmercanciasexentas)*-1 as totalmercanciasexentas, SUM(e.totalmercanciaexonerada)*-1 as totalmercanciaexonerada, SUM(e.totalgravado)*-1 as totalgravado, SUM(e.totalexento)*-1 as totalexento, SUM(e.totalexonerado)*-1 as totalexonerado , SUM(e.totalventa)*-1 as totalventa, SUM(e.totalventaneta)*-1 as totalventaneta, SUM(e.subtotal)*-1 as subtotal, SUM(e.totalimpuesto)*-1 as totalimpuesto , SUM(e.TotalOtrosCargos)*-1 as TotalOtrosCargos, SUM(e.totalcomprobante)*-1 as totalcomprobante FROM Entrada e, Proveedor p, Emisor em  WHERE e.idemisor = 95 AND e.idemisor = em.id AND e.idproveedor = p.id AND e.numero_interno like 'N%'";

        if( fechaInicio !== '' && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        
        if(clave !== ''){

            sql +=" AND e.clavenumerica = '"+clave+"'";
        } 
        
        if(consecutivo !== ''){

            sql +=" AND e.consecutivo = '"+consecutivo+"'";
        } 

        sql+=" GROUP BY e.codigomoneda";

        //TERMINA EL SUM
        sql += " ) AS consulta GROUP BY codigomoneda";

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 
            resolve(rows);
        })
    })
}



Entrada.obtenerEntradasPorArticulo = (obj) => {

    return new Promise((resolve,reject) => {

        const {fechaInicio,fechaFin, articulo, idemisor }= obj;

        let sql = "SELECT SUBSTRING(e.fecha_factura,1,10) as fecha, a.codigobarra_producto, a. descripcion as nombre, c.descripcion as categoria, SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto) as totalimpuesto, SUM(e.TotalOtrosCargos) as otroscargos,  SUM(e.totalcomprobante) as total FROM Entrada e, Articulo a, Categoria c, Entrada_Detalle ed, Emisor em WHERE e.idemisor = "+idemisor+" AND e.idemisor = em.id AND e.id = ed.identrada AND a.id = ed.idarticulo AND a.idcategoria = c.id AND e.estadoHacienda = 'aceptado'";

        if(fechaInicio !== '' && fechaFin !== ''){
            sql += " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        }

        if(articulo !== ''){
            sql += " AND a.descripcion = '"+articulo+"'";
        }

        sql += " GROUP BY SUBSTRING(e.fecha_factura,1,10), a.codigobarra_producto, a. descripcion, c.descripcion";

        console.log(sql);

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Entrada.obtenerEntradasPorProveedor = (obj) => {
    return new Promise((resolve,reject) => {
        const {fechaInicio,fechaFin,proveedor, idemisor,moneda} = obj;
        //sum de nc+fc
        let sql ="SELECT  proveedor, SUM(subtotal) as subtotal, SUM(totalimpuesto) as totalimpuesto, SUM(otrosCargos) as otrosCargos , SUM(total) as total FROM ("
        //select fc
        sql+= "SELECT  p.proveedor_nombre AS proveedor, SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto) as totalimpuesto, SUM(e.TotalOtrosCargos) as otroscargos, SUM(e.totalcomprobante) as total  FROM Entrada E, Proveedor P, Emisor em WHERE e.idemisor = "+idemisor+"  AND e.idemisor = em.id AND e.idproveedor = p.id AND e.numero_interno like 'F%'";

        if(fechaInicio !== ''& fechaFin !== ''){
            sql += " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        }

        if(moneda !== ''){
            sql += " AND e.codigomoneda= '" + moneda + "'";
        }


        if(proveedor !== ''){
            sql+= " AND p.proveedor_nombre='"+proveedor+"'";
        }

        sql +=  " GROUP BY p.proveedor_nombre";

        //select nc
        sql+= " UNION ALL SELECT  p.proveedor_nombre AS proveedor, SUM(e.subtotal)*-1 as subtotal, SUM(e.totalimpuesto)*-1 as totalimpuesto, SUM(e.TotalOtrosCargos)*-1 as otroscargos, SUM(e.totalcomprobante)*-1 as total  FROM Entrada E, Proveedor P, Emisor em WHERE e.idemisor = "+idemisor+"  AND e.idemisor = em.id AND e.idproveedor = p.id AND e.numero_interno like 'N%'";

        if(fechaInicio !== ''& fechaFin !== ''){
            sql += " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        }

        if(moneda !== ''){
            sql += " AND e.codigomoneda= '" + moneda + "'";
        }

        if(proveedor !== ''){
            sql+= " AND p.proveedor_nombre='"+proveedor+"'";
        }

        sql +=  " GROUP BY p.proveedor_nombre";

        sql +=  " ) as consulta GROUP BY proveedor";

        console.log(sql);

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
    
            resolve(rows);
        })
    })
}

Entrada.obtenerEntradasNoEnviadas = (obj) => {
    return new Promise((resolve,reject) => {
        const {cantidad, desde} = obj;

        pool.query(`
            SELECT e.id as identrada, e.codigo_estado, e.estadoHacienda, e.tipo_factura , em.id as idemisor, e.clavenumerica
            FROM Entrada e , Emisor em
            WHERE e.idemisor = em.id  
            AND em.estado_emisor = 1
            AND  e.estadoHacienda IS NULL
            AND em.client_id = 'api-prod'
            ORDER BY e.id ASC LIMIT ${desde},${cantidad}
        `,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}



Entrada.obtenerDatosMensajeAceptacionNoEnviadas = (idfactura) => {

    return new Promise((resolve,reject) => {

        pool.query(`
        SELECT e.clavenumerica, e.fecha_factura, e.status_factura, e.codicion_impuesto, e.totalcomprobante,e.totalimpuesto,p.codigo_actividad, p.cedula_proveedor, e.consecutivo_receptor, em.cedula_emisor, em.file_p12 as llave, em.pin_p12 as clave FROM Entrada e, Proveedor p, Emisor em WHERE e.id = ? AND e.idproveedor = p.id AND e.idemisor = em.id
        `,[idfactura],(err, rows, fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })

}

Entrada.obtenerEntradasAceptadasReporteD151 = (obj) => {
    
    return new Promise((resolve,reject) => {
        
        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;
        
        let sql = "SELECT SUBSTRING(e.fecha_factura,1,10) AS fecha ,e.clavenumerica,e.tipo_factura, p.proveedor_nombre,e.numero_interno, p.proveedor_nombre_comercial,p.cedula_proveedor,e.tipo_factura,e.medio_pago, e.codicion_impuesto,e.condicion_venta, e.totaldescuentos,e.totalservgravados, e.totalservexentos, e.totalservexonerado, e.totalmercanciasgravadas,  e.totalmercanciasexentas,e.totalmercanciaexonerada, e.totalgravado, e.totalexento,e.totalexonerado, e.totalventa, e.totalventaneta,e.subtotal, e.totalimpuesto ,e.TotalOtrosCargos, e.totalcomprobante, e.codigomoneda, e.tipocambio FROM Entrada e, Proveedor p, Emisor em WHERE e.idemisor = "+idemisor+" AND e.idemisor = em.id AND e.idproveedor = p.id AND e.estadoHacienda = 'aceptado'";

        if( fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";

        } 

        if(montoCompra && montoCompra.toString() !== ''){

            sql +=" AND e.totalcomprobante >= "+Number(montoCompra);
        } 

        sql += " ORDER BY p.proveedor_nombre,e.codigomoneda";

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

//funcion para obtener los totales de compras agrupados por proveedor y moneda

Entrada.obtenerEntradasAgrupadasPorProveedor = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;

        let sql = `
                SELECT p.id as idproveedor, p.proveedor_nombre,p.cedula_proveedor,
                SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados, SUM(e.totalservexentos) as totalservexentos, 
                SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas, 
                SUM(e.totalmercanciasexentas) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, 
                SUM(e.totalgravado) as totalgravado, SUM(e.totalexento) as totalexento,SUM(e.totalexonerado) as totalexonerado, 
                SUM(e.totalventa) as totalventa,SUM(e.totalventaneta) as totalventaneta,SUM(e.subtotal) as subtotal, 
                SUM(e.totalimpuesto) as totalimpuesto, SUM(e.TotalOtrosCargos) as TotalOtrosCargos, SUM(e.totalcomprobante) as totalcomprobante 
                FROM Entrada e, Proveedor p, Emisor em 
                WHERE e.idemisor = ${idemisor}
                AND e.idemisor = em.id 
                AND e.idproveedor = p.id 
                AND e.estadoHacienda = 'aceptado' 
                AND SUBSTRING(e.numero_interno,1,1) <> 'N'
                AND e.codigomoneda = 'CRC'
               
                ${fechaInicio && fechaInicio !== '' && fechaFin && fechaFin ? 
                    " AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'": ' '
                }

                ${montoCompra && montoCompra.toString() !== ''? 
                    " AND e.totalcomprobante >= "+Number(montoCompra): ' '    
                }

                GROUP BY  p.proveedor_nombre,p.cedula_proveedor,p.id UNION 
                SELECT p.id as idproveedor, p.proveedor_nombre,p.cedula_proveedor,
                SUM(e.totaldescuentos * e.tipocambio) as totaldescuentos,SUM(e.totalservgravados * e.tipocambio) as totalservgravados, SUM(e.totalservexentos * e.tipocambio) as totalservexentos, 
                SUM(e.totalservexonerado * e.tipocambio) as totalservexonerado, SUM(e.totalmercanciasgravadas * e.tipocambio) as totalmercanciasgravadas, 
                SUM(e.totalmercanciasexentas * e.tipocambio) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada * e.tipocambio) as totalmercanciaexonerada, 
                SUM(e.totalgravado * e.tipocambio) as totalgravado, SUM(e.totalexento * e.tipocambio) as totalexento,SUM(e.totalexonerado * e.tipocambio) as totalexonerado, 
                SUM(e.totalventa * e.tipocambio) as totalventa,SUM(e.totalventaneta * e.tipocambio) as totalventaneta,SUM(e.subtotal * e.tipocambio) as subtotal, 
                SUM(e.totalimpuesto * e.tipocambio) as totalimpuesto, SUM(e.TotalOtrosCargos * e.tipocambio) as TotalOtrosCargos, SUM(e.totalcomprobante * e.tipocambio) as totalcomprobante 
                FROM Entrada e, Proveedor p, Emisor em 
                WHERE e.idemisor = ${idemisor}
                AND e.idemisor = em.id 
                AND e.idproveedor = p.id 
                AND e.estadoHacienda = 'aceptado' 
                AND SUBSTRING(e.numero_interno,1,1) <> 'N'
                AND e.codigomoneda <> 'CRC'

                ${fechaInicio && fechaInicio !== '' && fechaFin && fechaFin ? 
                    " AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'": ' '
                }

                ${montoCompra && montoCompra.toString() !== ''? 
                    " AND e.totalcomprobante >= "+Number(montoCompra): ' '    
                }
                GROUP BY  p.proveedor_nombre,p.cedula_proveedor,p.id
            `;

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Entrada.obtenerEntradasAgrupadasNotaCreditoPorProveedor = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;

        let sql = `
                SELECT p.id as idproveedor, p.proveedor_nombre,p.cedula_proveedor,
                SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados, SUM(e.totalservexentos) as totalservexentos, 
                SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas, 
                SUM(e.totalmercanciasexentas) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, 
                SUM(e.totalgravado) as totalgravado, SUM(e.totalexento) as totalexento,SUM(e.totalexonerado) as totalexonerado, 
                SUM(e.totalventa) as totalventa,SUM(e.totalventaneta) as totalventaneta,SUM(e.subtotal) as subtotal, 
                SUM(e.totalimpuesto) as totalimpuesto, SUM(e.TotalOtrosCargos) as TotalOtrosCargos, SUM(e.totalcomprobante) as totalcomprobante 
                FROM Entrada e, Proveedor p, Emisor em 
                WHERE e.idemisor = ${idemisor}
                AND e.idemisor = em.id 
                AND e.idproveedor = p.id 
                AND e.estadoHacienda = 'aceptado' 
                AND SUBSTRING(e.numero_interno,1,1) = 'N'
                AND e.tipocambio = 'CRC'
                
                ${fechaInicio && fechaInicio !== '' && fechaFin && fechaFin ? 
                    " AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'": ' '
                }

                ${montoCompra && montoCompra.toString() !== ''? 
                    " AND e.totalcomprobante >= "+Number(montoCompra): ' '    
                }
                GROUP BY p.proveedor_nombre,p.cedula_proveedor,p.id UNION 
                SELECT p.id as idproveedor, p.proveedor_nombre,p.cedula_proveedor,
                SUM(e.totaldescuentos * e.tipocambio) as totaldescuentos,SUM(e.totalservgravados * e.tipocambio) as totalservgravados, SUM(e.totalservexentos * e.tipocambio) as totalservexentos, 
                SUM(e.totalservexonerado * e.tipocambio) as totalservexonerado, SUM(e.totalmercanciasgravadas * e.tipocambio) as totalmercanciasgravadas, 
                SUM(e.totalmercanciasexentas * e.tipocambio) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada * e.tipocambio) as totalmercanciaexonerada, 
                SUM(e.totalgravado * e.tipocambio) as totalgravado, SUM(e.totalexento * e.tipocambio) as totalexento,SUM(e.totalexonerado * e.tipocambio) as totalexonerado, 
                SUM(e.totalventa * e.tipocambio) as totalventa,SUM(e.totalventaneta * e.tipocambio) as totalventaneta,SUM(e.subtotal * e.tipocambio) as subtotal, 
                SUM(e.totalimpuesto * e.tipocambio) as totalimpuesto, SUM(e.TotalOtrosCargos * e.tipocambio) as TotalOtrosCargos, SUM(e.totalcomprobante * e.tipocambio) as totalcomprobante 
                FROM Entrada e, Proveedor p, Emisor em 
                WHERE e.idemisor = ${idemisor}
                AND e.idemisor = em.id 
                AND e.idproveedor = p.id 
                AND e.estadoHacienda = 'aceptado' 
                AND SUBSTRING(e.numero_interno,1,1) = 'N'
                AND e.tipocambio <>	'CRC'
                ${fechaInicio && fechaInicio !== '' && fechaFin && fechaFin ? 
                    " AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'": ' '
                }

                ${montoCompra && montoCompra.toString() !== ''? 
                    " AND e.totalcomprobante >= "+Number(montoCompra): ' '    
                }
                GROUP BY p.proveedor_nombre,p.cedula_proveedor,p.id 
                `;

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Entrada.obtenerEntradasParaActualizarTipoCambio = () => {

    return new Promise((resolve,reject)  => {

        pool.query(`
        SELECT SUBSTRING(fecha_factura,1,10) as fecha FROM Entrada WHERE tipocambio = 1 OR tipocambio < 1 GROUP BY SUBSTRING(fecha_factura,1,10) LIMIT 30;
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

Entrada.actualizarTipoCambio =(obj) => {
    return new Promise((resolve,reject) => {

        const {fecha,tipocambio} = obj;

        pool.query('UPDATE Entrada SET tipocambio = ? WHERE SUBSTRING(fecha_factura,1,10) = ?',
            [tipocambio,fecha],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Entrada.obtenerDatosEnvioEntrada = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor,identrada} = obj;
        const sql = `
            SELECT em.key_username_hacienda, em.key_password_hacienda,
                em.TOKEN_API, em.Client_ID, em.emisor_tipo_identificacion,
                em.numero_emisor, em.API,p.proveedor_tipo_identificacion,
                p.numero_proveedor,e.clavenumerica,e.fecha_factura
            FROM Entrada e, Proveedor p, Emisor em

            WHERE e.idemisor = em.id 
            AND e.idemisor =${idemisor}
            AND e.idproveedor = p.id
            AND e.id = ${identrada}
        `;

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
} 

Entrada.obtenerTotalesEntradasAgrupadosPorTipoImpuestoPorLinea = (obj) => {

    return new Promise((resolve,reject) => {

        const {fechaInicio,fechaFin,idemisor} = obj;

        const sql = `
        SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as montototal, 
		0 as MontoExoneracion,
        (CASE
            WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Tipo_Impuesto t
        WHERE t.idemisor = ${idemisor}
        AND  t.porcentaje_impuesto not in
        (SELECT DISTINCT ed.tarifa
        FROM Entrada e, Entrada_Detalle ed
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        ) UNION (SELECT ed.tarifa, SUM(ed.subtotal) as subtotal, SUM(ed.montototal) as montototal, 
            SUM(ed.MontoExoneracion) as MontoExoneracion,
        (CASE
            WHEN ed.tarifa = 0 THEN 'IVA 0%'
            WHEN ed.tarifa = 1 THEN 'IVA 1%'
            WHEN ed.tarifa = 2 THEN 'IVA 2%'
            WHEN ed.tarifa = 4 THEN 'IVA 4%'
            WHEN ed.tarifa = 8 THEN 'IVA 8%'
            WHEN ed.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Articulo a, Entrada e, Entrada_Detalle ed
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        AND a.id = ed.idarticulo
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa ORDER BY ed.tarifa ASC)
        `
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Entrada.obtenerTotalesPorLineasAgrupadosPorMercanciasYServicios = (obj) => {
    return new Promise((resolve,reject) => {
        
        const {fechaInicio,fechaFin,idemisor} = obj;
        const sql = `
        SELECT t.porcentaje_impuesto,NULL as codigo_servicio,0 as impuesto_neto, 0 as subtotal,
        (CASE
            WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Tipo_Impuesto t
        WHERE t.idemisor = ${idemisor}
        AND t.porcentaje_impuesto not in
        (SELECT DISTINCT ed.tarifa
            FROM Entrada e, Entrada_Detalle ed
            WHERE e.idemisor = ${idemisor}
            AND e.id = ed.identrada	
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        ) UNION (SELECT ed.tarifa,a.codigo_servicio,SUM(ed.subtotal) as subtotal, SUM(ed.impuesto_neto) as impuesto_neto ,
        (CASE
            WHEN ed.tarifa = 0 THEN 'IVA 0%'
            WHEN ed.tarifa = 1 THEN 'IVA 1%'
            WHEN ed.tarifa = 2 THEN 'IVA 2%'
            WHEN ed.tarifa = 4 THEN 'IVA 4%'
            WHEN ed.tarifa = 8 THEN 'IVA 8%'
            WHEN ed.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Entrada_Detalle ed, Entrada e, Articulo a
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        AND ed.idarticulo = a.id
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY a.codigo_servicio,ed.tarifa ORDER BY ed.tarifa ASC);
        `;

        console.log(sql)
        pool.query(sql, [],(err,rows) => {
            if(err) return reject(err);
            resolve(rows)
        })
    })
}

//------------------- MERCANCIAS  Y SERVICIOS ----------------------------------------------------------------------------------------------------


Entrada.obtenerSumatoriaLineasPorTarifaMercancias = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,fechaInicio,fechaFin,moneda} = obj;
        let sql =`
        select porcentaje_impuesto, sum(subtotal) as subtotal,sum(impuesto_neto) as impuesto_neto,
        (CASE
            WHEN porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        from
        (`;
        
        sql += `
        SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as impuesto_neto, 
        (CASE
            WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Tipo_Impuesto t
        WHERE t.idemisor = ${idemisor}
        AND  t.porcentaje_impuesto not in
        (SELECT DISTINCT ed.tarifa
            FROM Articulo a, Entrada e, Entrada_Detalle ed
            WHERE e.idemisor = ${idemisor}
            AND e.id = ed.identrada
            AND a.id = ed.idarticulo
            AND a.codigo_servicio = 'Mercancía'
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio 
        ) UNION (SELECT ed.tarifa, SUM(ed.subtotal) as subtotal, SUM(ed.impuesto_neto) as impuesto_neto, 
        (CASE
            WHEN ed.tarifa = 0 THEN 'IVA 0%'
            WHEN ed.tarifa = 1 THEN 'IVA 1%'
            WHEN ed.tarifa = 2 THEN 'IVA 2%'
            WHEN ed.tarifa = 4 THEN 'IVA 4%'
            WHEN ed.tarifa = 8 THEN 'IVA 8%'
            WHEN ed.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Articulo a, Entrada e, Entrada_Detalle ed
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        AND a.id = ed.idarticulo
        AND e.numero_interno like 'F%'
        AND a.codigo_servicio = 'Mercancía'
        ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''}
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio )
        `;

        sql += `
        UNION ALL
        SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as impuesto_neto, 
        (CASE
            WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Tipo_Impuesto t
        WHERE t.idemisor = ${idemisor}
        AND  t.porcentaje_impuesto not in
        (SELECT DISTINCT ed.tarifa
            FROM Articulo a, Entrada e, Entrada_Detalle ed
            WHERE e.idemisor = ${idemisor}
            AND e.id = ed.identrada
            AND a.id = ed.idarticulo
            AND a.codigo_servicio = 'Mercancía'
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio 
        ) UNION (SELECT ed.tarifa, SUM(ed.subtotal)*-1 as subtotal, SUM(ed.impuesto_neto)*-1 as impuesto_neto, 
        (CASE
            WHEN ed.tarifa = 0 THEN 'IVA 0%'
            WHEN ed.tarifa = 1 THEN 'IVA 1%'
            WHEN ed.tarifa = 2 THEN 'IVA 2%'
            WHEN ed.tarifa = 4 THEN 'IVA 4%'
            WHEN ed.tarifa = 8 THEN 'IVA 8%'
            WHEN ed.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Articulo a, Entrada e, Entrada_Detalle ed
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        AND a.id = ed.idarticulo
        AND e.numero_interno like 'N%'
        AND a.codigo_servicio = 'Mercancía'
        ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''}
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio )
        ) as consulta GROUP BY porcentaje_impuesto ORDER BY porcentaje_impuesto ASC`;

        console.log("mercancias entradas",sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

// ------------------------------------------------------------------------------------------- Servicios

Entrada.obtenerSumatoriaLineasPorTarifaServicios = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,fechaInicio,fechaFin,moneda} = obj;
//AGRUPA FC+ NC        
        let sql =  `
            SELECT porcentaje_impuesto, SUM(subtotal) as subtotal, SUM(impuesto_neto) as impuesto_neto,
            (CASE
                WHEN porcentaje_impuesto = 0 THEN 'IVA 0%'
                WHEN porcentaje_impuesto = 1 THEN 'IVA 1%'
                WHEN porcentaje_impuesto = 2 THEN 'IVA 2%'
                WHEN porcentaje_impuesto = 4 THEN 'IVA 4%'
                WHEN porcentaje_impuesto = 8 THEN 'IVA 8%'
                WHEN porcentaje_impuesto = 13 THEN 'IVA 13%'
            END) AS descripcion
            FROM
            (`;
//AGREGA FC
        sql +=  `
        SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as impuesto_neto, 
            (CASE
                WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
                WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
                WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
                WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
                WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
                WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
            END) AS descripcion
            FROM Tipo_Impuesto t
            WHERE t.idemisor = ${idemisor}
            AND  t.porcentaje_impuesto not in
            (SELECT DISTINCT ed.tarifa
                FROM Articulo a, Entrada e, Entrada_Detalle ed
                WHERE e.idemisor = ${idemisor}
                AND e.id = ed.identrada
                AND a.id = ed.idarticulo
                AND a.codigo_servicio = 'Servicio'
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
            GROUP BY ed.tarifa,a.codigo_servicio ) 
            UNION (SELECT ed.tarifa, SUM(ed.subtotal) as subtotal, SUM(ed.impuesto_neto) as impuesto_neto, 
            (CASE
                WHEN ed.tarifa = 0 THEN 'IVA 0%'
                WHEN ed.tarifa = 1 THEN 'IVA 1%'
                WHEN ed.tarifa = 2 THEN 'IVA 2%'
                WHEN ed.tarifa = 4 THEN 'IVA 4%'
                WHEN ed.tarifa = 8 THEN 'IVA 8%'
                WHEN ed.tarifa = 13 THEN 'IVA 13%'
            END) AS descripcion
            FROM Articulo a, Entrada e, Entrada_Detalle ed
            WHERE e.idemisor = ${idemisor}
            AND e.id = ed.identrada
            AND a.id = ed.idarticulo
            AND e.numero_interno like 'F%'
            AND a.codigo_servicio = 'Servicio'
            ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''}
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
            GROUP BY ed.tarifa,a.codigo_servicio )
    `;
//AGREGA NC
    sql +=  `
    UNION ALL
    SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as impuesto_neto, 
        (CASE
            WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
            WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
            WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
            WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
            WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
            WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Tipo_Impuesto t
        WHERE t.idemisor = ${idemisor}
        AND  t.porcentaje_impuesto not in
        (SELECT DISTINCT ed.tarifa
            FROM Articulo a, Entrada e, Entrada_Detalle ed
            WHERE e.idemisor = ${idemisor}
            AND e.id = ed.identrada
            AND a.id = ed.idarticulo
            AND a.codigo_servicio = 'Servicio'
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio ) 
        UNION (SELECT ed.tarifa, SUM(ed.subtotal)*-1 as subtotal, SUM(ed.impuesto_neto)*-1 as impuesto_neto, 
        (CASE
            WHEN ed.tarifa = 0 THEN 'IVA 0%'
            WHEN ed.tarifa = 1 THEN 'IVA 1%'
            WHEN ed.tarifa = 2 THEN 'IVA 2%'
            WHEN ed.tarifa = 4 THEN 'IVA 4%'
            WHEN ed.tarifa = 8 THEN 'IVA 8%'
            WHEN ed.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Articulo a, Entrada e, Entrada_Detalle ed
        WHERE e.idemisor = ${idemisor}
        AND e.id = ed.identrada
        AND a.id = ed.idarticulo
        AND e.numero_interno like 'N%'
        AND a.codigo_servicio = 'Servicio'
        ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''}
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
        GROUP BY ed.tarifa,a.codigo_servicio )
        )as consulta GRoup by porcentaje_impuesto order by porcentaje_impuesto
`;


        console.log("servicios ",sql)
        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

Entrada.obtenerSubtotalesEntradas = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,fechaInicio,fechaFin,moneda} = obj;

        //SQL FC
        /*let sql = `
        SELECT 
                t.porcentaje_impuesto, 0 subtotal
            FROM
                Tipo_Impuesto t
            WHERE
                t.idemisor = ${idemisor}
                    AND t.porcentaje_impuesto NOT IN (SELECT DISTINCT
                        ed.tarifa
                    FROM
                        Entrada e,
                        Entrada_Detalle ed
                    WHERE
                        e.idemisor = ${idemisor} AND e.id = ed.identrada 
                        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                        )
            UNION (SELECT 
                ed.tarifa, SUM(ed.subtotal) AS subtotal
            FROM
                Entrada_Detalle ed,
                Entrada e
            WHERE
                e.idemisor = ${idemisor} AND e.id = ed.identrada
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                ${moneda && moneda.length > 0 ? " AND e.numero_interno like 'F%' AND e.codigomoneda = '"+moneda+"'": ''}
            GROUP BY ed.tarifa
            ORDER BY ed.tarifa ASC);
    
        `;*/
        //SUMA NC+ FC
        let sql = `
        SELECT 
            porcentaje_impuesto, SUM(subtotal) AS subtotal
            FROM
            (   `
        
        //SQL FC
        sql += `
            SELECT 
                ed.tarifa as porcentaje_impuesto, SUM(ed.subtotal) AS subtotal
            FROM
                Entrada_Detalle ed,
                Entrada e
            WHERE
                e.idemisor = ${idemisor} AND e.id = ed.identrada
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''} AND e.numero_interno like 'F%'
            GROUP BY ed.tarifa
    
        `;        


        //SQL NC
        sql += `
            UNION ALL    
            SELECT 
                ed.tarifa as porcentaje_impuesto, SUM(ed.subtotal)*-1 AS subtotal
            FROM
                Entrada_Detalle ed,
                Entrada e
            WHERE
                e.idemisor = ${idemisor} AND e.id = ed.identrada
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(e.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(e.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                ${moneda && moneda.length > 0 ? " AND e.codigomoneda = '"+moneda+"'": ''} AND e.numero_interno like 'N%'
            GROUP BY ed.tarifa
    
        `;
        
        sql += `) as consulta group by porcentaje_impuesto order by porcentaje_impuesto `;


        console.log("totales entradas ",sql)
        pool.query(sql,[],(err,rows) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}


Entrada.actualizarCodigoEstadoEntradaRebotada = (obj) => {

    return new Promise((resolve,reject) =>{
        const {clave, codigo_estado,error,estado} = obj;
        console.log("obj",obj);
        const sql = 
            "UPDATE Entrada SET codigo_estado = "+codigo_estado+", errorEnvio= '"+error+"',estadoHacienda = '"+estado+"' WHERE clavenumerica = '"+clave+"'";
        ;
        pool.query(sql,[codigo_estado,error,estado,clave],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Entrada.obtenerEntradaAnulacion = (obj) => {

    return new Promise((resolve,reject) => {
        const {idfactura,idemisor} = obj;
        pool.query(`
                SELECT ed.totalcomprobante  as totalFactura, ed.tipo_factura, ed.num_documento,ed.totalventa, ed.totalimpuesto as impuestos,
                ed.totaldescuentos as descuentos,ed.condicion_venta, ed.medio_pago,ed.tipocambio,ed.codigomoneda, ed.id as idfactura, ed.clavenumerica,
                ed.fecha_factura,ed.TotalOtrosCargos as otrosCargos,ed.notas,ed.plazo_credito, e.id as idemisor,
                ((SELECT JSON_OBJECT(
                    'nombre',p.proveedor_nombre,
                    'nombrecomercial', p.proveedor_nombre_comercial, 
                    'telefono', p.proveedor_telefono_numtelefono, 
                    'cedula',p.cedula_proveedor,
                    'correo', p.proveedor_correo,
                    'idproveedor',p.id) 
                        FROM Emisor e 
                        WHERE ed.idemisor=e.id) ) as proveedor 
                FROM  Entrada ed, Emisor e,Proveedor p
                WHERE ed.id = ${idfactura}
                AND e.id = ${idemisor}
                AND ed.idemisor = e.id
                AND ed.idproveedor = p.id
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            console.log(rows);

            resolve(rows);
        })
    })
}

Entrada.entradaAnulacion = (obj) => {
    return new Promise((resolve,reject) => {
        console.log("Objeto entrada anulacion" , obj);
        const {
            idusuario,
            idproveedor,
            idemisor,
            clavenumerica,
            consecutivo,
            numero_interno,
            num_documento,
            consecutivo_receptor,
            fecha_factura,
            tipo_factura,
            condicion_venta,
            medio_pago,
            plazo_credito,
            condicion_impuesto,
            porcentaje_descuento_total,
            monto_descuento_total,
            subtotal,
            totalservgravados,
            totalservexentos,
            totalservexonerado,
            totalmercanciasgravadas,
            totalmercanciasexentas,
            totalmercanciaexonerada,
            totalgravado,
            totalexento,
            totalexonerado,
            totalventa,
            totaldescuentos,
            totalventaneta,
            totalimpuesto,
            totalcomprobante,
            totalIVADevuelto,
            TotalOtrosCargos,
            codigomoneda,
            tipocambio,
            status_factura,
            notas,
            fechaReferencia,
            claveReferencia
        } = obj;
        pool.query('INSERT INTO Entrada(idusuario,idproveedor,idemisor,clavenumerica,consecutivo,numero_interno,consecutivo_receptor,fecha_factura,tipo_factura,condicion_venta,medio_pago,plazo_credito,codicion_impuesto,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,status_factura,notas,fechaReferencia,claveReferencia) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [idusuario,idproveedor,idemisor,clavenumerica,consecutivo,numero_interno,consecutivo_receptor,fecha_factura,tipo_factura,condicion_venta,medio_pago,plazo_credito,condicion_impuesto,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,totalIVADevuelto,TotalOtrosCargos,codigomoneda,tipocambio,status_factura,notas,fechaReferencia,claveReferencia], (err, rows, fields) => {
            if(err){
                console.log("error entradas",err)
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Entrada.obtenerReferenciaPorId = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idfactura} = obj;

        pool.query(`
        SELECT fecha_factura,clavenumerica FROM Entrada WHERE idemisor = ${idemisor} AND id = ${idfactura} 
        `,[],(err,rows,fields) => {
            if(err){
                console.log("error entradas",err)
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Entrada.obtenerDatosEncabezadoYTotalesEntradaAnulacion = (idfactura) => {
    return new Promise((resolve,reject) => {

        const sql = `SELECT DISTINCT e.id, e.idemisor,e.idproveedor,e.clavenumerica, e.consecutivo,e.condicion_venta, e.medio_pago,
        e.fecha_factura, e.porcentaje_descuento_total,e.monto_descuento_total,e.subtotal,e.totalservgravados,e.totalservexentos,
         e.totalservexonerado,e.totalmercanciasgravadas,e.totalmercanciasexentas, e.totalmercanciaexonerada, e.totalgravado,
         e.totalexento, e.totalexonerado,e.totalventa,e.totaldescuentos,e.totalventaneta,e.totalimpuesto,e.totalcomprobante,
         e.codigomoneda, e.tipocambio,e.tipo_factura,e.TotalOtrosCargos,e.totalIVADevuelto,e.plazo_credito,e.claveReferencia,e.fechaReferencia, e.notas,
         e.porcentaje_descuento_total,e.monto_descuento_total,
         em.emisor_nombre,em.emisor_nombrecomercial,  em.cedula_emisor, em.numero_emisor,em.emisor_tipo_identificacion, em.emisor_otras_senas,
         (SELECT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
         FROM Barrios b WHERE b.CodNew = em.emisor_barrio 
            AND e.idemisor =  em.id
            AND e.id=${idfactura} ) AS ubicacion_emisor, 
         em.emisor_otras_senas, 
         em.emisor_telefono_codigopais, em.emisor_telefono_numtelefono,em.emisor_fax_codigopais, em.emisor_fax_numtelefono,
         em.emisor_correo,em.key_username_hacienda, em.key_password_hacienda,em.tipo_codigo_servicio, em.codigo_servicio, 
         em.Client_ID, em.API, em.TOKEN_API,em.file_p12,em.pin_p12, em.numeroresolucion,em.fecharesolucion, em.codigo_actividad,p.proveedor_nombre, 
         p.proveedor_nombre_comercial, p.proveedor_tipo_identificacion, 
         p.cedula_proveedor, p.numero_proveedor, p.identificacion_extranjero,p.otras_senas,
         p.otras_senas_extranjero,p.proveedor_telefono_codigopais, p.proveedor_telefono_numtelefono,
         p.proveedor_fax_codigopais, p.proveedor_fax_numtelefono,p.proveedor_correo, p.otras_senas, otras_senas_extranjero,
        (SELECT DISTINCT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
         FROM Barrios b WHERE b.CodNew = p.proveedor_barrio 
            AND e.idemisor =  em.id
            AND e.idproveedor = p.id
            AND e.id=${idfactura}) AS ubicacion_proveedor
         FROM Entrada e, Emisor em ,Proveedor p
            WHERE e.idemisor=em.id 
            AND e.idproveedor = p.id
            AND e.id=${idfactura};`
            console.log(sql);
        pool.query(sql,[], (err, rows, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
    
                resolve(rows)
            })
    }) 
}

Entrada.actualizarEstadoAnulado = obj => {

    return new Promise((resolve,reject) => {

        const {idemisor,clave,estado} = obj;

        pool.query('UPDATE Entrada SET anulada = ? WHERE idemisor = ? and clavenumerica =?',
        [estado,idemisor,clave],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}


Entrada.obtenerEntradasPorClavenumerica=(obj) => {

    return new Promise((resolve,reject) => {

        const {clavenumerica,idemisor} = obj;
        pool.query("SELECT id FROM Entrada WHERE idemisor = ? AND clavenumerica = ?",[idemisor,clavenumerica],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}
Entrada.eliminarEntrada = (obj) => {

    return new Promise((resolve,reject) => {

        const {identrada,idemisor} = obj;

        pool.query(`
            DELETE FROM Entrada WHERE idemisor = ${idemisor} AND id = ${identrada}
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Entrada.actualizarDatosReferencia = obj => {

    return new Promise((resolve,reject) => {
        const {identrada, claveReferencia,fechaReferencia,idemisor} = obj;

        pool.query('UPDATE Entrada SET claveReferencia = ? , fechaReferencia = ? WHERE idemisor = ? AND id = ?',
        [claveReferencia,fechaReferencia,idemisor,identrada],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })

}
module.exports = Entrada;

/*Entrada.obtenerTotalesComprobantesColonesProveedores = (obj) => {
 
    return new Promise((resolve, reject) => {

        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;

        let sql = "SELECT e.codigomoneda,SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados, SUM(e.totalservexentos) as totalservexentos, SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas, SUM(e.totalmercanciasexentas) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, SUM(e.totalgravado) as totalgravado,  SUM(e.totalexento) as totalexento,SUM(e.totalexonerado) as totalexonerado, SUM(e.totalventa) as totalventa,  SUM(e.totalventaneta) as totalventaneta,SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto)  as totalimpuesto,SUM(e.TotalOtrosCargos) as TotalOtrosCargos,  SUM(e.totalcomprobante) as totalcomprobante FROM Entrada e, Proveedor p, Emisor em  WHERE e.idemisor = "+idemisor+"  AND e.idemisor = em.id  AND e.idproveedor = p.id  AND e.estadoHacienda = 'aceptado' AND SUBSTRING(e.numero_interno,1,1) <> 'N' AND e.codigomoneda = 'CRC'";

        if( fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        if(montoCompra && montoCompra.toString() !== ''){

            sql +=" AND e.totalcomprobante >= "+Number(montoCompra);
        } 

        sql += "  GROUP BY e.codigomoneda;";

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 
            resolve(rows);
        })
    })
}

Entrada.obtenerTotalesComprobantesDolaresProveedores = (obj) => {
 
    return new Promise((resolve, reject) => {

        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;

        let sql = "SELECT e.codigomoneda,SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados, SUM(e.totalservexentos) as totalservexentos, SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas, SUM(e.totalmercanciasexentas) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, SUM(e.totalgravado) as totalgravado,  SUM(e.totalexento) as totalexento,SUM(e.totalexonerado) as totalexonerado, SUM(e.totalventa) as totalventa,  SUM(e.totalventaneta) as totalventaneta,SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto)  as totalimpuesto,SUM(e.TotalOtrosCargos) as TotalOtrosCargos,  SUM(e.totalcomprobante) as totalcomprobante FROM Entrada e, Proveedor p, Emisor em  WHERE e.idemisor = "+idemisor+"  AND e.idemisor = em.id  AND e.idproveedor = p.id  AND e.estadoHacienda = 'aceptado' AND SUBSTRING(e.numero_interno,1,1) <> 'N' AND e.codigomoneda <> 'CRC'";

        if( fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        if(montoCompra && montoCompra.toString() !== ''){

            sql +=" AND e.totalcomprobante >= "+Number(montoCompra);
        } 

        sql += "  GROUP BY e.codigomoneda;";

        console.log(sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 
            resolve(rows);
        })
    })
}*/ 
