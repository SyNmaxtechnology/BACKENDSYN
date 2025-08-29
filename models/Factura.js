const pool = require("../db/config");
const FacturaDetalle = require("../models/FacturaDetalle");
const Emisor = require("./Emisor");
let Factura = {};
// aI^%o&t4#vmT)^G(SgYm contraseña hosting mysql

//funciones privadas


const obtenerCliente1000 = async (idemisor) => {

    try {
        const idcliente = await Emisor.obtenerCliente1000(idemisor);
        return idcliente[0].id;
    } catch (error) {

        return error;
    }
}

const obtenerIdemisorPorFactura = (idfactura, tipo_factura) => {

    return new Promise((resolve, reject) => {
        let sql = '';

        if (tipo_factura == '03') {
            sql = `
                SELECT idemisor FROM Nota_Credito WHERE id = ${idfactura}
            `;
        } else {
            sql = `
                SELECT idemisor FROM factura WHERE id = ${idfactura}
            `;
        }
        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerIdEmisor = async (idfactura, tipo_factura) => {

    try {
        const response = await obtenerIdemisorPorFactura(idfactura, tipo_factura);
        if (response.length === 0) {
            return [];
        }
        return response[0].idemisor;
    } catch (error) {
        return error;
    }
}

Factura.nuevaFactura = (obj) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { idusuario, idcliente, idbodega, idemisor, num_documento,fecha_factura, condicion_venta, medio_pago, medio_pago2, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas, TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef, plazo_credito } = obj;

            if (idcliente.toString() === '1') {
                idcliente = await obtenerCliente1000(idemisor);
            }
            ///CAMBIO PARA CLIENTE PANAMA
            if (TipodocRef){
                pool.query('INSERT INTO Factura(idusuario,idcliente,idbodega,idemisor,fecha_factura,num_documento,condicion_venta,medio_pago,medio_pago2,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,codigomoneda,tipocambio,tipo_factura,TotalOtrosCargos, notas,TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef, plazo_credito,importada) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"'+plazo_credito+'",?)', [idusuario, idcliente, idbodega, idemisor, fecha_factura, num_documento,condicion_venta, medio_pago, medio_pago2, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas, TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef, plazo_credito], (err, rows, fields) => {
                    if (err) {
                        console.log("nueva Factura")
                        console.log(err);
                        return reject(err);
                    }

                    resolve(rows);
                });
            }else{
                pool.query('INSERT INTO Factura(idusuario,idcliente,idbodega,idemisor,fecha_factura,num_documento,condicion_venta,medio_pago,medio_pago2,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,codigomoneda,tipocambio,tipo_factura,TotalOtrosCargos, notas, plazo_credito,importada) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"'+plazo_credito+'",?)', [idusuario, idcliente, idbodega, idemisor, fecha_factura, num_documento,condicion_venta, medio_pago, medio_pago2, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas, plazo_credito], (err, rows, fields) => {
                    if (err) {
                        console.log("nueva Factura")
                        console.log(err);
                        return reject(err);
                    }

                    resolve(rows);
                }); 
            }
        } catch (error) {
            reject(error)
        }
    })
}
//HACER DECLARACION DE IMPUESTO DE VALOR AGREGADO HACIENDA, 14 DE ABRIL

Factura.guardarProforma = (obj) => {
    return new Promise(async (resolve, reject) => {

        try {
            let { idusuario, idcliente, idbodega, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos, notas, plazo_credito, idautoriza } = obj;

            if (idcliente.toString() === '1') {
                idcliente = await obtenerCliente1000(idemisor);
            }

            pool.query('INSERT INTO Factura(idusuario,idcliente,idbodega,idemisor,fecha_factura,condicion_venta,medio_pago,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,codigomoneda,tipocambio,tipo_factura,proforma,totalOtrosCargos, notas,plazo_credito,idautoriza) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [idusuario, idcliente, idbodega, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos, notas, plazo_credito, idautoriza], (err, rows, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                resolve(rows);
            });
        } catch (error) {
            reject(error);
        }
    })
}

Factura.actualizarProforma = (obj) => {

    return new Promise(async (resolve, reject) => {

        try {
            let { id, idusuario, idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, num_documento, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, prefactura, otrosCargos, notas, plazo_credito } = obj;

            if (idcliente.toString() === '1') {
                idcliente = await obtenerCliente1000(idemisor);
            }

            pool.query(`
                UPDATE Factura SET idusuario=?,idcliente=?, idemisor=?, fecha_factura=?, condicion_venta=?, medio_pago=?, num_documento=?,porcentaje_descuento_total=?, monto_descuento_total=?, subtotal=?, totalservgravados=?, totalservexentos=?, totalservexonerado=?, totalmercanciasgravadas=?, totalmercanciasexentas=?, totalmercanciaexonerada=?, totalgravado=?, totalexento=?, totalexonerado=?, totalventa=?, totaldescuentos=?, totalventaneta=?, totalimpuesto=?, totalcomprobante=?, codigomoneda=?, tipocambio=?, tipo_factura=?,TotalOtrosCargos=?,notas=?, plazo_credito = ?,importada=0 WHERE id = ?
            `, [idusuario, idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, num_documento, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, otrosCargos, notas, plazo_credito, id],
                (err, rows, fields) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(rows);
                })
        } catch (error) {
            reject(error);
        }
    })
}

Factura.guardarClaveNumerica = (obj) => {
    return new Promise((resolve, reject) => {
        console.log({ obj })
       // if (obj.num_documento == undefined){
          //  const { clave, consecutivo, id, numeroInterno, tipo_factura } = obj;
      //  }else{
            const { clave, consecutivo, id, num_documento,numeroInterno, tipo_factura } = obj;   
       // }
        let query = '';
        if (typeof tipo_factura !== 'undefined' && tipo_factura == '03') {
            query = 'UPDATE Nota_Credito SET clavenumerica =?, consecutivo=?, num_documento=?, numero_interno=? WHERE id=?';
            console.log("nota credito seleccionda")
        } else {
            query = 'UPDATE Factura SET clavenumerica =?, consecutivo=?, num_documento=?, numero_interno=? WHERE id=?';
        }
        if (obj.num_documento == undefined){
            pool.query(query, [clave, consecutivo, id, numeroInterno, id],
                function (err, rows) {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    const { affectedRows } = rows;
                    console.log(rows);
                    if (affectedRows > 0) {
                        resolve(true);
                    }
                })
            }else{
                pool.query(query, [clave, consecutivo, num_documento, numeroInterno, id],
                    function (err, rows) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        const { affectedRows } = rows;
                        console.log(rows);
                        if (affectedRows > 0) {
                            resolve(true);
                        }
                    }) 
            }
    })
}

Factura.obtenerDatosFactura = (obj) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { idfactura, tipo_factura } = obj;
            let query = '';

            const idemisor = await obtenerIdEmisor(idfactura, tipo_factura);
            const idcliente = await obtenerCliente1000(idemisor);

            if (tipo_factura == '03') {

                query = `SELECT DISTINCT nc.id, nc.idemisor,nc.idcliente,nc.clavenumerica, nc.consecutivo,nc.condicion_venta, nc.num_documento,
                nc.medio_pago,nc.fecha_factura,nc.tipo_factura, nc.porcentaje_descuento_total,nc.monto_descuento_total,
                nc.subtotal,nc.totalservgravados,nc.totalservexentos, nc.totalservexonerado,nc.totalmercanciasgravadas,
                nc.totalmercanciasexentas,nc.totalmercanciaexonerada, nc.totalgravado, nc.totalexento, nc.totalexonerado,
                nc.totalventa,nc.totaldescuentos,nc.totalventaneta,nc.totalimpuesto,nc.totalcomprobante, nc.codigomoneda,
                nc.tipocambio,nc.tipo_factura,nc.TotalOtrosCargos,nc.totalIVADevuelto,nc.plazo_credito,nc.status_factura, 
                nc.tipoDocReferencia,nc.numeroReferencia,nc.codigo,nc.fecha_emision, nc.razon, nc.razon , e.emisor_nombre, 
                e.emisor_nombrecomercial,  e.cedula_emisor, e.numero_emisor,e.emisor_tipo_identificacion, e.logo,
                (SELECT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
                FROM Barrios b WHERE b.codnew = e.emisor_barrio
                            AND nc.idemisor= e.id
                            AND nc.id=${idfactura}) AS ubicacion_emisor, e.emisor_otras_senas, 
                e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,e.emisor_fax_codigopais, e.emisor_fax_numtelefono, 
                e.emisor_correo,e.file_p12,e.pin_p12,e.key_username_hacienda, e.key_password_hacienda,e.codigo_actividad, 
                e.tipo_codigo_servicio, e.codigo_servicio, e.Client_ID, e.API, e.TOKEN_API, e.numeroresolucion, e.fecharesolucion,
                (IF (nc.idcliente <> ${idcliente} AND nc.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',c.cliente_nombre,'cliente_nombre_comercial', 
                c.cliente_nombre_comercial,'cliente_tipo_identificacion', c.cliente_tipo_identificacion,'CodActividad',c.CodActRec,'ArtExonera',c.ArtExo,'IncisoExo',c.IncisoExo,'InstiExo',c.InstExo,
                'cedula_cliente',c.cedula_cliente,'numero_cliente', c.numero_cliente,'identificacion_extranjero', c.identificacion_extranjero,
                'otras_senas', c.otras_senas,'otras_senas_extranjero', c.otras_senas_extranjero,'cliente_telefono_codigopais',
                c.cliente_telefono_codigopais,'cliente_telefono_numtelefono', c.cliente_telefono_numtelefono,'cliente_fax_codigopais',
                c.cliente_fax_codigopais,'cliente_fax_numtelefono',c.cliente_fax_numtelefono,'cliente_correo',c.cliente_correo,
                'TipoDocumentoExoneracion', c.tipoExoneracion, 'documentoExoneracion',c.documentoExoneracion,'nombreInstitucion',c.NombreInstitucion,'PorcentajeExoneracion',
                c.porcentajeExoneracion,'FechaEmision', c.fechaEmision,'ubicacion_cliente', 
                (SELECT JSON_OBJECT('provincia', b.provincia,'canton',b.canton,'distrito', b.distrito,'barrio',  b.hacienda) FROM Barrios b WHERE b.codnew = c.cliente_barrio 
                            AND nc.idemisor= e.id 
                            AND nc.id=${idfactura})) AS ubicacion_cliente FROM Cliente c WHERE nc.idcliente=c.id),NULL)) AS datosCliente 
                FROM Nota_Credito nc, Emisor e , Cliente c WHERE nc.idemisor=e.id AND nc.id=${idfactura}`;
            } else {
                // se agregan x cliente panama TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef
                query = `SELECT DISTINCT f.id, f.idemisor,f.idcliente,f.clavenumerica, f.consecutivo,f.condicion_venta, f.medio_pago,f.fecha_factura, f.num_documento,
                f.porcentaje_descuento_total,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos, f.totalservexonerado,
                f.totalmercanciasgravadas,f.totalmercanciasexentas, f.totalmercanciaexonerada, f.totalgravado, f.totalexento, 
                f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante, f.codigomoneda, 
                f.tipocambio,f.tipo_factura,f.TotalOtrosCargos,f.notas,f.totalIVADevuelto,f.plazo_credito,f.status_factura, f.TipodocRef, f.NumeroRef, f.FechaRef, f.CodigoRef, f.RazonRef, e.emisor_nombre, 
                e.emisor_nombrecomercial,  e.cedula_emisor, e.numero_emisor,e.emisor_tipo_identificacion,e.logo,(SELECT JSON_OBJECT('provincia',
                b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) 
                FROM Barrios b WHERE b.codnew = e.emisor_barrio
                                        AND f.idemisor= e.id
                                        AND f.id=${idfactura}) AS ubicacion_emisor, e.emisor_otras_senas, e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,e.emisor_fax_codigopais,
                e.emisor_fax_numtelefono, e.emisor_correo,e.file_p12,e.pin_p12,e.key_username_hacienda, e.key_password_hacienda,
                e.codigo_actividad,e.tipo_codigo_servicio, e.codigo_servicio, e.Client_ID, e.API, e.TOKEN_API, e.numeroresolucion,
                e.fecharesolucion, (IF (f.idcliente <> ${idcliente} AND f.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',c.cliente_nombre,'cliente_nombre_comercial', 
                c.cliente_nombre_comercial,'cliente_tipo_identificacion', c.cliente_tipo_identificacion,'CodActividad',c.CodActRec,'ArtExonera',c.ArtExo,'IncisoExo',c.IncisoExo,'InstiExo',c.InstExo,
                'cedula_cliente', c.cedula_cliente,'numero_cliente', c.numero_cliente,'identificacion_extranjero', c.identificacion_extranjero,'otras_senas',
                c.otras_senas,'otras_senas_extranjero', c.otras_senas_extranjero,'cliente_telefono_codigopais',c.cliente_telefono_codigopais,
                'cliente_telefono_numtelefono', c.cliente_telefono_numtelefono,'cliente_fax_codigopais',c.cliente_fax_codigopais,
                'cliente_fax_numtelefono', c.cliente_fax_numtelefono,'cliente_correo',c.cliente_correo,'TipoDocumentoExoneracion',
                c.tipoExoneracion, 'documentoExoneracion',c.documentoExoneracion,'nombreInstitucion',c.NombreInstitucion,'PorcentajeExoneracion',c.porcentajeExoneracion,
                'FechaEmision',c.fechaEmision, 'ubicacion_cliente',(SELECT JSON_OBJECT('provincia', b.provincia,'canton',b.canton,
                'distrito',b.distrito,'barrio',  b.hacienda) FROM Barrios b 
                    WHERE b.codnew = c.cliente_barrio 
                        AND f.idemisor= e.id 
                        AND f.id= ${idfactura} )) AS ubicacion_cliente 
                FROM Cliente c WHERE f.idcliente=c.id),NULL)) AS datosCliente FROM Factura f, Emisor e ,Cliente c WHERE f.idemisor=e.id
                AND f.id=${idfactura}
                `;
            }

            console.log({ query })

            pool.query(query, [], (err, rows, fields) => {
                if (err) {
                    console.log(err);
                    console.log("obtenerDatosFactura")
                    return reject(err);
                }

                resolve(rows)
            })
        } catch (error) {
            reject(error)
        }
    })
}


