const request = require("request");
const pool = require("../db/config");
const fs = require("fs");
const consecutivo = require("./Consecutivos");
const Emisor = require("../models/Emisor");
//URL para servicios Web
const HACIENDA_HTTP_ADDRESS = "https://api.comprobanteselectronicos.go.cr/recepcion/v1/recepcion";
const BCCR_INDICAORES_ECONOMICOS = "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos";

const obtenerTipoCambio = () => {//

    return new Promise((resolve, reject) => { // funcion para obtener el tipo de cambio del BCCR indicadores economicos

        const f = new Date();
        let obj = {
                "tcIndicador": 318, // El tipo de cambio de venta de dolar
                "tcFechaInicio": f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear(),
                "tcFechaFinal": f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear(),
                "tcNombre": 'SyNMaxTecnhnology',
                "tnSubNiveles": 'N',
                "tcCorreo": 'navemen23@hotmail.com',
                "token": "35TE0MOE25"
            }
            // token para el tipo de cambio
        const url = `${BCCR_INDICAORES_ECONOMICOS}?Indicador=${obj.tcIndicador}&FechaInicio=${obj.tcFechaInicio}&FechaFinal=${obj.tcFechaFinal}&Nombre=${obj.tcNombre}&SubNiveles=${obj.tnSubNiveles}&CorreoElectronico=${obj.tcCorreo}&Token=${obj.token}`;

        request.get(url, function(error, response, body) {
            if (error) {
                console.error(error)
                return reject(error)
            }
            //console.log(body);
            resolve(body)
        });
    })
}

const generacion_clave_numerica = (stringPreviousClaveNumerica, tipoComprobante, id, idemisor) => {
    console.log("id factura ", id)
        // stringPreviousClaveNumerica es la clave anterior
        // En caso de que no hay clave numerica anterior.
    let codPais // String[1:3]
    let dia // String[4:5]
    let mes // String[6:7]
    let ano // String[8:9]
    let cedEmisor // String[10:21]
    let consecutivo // String[22:41]
    let situacionComprobante // String[42]
    let codSeguridad // String[43:50]
    let claveNumerica // Return of this function

    let situacionComprobanteAnterior = stringPreviousClaveNumerica.substring(41, 42) // String[42]
    console.log("situacionComprobanteAnterior ", situacionComprobanteAnterior)
    return new Promise(async(resolve, reject) => {
        codPais = getCodPais()
        dia = getDia()
        mes = getMes()
        ano = getYear()
        cedEmisor = await numeroEmisor(idemisor) //crear una funcion para obtener el numero del emisor
            //consecutivo = new_consecutivo(tipoComprobante)
        codSeguridad = codigoSeguridad()
        new_consecutivo(tipoComprobante, id, idemisor)
            .then(new_consecutivo => {
                const { nuevoConsecutivo, llave, clave, numeroInterno } = new_consecutivo;
                claveNumerica = codPais + dia + mes + ano + cedEmisor + nuevoConsecutivo + '1' + codSeguridad
                console.log("claveNumerica ", claveNumerica.length)
                const obj = {

                }
                resolve({
                    claveNumerica,
                    nuevoConsecutivo,
                    id,
                    llave,
                    clave,
                    numeroInterno
                })
            })
            .catch(error => {
                console.error("new_consecutivo returned an error with tipoComprobante: " + tipoComprobante + " and situacionComprobante: " + situacionComprobante)
                console.error(error)
                reject(error)
            })
    })
}


const generarArchivoXML = (obj) => {
    return new Promise((resolve, reject) => {
        try {
            const { path, comprobante } = obj;
            fs.appendFile(path, comprobante, function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Archivo creado correctamente!");
                    resolve(true);
                }
            });

        } catch (err) {
            reject(err);
        }
    })

}

const codigoSeguridad = () => {

    let cantidadNumeros = 8;
    let myArray = []
    while (myArray.length < cantidadNumeros) {
        let numeroAleatorio = Math.ceil(Math.random() * cantidadNumeros);
        let existe = false;
        for (let i = 0; i < myArray.length; i++) {
            if (myArray[i] == numeroAleatorio) {
                existe = true;
                break;
            }
        }
        if (!existe) {
            myArray[myArray.length] = numeroAleatorio;
        }
    }
    return myArray.toString().replace(/,/g, ''); //convetir a string el array de numeros random y luego quitarle las comas por un espacio en blanco
}

