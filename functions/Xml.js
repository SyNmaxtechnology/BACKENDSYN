const pool = require("../db/config");
let XML = {};

XML.guardarXML = (obj) => {//com
    return new Promise((resolve, reject) => {
        const { id, xml, tipo_factura } = obj;
        let query = '';
        let queryb = '';

        ///AGREGADO POR SYN
        
          /*  queryb = 'SELECT xml, acuseXml FROM Xml WHERE idnotacredito is null and idfactura=?';
        
            pool.query(queryb, [idfactura],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
            console.log(rows);*/
        //AGREGADO POR SYN

        if (tipo_factura == '03') {
            query = 'INSERT INTO Xml(idnotacredito,xml) VALUES('+id+',"'+xml+'")';
        } else if(tipo_factura == '05') { // guardar el mensaje creado
            query = 'INSERT INTO Xml(identrada,mensajeAceptacion) VALUES('+id+',"'+xml+'")';
        } else if(tipo_factura == '05RH') { // respuesta de aceptacion de hacienda
            query = 'UPDATE Xml SET respuestaMensajeAceptacion= "'+xml+'" WHERE identrada ='+id;
        } else if(tipo_factura == '08') { //Factura de compra
            query = 'INSERT INTO Xml(identrada,xml) VALUES('+id+',"'+xml+'")';
        } else if(tipo_factura == '08A' || tipo_factura == '08R') { //Factura de compra anulacion o reemplazo
            query = 'INSERT INTO Xml(identrada,xml) VALUES('+id+',"'+xml+'")';
        } else { //factura o tiquete electronico
            query = 'INSERT INTO Xml(idfactura,xml) VALUES('+id+',"'+xml+'")';
        }

        console.log(query);
        pool.query(query, [],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

XML.obtenerXML = (obj) => {
    return new Promise((resolve, reject) => {
        const {idfactura, tipo} = obj;
        
        console.log("obj obetenr xml",obj)
        let query = '';
        
        if(tipo == 'Nota de Crédito' || tipo == '03'){
            query = 'SELECT xml, acuseXml FROM Xml WHERE idfactura is null and idnotacredito=?';
            
        }  
        else {
            query = 'SELECT xml, acuseXml FROM Xml WHERE idnotacredito is null and idfactura=?';
        }
        pool.query(query, [idfactura],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

XML.obtenerRespuestaMensajeAceptacion = (idfactura) => {
    //SELECT mensajeAceptacion FROM Xml WHERE identrada=?
    return new Promise((resolve,reject) => {
        const query = 'SELECT respuestaMensajeAceptacion FROM Xml WHERE identrada=?';
        pool.query(query, [idfactura],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

XML.guardarAcuse = (obj) => {
    return new Promise((resolve, reject) => {
        console.log("OBJETO DE ACTUALIZAR ACUSE XML VENTA", obj);
        const { id, acuseXml, tipo_factura } = obj;
        let query = '';
        if(tipo_factura == '03'){
            query = 'UPDATE Xml SET acuseXml = ? WHERE idfactura is null and  idnotacredito= ?'
        } else {
            query= 'UPDATE Xml SET acuseXml = ? WHERE idnotacredito is null and idfactura = ?'
        }
        pool.query(query, [acuseXml,id],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

XML.guardarAcuseFacturaCompra = (obj) => {
    return new Promise((resolve, reject) => {
        console.log("OBJETO DE ACTUALIZAR ACUSE XML COMPRA", obj);

        const { acuseXml,id } = obj;
        const query= 'UPDATE Xml SET acuseXml = ? WHERE identrada = ?'
        
        pool.query(query, [acuseXml,id],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

XML.obtenerAcuseFacturaCompra = (id) => {
    return new Promise((resolve,reject) => {
        pool.query('SELECT acuseXml FROM Xml WHERE identrada=?', [id],(err,rows,fields) => {
            if (err) {
                console.log(err)
                return reject(err);
            }
    
            resolve(rows);
        })
    })
}


XML.obtenerMensajeAceptacion = (identrada) => {
    return new Promise((resolve,reject) => {

        pool.query(`
        SELECT mensajeAceptacion FROM Xml WHERE identrada = ${identrada} 
        `, [],(err, rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

XML.obtenerEntradaPorIdEntrada = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {idemisor,identrada} = obj;
        const sql = `
            SELECT x.Xml FROM Entrada e, Xml x
                WHERE e.idemisor = ${idemisor}
                AND e.id = x.identrada
                AND x.identrada = ${identrada};
        `;

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

XML.existeXMLPorIdFactura = (idfactura) => {

    return new Promise((resolve,reject) => {

        const sql = `
            SELECT id FROM xml WHERE idfactura = ${idfactura}
        `;
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}
module.exports = XML;