Factura.obtenerDatosReporteFactura = (obj) => {
    return new Promise(async (resolve, reject) => {
        const { tipo, idfactura } = obj;

        const idemisor = await obtenerIdEmisor(idfactura, tipo);
        const idcliente = await obtenerCliente1000(idemisor)
        let query = '';
        console.log("id factura de factura", idfactura);
        console.log("tipo de factura ", tipo);
        if (tipo != '03') {
            // se agregan x cliente panama TipodocRef, NumeroRef, FechaRef, CodigoRef, RazonRef
           query = `SELECT DISTINCT f.id,f.clavenumerica, f.num_documento, f.consecutivo,f.condicion_venta,f.plazo_credito,f.medio_pago,f.fecha_factura,
           f.porcentaje_descuento_total,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos,
           f.totalservexonerado,f.totalmercanciasgravadas,f.totalmercanciasexentas,f.totalmercanciaexonerada, f.totalgravado,
           f.totalexento, f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante,
           f.codigomoneda, f.tipocambio,f.tipo_factura,f.TotalOtrosCargos,f.TipodocRef, f.NumeroRef, f.FechaRef, f.CodigoRef, f.RazonRef, e.emisor_nombre, e.emisor_nombrecomercial,  e.cedula_emisor, 
           e.numero_emisor,e.emisor_tipo_identificacion,(SELECT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito',
           b.distrito, 'barrio', b.hacienda) FROM Barrios b WHERE b.codnew = e.emisor_barrio AND f.idemisor=e.id AND f.id= ${idfactura}) AS ubicacion_emisor, e.emisor_otras_senas,
           e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,e.emisor_fax_codigopais,e.logo, e.emisor_fax_numtelefono,  
           e.codigo_actividad,e.emisor_correo,(IF (f.idcliente <> ${idcliente} AND f.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',c.cliente_nombre,
           'cliente_nombre_comercial', c.cliente_nombre_comercial,'cliente_tipo_identificacion', c.cliente_tipo_identificacion,'CodActividad',c.CodActRec,'ArtExonera',c.ArtExo,'IncisoExo',c.IncisoExo,'InstiExo',c.InstExo,
           'cedula_cliente', c.cedula_cliente,'numero_cliente', c.numero_cliente,'identificacion_extranjero',
           c.identificacion_extranjero,'otras_senas', c.otras_senas,'otras_senas_extranjero', c.otras_senas_extranjero,
           'cliente_telefono_codigopais',c.cliente_telefono_codigopais,'cliente_telefono_numtelefono', c.cliente_telefono_numtelefono,'TipoDocumentoExoneracion',c.tipoExoneracion,'documentoExoneracion',c.documentoExoneracion,'nombreInstitucion',c.NombreInstitucion,'FechaEmision',c.fechaEmision,
           'cliente_fax_codigopais',c.cliente_fax_codigopais,'cliente_fax_numtelefono',c.cliente_fax_numtelefono,'cliente_correo',
           c.cliente_correo,'ubicacion_cliente', (SELECT JSON_OBJECT('provincia', b.provincia,'canton',b.canton,'distrito', b.distrito,
           'barrio',  b.hacienda) FROM Barrios b WHERE b.codnew = c.cliente_barrio AND f.idemisor=e.id  AND f.id= ${idfactura})) 
           AS ubicacion_cliente  FROM Cliente c 
           WHERE f.idcliente=c.id),NULL)) AS datosCliente 
           FROM Factura f, Emisor e , Cliente c 
           WHERE f.idemisor=e.id 
           AND f.id=${idfactura};
           `;
       } else {
           query = `SELECT DISTINCT nc.id,nc.clavenumerica, nc.num_documento ,nc.consecutivo,nc.condicion_venta, nc.medio_pago,nc.fecha_factura, 
           nc.porcentaje_descuento_total,nc.monto_descuento_total,nc.subtotal,nc.totalservgravados,nc.totalservexentos, 
           nc.totalservexonerado,nc.totalmercanciasgravadas,nc.totalmercanciasexentas,nc.totalmercanciaexonerada, nc.totalgravado,
            nc.totalexento, nc.totalexonerado,nc.totalventa,nc.totaldescuentos,nc.totalventaneta,nc.totalimpuesto,nc.totalcomprobante,
            nc.codigomoneda, nc.tipocambio,nc.tipo_factura,nc.TotalOtrosCargos,nc.fecha_emision, nc.tipoDocReferencia,
            nc.numeroReferencia, nc.codigo, nc.razon , e.emisor_nombre, e.emisor_nombrecomercial, 
            e.cedula_emisor, e.numero_emisor,e.emisor_tipo_identificacion,(SELECT JSON_OBJECT('provincia',b.provincia,'canton',b.canton,'distrito', b.distrito, 'barrio', b.hacienda) FROM Barrios b 
            WHERE b.codnew = e.emisor_barrio
            AND nc.idemisor= e.id
            AND nc.id=${idfactura}) AS ubicacion_emisor, 
            e.emisor_otras_senas,e.codigo_actividad, e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,e.emisor_fax_codigopais, e.logo,
            e.emisor_fax_numtelefono,  e.emisor_correo,(IF (nc.idcliente <> ${idcliente} AND nc.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',
            c.cliente_nombre,'cliente_nombre_comercial', c.cliente_nombre_comercial,'CodActividad',c.CodActRec,'ArtExonera',c.ArtExo,'IncisoExo',c.IncisoExo,'InstiExo',c.InstExo,
            'cliente_tipo_identificacion', c.cliente_tipo_identificacion,'cedula_cliente', c.cedula_cliente,'CodActividad',c.CodActRec,'ArtExonera',
            'numero_cliente', c.numero_cliente,'identificacion_extranjero', c.identificacion_extranjero,'otras_senas', c.otras_senas,'otras_senas_extranjero', 
            c.otras_senas_extranjero,'cliente_telefono_codigopais',c.cliente_telefono_codigopais,'cliente_telefono_numtelefono',
            c.cliente_telefono_numtelefono,'TipoDocumentoExoneracion',c.tipoExoneracion,'documentoExoneracion',c.documentoExoneracion,'nombreInstitucion',c.NombreInstitucion,'FechaEmision',c.fechaEmision,'cliente_fax_codigopais',c.cliente_fax_codigopais,'cliente_fax_numtelefono',
            c.cliente_fax_numtelefono,'cliente_correo',c.cliente_correo,'ubicacion_cliente', (SELECT JSON_OBJECT('provincia', 
            b.provincia,'canton',b.canton,'distrito', b.distrito,'barrio',  b.hacienda) FROM Barrios b 
            WHERE b.codnew = c.cliente_barrio 
            AND nc.idemisor= e.id 
            AND nc.id=${idfactura})) AS ubicacion_cliente
            FROM Cliente c WHERE nc.idcliente=c.id),NULL))
            AS datosCliente FROM Nota_Credito nc, Emisor e , Cliente c
            WHERE nc.idemisor=e.id 
            AND nc.id = ${idfactura}
           `;
       }
        pool.query(query, [idfactura], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Factura.encabezadoReporteFactura = (obj) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { id, tipo, idemisor } = obj;

            let query = '';
            //const idemisor = await obtenerIdEmisor(idfactura,tipo_factura);
            const idcliente = await obtenerCliente1000(idemisor)
            const tipoQuery = tipo == '03';

            if (tipoQuery) { //e.logo // SUBSTRING(nc.fecha_factura,1,10)
                query = "SELECT DISTINCT nc.status_factura,nc.id,nc.num_documento,nc.clavenumerica, nc.consecutivo,nc.condicion_venta, nc.plazo_credito, SUBSTRING(nc.fecha_factura,1,10) as fecha_factura,nc.medio_pago, nc.porcentaje_descuento_total,nc.monto_descuento_total,nc.subtotal,nc.totalservgravados,nc.totalservexentos,nc.totalservexonerado,nc.totalmercanciasgravadas,nc.totalmercanciasexentas,nc.totalmercanciaexonerada, nc.totalgravado, nc.totalexento, nc.totalexonerado,nc.totalventa,nc.totaldescuentos,nc.totalventaneta,nc.totalimpuesto,nc.totalcomprobante, nc.codigomoneda, nc.tipocambio,nc.tipo_factura,nc.totalIVADevuelto, nc.TotalOtrosCargos,nc.numeroReferencia,e.emisor_nombre, e.emisor_nombrecomercial, e.numero_emisor, e.emisor_telefono_numtelefono, e.emisor_fax_numtelefono, e.emisor_correo, e.emisor_otras_senas,e.logo,e.notas_emisor, (IF (nc.idcliente <> " + idcliente + " AND nc.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',c.cliente_nombre,'cliente_nombre_comercial', c.cliente_nombre_comercial,'numero_cliente', c.numero_cliente, 'cedula_cliente', c.cedula_cliente,'identificacion_extranjero', c.identificacion_extranjero,'cliente_telefono_numtelefono', c.cliente_telefono_numtelefono,'cliente_fax_numtelefono', c.cliente_fax_numtelefono,'cliente_correo',c.cliente_correo) as datosCliente FROM Cliente c WHERE nc.idcliente=c.id),NULL)) AS datosCliente FROM Nota_Credito nc, Emisor e , Cliente c WHERE e.id = " + idemisor + " AND nc.idemisor=e.id AND nc.id=" + id;
            } else {
                query = "SELECT DISTINCT f.status_factura ,f.id,f.num_documento,f.clavenumerica, f.consecutivo,f.condicion_venta, f.medio_pago, f.plazo_credito,f.porcentaje_descuento_total,SUBSTRING(f.fecha_factura,1,10) as fecha_factura,f.notas,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos,f.totalservexonerado,f.totalmercanciasgravadas,f.totalmercanciasexentas,f.totalmercanciaexonerada, f.totalgravado, f.totalexento, f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante, f.codigomoneda, f.tipocambio,f.tipo_factura,f.totalIVADevuelto,f.TotalOtrosCargos,f.TipodocRef, f.NumeroRef, f.FechaRef, f.CodigoRef, f.RazonRef, e.emisor_nombre, e.emisor_nombrecomercial, e.numero_emisor, e.emisor_telefono_numtelefono, e.emisor_fax_numtelefono, e.emisor_correo, e.emisor_otras_senas,e.logo,e.notas_emisor, (IF (f.idcliente <> " + idcliente + " AND f.idcliente <> 1,(SELECT JSON_OBJECT('cliente_nombre',c.cliente_nombre,'cliente_nombre_comercial', c.cliente_nombre_comercial,'numero_cliente', c.numero_cliente, 'cedula_cliente', c.cedula_cliente,'identificacion_extranjero', c.identificacion_extranjero,'cliente_telefono_numtelefono', c.cliente_telefono_numtelefono,'cliente_fax_numtelefono', c.cliente_fax_numtelefono,'cliente_correo',c.cliente_correo) as datosCliente FROM Cliente c WHERE f.idcliente=c.id),NULL)) AS datosCliente FROM Factura f, Emisor e , Cliente c WHERE e.id = " + idemisor + " AND f.idemisor=e.id AND f.id=" + id;
                console.log(query);
            }

            pool.query(query, [],
                (err, rows, fields) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    console.log(rows);

                    resolve(rows)
                })
        } catch (error) {
            reject(error)
        }
    })
}
// -----------------------------------------------------------------------------------------------------------
Factura.obtenerEstadoFactura = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT status_factura FROM Factura WHERE id = ?', [id],
            function (err, rows, fields) {
                if (err) return reject(err);

                resolve(rows);
            })
    })
}

