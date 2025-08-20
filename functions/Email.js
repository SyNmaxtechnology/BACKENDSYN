const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const config = require('../Email/emailConfig');
const base64 = require("file-base64");
const fs = require("fs");
const tls = require("tls");
//const { facturas : {host, port, user, pass} } = config; //CAMBIO SYN
const { enviosbk : {host, port, user, pass} } = config; //CAMBIO SYN
//const { correos : {host, port, user, pass} } = config; //correo ice
//const { correosyn : {host, port, user, pass} } = config; //correo syn
const time = Date.now();
const Factura = require('../models/Factura');
const FacturaDetalle = require('../models/FacturaDetalle');
const consulta = require("./consulta");
const Xml = require("./Xml");
const path = require("path");
let iniciar =0;
global.desdeCorreos = iniciar;
let Transport1 = nodemailer.createTransport({

   /* host,
    secure: false,
    // secureConnection: false, 
    ignoreTLS: false,
    port,
    auth: {
        user,
        pass
    }*/
    host,
    secure: true, 
    port,
    auth: {
        user,
        pass
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
        ignoreTLS: false,
        requireTLS: true
    }
    
});

let Transport2 = nodemailer.createTransport(smtpPool({
    pool: true,
    maxConnections: 1,
    maxMessages: 10,
    debug: true,
    //logger: true,
    connectionTimeout: 3000,
    host,
    secure: true, 
    port,
    auth: {
        user,
        pass
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
        ignoreTLS: false,
        requireTLS: true
    }
}));

