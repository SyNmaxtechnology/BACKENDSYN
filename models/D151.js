const pool = require("../db/config");
const FacturaController = require("../controllers/FacturaController");
const EntradaController = require("../controllers/EntradaController");

const obtenerEncabezadosFacturasClientes =  async (obj) => { //com

        try {

            const facturas = await FacturaController.buscarFacturasOTiquetesAceptadosReported151(obj);   
            return facturas;

        } catch(err){
            throw err;
        }
    
}

const obtenerEncabezadosFacturasProveedores = async (obj) => {
     
    try {
    
        const compras = await EntradaController.obtenerEntradasAceptadasReporteD151(obj);
        return compras;
    
    } catch (error) {
        throw err;   
    }
}

const obtenerTotalesComprobantesClientes = (obj) => {
 
    return new Promise((resolve, reject) => {

        const {fechaInicio,fechaFin,idemisor,montoVenta} = obj;

        let sql =  "SELECT f.codigomoneda, SUM(f.totaldescuentos) as totaldescuentos,SUM(f.totalservgravados) as totalservgravados, SUM(f.totalservexentos) as totalservexentos,SUM(f.totalservexonerado) as totalservexonerado,  SUM(f.totalmercanciasgravadas) as totalmercanciasgravadas,  SUM(f.totalmercanciasexentas) as totalmercanciasexentas, SUM(f.totalmercanciaexonerada) as totalmercanciaexonerada,  SUM(f.totalgravado) as totalgravado, SUM(f.totalexento) as totalexento,SUM(f.totalexonerado) as totalexonerado,  SUM(f.totalventa) as totalventa, SUM(f.totalventaneta) as totalventaneta, SUM(f.subtotal) as subtotal, SUM(f.totalimpuesto) as totalimpuesto , SUM(f.TotalOtrosCargos) as TotalOtrosCargos, SUM(f.totalcomprobante) as totalcomprobante FROM Factura f, Cliente c, Emisor e  WHERE f.idemisor = "+idemisor+"  AND f.idemisor = e.id  AND f.idcliente = c.id AND f.status_factura = 'aceptado'  AND f.anulada = 0 AND f.proforma IS NULL";

        if( fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== ''){

            sql +=" AND SUBSTRING(f.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(f.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        
        if(montoVenta && montoVenta.toString() !== ''){

            sql +=" AND f.totalcomprobante >= "+Number(montoVenta);
        } 

        sql += ' GROUP BY f.codigomoneda;'

        console.log("totales ",sql);

        pool.query(sql,[], (err,rows,fields) => {
            if(err){
                return reject(err);
            } 
    
            resolve(rows);
        })
    })
}


const obtenerTotalesComprobantesProveedores = (obj) => {
 
    console.log("body 1",obj);
    return new Promise((resolve, reject) => {

        const {fechaInicio,fechaFin,idemisor,montoCompra} = obj;

        let sql = "SELECT e.codigomoneda,SUM(e.totaldescuentos) as totaldescuentos,SUM(e.totalservgravados) as totalservgravados, SUM(e.totalservexentos) as totalservexentos, SUM(e.totalservexonerado) as totalservexonerado, SUM(e.totalmercanciasgravadas) as totalmercanciasgravadas, SUM(e.totalmercanciasexentas) as totalmercanciasexentas,SUM(e.totalmercanciaexonerada) as totalmercanciaexonerada, SUM(e.totalgravado) as totalgravado,  SUM(e.totalexento) as totalexento,SUM(e.totalexonerado) as totalexonerado, SUM(e.totalventa) as totalventa,  SUM(e.totalventaneta) as totalventaneta,SUM(e.subtotal) as subtotal, SUM(e.totalimpuesto)  as totalimpuesto,SUM(e.TotalOtrosCargos) as TotalOtrosCargos,  SUM(e.totalcomprobante) as totalcomprobante FROM Entrada e, Proveedor p, Emisor em  WHERE e.idemisor = "+idemisor+"  AND e.idemisor = em.id  AND e.idproveedor = p.id  AND e.estadoHacienda = 'aceptado'";

        if( fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== ''){

            sql +=" AND SUBSTRING(e.fecha_factura,1,10) >= '"+fechaInicio+"' AND SUBSTRING(e.fecha_factura,1,10) <= '"+fechaFin+"'";
        } 
        console.log("montocompra 2",montoCompra)
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


module.exports = {
    obtenerEncabezadosFacturasClientes,
    obtenerEncabezadosFacturasProveedores,
    obtenerTotalesComprobantesClientes,
    obtenerTotalesComprobantesProveedores
}