Factura.obtenerIntentosEnvio = (id) => {
    return new Promise((resolve, reject) => {

        pool.query('SELECT intentoEnvio FROM Factura WHERE id = ?', [id],
            function (err, rows, fields) {
                if (err) return reject(err);

                resolve(rows);
            })
    })
}


Factura.facturasAceptadasSinEnviarPorCorreo = (desde, cantidadRegistros) => {
    return new Promise((resolve, reject) => { //
        //ELIMINA  f.idemisor='1' del select
        pool.query("SELECT f.id, f.tipo_factura,f.idemisor, f.correo FROM  Factura f, Emisor e  WHERE  f.correo = 0  AND f.idemisor = e.id AND f.status_factura = 'aceptado'  AND f.tipo_factura = '01' AND e.estado_emisor = 1 AND e.client_id = 'api-prod' LIMIT ? ,?", [desde, cantidadRegistros], (err, rows, fields) => {
            console.log(err);
            if (err) {
                return reject(err);
            }
            //AND e.estado_emisor = 1
            resolve(rows);
        })
    })
}

Factura.NCAceptadasSinEnviarPorCorreo = (desde, cantidadRegistros) => {
    return new Promise((resolve, reject) => { //
        pool.query("SELECT f.id, f.tipo_factura,f.idemisor, f.correo FROM nota_credito f, Emisor e  WHERE f.correo = 0  AND f.idemisor = e.id AND f.status_factura = 'aceptado' AND e.estado_emisor = 1 AND e.client_id = 'api-prod' LIMIT ? ,?", [desde, cantidadRegistros], (err, rows, fields) => {
            console.log(err);
            if (err) {
                return reject(err);
            }
            //AND e.estado_emisor = 1
            resolve(rows);
        })
    })
}

Factura.actualizarEstadoEnvioCorreo = (idfactura) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE Factura SET correo = 1 WHERE id = ?", [idfactura], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Factura.actualizarIntentosEnvio = () => {
    return new Promise((resolve, reject) => {
        const { id, intentos } = obj;

        pool.query('UPDATE Factura SET intentoEnvio = ? WHERE id = ?', [intentos, id],
            (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}
// -------------------------------------------------------------------------------------------------------
Factura.obtenerMonedas = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT monedaISO, nombreMoneda FROM Moneda LIMIT 100', [],
            (err, rows, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                resolve(rows)
            })
    })
}

