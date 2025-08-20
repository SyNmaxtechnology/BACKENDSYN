const pool = require("../db/config");
const Categoria = require("./Categoria");
let EntradaDetalle = {};


EntradaDetalle.insertarDetalle = (obj) => {
    return new Promise((resolve,reject) => {
        const {
            idarticulo,
            identrada,
            precio_linea,
            cantidad,
            descripcioDetalle,
            porcentajedescuento,
            montodescuento,
            naturalezadescuento,
            numerolineadetalle,
            subtotal,
            montototal,
            codigo,
            codigo_tarifa,
            tarifa,
            monto,
            impuesto_neto,
            numerodocumento,
            montoitotallinea,
            baseimponible,
            MontoExoneracion,
            factorIVA,
            otrosCargos

        } = obj;

        pool.query("INSERT INTO ENtrada_Detalle(idarticulo,identrada,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,impuesto_neto,numerodocumento,montoitotallinea,baseimponible,MontoExoneracion,factorIVA,otroscargos) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[idarticulo,identrada,precio_linea,cantidad,descripcioDetalle,porcentajedescuento,montodescuento,naturalezadescuento,numerolineadetalle,subtotal,montototal,codigo,codigo_tarifa,tarifa,monto,impuesto_neto,numerodocumento,montoitotallinea,baseimponible,MontoExoneracion,factorIVA,otrosCargos], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


EntradaDetalle.obtenerLineasEntrada = (identrada) => {
    return new Promise((resolve,reject) => {
        pool.query(`SELECT DISTINCT e.id,ed.identrada,ed.idarticulo,a.id,a.codigobarra_producto,
        a.unidad_medida as unidadMedida,a.unidad_medida_comercial as unidadMedidaComercial,ed.precio_linea,ed.cantidad,
        ed.descripcioDetalle,ed.porcentajedescuento,ed.montodescuento,ed.naturalezadescuento,ed.numerolineadetalle,ed.subtotal,
        ed.montototal,ed.codigo,ed.codigo_tarifa,ed.tarifa,ed.monto,ed.baseimponible,ed.impuesto_neto,ed.numerodocumento,
        ed.montoitotallinea,em.tipo_codigo_servicio, ti.descripcion, ed.MontoExoneracion, a.idcategoria 
        FROM Entrada e, Entrada_Detalle ed,Articulo a, Emisor em, Tipo_Impuesto ti
        WHERE ed.identrada = ? 
            AND ed.identrada = e.id 
            AND ed.idarticulo = a.id 
            AND e.idemisor = em.id
            AND a.tipo_impuesto = ti.id
            ORDER BY ed.numerolineadetalle ASC
            `, [identrada], async (err, rows, fields) => {
                if(err){
                    return reject(err);
                }

                try {
                    //return resolve(rows);
                    const categoria = await Categoria.obtenerCodigoCabysCategoria1();
                    let lineas = rows;
                    for(linea of lineas){
                        //codigocabys

                        if(!linea.idcategoria || linea.idcategoria == ''){ // no tiene categoria asociada
                            linea.codigoCabys = categoria[0].codigocabys;
                        } else { // tiene categoria asociada
                            const patron=new RegExp('^[0-9]{13}$');
                            const codigoCabysCategoria = await Categoria.obtenerCodigoCabysPorId(linea.idcategoria);
                            if(
                                !codigoCabysCategoria[0].codigoCabys 
                                || codigoCabysCategoria[0].codigoCabys == '' 
                                || !patron.test(codigoCabysCategoria[0].codigoCabys)){

                                linea.codigoCabys = categoria[0].codigocabys;
                            } else {
                                linea.codigoCabys = codigoCabysCategoria[0].codigoCabys;
                            }
                        }
                      /*
                        if(!linea.codigoCabys){
                            linea.codigoCabys = categoria[0].codigocabys;
                        }
                      
                      */
                    } // comentario
                    resolve(lineas);
                            
                } catch(err ){
                    throw err;
                }
    
            })
    })
}


EntradaDetalle.obtenerLineasEntradaAactualizar = (idfactura) => {

    return new Promise((resolve,reject) => {
        pool.query(`SELECT ed.precio_linea, ed.cantidad, ed.descripcioDetalle, ed.porcentajedescuento,
                        ed.montodescuento,ed.naturalezadescuento, ed.subtotal,ed.montototal, a.codigobarra_producto,
                        ed.codigo,ed.codigo_tarifa,a.codigo_servicio,a.tipo_servicio, ed.tarifa, a.unidad_medida as unidadMedida,
                        a.unidad_medida_comercial as unidadMedidaComercial,a.idcategoria,a.id as idarticulo, ed.monto, ed.baseimponible,ed.impuesto_neto, ed.montoitotallinea,ed.numerolineadetalle, ed.MontoExoneracion, ed.otrosCargos, ed.factorIVA

                        FROM Entrada_Detalle ed, Entrada e, Articulo a, Categoria c
                        WHERE e.id = ${idfactura}
                        AND ed.identrada = e.id
                        AND ed.idarticulo =a.id
                        AND c.id = a.idcategoria
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

EntradaDetalle.eliminarLineasEntrada = (identrada) => {

    return new Promise((resolve,reject) => {
        pool.query(`
        
            DELETE FROM Entrada_Detalle WHERE identrada = ${identrada}
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows);
        })
    })
}
module.exports = EntradaDetalle;