const isHaciendaOnline = () => {
    //funciones.codigoSeguridad().toString().replace(/,/g,'') //-> /,/g esa expresion regular significa que donde haya una coma en el string

    return new Promise(function(resolve, reject) {

        try {
            console.log(HACIENDA_HTTP_ADDRESS);
            request(HACIENDA_HTTP_ADDRESS, function(error, response, body) {
                if (error) {
                    console.error("error:", error); // mostrar si hay un error
                }
                // console.log(response)
                console.log("statusCode:", response && response.statusCode); // pintar el codigo de estado
                //console.log("body:", body); // e.
                let term = response.statusCode;
                let re = new RegExp("^2[0-8][0-9]$|^29[0-9]$|^(400)$");

                if (response && re.test(term)) {
                    resolve(true)
                    console.log("HACIENDA_HTTP_ADDRESS esta Online")
                } else {
                    reject(false)
                    console.error("HACIENDA_HTTP_ADDRESS no esta Online")
                    console.error(response.statusCode)
                }
            });
        } catch (error) {
            console.error(error)
            console.log(" error en isHaciendaOnline(): " + HACIENDA_HTTP_ADDRESS)
            reject(error)
        }
    })
}
const new_consecutivo = (tipoComprobante, id, idemisor) => {

    console.log("tipoComprobante in new_consecutivo() is: " + tipoComprobante);
    console.log("idfactura", id);
    console.log("idemisor", idemisor);
    return new Promise((resolve, reject) => {
        let query = '';
        if (tipoComprobante !== '03' && tipoComprobante !== '08') { //Factura o Tiquete
            console.log("factura")
            query = `SELECT f.id, e.casaMatriz, e.puntoVenta, e.file_p12 as llave, e.pin_p12 as clave FROM Factura f, Emisor e WHERE f.id = ? AND f.idemisor=e.id;`;
        } else if(tipoComprobante == '03') { //ANulacion
            query = `SELECT n.id, e.casaMatriz, e.puntoVenta, e.file_p12 as llave, e.pin_p12 as clave FROM Nota_Credito n, Emisor e WHERE n.id = ? AND n.idemisor=e.id;`;
            console.log("NOta")
        } else {
            console.log("Otro")
            query = `SELECT e.id, em.casaMatriz, em.puntoVenta, em.file_p12 as llave, em.pin_p12 as clave FROM Entrada e , Emisor em WHERE e.id = ? AND e.idemisor=em.id;`;
        }

        console.log(query);
        pool.query(query, [id, idemisor], (err, rows, fields) => {
            console.log("resultado ",rows);

            if (err) {
                return reject(err);
            }
            let tipoconse = ''
            if(tipoComprobante == '01'){
                tipoconse = 'FA';
            }
            if(tipoComprobante == '04'){
                tipoconse = 'TK';
            }
            if(tipoComprobante == '03'){
                tipoconse = 'NC';
            }
            if(tipoComprobante == '05'){
                tipoconse = 'RE';
            }
            if(tipoComprobante == '08'){
                tipoconse = 'FC'; // factura de compra
            }

            console.log("tipoconse ", tipoconse)

            const objConsecutivo = {
                tipoconse,
                idemisor
            };

            consecutivo.actualiarEmisorConsecutivo(objConsecutivo)
                .then(async consecutivoGenerado => {

                    console.log("consecutivo generado ", consecutivoGenerado);
                /* 
                    const { id, puntoVenta, casaMatriz, llave, clave } = rows[0];
                    let consecutivo = "0000000000";
                    consecutivo = consecutivo.substring(0, consecutivo.length - id.toString().length);
                    const numeroInterno = consecutivo + String(id);
                    const nuevoConsecutivo = casaMatriz + puntoVenta + tipoComprobante + consecutivo + String(id);
                    console.log("nuevoConsecutivo " + nuevoConsecutivo);
                    resolve({ nuevoConsecutivo, llave, clave, numeroInterno });*/
                    let data = null;
                    if(rows.length === 0){
                        const fila = await Emisor.obtenerDatosHacienda(idemisor);
                        data = fila;
                    } else {
                        data = rows;
                    }

                    console.log("row ",data);
                    const { puntoVenta, casaMatriz, llave, clave } = data[0];
                    const nuevoConsecutivo = casaMatriz + puntoVenta + tipoComprobante + consecutivoGenerado;
                    const numeroInterno = consecutivoGenerado;
                    resolve({ nuevoConsecutivo, llave, clave, numeroInterno });

            })
            .catch(err => {
                console.log("Error consecutivo ", err);
                reject(err);
            })
        })
    })
}

const numeroEmisor = (id) => {

        return new Promise((resolve, reject) => {
            pool.query("SELECT numero_emisor FROM Emisor where id=?", [id], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                const { numero_emisor } = rows[0];
                console.log("numero emisor ",rows);
                resolve(numero_emisor);
            })
        })
    }
    /*
        En el momento de crear la factura, se deben crear el objeto de las ordenes y crear los valores totales de la factura, insertar la factura
        y luego los detalles de factura 1
    */
const getDia = function() {
    // pending to test in a date from 1 - 9
    const today = new Date()
    return ("0" + (today.getDate())).slice(-2)
}

const getMes = function() {
    const today = new Date()
    return ("0" + (today.getMonth() + 1)).slice(-2)
}

const getYear = function() {
    const today = new Date()
    return ("0" + (today.getYear())).slice(-2)
}

const getCodPais = function() {
    return "506"
}

module.exports = {
    obtenerTipoCambio,
    generarArchivoXML,
    generacion_clave_numerica,
    new_consecutivo
}