Factura.buscarComprobantes = (obj) => {
    return new Promise((resolve, reject) => {


        const { idemisor, tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = obj;
        let consultaBase = '';
        if (tipoFactura == '04_01') {
            consultaBase = "SELECT f.id,DATE(f.fecha_factura) as fecha, Date_Format(f.fecha_factura,'%H:%I:%S') as hora, f.clavenumerica, f.consecutivo,f.condicion_venta, f.medio_pago,f.fecha_factura, f.porcentaje_descuento_total,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos, f.totalservexonerado,f.totalmercanciasgravadas,f.totalmercanciasexentas,f.totalmercanciaexonerada, f.totalgravado, f.totalexento, f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante, f.codigomoneda, f.tipocambio,f.tipo_factura,f.TotalOtrosCargos,f.totalIVADevuelto,f.plazo_credito,f.status_factura,f.numero_interno,f.num_documento,f.anulada, f.TipodocRef, f.NumeroRef, f.FechaRef, f.CodigoRef, f.RazonRef, c.cedula_cliente, c.cliente_nombre_comercial,c.cliente_nombre,f.errorEmail FROM Factura f, Cliente c WHERE f.idemisor =" + idemisor + "  AND f.proforma IS NULL AND f.idcliente = c.id ";
        } else {
            consultaBase = "SELECT f.id,DATE(f.fecha_factura) as fecha, Date_Format(f.fecha_factura,'%H:%I:%S') as hora, f.clavenumerica, f.consecutivo,f.condicion_venta, f.medio_pago,f.fecha_factura, f.porcentaje_descuento_total,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos, f.totalservexonerado,f.totalmercanciasgravadas,f.totalmercanciasexentas,f.totalmercanciaexonerada, f.totalgravado, f.totalexento, f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante, f.codigomoneda, f.tipocambio,f.tipo_factura,f.TotalOtrosCargos,f.totalIVADevuelto,f.plazo_credito,f.status_factura,f.numero_interno,f.num_documento,f.anulada, f.TipodocRef, f.NumeroRef, f.FechaRef, f.CodigoRef, f.RazonRef, c.cedula_cliente, c.cliente_nombre_comercial,c.cliente_nombre,f.errorEmail FROM Factura f, Cliente c WHERE f.tipo_factura='" + obj.tipoFactura + "' AND f.idemisor =" + idemisor + "  AND f.proforma IS NULL AND f.idcliente = c.id ";
        }

        if (typeof fechaInicio !== 'undefined') {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }
        if (typeof consecutivo !== 'undefined') {
            consultaBase += " AND f.consecutivo='" + consecutivo + "'";
        }
        if (typeof claveNumerica !== 'undefined') {
            consultaBase += " AND f.clavenumerica='" + claveNumerica + "'";
        }
        if (typeof numeroInterno !== 'undefined') {
            consultaBase += " AND f.numero_interno='" + numeroInterno + "'";
        }
        if (typeof nombreCliente !== 'undefined') {
            consultaBase += " AND UPPER(TRIM(c.cliente_nombre))='" + nombreCliente.toUpperCase().trim() + "'";
        }

        consultaBase += ' ORDER BY f.fecha_factura ASC;';

        console.log(consultaBase);
        pool.query(consultaBase, [tipoFactura, fechaInicio, fechaFin], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

//-- BUSCAR PROFORMA ----

Factura.buscarProforma = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = obj;

        let consultaBase = "SELECT f.id,DATE(f.fecha_factura) as fecha,f.num_documento, Date_Format(f.fecha_factura,'%H:%I:%S') as hora, f.clavenumerica, f.consecutivo,f.condicion_venta, f.medio_pago,f.fecha_factura, f.porcentaje_descuento_total,f.monto_descuento_total,f.subtotal,f.totalservgravados,f.totalservexentos, f.totalservexonerado,f.totalmercanciasgravadas,f.totalmercanciasexentas,f.totalmercanciaexonerada, f.totalgravado, f.totalexento, f.totalexonerado,f.totalventa,f.totaldescuentos,f.totalventaneta,f.totalimpuesto,f.totalcomprobante, f.codigomoneda, f.tipocambio,f.tipo_factura,f.TotalOtrosCargos,f.totalIVADevuelto,f.plazo_credito,f.status_factura,f.numero_interno, c.cedula_cliente, c.cliente_nombre_comercial,c.cliente_nombre FROM Factura f, Cliente c WHERE f.proforma='" + tipoFactura + "' AND f.idemisor =" + idemisor + " AND f.idcliente = c.id";

        if (typeof fechaInicio !== 'undefined') {

            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof consecutivo !== 'undefined') {
            consultaBase += " AND f.consecutivo='" + consecutivo + "'";
        }
        if (typeof claveNumerica !== 'undefined') {
            consultaBase += " AND f.clavenumerica='" + claveNumerica + "'";
        }
        if (typeof numeroInterno !== 'undefined') {
            consultaBase += " AND f.numero_interno='" + numeroInterno + "'";
        }

        if (typeof nombreCliente !== 'undefined') {
            consultaBase += " AND UPPER(TRIM(c.cliente_nombre))='" + nombreCliente.toUpperCase().trim() + "'";
        }

        consultaBase += ' ORDER BY f.fecha_factura ASC;';

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

Factura.buscarNotaCredito = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, tipoFactura, fechaInicio, fechaFin, consecutivo, claveNumerica, numeroInterno, nombreCliente } = obj;
        //num_documento
        let consultaBase = "SELECT nc.id,DATE(nc.fecha_factura) as fecha, Date_Format(nc.fecha_factura,'%H:%I:%S') as hora, nc.clavenumerica, nc.consecutivo,nc.condicion_venta, nc.medio_pago,nc.fecha_factura, nc.porcentaje_descuento_total,nc.monto_descuento_total,nc.subtotal,nc.totalservgravados,nc.totalservexentos, nc.totalservexonerado,nc.totalmercanciasgravadas,nc.totalmercanciasexentas,nc.totalmercanciaexonerada, nc.totalgravado, nc.totalexento, nc.totalexonerado,nc.totalventa,nc.totaldescuentos,nc.totalventaneta,nc.totalimpuesto,nc.totalcomprobante, nc.codigomoneda, nc.tipocambio,nc.tipo_factura,nc.TotalOtrosCargos,nc.totalIVADevuelto,nc.plazo_credito,nc.status_factura,nc.numero_interno, nc.fecha_emision,nc.tipoDocReferencia,nc.numeroReferencia,nc.razon,nc.num_documento,c.cedula_cliente, c.cliente_nombre_comercial,c.cliente_nombre FROM Nota_Credito nc, Cliente c WHERE nc.tipo_factura='" + tipoFactura + "' AND nc.idemisor =" + idemisor + " AND nc.idcliente = c.id";

        if (typeof fechaInicio !== 'undefined') {
            consultaBase += " AND DATE(nc.fecha_factura) BETWEEN '" + fechaInicio.toString() + "' AND '" + fechaFin.toString() + "'";
        }
        if (typeof consecutivo !== 'undefined') {
            consultaBase += " AND nc.consecutivo='" + consecutivo + "'";
        }
        if (typeof claveNumerica !== 'undefined') {
            consultaBase += " AND nc.clavenumerica='" + claveNumerica + "'";
        }
        if (typeof numeroInterno !== 'undefined') {
            consultaBase += " AND nc.numero_interno='" + numeroInterno + "'";
        }
        if (typeof nombreCliente !== 'undefined') {
            consultaBase += " AND UPPER(TRIM(c.cliente_nombre))='" + nombreCliente.toUpperCase().trim() + "'";
        }

        consultaBase += ' ORDER BY nc.fecha_factura ASC;';

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


Factura.buscarFacturasOTiquetesAceptados = (obj) => {
    console.log("buscarFacturasOTiquetesAceptados")
    return new Promise((resolve, reject) => {

        const { tipoDocumento, clave, consecutivo, fechaInicio, fechaFin, idemisor } = obj;

        let consultaBase = "SELECT f.id,SUBSTRING(f.fecha_factura,1,10) as fecha, f.clavenumerica ,f.num_documento,  c.cliente_nombre, c.cliente_nombre_comercial,f.condicion_venta,f.tipo_factura,f.medio_pago, f.totaldescuentos,f.totalservgravados, f.totalservexentos, f.totalservexonerado, f.totalmercanciasgravadas,  f.totalmercanciasexentas,f.totalmercanciaexonerada,  f.totalgravado, f.totalexento,f.totalexonerado, f.totalventa, f.totalventaneta,f.subtotal, f.totalimpuesto ,f.TotalOtrosCargos, f.totalcomprobante, f.codigomoneda, f.tipocambio FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + "  AND f.idemisor = e.id  AND f.idcliente = c.id AND f.status_factura = 'aceptado' AND f.anulada = 0 AND f.proforma IS NULL";

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof clave !== 'undefined' && clave !== '') {
            consultaBase += " AND f.clavenumerica=" + clave;
        }

        if (typeof consecutivo !== 'undefined' && consecutivo !== '') {
            consultaBase += " AND f.consecutivo=" + consecutivo;
        }

        consultaBase += ' ORDER BY f.fecha_factura ASC;';

        console.log("consulta", consultaBase);

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log(rows);
            resolve(rows)
        })
    })
}

/*

*/

Factura.sumatoriaDeFacturasAgrupadasPorMoneda = (obj) => {

    return new Promise((resolve, reject) => {

        const { tipoDocumento, clave, consecutivo, fechaInicio, fechaFin, idemisor } = obj;

        let consultaBase = ` 
            SELECT f.codigomoneda, SUM(f.totaldescuentos) as totaldescuentos,SUM(f.totalservgravados) as totalservgravados, 
            SUM(f.totalservexentos) as totalservexentos,SUM( f.totalservexonerado) as  totalservexonerado, 
            SUM(f.totalmercanciasgravadas) as totalmercanciasgravadas ,  
            SUM(f.totalmercanciasexentas) as totalmercanciasexentas,SUM(f.totalmercanciaexonerada) as totalmercanciaexonerada, 
            SUM(f.totalgravado) as totalgravado, SUM(f.totalexento) as totalexento ,SUM(f.totalexonerado) as totalexonerado, 
            SUM(f.totalventa) as totalventa, SUM(f.totalventaneta) as totalventaneta,SUM(f.subtotal) as subtotal,
            SUM(f.totalimpuesto) as  totalimpuesto,SUM(f.TotalOtrosCargos) AS TotalOtrosCargos, SUM(f.totalcomprobante) as totalcomprobante
            FROM Factura f, Emisor e WHERE f.idemisor = ${idemisor}  AND f.idemisor = e.id  
            AND f.status_factura = 'aceptado' AND f.anulada = 0 AND f.proforma IS NULL`;

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof clave !== 'undefined' && clave !== '') {
            consultaBase += " AND f.clavenumerica=" + clave;
        }

        if (typeof consecutivo !== 'undefined' && consecutivo !== '') {
            consultaBase += " AND f.consecutivo=" + consecutivo;
        }

        consultaBase += ' GROUP BY f.codigomoneda;';

        console.log(consultaBase);

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows)
        })
    })
}
//-----------------Reporte por Forma de Pago------------


Factura.buscarFacturasPorFormaDePago = (obj) => {

    return new Promise((resolve, reject) => {

        const { medio_pago, fechaInicio, fechaFin, idemisor } = obj;
        console.log("medio ", medio_pago);
        let consultaBase = "SELECT f.id,SUBSTRING(f.fecha_factura,1,10) as fecha, f.clavenumerica ,f.num_documento, c.cliente_nombre, c.cliente_nombre_comercial, f.subtotal, f.totalimpuesto, f.TotalOtrosCargos, f.totalcomprobante, CASE WHEN f.medio_pago = '01' THEN 'efectivo' WHEN f.medio_pago = '02' THEN 'tarjeta' END as medioPago FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND f.idemisor = e.id AND f.idcliente = c.id AND f.status_factura = 'aceptado' AND f.anulada <> 1";

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof medio_pago !== 'undefined' && medio_pago !== '') {
            consultaBase += " AND f.medio_pago=" + medio_pago;
        }

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Factura.obtenerTotalesAgrupadosPorMedioPago = (obj) => {

    return new Promise((resolve, reject) => {

        const { medio_pago, fechaInicio, fechaFin, idemisor } = obj;

        let consultaBase = `
            SELECT f.codigomoneda, SUM(f.totaldescuentos) as totaldescuentos,SUM(f.totalservgravados) as totalservgravados, 
            SUM(f.totalservexentos) as totalservexentos,SUM( f.totalservexonerado) as  totalservexonerado, 
            SUM(f.totalmercanciasgravadas) as totalmercanciasgravadas ,  
            SUM(f.totalmercanciasexentas) as totalmercanciasexentas,SUM(f.totalmercanciaexonerada) as totalmercanciaexonerada, 
            SUM(f.totalgravado) as totalgravado, SUM(f.totalexento) as totalexento ,SUM(f.totalexonerado) as totalexonerado, 
            SUM(f.totalventa) as totalventa, SUM(f.totalventaneta) as totalventaneta,SUM(f.subtotal) as subtotal,
            SUM(f.totalimpuesto) as  totalimpuesto,SUM(f.TotalOtrosCargos) AS TotalOtrosCargos, SUM(f.totalcomprobante) as totalcomprobante
            FROM Factura f, Emisor e WHERE f.idemisor = ${idemisor}  AND f.idemisor = e.id  
            AND f.status_factura = 'aceptado' AND f.anulada = 0 AND f.proforma IS NULL
        `;

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof medio_pago !== 'undefined' && medio_pago !== '') {
            consultaBase += " AND f.medio_pago=" + medio_pago;
        }

        consultaBase += " GROUP BY f.codigomoneda"

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows)
        })
    })
}


//----------------------------------------------------