const leerbase64Decodificado = (ruta) => {
    return new Promise((resolve,reject) => {
        const path = __dirname +'/../tmp/'+ruta;

        fs.readFile(path,'utf-8',(err,data ) => {
            if(err){
                return reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

const decodeBase64 = (base64String,ruta) => {

    return new Promise((resolve,reject) => {
        const path = __dirname +'/../tmp/'+ruta;
        base64.decode(base64String, path, function(err, output) {
            if(err){
                return reject(err)
            } else {
                resolve("Decodificado a string"); 
            }
          });
    })
}

const crearPDF = (texto, id) => {
    console.log("Funcion de crear el pdf");
    return new Promise((resolve,reject) => {
        const path = 'pdf/'+id+'.pdf';
        consulta.generarPDFDeComprobante(texto,path)
            .then(respuesta => {
                resolve(respuesta);
            })
        .catch(err => reject(err));
    })
}

const obtenerCorreosNoEnviados =  () => {

    return new Promise(async (resolve,reject) => {

        let nombreComprobante = '';
        let textoComprobanteXML ='';
        let nombreAcuse = '';
        let textoAcuseXML= '';
        let rutaPDF = '';
        let PDF ='';
        let reporte = '';
        let indice = 0
        let arrCorreos = [];
        const cantidadCorreos =30;
        //evitarEstadoSuspension();

        var idsFactura = await Factura.facturasAceptadasSinEnviarPorCorreo(global.desdeCorreos,cantidadCorreos); //lista
        console.log("conteo de facturas",idsFactura);
        if (idsFactura.length == 0) {
            idsFactura = await Factura.NCAceptadasSinEnviarPorCorreo(global.desdeCorreos,cantidadCorreos); //lista    
            console.log("conteo de NC",idsFactura);
        }

        for(const dataIdsFactura of idsFactura) {
            const objtoXml = {
                idfactura: dataIdsFactura.id,
                tipo: dataIdsFactura.tipo_factura
            }
           // console.log("correo ",factura[0].datosCliente.cliente_correo)
            const factura = await Factura.obtenerDatosReporteFactura(objtoXml); //una linea
            let ordenes = await FacturaDetalle.obtenerOrdenesPorFactura({idfactura: dataIdsFactura.id,
                tipo: dataIdsFactura.tipo_factura,idemisor: dataIdsFactura.idemisor });
            const clave = factura[0].clavenumerica;
            if(ordenes.length > 0){
                if(factura[0].datosCliente !== null){
                    reporte = await consulta.crearReporteConReceptor(ordenes,factura[0]);
                    crearPDF(reporte,clave)
                        .then(async response => {
                            const xml = await Xml.obtenerXML(objtoXml);
                            if(xml.length > 0){
                                if(typeof xml[0].acuseXml !== 'undefined' || xml[0].acuseXml != null){
                                    
                                    nombreComprobante = clave+'.xml';
                                    textoComprobanteXML = xml[0].xml;
                                    nombreAcuse = 'Respuesta_'+nombreComprobante;
                                    textoAcuseXML = xml[0].acuseXml;
                                    //rutaPDF = __dirname +'/../pdf/'+clave+'.pdf';
                                    const ruta = '../pdf/' + clave + '.pdf';
                                    const root = path.join(__dirname, ruta);
                                    rutaPDF = root;
                                    PDF= clave+'.pdf';
                                    const idfactura = dataIdsFactura.id;                  
                                    const expresion = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;                                      
                                        if(expresion.test(factura[0].datosCliente.cliente_correo)){
                                            //resolve('','',nombreComprobante,textoComprobanteXML,nombreAcuse,textoAcuseXML,rutaPDF,PDF,factura[0].datosCliente.cliente_correo,factura[0].emisor_nombre || factura[0].emisor_nombrecomercial,idfactura,dataIdsFactura.idemisor);

                                            arrCorreos.push({
                                                correoEmisor:'',
                                                correoReceptor:'',
                                                nombreComprobante,
                                                textoComprobanteXML,
                                                nombreAcuse,
                                                textoAcuseXML,
                                                rutaPDF,
                                                pdf: PDF,
                                                correo:factura[0].datosCliente.cliente_correo,
                                                emisor_nombre:factura[0].emisor_nombre || factura[0].emisor_nombrecomercial,
                                                idfactura:dataIdsFactura.id,
                                                idemisor:dataIdsFactura.idemisor
                                            })
                                
                                        } else {
                                            //actualizar el estado de envioCorreo
                                            console.log("El correo no es válido");
                                            Factura.actualizarErrorEnvioCorreo({
                                                idemisor: dataIdsFactura.idemisor,
                                                idfactura: dataIdsFactura.id,
                                                descripcion: 'El correo no es válido para el envío',
                                                estado: 1
                                            }).then(responseActualizarEstadoError => {
                                                if(responseActualizarEstadoError.affectedRows > 0){
                                                    console.log("El estado de error email ha sido actualizado")
                                                } else {
                                                    console.log("El estado de error email no ha sido actualizado")
                                                }
                                            })
                                            .catch(err => {
                                                console.log("error correo",err);
                                            }) 

                                        }
                                }else {
                                    console.log("No tiene xml")
                                    console.log(factura[0].datosCliente.cliente_correo)
                                }
                            }
                        }).catch(err => {
                            iniciar+=1;
                            global.desdeCorreos = iniciar//;
                            console.log("error al  generar el comporbante ", err);
                        });
                }
            }

            if(indice === idsFactura.length){
                iniciar+=1;
                global.desdeCorreos = iniciar * cantidadCorreos;
                
            }
        }
        return resolve(arrCorreos);
    })
}



exports.enviarCorreoMasivo =  () => {
    
    return new Promise(async (resolve, reject) => {
      try {
     
        const correos = await obtenerCorreosNoEnviados();


        //--------------------------------------------------------------------------------------------------------------------
        
        for (const {
                correoEmisor, correoReceptor, nombreComprobante ,
                textoComprobanteXML, nombreAcuse, 
                textoAcuseXML, rutaPDF, pdf, 
                correo, emisor_nombre,idfactura,
                idemisor 
        } of correos) {

                //const { host, port, user, pass } = config;
        //nombreComprobante, textoComprobanteXML, nombreAcuse, textoAcuseXML, rutaPDF, pdf, correo
            console.log("ENVIAR CORREO A ", correo);
            console.log("emisor ", emisor_nombre)
            
            let mailOptions = {};
            let arrCorreos = [];
            let correos = null;
            const expresion = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/; 
            let unico = false;
            if(correo.indexOf(';') !== -1){
                for(let i = 0; i < 3; i++){
                    //                                            if(expresion.test(factura[0].datosCliente.cliente_correo) == true){
                    correos = correo.split(';');
                    if(correos[i] && expresion.test(correos[i])){
                        arrCorreos.push(correos[i]);
                    }
                }
            } else {
                unico = true;
            }

            if(nombreComprobante == '' && textoComprobanteXML == '' && nombreAcuse == '' && textoAcuseXML == '' 
                    && rutaPDF != ''&& pdf != '' && correo != ''){
                        console.log("correo 1")
                        const numeroProforma = pdf.split('.')[0];
                    mailOptions = {
                        // Fred Foo 👥 <foo@blurdybloop.com>
                        // no-reply@synmaxtechnology.com
                        from: '"synmaxtechnology 👥" <no-replysynmaxtechnology@ice.co.cr>',
                        //to: ['navemen23@hotmail.com',correo],
                        to: unico === true ? correo : arrCorreos.join(','),
                        subject: 'Proforma numero '+numeroProforma+' ()',
                        html: `
                            <b>En el adjunto el archivo pdf de la proforma</b>
                            <p> Correo generado automáticamente. </p>
                            <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                        attachments: [{
                                filename: pdf,
                                path: rutaPDF,
                                contentType: "application/pdf"
                            }
                        ]
                    };
            } else if((nombreAcuse == '' && textoAcuseXML== '') && (pdf == '' && rutaPDF == '')) {
                /*const archivo = 'comprobante_'+time+'.txt';
                await decodeBase64(textoComprobanteXML,archivo);
                const stringUTF8 = await leerbase64Decodificado(archivo)*/
                let numeroConsecutivo = nombreComprobante.split('Respuesta_')[1].split('.')[0];
                numeroConsecutivo =  numeroConsecutivo.substring(21,41);
                let subject = '';

                if(estado == 'aceptado'){
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.';
                } else  {
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+')';
                }
                mailOptions = {

                    from: '"synmaxtechnology 👥" <nono-replysynmaxtechnology@ice.co.cr>',
                    to: correo,
                    subject: subject,
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [
                        { //enb64.decode(textoComprobanteXML)
                            filename: nombreComprobante,
                            content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        }]
                };
            } else {

                let numeroConsecutivo = nombreAcuse.split('Respuesta_')[1].split('.')[0];
                numeroConsecutivo =  numeroConsecutivo.substring(21,41);
                console.log("correo 2")
                mailOptions = {
                    // En el adjunto los archivos PDF y XMls del comprobante electrónico
                    from: 'no-replysynmaxtechnology@ice.co.cr',
                    //to: ['navemen23@hotmail.com',correo],
                    to: unico === true ? correo : arrCorreos.join(','),
                    subject: 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.',
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [{
                            filename: pdf,
                            path: rutaPDF,
                            contentType: "application/pdf"
                        },
                        {
                            filename: nombreComprobante,
                            content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),  //enb64.decode(textoComprobanteXML), //Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        },
                        {
                            filename: nombreAcuse,
                            content: Buffer.from(textoAcuseXML, "base64").toString("utf8"),//enb64.decode(textoAcuseXML),
                            contentType: "application/xml"
                        }
                    ]
                };
            }
            console.log("a enviar correo");

            Transport2.sendMail(mailOptions, function(error, emailData) {


          //  Transport1.sendMail(mailOptions, function(error, emailData) {  //CAMBIO SYN
                console.log("error ", error);
                console.log("enviado ",emailData);
                if (error) {
                    console.log("Error al enviar el correo");
                    
                    reject(error);
                    

                } else {
                    console.log("EL CORREO SE HA ENVIADO");
                    
                    //console.log("COrredo enviado ", emailData);

                    Factura.actualizarEstadoEnvioCorreo(idfactura)
                        .then(responseFactura => {
                            console.log("Factura enviada por correo ", responseFactura);

                            Factura.actualizarErrorEnvioCorreo({
                                idemisor: idemisor,
                                idfactura: idfactura,
                                descripcion: null
                            }).then(responseActualizarEstadoError => {
                                if(responseActualizarEstadoError.affectedRows > 0){
                                    console.log("El estado de error email ha sido actualizado")
                                } else {
                                    console.log("El estado de error email no ha sido actualizado")
                                }
                            })
                            .catch(err => {
                                console.log("error correo",err);
                            }) 
                    })

                } //evillamora@hotmail.com
            })
        }
      } catch (error) {
          reject(error);
      }
    })
}

// 50610082000011482087500100001010000000589128751634
exports.enviarCorreo =  (correoEmisor, correoReceptor, nombreComprobante, textoComprobanteXML, nombreAcuse, textoAcuseXML, rutaPDF, pdf, correo,estado,emisor_nombre) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("correo destinatario ", correo);
            console.log("emisor ", emisor_nombre)
            let mailOptions = {};
            

            if((nombreAcuse == '' && textoAcuseXML== '') && (pdf == '' && rutaPDF == '')) {
                /*const archivo = 'comprobante_'+time+'.txt';
                await decodeBase64(textoComprobanteXML,archivo);
                const stringUTF8 = await leerbase64Decodificado(archivo)*/
                let numeroConsecutivo = nombreComprobante.split('Respuesta_')[1].split('.')[0];
                numeroConsecutivo =  numeroConsecutivo.substring(21,41);
                let subject = '';

                if(estado == 'aceptado'){
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.';
                } else  {
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+')';
                }
                mailOptions = {

                    from: '"synmaxtechnology 👥" <no-replysynmaxtechnology@ice.co.cr>',
                    to: correo,
                    subject: subject,
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [
                        { //enb64.decode(textoComprobanteXML)
                            filename: nombreComprobante,
                            content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        }]
                };
            } else if(nombreComprobante == '' && textoComprobanteXML == '' && nombreAcuse == '' && textoAcuseXML == '' 
                && rutaPDF != ''&& pdf != '' && correo != ''){
                    const numeroProforma = pdf.split('.')[0];
                    //subject: `Comprobante Electrónico N°. ${numeroConsecutivo} (${emisor_nombre.uppercase()}) - Aceptado por el Ministerio de Hacienda.`,

                    
                mailOptions = {

                    from: 'no-replysynmaxtechnology@ice.co.cr',
                    //to: ['navemen23@hotmail.com',correo],
                    to: correo,
                    subject: `Proforma N°. ${numeroProforma} (${emisor_nombre.toUpperCase()})`,
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p> PROFORMA NÚMERO ${numeroProforma}</p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [{
                            filename: pdf,
                            path: rutaPDF,
                            contentType: "application/pdf"
                        }
                    ]
                };
            } else if(nombreComprobante != '' && textoComprobanteXML != ''  && !textoAcuseXML && rutaPDF != ''&& pdf != '' && correo != ''){
                // la factura esta rebotada 
                let numeroConsecutivo = pdf.split('.')[0];
                numeroConsecutivo =  numeroConsecutivo.substring(21,41);
                let subject = '';
                if(estado == 'rebotado'){
                    subject ='Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+'). El comprobante fue rebotado por el Ministerio de Hacienda'
                } else {
                    subject ='Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+')';   
                }
                mailOptions = {
                    from: 'no-replysynmaxtechnology@ice.co.cr',
                    to: correo,
                    subject,
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [{
                            filename: pdf,
                            path: rutaPDF,
                            contentType: "application/pdf"
                        }, //enb64.decode(textoComprobanteXML)
                        {
                            filename: nombreComprobante,
                            content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        }
                    ]
                };
            }
            else {

                
                let numeroConsecutivo = pdf.split('.')[0];
                numeroConsecutivo =  numeroConsecutivo.substring(21,41);
                let subject = '';

                if(estado == 'aceptado'){
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.';
                } else  {
                    subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+')';
                }
                mailOptions = {

                    from: 'no-replysynmaxtechnology@ice.co.cr',
                    to: correo,
                    subject: subject,
                    html: `<center>
                            <h1>Ha recibido un documento electrónico</h1>
                            </center>
                    
                    <h2>Emisor: </h2><br>
                    <p>
                        ${String(emisor_nombre).toUpperCase()}
                    </p>
                    <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                    <p> Correo generado automáticamente. </p>
                    <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                    `,
                    attachments: [{
                            filename: pdf,
                            path: rutaPDF,
                            contentType: "application/pdf"
                        }, //enb64.decode(textoComprobanteXML)
                        {
                            filename: nombreComprobante,
                            content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        },
                        { //enb64.decode(textoAcuseXML) textoAcuseXML decodeURIComponent(window.atob(textoAcuseXML))
                            filename: nombreAcuse,
                            content:  Buffer.from(textoAcuseXML, "base64").toString("utf8"),
                            contentType: "application/xml"
                        }
                    ]
                };
            }

            Transport1.sendMail(mailOptions, function(error, emailData) {

                if (error) {

                    console.log("Error envio correos", error);

                    return reject(error);

                } else {

                    console.log("correo enviado");
                    console.log(emailData);

                    return resolve(true);
                } //evillamora@hotmail.com
            })
        } catch (error) {
            reject('Ha ocurrido un error al enviar el correo');
        }
    })
}

exports.enviarEstadoCuenta = (obj) => {
    
    return new Promise((resolve,reject) => {
        const {emisor_nombre,correo,pdf,rutaPDF,cliente,fechaEmision} = obj;
        try {
         const mailOptions = {

                from: 'no-replysynmaxtechnology@ice.co.cr',
                to: correo,
                subject: `Estado de cuenta. Fecha: ${fechaEmision.replace('T',' ')}`,
                html: `<center>
                        <h1>Ha recibido un documento electrónico.</h1>
                        <br>
                        <h3>Estimado Cliente <b>${cliente}</b></b>, adjunto se encuentra en formato PDF el estado de cuenta</h3>
                        </center>
                
                <h2>Emisor: </h2><br>
                <p>
                    ${String(emisor_nombre).toUpperCase()}
                </p>
                <p> Correo generado automáticamente. </p>
                <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                `,
                attachments: [{
                        filename: pdf,
                        path: rutaPDF,
                        contentType: "application/pdf"
                    }
                ]
            };

            Transport1.sendMail(mailOptions, function(error, emailData) {

                if (error) {

                    console.log("Error envio correos", error);

                    return reject(error);

                } else {

                    console.log("correo enviado");
                    console.log(emailData);

                    return resolve(true);
                } //evillamora@hotmail.com
            })
        
        } catch (error) {
            reject('Hubo un error al emviar el correo')
        }
    })
}
/*
module.exports = {
    user: 'programador1@synmaxtechnology.com',
    pass: 'vqIYjS$pnnP5',
    host: 'mail.synmaxtechnology.com',
    port: '25'
}
no-reply@synmaxtechnology.com
*/



/**
 * exports.enviarCorreoMasivo = async (correoEmisor, correoReceptor, nombreComprobante = '', textoComprobanteXML= '', nombreAcuse= '', textoAcuseXML= '', rutaPDF, pdf, correo, emisor_nombre) => {
    
    return new Promise((resolve, reject) => {
      try {
            //const { host, port, user, pass } = config;
    //nombreComprobante, textoComprobanteXML, nombreAcuse, textoAcuseXML, rutaPDF, pdf, correo
        console.log("ENVIAR CORREO A ", correo);
        console.log("emisor ", emisor_nombre)
        let mailOptions = {};
        let arrCorreos = [];
        let correos = null;
        const expresion = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
        let unico = false;
        if(correo.indexOf(';') !== -1){
            for(let i = 0; i < 3; i++){
                //                                            if(expresion.test(factura[0].datosCliente.cliente_correo) == true){
                correos = correo.split(';');
                if(correos[i] && expresion.test(correos[i])){
                    arrCorreos.push(correos[i]);
                }
            }
        } else {
            unico = true;
        }

        if(nombreComprobante == '' && textoComprobanteXML == '' && nombreAcuse == '' && textoAcuseXML == '' 
                && rutaPDF != ''&& pdf != '' && correo != ''){
                    console.log("correo 1")
                    const numeroProforma = pdf.split('.')[0];
                mailOptions = {
                    // Fred Foo 👥 <foo@blurdybloop.com>
                    // no-reply@synmaxtechnology.com
                    from: '"synmaxtechnology 👥" <no-reply@synmaxtechnology.com>',
                    //to: ['navemen23@hotmail.com',correo],
                    to: unico === true ? correo : arrCorreos.join(','),
                    subject: 'Proforma numero '+numeroProforma+' ()',
                    html: `
                        <b>En el adjunto el archivo pdf de la proforma</b>
                        <p> Correo generado automáticamente. </p>
                        <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                `,
                    attachments: [{
                            filename: pdf,
                            path: rutaPDF,
                            contentType: "application/pdf"
                        }
                    ]
                };
        } else if((nombreAcuse == '' && textoAcuseXML== '') && (pdf == '' && rutaPDF == '')) {
            
            let numeroConsecutivo = nombreComprobante.split('Respuesta_')[1].split('.')[0];
            numeroConsecutivo =  numeroConsecutivo.substring(21,41);
            let subject = '';

            if(estado == 'aceptado'){
                subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.';
            } else  {
                subject = 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+')';
            }
            mailOptions = {

                from: '"synmaxtechnology 👥" <no-reply@synmaxtechnology.com>',
                to: correo,
                subject: subject,
                html: `<center>
                        <h1>Ha recibido un documento electrónico</h1>
                        </center>
                
                <h2>Emisor: </h2><br>
                <p>
                    ${String(emisor_nombre).toUpperCase()}
                </p>
                <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                <p> Correo generado automáticamente. </p>
                <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                `,
                attachments: [
                    { //enb64.decode(textoComprobanteXML)
                        filename: nombreComprobante,
                        content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                        contentType: "application/xml"
                    }]
            };
        } else {

            let numeroConsecutivo = nombreAcuse.split('Respuesta_')[1].split('.')[0];
            numeroConsecutivo =  numeroConsecutivo.substring(21,41);
            console.log("correo 2")
            mailOptions = {
                // En el adjunto los archivos PDF y XMls del comprobante electrónico
                from: 'no-reply@synmaxtechnology.com',
                //to: ['navemen23@hotmail.com',correo],
                to: unico === true ? correo : arrCorreos.join(','),
                subject: 'Comprobante Electrónico N°. '+numeroConsecutivo+' ('+String(emisor_nombre).toUpperCase()+') - Aceptado por el Ministerio de Hacienda.',
                html: `<center>
                        <h1>Ha recibido un documento electrónico</h1>
                        </center>
                
                <h2>Emisor: </h2><br>
                <p>
                    ${String(emisor_nombre).toUpperCase()}
                </p>
                <p>COMPROBANTE ELECTRÓNICO N°. ${numeroConsecutivo} </p>
                <p> Correo generado automáticamente. </p>
                <p> Por Favor, no responder a esta dirección de correo electrónico </p>
                `,
                attachments: [{
                        filename: pdf,
                        path: rutaPDF,
                        contentType: "application/pdf"
                    },
                    {
                        filename: nombreComprobante,
                        content: Buffer.from(textoComprobanteXML, "base64").toString("utf8"),  //enb64.decode(textoComprobanteXML), //Buffer.from(textoComprobanteXML, "base64").toString("utf8"),
                        contentType: "application/xml"
                    },
                    {
                        filename: nombreAcuse,
                        content: Buffer.from(textoAcuseXML, "base64").toString("utf8"),//enb64.decode(textoAcuseXML),
                        contentType: "application/xml"
                    }
                ]
            };
        }
        console.log("a enviar correo");
        Transport2.sendMail(mailOptions, function(error, emailData) {
            console.log("error ", error);
            console.log("enviado ",emailData);
            if (error) {
                console.log("Error al enviar el correo");
                
                reject(error);
                

            } else {
                console.log("EL CORREO SE HA ENVIADO");
                
                //console.log("COrredo enviado ", emailData);
                resolve(true);
            } //evillamora@hotmail.com
        })
      } catch (error) {
          reject('Hubo un error al enviar el correo');
      }
    })
}
 */