Factura.buscarFacturasPorProductosVendidos = (obj) => {
    return new Promise((resolve, reject) => {

        const { producto, fechaInicio, fechaFin, idemisor } = obj;
        let sql = '';

        if (producto !== '' && (fechaInicio !== '' && fechaFin !== '')) {
            sql = "SELECT p.id,p.codigobarra_producto, p.descripcion, , fd.cantidad, c.descripcion as categoria, sum(f.subtotal) as subtotal, sum(f.totalimpuesto) as totalimpuesto, sum(f.totalOtrosCargos) as otroscargos, sum(f.totalcomprobante) as totalcomprobante FROM Factura f,  Producto p,Categoria c, Emisor e, Factura_Detalle fd  WHERE f.idemisor= '" + idemisor + "' AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "' AND p.descripcion= '" + producto + "' AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id  AND f.id = fd.idfactura  AND fd.idproducto = p.id   AND p.idcategoria = c.id group by p.id,p.codigobarra_producto, p.descripcion, c.descripcion,fd.cantidad";
        }

        else if (producto !== '') {
            sql = "SELECT p.id,p.codigobarra_producto, p.descripcion,fd.cantidad,c.descripcion as categoria, sum(f.subtotal) as subtotal, sum(f.totalimpuesto) as totalimpuesto, sum(f.totalOtrosCargos) as otroscargos, sum(f.totalcomprobante) as totalcomprobante FROM Factura f,  Producto p,Categoria c, Emisor e, Factura_Detalle fd  WHERE f.idemisor= '" + idemisor + "' AND p.descripcion= '" + producto + "' AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id  AND f.id = fd.idfactura  AND fd.idproducto = p.id   AND p.idcategoria = c.id group by p.id,p.codigobarra_producto, p.descripcion, c.descripcion,fd.cantidad";

        }

        else if (fechaInicio !== '' && fechaFin !== '') {
            sql = "SELECT p.id,p.codigobarra_producto, p.descripcion, fd.cantidad,c.descripcion as categoria, sum(f.subtotal) as subtotal, sum(f.totalimpuesto) as totalimpuesto, sum(f.totalOtrosCargos) as otroscargos, sum(f.totalcomprobante) as totalcomprobante FROM Factura f,  Producto p,Categoria c, Emisor e, Factura_Detalle fd  WHERE f.idemisor= '" + idemisor + "' AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "' AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id  AND f.id = fd.idfactura  AND fd.idproducto = p.id   AND p.idcategoria = c.id group by p.id,p.codigobarra_producto, p.descripcion, c.descripcion,fd.cantidad";

        } else {
            sql = "SELECT p.id,p.codigobarra_producto, p.descripcion, fd.cantidad,c.descripcion as categoria, sum(f.subtotal) as subtotal, sum(f.totalimpuesto) as totalimpuesto, sum(f.totalOtrosCargos) as otroscargos, sum(f.totalcomprobante) as totalcomprobante FROM Factura f,  Producto p,Categoria c, Emisor e, Factura_Detalle fd  WHERE f.idemisor= '" + idemisor + "' AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id  AND f.id = fd.idfactura  AND fd.idproducto = p.id   AND p.idcategoria = c.id group by p.id,p.codigobarra_producto, p.descripcion, c.descripcion,fd.cantidad";
        }
        console.log(sql)
        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Factura.agruparTotalesFacturaPorProducto = (obj) => {

    return new Promise((resolve, reject) => {

        const { producto, fechaInicio, fechaFin, idemisor } = obj;
        /*
            -- and f.id = 8595
            group by f.codigomoneda; 
        */
        let consultaBase = `
            SELECT f.codigomoneda, SUM(fd.montodescuento) as totaldescuentos, SUM(fd.impuesto_neto) as totalimpuesto,
        
            SUM(CASE WHEN p.tipo_servicio = '01' AND fd.tarifa = 0 THEN fd.montototal ELSE 0 END) as totalservexentos,
            SUM(CASE WHEN p.tipo_servicio = '02' AND fd.tarifa = 0  THEN fd.montototal ELSE 0 END) as totalmercanciasexentas,
            SUM(CASE WHEN p.tipo_servicio = '01' AND fd.tarifa > 0 then fd.montototal / fd.tarifa*fd.porcentajeExonerado ELSE 0 end) as totalservexonerados,
            SUM(CASE WHEN p.tipo_servicio = '02' AND fd.tarifa > 0 THEN fd.montototal / fd.tarifa*fd.porcentajeExonerado ELSE 0 END) as totalmercexoneradas,
            
            SUM(CASE WHEN p.tipo_servicio = '01' AND fd.tarifa > 0 then fd.montototal - (fd.montototal / fd.tarifa*fd.porcentajeExonerado) ELSE 0 end) as totalservgravados,
            SUM(CASE WHEN p.tipo_servicio = '02' AND fd.tarifa > 0 THEN fd.montototal - (fd.montototal / fd.tarifa*fd.porcentajeExonerado) ELSE 0 END) as totalmercgravadas,
            
            SUM(case when fd.tarifa > 0 then fd.montototal / fd.tarifa*fd.porcentajeExonerado else 0 end ) as totalExonerado,
            SUM(CASE WHEN fd.monto = 0  THEN fd.montototal ELSE 0 END) as totalexentos,
            SUM(case when fd.tarifa > 0 then fd.montototal - (fd.montototal / fd.tarifa*fd.porcentajeExonerado) else 0 end ) as totalgravado,
            sum(case when f.TotalOtrosCargos > 0 then fd.otrosCargos else 0 end ) as otroscargos,
            sum(fd.montoitotallinea) as totalcomprobante,
            sum(fd.subtotal) as subtotal
            
            FROM Factura f, Emisor e, Producto p, Factura_Detalle fd  
            WHERE f.idemisor = ${idemisor}  
            AND f.idemisor = e.id 
            AND f.status_factura = 'aceptado' 
            AND f.anulada = 0 
            AND f.id = fd.idfactura
            AND fd.idproducto = p.id
            AND f.proforma IS null
        `;


        if (producto && producto != '') {
            consultaBase += ' AND TRIM(p.descripcion) = TRIM("' + producto + '") '
        }

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        consultaBase += " GROUP BY f.codigomoneda";
        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}



Factura.obtenerFacturasPorCliente = (obj) => {

    //( Agrupado por cliente) = columnas (  fecha, numero_documento, cliente, subtotal, iva, servicio, total) solo incluir las que no esten anuladas

    return new Promise((resolve, reject) => {
        const { fechaInicio, fechaFin, idemisor, cliente } = obj;

        let sql = '';

        if (fechaFin !== '' && fechaFin !== '' && cliente !== '') {

            sql = "SELECT c.id, c.cliente_nombre as nombre, SUBSTRING(f.fecha_factura,1,10) as fecha, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto, SUM(f.TotalOtrosCargos) as otroscargos, SUM(f.totalcomprobante) as total FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "' AND (c.cliente_nombre = '" + cliente + "' OR c.cliente_nombre_comercial = '" + cliente + "') AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id AND f.idcliente = c.id GROUP BY c.id,c.cliente_nombre,SUBSTRING(f.fecha_factura,1,10)";


        } else if (fechaFin !== '' && fechaFin !== '') {

            sql = "SELECT c.id, c.cliente_nombre as nombre, SUBSTRING(f.fecha_factura,1,10) as fecha, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto, SUM(f.TotalOtrosCargos) as otroscargos, SUM(f.totalcomprobante) as total FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "' AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id AND f.idcliente = c.id GROUP BY c.id,c.cliente_nombre,SUBSTRING(f.fecha_factura,1,10)";

        } else if (cliente !== '') {

            sql = "SELECT c.id, c.cliente_nombre as nombre, SUBSTRING(f.fecha_factura,1,10) as fecha, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto, SUM(f.TotalOtrosCargos) as otroscargos, SUM(f.totalcomprobante) as total FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND (c.cliente_nombre = '" + cliente + "' OR c.cliente_nombre_comercial = '" + cliente + "') AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id AND f.idcliente = c.id GROUP BY c.id,c.cliente_nombre,SUBSTRING(f.fecha_factura,1,10)";

        } else if (fechaFin === '' && fechaFin === '' && cliente === '') {
            sql = "SELECT c.id, c.cliente_nombre as nombre, SUBSTRING(f.fecha_factura,1,10) as fecha, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto, SUM(f.TotalOtrosCargos) as otroscargos, SUM(f.totalcomprobante) as total FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND f.status_factura = 'aceptado' AND f.anulada <> 1 AND f.idemisor = e.id AND f.idcliente = c.id GROUP BY c.id,c.cliente_nombre,SUBSTRING(f.fecha_factura,1,10)";
        }

        console.log(sql);

        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Factura.obtenerTotalesAceptadosDeClientes = (obj) => {

    return new Promise((resolve, reject) => {

        const { fechaInicio, fechaFin, cliente, idemisor } = obj;

        let consultaBase = `
            SELECT f.codigomoneda, SUM(f.totaldescuentos) as totaldescuentos,SUM(f.totalservgravados) as totalservgravados, 
            SUM(f.totalservexentos) as totalservexentos,SUM( f.totalservexonerado) as  totalservexonerado, 
            SUM(f.totalmercanciasgravadas) as totalmercanciasgravadas ,  
            SUM(f.totalmercanciasexentas) as totalmercanciasexentas,SUM(f.totalmercanciaexonerada) as totalmercanciaexonerada, 
            SUM(f.totalgravado) as totalgravado, SUM(f.totalexento) as totalexento ,SUM(f.totalexonerado) as totalexonerado, 
            SUM(f.totalventa) as totalventa, SUM(f.totalventaneta) as totalventaneta,SUM(f.subtotal) as subtotal,
            SUM(f.totalimpuesto) as  totalimpuesto,SUM(f.TotalOtrosCargos) AS TotalOtrosCargos, SUM(f.totalcomprobante) as totalcomprobante
            FROM Factura f, Emisor e, Cliente c  
                WHERE f.idemisor = ${idemisor}  
                AND f.idemisor = e.id 
                AND f.idcliente = c.id 
                AND f.status_factura = 'aceptado' 
                AND f.anulada = 0 
                AND f.proforma IS NULL
        `;

        if (cliente && cliente != '') {
            consultaBase += ' AND TRIM(c.cliente_nombre) = TRIM("' + cliente + '") OR TRIM(c.cliente_nombre_comercial) = TRIM("' + cliente + '")'
        }

        if ((typeof fechaInicio !== 'undefined' && fechaInicio !== '')
            && (typeof fechaFin !== 'undefined' && fechaFin !== '')) {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (typeof medio_pago !== 'undefined' && medio_pago !== '') {
            consultaBase += " AND f.medio_pago=" + medio_pago;
        }

        consultaBase += " GROUP BY f.codigomoneda";

        console.log(consultaBase)
        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

// -- --------------------------------------

Factura.obtenerDatosNotaCredito = (obj) => {

    return new Promise((resolve, reject) => {
        const objFactura = {
            idfactura: obj.id,
            tipo_factura: obj.tipo_factura
        }
        Factura.obtenerDatosFactura(objFactura)
            .then(dataFactura => {
                const objOrden = {
                    tipo: obj.tipo_factura,
                    idfactura: obj.id,
                    idemisor: obj.idemisor
                }
                FacturaDetalle.obtenerOrdenesPorFactura(objOrden)
                    .then(dataOrdenes => {
                        const objeto = {
                            factura: dataFactura,
                            ordenes: dataOrdenes
                        };

                        resolve(objeto);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    })
}

Factura.insertarNotaCredito = (obj) => {
    return new Promise((resolve, reject) => {

        const { idusuario, idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, tipoDocReferencia, NumeroReferencia, fecha_emision, codigo, razon, TotalOtrosCargos, plazo_credito } = obj;

        pool.query("INSERT INTO Nota_Credito(idusuario,idcliente,idemisor,fecha_factura,condicion_venta,medio_pago,porcentaje_descuento_total,monto_descuento_total,subtotal,totalservgravados,totalservexentos,totalservexonerado,totalmercanciasgravadas,totalmercanciasexentas,totalmercanciaexonerada,totalgravado,totalexento,totalexonerado,totalventa,totaldescuentos,totalventaneta,totalimpuesto,totalcomprobante,codigomoneda,tipocambio,tipo_factura,tipoDocReferencia, numeroReferencia,fecha_emision,codigo,razon, TotalOtrosCargos,plazo_credito) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
            [idusuario, idcliente, idemisor, fecha_factura, condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta, totalimpuesto, totalcomprobante, codigomoneda, tipocambio, tipo_factura, tipoDocReferencia, NumeroReferencia, fecha_emision, codigo, razon, TotalOtrosCargos, plazo_credito], function (err, rows, fiedls) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(rows);
            })
    })
}

Factura.obtenerInformacionFacturaNoEnviadas = (obj) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("obj ", obj);
            const { id, tipo_factura } = obj;

            const idemisor = await obtenerIdEmisor(id, tipo_factura);
            const idcliente = await obtenerCliente1000(idemisor)

            if (tipo_factura !== '03') {
                query = " SELECT f.idemisor,f.fecha_factura, f.clavenumerica, (IF (f.idcliente <> " + idcliente + " AND f.idcliente <> 1,(SELECT JSON_OBJECT('tipoIdentificacion',c.cliente_tipo_identificacion,'numeroIdentificacion', c.numero_cliente) FROM Cliente c WHERE f.idcliente=c.id),NULL)) as datosReceptor, e.API, e.emisor_tipo_identificacion, e.numero_emisor, e.key_username_hacienda, e.key_password_hacienda , e.TOKEN_API, e.Client_ID, x.xml FROM Factura f, Cliente c , Emisor e, Xml x  WHERE f.id = " + id + " AND c.id = f.idcliente AND e.id = f.idemisor AND x.idfactura = f.id";
            } else {
                query = `
                SELECT nc.idemisor,nc.fecha_factura, nc.clavenumerica, nc.numeroReferencia as claveref, (IF (nc.idcliente <> ${idcliente} AND nc.idcliente <> 1, (SELECT JSON_OBJECT('tipoIdentificacion'
                ,c.cliente_tipo_identificacion,'numeroIdentificacion', c.numero_cliente) FROM Cliente c WHERE nc.idcliente=c.id),NULL))
                as datosReceptor, e.API, e.emisor_tipo_identificacion, e.numero_emisor, e.key_username_hacienda, e.key_password_hacienda , 
                e.TOKEN_API, e.Client_ID FROM Nota_Credito nc, Cliente c , Emisor e WHERE nc.id = ${id} 
                AND c.id = nc.idcliente 
                AND e.id = nc.idemisor;
                `;
            }

            console.log(query);
            pool.query(query, [id], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
        } catch (error) {
            reject(error);
        }
    })
}

Factura.obtenerIdFacturasNoEnvidas = (idemisor) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT f.id,f.tipo_factura FROM Factura f WHERE f.status_factura IS NULL AND idemisor=?", [idemisor],
            (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            }) //SELECT id,idemisor,status_factura FROM Factura WHERE status_factura IS NULL AND idemisor
    })
}


Factura.paginarFacturasNoEnviadas = (cantidadRegistros, desde) => { //comentario de prueba 1234
    return new Promise(async (resolve, reject) => {
        try {

            const response =  await Emisor.obtenerIdEmisorPorPrioridadActivada();
            if(response[0].prioridadEmisores >= 1) {
                pool.query(`SELECT f.id,f.tipo_factura,f.proforma, e.id as idemisor 
                FROM Factura f, Emisor e 
                WHERE f.status_factura IS NULL
                AND f.idemisor = e.id
                AND e.estado_emisor='1' 
                AND f.proforma IS NULL 
                AND e.client_id = 'api-prod' 
               
                AND f.tipo_factura='01'             
                ORDER BY f.tipo_factura,f.id DESC  LIMIT ${desde},${cantidadRegistros}`, [], (err, rows, fields) => { //comentario envie primero las faccturas Y SOLO CODIGO ESTADO NULL **${response[0].prioridadEmisores > 0 ? ' AND e.prioridad = 1' : ''}
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                })
            }else {
                pool.query(`SELECT f.id,f.tipo_factura,f.proforma, e.id as idemisor 
                FROM Factura f, Emisor e 
                WHERE  f.status_factura IS NULL
                AND f.idemisor = e.id
                AND e.estado_emisor = 1
                AND f.proforma IS NULL 
                AND e.client_id = 'api-prod'
                AND f.tipo_factura = '04'   
               
                AND f.fecha_factura > '2025-08-01 00:00:00'
                ORDER BY e.prioridad DESC,f.id  LIMIT ${desde},${cantidadRegistros}`, [], (err, rows, fields) => { //comentario envie primero las faccturas Y SOLO CODIGO ESTADO NULL **${response[0].prioridadEmisores > 0 ? ' AND e.prioridad = 1' : ''}
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                })  
            }
        } catch (error) {

        }
    })
}

Factura.facturasNoEnviadas = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT f.id,f.tipo_factura, e.id as idemisor  FROM Factura f, Emisor e WHERE f.status_factura IS NULL AND f.idemisor = e.id AND e.estado_emisor = 1`, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Factura.obtenerUltimoIdInsertado = (idemisor) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id,tipo_factura FROM Factura WHERE idemisor = ? ORDER BY id DESC LIMIT 1", [idemisor],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
    })
}

Factura.obtenerCodigoEstado = (obj) => {
    return new Promise((resolve, reject) => {
        const { id, tipo_factura } = obj;
        let query = '';
        if (tipo_factura !== '03') {
            query = "SELECT codigo_estado FROM Factura WHERE id= ?";
        } else {
            query = "SELECT codigo_estado FROM Nota_Credito WHERE id= ?";
        }
        pool.query(query, [id],
            (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}

Factura.actualizarCodigoEstado = (obj) => {
    return new Promise((resolve, reject) => {
        const { tipo_factura, status, clave, error, idemisor } = obj;
        let query = '';
        if (tipo_factura !== '03') {
            query = "UPDATE Factura SET codigo_estado=?, errorEnvio= ? WHERE clavenumerica= ? and idemisor= ?";
        } else {
            query = "UPDATE Nota_Credito SET codigo_estado=?, errorEnvio= ? WHERE clavenumerica= ? and idemisor= ?";
        }
        pool.query(query, [status, error, clave, idemisor],
            (err, rows, fields) => {
                if (err) return reject(err);
                console.log({ codigo: rows })
                resolve(rows);
            })
    })
}
Factura.actualizarEstadoAnulado = (idfactura) => {
    return new Promise((resolve, reject) => {
        console.log("idfactura anulada ", idfactura);
        pool.query('UPDATE Factura SET anulada = 1 WHERE id=?', [idfactura],
            (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}

Factura.actualizarEstadoAnuladoPorClavenumerica = (clavenumerica) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE Factura SET anulada = 1 WHERE clavenumerica=?', [clavenumerica],
            (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}


Factura.actualizarEstadoFactura = (obj) => {
    return new Promise(async(resolve, reject) => {
        try{
            const { idfactura,tipo_factura, status, clave, error, idemisor } = obj;
            console.log("actualizarEstadoFactura ", obj);
            let arr = [];
            if (tipo_factura !== '03') {
                //query = "UPDATE Factura SET status_factura=?, errorEnvio= ? WHERE clavenumerica= ? and idemisor= ?"; CAMBIO SYBN
                query = "UPDATE Factura SET status_factura=?, errorEnvio= ? WHERE id= ?";
                arr = [status, error, idfactura];
            } else {
                query = "UPDATE Nota_Credito SET status_factura=?, errorEnvio= ? WHERE clavenumerica= ? and idemisor= ?"; 
                arr = [status, error, clave, idemisor];
            }
            pool.query(query, arr,
                (err, rows, fields) => {
                    if (err) {
                        console.log("err actualizar estado factura con id SyN", err);
                        return reject(err)
                    };

                    console.log({ estado: rows })
                    resolve(rows);
                })
        } catch (error) {
            reject(error);
        }

    })
}


Factura.actualizarEstadoFacturaPorId = (obj) => {
    return new Promise(async(resolve, reject) => {
        try{
            const { tipo_factura, status, id } = obj;
            console.log("actualizarEstadoFactura por ID ", obj);
            if (tipo_factura !== '03') {
                query = "UPDATE Factura SET status_factura=? WHERE id= ?";
            } else {
                query = "UPDATE Nota_Credito SET status_factura=? WHERE id= ?";
            }
            pool.query(query, [status, id],
                (err, rows, fields) => {
                    if (err) {
                        console.log("err actualizar estado factura ", err);
                        return reject(err)
                    };
                    resolve(rows);
                })
            
        } catch (error) {
		            reject(error);
		}
    })
}

Factura.obtenerCorreoCliente = (idfactura,tipo_factura) => {
    console.log('PASO POR OBTENER CORREO')
    console.log({idfactura},{tipo_factura});
    return new Promise(async (resolve, reject) => {
        try {
            //const idemisor = await obtenerIdEmisor(idfactura, '01'); //CAMBIO X SYN
            const idemisor = await obtenerIdEmisor(idfactura,tipo_factura);
            console.log({tipo_factura});
            if (idemisor.length === 0) {
                return resolve([]);
            } else {
                if (tipo_factura === '01') {
                    const idcliente = await obtenerCliente1000(idemisor);
                    console.log({ idcliente,tipo_factura })
                    const sql = `
                        select c.cliente_correo FROM Cliente c
                        INNER JOIN Factura f ON f.idcliente = c.id
                        INNER JOIN Emisor e ON f.idemisor = e.id
                        AND f.idcliente <> ${idcliente} 
                        AND f.idcliente <> 1
                        AND f.id = ${idfactura}
                    `;
                    console.log(sql);
                    pool.query(sql, [], (err, rows, fields) => {
                        if (err) return reject(err);
                        resolve(rows);
                    })
                }else{
                    const idcliente = await obtenerCliente1000(idemisor);
                    console.log({ idcliente,tipo_factura })
                    const sql = `
                        select c.cliente_correo FROM Cliente c
                        INNER JOIN nota_credito f ON f.idcliente = c.id
                        INNER JOIN Emisor e ON f.idemisor = e.id
                        AND f.idcliente <> ${idcliente} 
                        AND f.idcliente <> 1
                        AND f.id = ${idfactura}
                    `;
                    console.log(sql);
                    pool.query(sql, [], (err, rows, fields) => {
                        if (err) return reject(err);
                        resolve(rows);
                    })
                }
            }

        } catch (error) {
            reject(error);
        }
    })
}

Factura.obtenerTotalNotasCreditoNoEnviadas = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT COUNT(*) FROM Nota_Credito WHERE status_factura IS NULL OR codigo_estado IS NULL', [], (err, rows, fields) => {

            if (err) return reject(err);
            resolve(rows);
        })
    })
}

//AND nc.codigo_estado IS NULL se quito del select SYN
Factura.paginarNotasCreditoNoEnviadas = (cantidadRegistros, desde) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT nc.id, nc.tipo_factura,e.id as idemisor, nc.codigo_estado, nc.status_factura, nc.numeroReferencia as claveref  
        FROM Nota_Credito nc, Emisor e 
        WHERE nc.status_factura IS NULL  
        
        AND nc.idemisor = e.id
        AND e.estado_emisor = 1
        AND e.client_id = 'api-prod'
       
        ORDER BY e.prioridad DESC,nc.id ASC LIMIT ${desde},${cantidadRegistros}`, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}


Factura.obtenerDatosEncabezadoReportePos = (obj) => {

    return new Promise(async (resolve, reject) => {
        try {
            const { idemisor, idfactura } = obj;

            const idcliente = await obtenerCliente1000(idemisor)
            pool.query(`
                SELECT SUBSTRING(f.fecha_factura,1,10) as fecha, f.num_documento, f.clavenumerica,f.consecutivo,
                (IF (f.idcliente <> 1 AND f.idcliente <> ${idcliente},(SELECT JSON_OBJECT('nombre',c.cliente_nombre,
                'direccion', c.otras_senas, 'telefono', c.cliente_telefono_numtelefono,
                'correo',c.cliente_correo) FROM Cliente c WHERE f.idcliente=c.id),NULL)) as datosReceptor,
                e.emisor_nombre, e.emisor_nombrecomercial, e.emisor_otras_senas, e.logo, e.emisor_telefono_numtelefono, e.emisor_correo,
                f.totalcomprobante as total, f.totalimpuesto as impuestos, totaldescuentos as descuentos,
                f.totalVenta, f.totalVentaNeta, f.tipocambio, f.codigomoneda, e.emisor_otras_senas as senas,
                e.numeroresolucion ,e.fecharesolucion, e.cedula_emisor as cedula, f.notas

                FROM Factura f, Cliente c, Emisor e
                WHERE f.id = ${idfactura}
                AND e.id = ${idemisor}
                AND f.idemisor = e.id
                AND f.idcliente = c.id

            `, [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
        } catch (error) {
            reject(error);
        }
    })
}


Factura.obtenerDatosFacturaProforma = (idfactura) => {

    return new Promise(async (resolve, reject) => {
        try {
            const idemisor = await obtenerIdEmisor(idfactura, '01');
            const idcliente = await obtenerCliente1000(idemisor)
            pool.query(`
                SELECT f.totalcomprobante  as totalFactura, f.tipo_factura, f.num_documento,f.subtotal, f.totalimpuesto as impuestos,
                    f.totaldescuentos as descuentos,f.condicion_venta, f.medio_pago,f.tipocambio,f.codigomoneda, f.TotalOtrosCargos as otrosCargos,f.notas,f.plazo_credito,(IF (f.idcliente <> 1 AND f.idcliente <> ${idcliente},(SELECT JSON_OBJECT('nombre',c.cliente_nombre,
                    'nombrecomercial', c.cliente_nombre_comercial, 'telefono', c.cliente_telefono_numtelefono, 'cedula',c.cedula_cliente,'idcliente', c.id, 'porcentajeExoneracion',c.porcentajeExoneracion, 'ExentoIVA', c.exentoIVA, 'correo', c.cliente_correo,'descuento',c.descuento,'limi_credi',limi_credi,'saldo',saldo,'vence1',vence1,'vence2',vence2,'vence3',vence3,'vence4',vence4,'vence5',vence5) FROM Cliente c WHERE f.idcliente=c.id),NULL)) as cliente 
                    FROM Cliente c, Factura f, Emisor e
                    WHERE f.id = ${idfactura}
                    AND f.idemisor = e.id
                    AND f.idcliente = c.id
                    AND f.proforma IS NOT NULL
            `, [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
        } catch (error) {
            reject(error)
        }
    })
}

Factura.actualizarNumeroDocumento = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idfactura, num_documento } = obj;

        pool.query(`
            UPDATE Factura SET num_documento = ${num_documento} WHERE idemisor = ${idemisor} AND id = ${idfactura}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}



Factura.actualizarEstadoProformaAFactura = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idfactura } = obj;

        pool.query(`
            UPDATE Factura SET proforma = NULL WHERE idemisor = ${idemisor} AND id = ${idfactura}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Factura.actualizarConsecutivosElectronicos = (obj) => {

    return new Promise((resolve, reject) => {

        const { clavenumerica, consecutivo, idfactura, idemisor, numeroInterno } = obj;
        console.log("COnsecutivo a actualizar ", consecutivo);
        pool.query(`
            UPDATE Factura SET proforma = NULL ,clavenumerica = ?, consecutivo = ?, numero_interno= ?
            WHERE idemisor = ${idemisor} AND id = ${idfactura}
        `, [clavenumerica, consecutivo, numeroInterno], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Factura.obtenerEncabezadoReporteFacturaDetallado = (obj) => {

    return new Promise((resolve, reject) => {
        const { fechaInicio, fechaFin, idemisor } = obj;

        let sql = `
            SELECT f.id as idfactura ,f.fecha_factura, f.clavenumerica as clave, f.num_documento, c.cliente_nombre as cliente,
            f.tipocambio,f.codigomoneda as moneda, f.totalventa as montototal, f.totalimpuesto as impuestos,
            f.TotalOtrosCargos as otrosCargos,f.totalcomprobante as total, f.monto_descuento_total as descuentos

            FROM Factura f, Cliente c, Emisor e
            WHERE f.idemisor = ${idemisor}
            AND f.idemisor = e.id
            AND f.idcliente = c.id
            AND f.status_factura = 'aceptado'
            AND f.anulada <> 1`;

        if (typeof fechaInicio !== 'undefined' && typeof fechaFin != 'undefined') {

            if (fechaInicio != '' && fechaFin != '') {
                sql += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin + "'";
            }
        }

        console.log(sql);
        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Factura.agregarFacturasConCredito = (obj) => {
    return new Promise((resolve, reject) => {

        const {
            idemisor, idcliente, idfactura, fecha_factura, montototal, saldoactual, factura
        } = obj;

        pool.query(`
            INSERT INTO MovimientosCxc(idemisor,idcliente,idfactura,fecha_factura,montototal,saldoactual,factura)
            VALUES(?,?,?,?,?,?,?);
        `, [idemisor, idcliente, idfactura, fecha_factura, montototal, saldoactual, factura], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Factura.obtenerFacturasCreditoPorCliente = () => {

    return new Promise((resolve, reject) => {


    })
}

Factura.mantenerOnlineLaBd = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT  'hola'`, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows)
        });
    })
}


Factura.buscarFacturasOTiquetesAceptadosReported151 = (obj) => {
    console.log("buscarFacturasOTiquetesAceptados")
    return new Promise((resolve, reject) => {
        //comentario
        const { montoVenta, fechaInicio, fechaFin, idemisor } = obj;

        let consultaBase = "SELECT f.clavenumerica ,SUBSTRING(f.fecha_factura,1,10) as fecha ,c.cliente_nombre,c.cedula_cliente,f.condicion_venta,f.tipo_factura,f.medio_pago, f.totaldescuentos,f.totalservgravados, f.totalservexentos, f.totalservexonerado, f.totalmercanciasgravadas,  f.totalmercanciasexentas,f.totalmercanciaexonerada,  f.totalgravado, f.totalexento,f.totalexonerado, f.totalventa, f.totalventaneta,f.subtotal, f.totalimpuesto ,f.TotalOtrosCargos, f.totalcomprobante, f.codigomoneda, f.tipocambio FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND f.idemisor = e.id  AND f.idcliente = c.id AND f.status_factura = 'aceptado' AND f.anulada = 0 AND f.proforma IS NULL";

        if (fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== '') {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (montoVenta && montoVenta.toString() !== '') {
            consultaBase += " AND f.totalcomprobante >=" + Number(montoVenta);
        }

        consultaBase += ' ORDER BY c.cliente_nombre,f.codigomoneda';

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows)
        })
    })
}


Factura.obtenerFacturasAgrupadasPorCliente = (obj) => {

    return new Promise((resolve, reject) => {

        const { montoVenta, fechaInicio, fechaFin, idemisor } = obj;

        let consultaBase = "SELECT c.cliente_nombre,c.cedula_cliente, f.codigomoneda,SUM(f.totaldescuentos) as totaldescuentos,SUM(f.totalservgravados) as totalservgravados, SUM(f.totalservexentos) as totalservexentos, SUM(f.totalservexonerado) as totalservexonerado, SUM(f.totalmercanciasgravadas) as totalmercanciasgravadas,  SUM(f.totalmercanciasexentas) as totalmercanciasexentas,SUM(f.totalmercanciaexonerada) as totalmercanciaexonerada, SUM(f.totalgravado) as totalgravado, SUM(f.totalexento) as totalexento, SUM(f.totalexonerado) as totalexonerado, SUM(f.totalventa) as totalventa, SUM(f.totalventaneta) as totalventaneta, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto ,SUM(f.TotalOtrosCargos) as TotalOtrosCargos, SUM(f.totalcomprobante) as totalcomprobante FROM Factura f, Cliente c, Emisor e WHERE f.idemisor = " + idemisor + " AND f.idemisor = e.id  AND f.idcliente = c.id AND f.status_factura = 'aceptado' AND f.anulada = 0 AND f.proforma IS NULL";

        if (fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== '') {
            consultaBase += " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'";
        }

        if (montoVenta && montoVenta.toString() !== '') {
            consultaBase += " AND f.totalcomprobante >=" + Number(montoVenta);
        }

        consultaBase += ' GROUP BY c.cliente_nombre,c.cedula_cliente,f.codigomoneda';

        pool.query(consultaBase, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows)
        })
    })
}

Factura.obtenerTipoCambioFacturasParaActualizar = () => {

    return new Promise((resolve, reject) => {

        pool.query(`
        SELECT SUBSTRING(fecha_factura,1,10) as fecha FROM Factura WHERE tipocambio = 1 OR tipocambio < 1 GROUP BY SUBSTRING(fecha_factura,1,10) LIMIT 10;
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err)
            }

            resolve(rows);
        })

    })
}

Factura.actualizarTipoCambio = (obj) => {
    return new Promise((resolve, reject) => {

        const { fecha, tipocambio } = obj;

        pool.query('UPDATE Factura SET tipocambio = ? WHERE SUBSTRING(fecha_factura,1,10) = ?',
            [tipocambio, fecha], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Factura.obtenerTotalesFacturasAgrupadosPorTipoImpuestoPorLinea = (obj) => {

    return new Promise((resolve, reject) => {

        const { fechaInicio, fechaFin, idemisor } = obj;
        const sql = `
        SELECT t.porcentaje_impuesto, 0 as subtotal, 0 as montototal, 0 as totalImpuesto,
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
        AND t.porcentaje_impuesto not in
        (SELECT DISTINCT fd.tarifa
        FROM Factura f, Factura_Detalle fd
        WHERE f.idemisor = ${idemisor}
        AND f.id = fd.idfactura
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
        ) UNION (SELECT fd.tarifa,SUM(fd.subtotal) as subtotal, SUM(fd.montototal) as montototal, 
            SUM(fd.MontoExoneracion) as MontoExoneracion, SUM(fd.monto) as totalImpuesto,
        (CASE
            WHEN fd.tarifa = 0 THEN 'IVA 0%'
            WHEN fd.tarifa = 1 THEN 'IVA 1%'
            WHEN fd.tarifa = 2 THEN 'IVA 2%'
            WHEN fd.tarifa = 4 THEN 'IVA 4%'
            WHEN fd.tarifa = 8 THEN 'IVA 8%'
            WHEN fd.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Producto p, Factura f, Factura_Detalle fd
        WHERE f.idemisor = ${idemisor}
        AND f.id = fd.idfactura
        AND p.id = fd.idproducto
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
        GROUP BY fd.tarifa ORDER BY fd.tarifa ASC)
        `
        console.log(sql);
        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Factura.obtenerTotalesPorLineasAgrupadosPorMercanciasYServicios = (obj) => {
    return new Promise((resolve, reject) => {

        const { fechaInicio, fechaFin, idemisor } = obj;

        pool.query(`
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
            (SELECT DISTINCT fd.tarifa
            FROM Factura f, Factura_Detalle fd
            WHERE f.idemisor = ${idemisor}
            AND f.id = fd.idfactura
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
            ) UNION (SELECT fd.tarifa,p.codigo_servicio,SUM(fd.subtotal) as subtotal, SUM(fd.impuesto_neto) as impuesto_neto ,
            (CASE
                WHEN fd.tarifa = 0 THEN 'IVA 0%'
                WHEN fd.tarifa = 1 THEN 'IVA 1%'
                WHEN fd.tarifa = 2 THEN 'IVA 2%'
                WHEN fd.tarifa = 4 THEN 'IVA 4%'
                WHEN fd.tarifa = 8 THEN 'IVA 8%'
                WHEN fd.tarifa = 13 THEN 'IVA 13%'
            END) AS descripcion
            FROM Factura_Detalle fd, Factura f, Producto p
            WHERE f.idemisor = ${idemisor}
            AND f.id = fd.idfactura
            AND fd.idproducto = p.id
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
            GROUP BY p.codigo_servicio,fd.tarifa ORDER BY fd.tarifa ASC);
        `, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows)
        })
    })
}

Factura.obtenerSubtotalesFactura = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, fechaInicio, fechaFin } = obj;

        pool.query(`
            SELECT t.porcentaje_impuesto,0 subtotal
                FROM Tipo_Impuesto t
                    WHERE t.idemisor = ${idemisor}
                    AND t.porcentaje_impuesto NOT IN 
                    (SELECT DISTINCT fd.tarifa
                    FROM Factura f, Factura_Detalle fd
                    WHERE f.idemisor = ${idemisor}
                    AND f.id = fd.idfactura
                    ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
                
                    ) UNION (
                        SELECT fd.tarifa,SUM(fd.subtotal) as subtotal
                    FROM Factura_Detalle fd, Factura f
                    WHERE f.idemisor = ${idemisor}
                    AND f.id = fd.idfactura
                    ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
                GROUP BY fd.tarifa ORDER BY fd.tarifa ASC);
        `, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

Factura.eliminarFacturas = (obj) => {
    return new Promise((resolve, reject) => {
        const { idemisor, numeroInternoInicio, numeroInternoFin } = obj;
        const sql = `
            DELETE FROM Factura 
            WHERE idemisor = ${idemisor} 
            AND status_factura <> 'aceptado'
            AND proforma IS NULL 
            ${numeroInternoInicio && numeroInternoInicio.toString() !== ''
                && numeroInternoFin && numeroInternoFin.toString() !== '' ? `
            AND numero_interno >= ${numeroInternoInicio} 
            AND numero_interno <= ${numeroInternoFin};
            `: ''}
        `;
        console.log("-----------------------------------------------------")
        console.log(sql);
        pool.query(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

// -------------------------------------------------------------------------------------------  Mercancías

Factura.obtenerSumatoriaLineasPorTarifaMercancias = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, fechaInicio, fechaFin } = obj;
        const sql = `
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
        (SELECT DISTINCT fd.tarifa
            FROM Producto p, Factura f, Factura_Detalle fd
            WHERE f.idemisor = ${idemisor}
            AND f.id = fd.idfactura
            AND p.id = fd.idproducto
            AND p.codigo_servicio = 'Mercancía'
            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
        GROUP BY fd.tarifa ORDER BY fd.tarifa ASC
        ) UNION (SELECT fd.tarifa, SUM(fd.subtotal) as subtotal, SUM(fd.impuesto_neto) as impuesto_neto, 
        (CASE
            WHEN fd.tarifa = 0 THEN 'IVA 0%'
            WHEN fd.tarifa = 1 THEN 'IVA 1%'
            WHEN fd.tarifa = 2 THEN 'IVA 2%'
            WHEN fd.tarifa = 4 THEN 'IVA 4%'
            WHEN fd.tarifa = 8 THEN 'IVA 8%'
            WHEN fd.tarifa = 13 THEN 'IVA 13%'
        END) AS descripcion
        FROM Producto p, Factura f, Factura_Detalle fd
        WHERE f.idemisor = ${idemisor}
        AND f.id = fd.idfactura
        AND p.id = fd.idproducto
        AND p.codigo_servicio = 'Mercancía'
        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
        GROUP BY fd.tarifa ORDER BY fd.tarifa ASC)
        `;
        pool.query(sql, [], (err, rows, fields) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

// ------------------------------------------------------------------------------------------- Servicios

Factura.obtenerSumatoriaLineasPorTarifaServicios = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, fechaInicio, fechaFin } = obj;

        pool.query(`
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
                (SELECT DISTINCT fd.tarifa
                    FROM Producto p, Factura f, Factura_Detalle fd
                    WHERE f.idemisor = ${idemisor}
                    AND f.id = fd.idfactura
                    AND p.id = fd.idproducto
                    AND p.codigo_servicio = 'Servicio'
                    ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
                GROUP BY fd.tarifa ORDER BY fd.tarifa ASC) 
                UNION (SELECT fd.tarifa, SUM(fd.subtotal) as subtotal, SUM(fd.impuesto_neto) as impuesto_neto, 
                (CASE
                    WHEN fd.tarifa = 0 THEN 'IVA 0%'
                    WHEN fd.tarifa = 1 THEN 'IVA 1%'
                    WHEN fd.tarifa = 2 THEN 'IVA 2%'
                    WHEN fd.tarifa = 4 THEN 'IVA 4%'
                    WHEN fd.tarifa = 8 THEN 'IVA 8%'
                    WHEN fd.tarifa = 13 THEN 'IVA 13%'
                END) AS descripcion
                FROM Producto p, Factura f, Factura_Detalle fd
                WHERE f.idemisor = ${idemisor}
                AND f.id = fd.idfactura
                AND p.id = fd.idproducto
                AND p.codigo_servicio = 'Servicio'
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'" : ''}
                GROUP BY fd.tarifa ORDER BY fd.tarifa ASC)
        `, [], (err, rows, fields) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

Factura.obtenerEstadoFacturaPorClave = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, clave } = obj;

        pool.query(`
            SELECT status_factura FROM Factura WHERE idemisor = ? AND clavenumerica = ?
        `, [idemisor, clave], (err, rows, fields) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

Factura.obtenerEstadoNotaCreditoPorClave = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, clave } = obj;

        pool.query(`
            SELECT status_factura,numeroReferencia, clavenumerica FROM Nota_Credito WHERE idemisor = ? AND clavenumerica = ?
        `, [idemisor, clave], (err, rows, fields) => {
            if (err) return reject(err);
            resolve(rows);
        })
    })
}

Factura.obtenerFacturaPorClave = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, clave } = obj;

        pool.query('SELECT id FROM Factura WHERE idemisor = ? AND clavenumerica = ?',
            [idemisor, clave], (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}

///AGREGADO X SYN
Factura.obtenerFacturaPordocumento = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, num_documento } = obj;
        //AGREGA clavenumerica
        pool.query('SELECT id,clavenumerica FROM Factura WHERE idemisor = ? AND num_documento = ?',
            [idemisor, num_documento], (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}

Factura.obtenerNotaCreditoPorClave = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, clave } = obj;

        pool.query('SELECT id FROM Nota_Credito WHERE idemisor = ? AND clavenumerica = ?',
            [idemisor, clave], (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows);
            })
    })
}
Factura.actualizarErrorEnvioCorreo = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, descripcion, idfactura, estado } = obj;
        let sql = '';

        let parametros = [];

        if (typeof estado !== 'undefined') {
            sql = 'UPDATE Factura SET errorEmail=?, correo=? WHERE idemisor = ? AND id = ? '
            parametros = [descripcion, estado, idemisor, idfactura];
        } else {
            sql = 'UPDATE Factura SET errorEmail=? WHERE idemisor = ? AND id = ? '
            parametros = [descripcion, idemisor, idfactura];
        }

        pool.query(sql,
            parametros, (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Factura.actualizarIdBodega = (obj) => {

    return new Promise((resolve, reject) => {

        const { idbodega, idfactura, idemisor } = obj;

        pool.query(`

            UPDATE Factura SET idbodega = ${idbodega} WHERE idemisor = ${idemisor} AND id = ${idfactura}

        `, (err, rows, fields) => {

            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Factura.obtenerIdbodegaPorClavenumerica = obj => {

    return new Promise((resolve, reject) => {

        const { clavenumerica, idemisor } = obj;
        //
        pool.query('SELECT idbodega FROM Factura WHERE idemisor = ? AND clavenumerica =?',
            [idemisor, clavenumerica], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

module.exports = Factura;

/*
        SELECT t.porcentaje_impuesto,0 subtotal
    FROM Tipo_Impuesto t
    WHERE t.idemisor = 2
    AND t.porcentaje_impuesto NOT IN
    (SELECT DISTINCT fd.tarifa
    FROM Factura f, Factura_Detalle fd
    WHERE f.idemisor = 2
    AND f.id = fd.idfactura

    ) UNION (
        SELECT fd.tarifa,SUM(fd.subtotal) as subtotal
    FROM Factura_Detalle fd, Factura f
    WHERE f.idemisor = 2
    AND f.id = fd.idfactura
    GROUP BY fd.tarifa ORDER BY fd.tarifa ASC);
        -------------------------------------------------------------------------------------------------------------


        `SELECT t.codigo_impuesto, SUM(fd.subtotal) as subtotal, SUM(fd.montototal) as montototal, SUM(fd.MontoExoneracion) as MontoExoneracion
        FROM Tipo_Impuesto t,Producto p, Factura f, Factura_Detalle fd
        WHERE f.idemisor = ${idemisor}
        AND f.id = fd.idfactura
        AND p.id = fd.idproducto
        AND t.id = p.tipo_impuesto

        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}

        GROUP BY t.codigo_impuesto ORDER BY t.codigo_impuesto ASC`;

         SELECT t.codigo_impuesto, 0 as subtotal, 0 as montototal, 0 as MontoExoneracion,
                (CASE
                    WHEN t.codigo_impuesto = '01' THEN 'IVA 0%'
                    WHEN t.codigo_impuesto = '02' THEN 'IVA 1%'
                    WHEN t.codigo_impuesto = '03' THEN 'IVA 2%'
                    WHEN t.codigo_impuesto = '04' THEN 'IVA 4%'
                    WHEN t.codigo_impuesto = '08' THEN 'IVA 13%'
                    ELSE null
                END) AS descripcion
                FROM Tipo_Impuesto t
                WHERE t.idemisor = ${idemisor}
                AND  t.codigo_impuesto not in
            (SELECT t.codigo_impuesto
                FROM Tipo_Impuesto t,Producto p, Factura f, Factura_Detalle fd
                WHERE f.idemisor = ${idemisor}
                AND t.idemisor = ${idemisor}
                AND f.id = fd.idfactura
                AND p.id = fd.idproducto
                AND t.id = p.tipo_impuesto
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                GROUP BY t.codigo_impuesto  ORDER BY t.codigo_impuesto ASC)
                UNION (SELECT t.codigo_impuesto, SUM(fd.subtotal) as subtotal, SUM(fd.montototal) as montototal,
                    SUM(fd.MontoExoneracion) as MontoExoneracion,
                (CASE
                    WHEN t.codigo_impuesto = '01' THEN 'IVA 0%'
                    WHEN t.codigo_impuesto = '02' THEN 'IVA 1%'
                    WHEN t.codigo_impuesto = '03' THEN 'IVA 2%'
                    WHEN t.codigo_impuesto = '04' THEN 'IVA 4%'
                    WHEN t.codigo_impuesto = '08' THEN 'IVA 13%'
                    ELSE null
                END) AS descripcion
                FROM Tipo_Impuesto t,Producto p, Factura f, Factura_Detalle fd
                WHERE f.idemisor = ${idemisor}
                AND t.idemisor = ${idemisor}
                AND f.id = fd.idfactura
                AND p.id = fd.idproducto
                AND t.id = p.tipo_impuesto
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== ''? " AND SUBSTRING(f.fecha_factura,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(f.fecha_factura,1,10) <= '" + fechaFin.toString() + "'": ''}
                GROUP BY t.codigo_impuesto, t.descripcion ORDER BY t.codigo_impuesto ASC)

                        *Nuevo Reporte** Reporte de razones no compra / agrupado por razon digitada/ % de participacion de la razon vrs el total

                */

