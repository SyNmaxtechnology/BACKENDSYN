const pdf = require("html-pdf");
const facturaFunciones = require("../functions/Factura");
const convert = require('xml-js');
const { reject } = require("bcrypt/promises");
const mediosPagoService = require("../ServiciosWeb/MedioPago")();
const tipoCambioController = require("../controllers/TipoCambioController");
const fecha = require("../db/fecha");

exports.crearReporteSinReceptor = (dataOrdenes, dataFactura) => {
    return new Promise((resolve, reject) => {
        
        if (typeof dataFactura.consecutivo === "undefined" || JSON.stringify(dataOrdenes) === "{}" ||
            typeof dataFactura.numero_emisor === "undefined") {
            let error = new Error("informacion indefinida");
            reject(error)

        } else {

            console.log({dataFactura})
            const fechaSubstr = fecha().toString().substring(0,10);
            tipoCambioController.obtenerTipoCambio(fechaSubstr).then(tipoCambioActual => {
                
                let totalTipoCambio = Number(tipoCambioActual[0].tipocambio).toFixed(2);
                listaOrdenes(dataOrdenes).then(data => {

                    let medioPago = 'No especificado';
                    for(let medio of mediosPagoService){
                        if(medio.id == dataFactura.medio_pago) {
                            medioPago = medio.medio;
                        }   
                    }
                    let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let codigomoneda = dataFactura.codigomoneda;
                    let simboloMoneda = '';
                    let anchoTotales = 0;
                    let totalDolares = 0;
                    //totalTipoCambio=500;
                    if(codigomoneda === 'CRC'){
                        simboloMoneda = '¢'
                        anchoTotales = 100;
                        totalDolares = total / totalTipoCambio;
                    } else {
                        simboloMoneda = '$'
                        anchoTotales = 50;
                        totalDolares = total * 1;
                    }

                    let ordenes = data;
                    let impuesto = parseFloat(dataFactura.totalimpuesto).toFixed(2);
                    let descuento = parseFloat(dataFactura.totaldescuentos).toFixed(2);
                    let subTotal = parseFloat(dataFactura.totalventa).toFixed(2);
                    //let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let cedula = obtenerNumeros_Emisor_Receptor(dataFactura.numero_emisor);
                    //let totalDolares = total / totalTipoCambio;
                    let direccion = typeof dataFactura.emisor_otras_senas === 'undefined' || dataFactura.emisor_otras_senas == null ? '': dataFactura.emisor_otras_senas;
                    let otrosCargos = Number(dataFactura.TotalOtrosCargos).toFixed(2);
                    const fecha = dataFactura.fecha_factura;
                    let tipo_factura = '';
                    if(dataFactura.tipo_factura == '01' || dataFactura.tipo_factura == 'Factura Electrónica') {
                        tipo_factura='Factura Electrónica'
                    } else if(tipo_factura == '04' || dataFactura.tipo_factura =='Tiquete Electrónico') {
                        tipo_factura='Tiquete Electrónico'
                    } else if(tipo_factura == '03' || dataFactura.tipo_factura =='Nota de Crédito') {
                        tipo_factura=`Nota Crédito \n Electrónica`
                    }
                    var content = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title></title>
                        <style>
                        body {
                            height: auto;   
                            align-items: center; 
                        }
                        header {
                            margin-top: 10px;
                            text-align: center;
                            font-size: 10px;
                        }
                        footer {
                            text-align: center;
                        }
                        #descricionComprobante, #descricionLineas,#totales {
                            margin: 0 auto;
                            border: 1px solid black;
                            border-radius: 5px;
                            width: 560px;
                            margin-bottom: 2px;
                        }
                        
                        #descricionComprobante p {
                            margin-left: 5px;
                        }
                
                        p {
                            font-size: 8px;
                        }
                
                        #lineas {
                            width: 100%;
                            text-align: center;
                        }
                
                        #lineas tr {
                            font-size: 8px;
                        }
                
                        #nombreCliente {
                            margin-left: 5px;
                        }
                
                        #totalDolares {
                            margin-left: 5px;
                            float: left;
                        }
                        .cajaLogo img {
                            width:130px;
                            height:80px;
                            object-fit:contain;
                            
                        }

                        .notasEmisor {
                            text-align: center;
                        }

                        </style>
                    </head>
                    <body>
                        <header>
                            <div id="cabecera">
                                <table style="width: 100%">
                                    <tbody>
                                    ${dataFactura.numeroReferencia? `
                                    <div style="width: 100%; text-align:center;"> 
                                        <div><b>Nota Crédito Electrónica:</b> ${dataFactura.consecutivo}</div>
                                    </div>
                                `: ''};
                                    ${dataFactura.logo ? `
                                    <td>
                                        <section class="cajaLogo" style="width: 10%">
                                            <img src=${dataFactura.logo} alt="logo">
                                        </section>
                                    </td>    
                                    `
                                    : ''}
                                        <td style="margin-right: 1px;">
                                            <section class="datEmisor" style="width: 100%">
                                                <div id="emisor"><b>${dataFactura.emisor_nombre || dataFactura.emisor_nombrecomercial }</b></div>
                                                <div id="telefono"> <span><b>Tel:</b></span> ${dataFactura.emisor_telefono_numtelefono}</div>
                                                <div id="Identificación"> <span><b>Identificación:</b></span> ${cedula}</div>
                                                <div id="email"> <span><b>Correo:</b></span> ${dataFactura.emisor_correo}</div> 
                                                <div id="direccion"> <span><b>Direccion:</b></span> ${direccion}</div>
                                            </section>
                                        </td>
                                        <td style="margin-right: 1px;">
                                        <section class="datEmisor" style="width: 100%">
                                            ${dataFactura.numeroReferencia? `
                                                <div id="comprobante"><b>Documento afectado</b></div>
                                                <div style="word-break: break-all;style="width: 30%; text-align:center""> ${dataFactura.numeroReferencia}</div>
                                            ` : `                                            
                                                <div id="comprobante"><b>${tipo_factura}</b></div>
                                                <div> ${dataFactura.consecutivo}</div>
                                            `}
                                        </section>
                                    </td>
                                    </tbody>
                                </table>
                            </div>
                        </header><br>
                        <div id="descricionComprobante">
                            <p><b>Fecha:</b> ${fecha}</p>
                            <p><b>Tipo pago:</b> ${medioPago}</p>
                            <p><b>Número Externo:</b> ${dataFactura.num_documento}</p>
                        </div>
                        <div id="descricionLineas">
                            <table id="lineas">
                                <thead style="border: 1px solid black;">
                                    <tr>
                                        <th id="cant" style="width: 5%;">Cantidad</th>
                                        <th id="cod" style="width: 10%;">Código</th>
                                        <th id="descr" style="width:25;">Descripción</th>
                                        <th id="desc" style="width:10;">Descuento</th>
                                        <th id="imp" style="width:15;">Impuesto</th>
                                        <th id="pre" style="width:15;">Precio</th>
                                        <th id="tot" style="width:20;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ordenes}
                                </tbody>
                            </table>
                        </div>
                        <div id="descricionComprobante">
                            <table style="width: 100%;">
                                <tbody>
                                    <tr>
                                        ${(dataFactura.codigomoneda === 'CRC')?
                                            `<td>
                                                <p style="width: 100%;">Total a pagar en USD: $${Number(totalDolares).toFixed(2)}</p>
                                            </td>`:''
                                        }
                                        <td style="margin-right: 1px;">
                                            <div id="totalColones" style="float: right; width: ${anchoTotales}%; float: rigth;">
                                                
                                                <p><b>Subtotal:</b> ${subTotal}</p>
                                                <p><b>IVA:</b> ${impuesto}</p>
                                                <p><b>Total Imp.Servicio:</b> ${otrosCargos}</p>
                                                <p><b>Total Descuentos:</b> ${descuento}</p>
                                                <p><b>Total ${simboloMoneda}:</b> ${total}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <footer>
                            <p>
                                <b>Notas:</b>
                                ${(dataFactura.notas)? dataFactura.notas : ''  }
                                ${(dataFactura.TipodocRef)?
                                    `
                                    <td>
                                        <p style="width: 100%;"><b>Tipo Cliente:</b> ${dataFactura.TipodocRef}</p>
                                        <p style="width: 100%;"><b>Orden:</b> ${dataFactura.NumeroRef}</p>
                                        <p style="width: 100%;"><b>Fecha:</b> ${dataFactura.FechaRef}</p>
                                        <p style="width: 100%;"><b>Razon:</b> ${dataFactura.RazonRef}</p>
                                    </td>`:''
                                }
                            </p>
                            <p id="clavenumerica" ><b>Clave:</b> ${dataFactura.clavenumerica}</p>
                            ${(dataFactura.notas_emisor)? `
                              <p class="notasEmisor"> 
                                <b> Notas del Emisor </b>
                                <p> ${dataFactura.notas_emisor}
                              </p>
                            ` : ''  }
                            <p id="autorizacion">Autorización mediante Resolución No. DGT-R-033-2019 del 27/06/2019 de la DGTD</p>
                        </footer> 
                    </body>
                    </html>`;
                    resolve(content);
                })
                .catch(err => {
                    console.log(err);
                    reject(err)
                })
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
        }
    });
}

exports.crearReporteConReceptor = (dataOrdenes, dataFactura) => {
    return new Promise((resolve, reject) => {

        const cliente = dataFactura.datosCliente;
        if (typeof dataFactura.consecutivo === "undefined" || JSON.stringify(dataOrdenes) === "{}" ||
            typeof dataFactura.numero_emisor === "undefined" || typeof cliente.numero_cliente === "undefined") {
            let error = new Error("informacion indefinida");
            reject(error)
        } else {
            console.log({dataFactura})
            const fechaSubstr = fecha().toString().substring(0,10) 
            tipoCambioController.obtenerTipoCambio(fechaSubstr).then(tipoCambioActual => {

                // totalTipoCambio =xml.DataSet['diffgr:diffgram']['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']._text;
                let totalTipoCambio = Number(tipoCambioActual[0].tipocambio).toFixed(2);
                listaOrdenes(dataOrdenes).then(data => {
                    console.log("Entró");
                    let medioPago = 'No especificado';
                    for(let medio of mediosPagoService){
                        if(medio.id == dataFactura.medio_pago) {
                            medioPago = medio.medio;
                        }   
                    }
                    //CAMBIO X SYN
                    if (dataFactura.condicion_venta=="01") {
                        medioPago ="CONTADO";
                        console.log("CONTADO");
                    } else {
                       medioPago ="CREDITO";   
                       console.log("CREDITO"); 
                    }                    
                    
                    let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let codigomoneda = dataFactura.codigomoneda;
                    let simboloMoneda = '';
                    let totalDolares = 0;
                    let anchoTotales = 0;
                    //totalTipoCambio=500;
                    if(codigomoneda === 'CRC'){
                        simboloMoneda = '¢'
                        totalDolares = total / totalTipoCambio;
                        anchoTotales = 100;
                    } else {
                        simboloMoneda = '$'
                        totalDolares = total * 1;
                        anchoTotales = 50;
                    }

                    let ordenes = data;
                    let impuesto = parseFloat(dataFactura.totalimpuesto).toFixed(2);
                    let descuento = parseFloat(dataFactura.totaldescuentos).toFixed(2);
                    let subTotal = parseFloat(dataFactura.totalventa).toFixed(2);
                    //let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let cedula = obtenerNumeros_Emisor_Receptor(dataFactura.numero_emisor);
                    let cedula_receptor = obtenerNumeros_Emisor_Receptor(cliente.numero_cliente);
                    //let totalDolares = total / totalTipoCambio;
                    //let direccion = typeof dataFactura.emisor_otras_senas === 'undefined' || dataFactura.emisor_otras_senas == null ? '': dataFactura.emisor_otras_senas; //CAMBIO SYN
                    let direccion = typeof dataFactura.emisor_otras_senas;
                    let otrosCargos = Number(dataFactura.TotalOtrosCargos).toFixed(2);
                    const fecha = dataFactura.fecha_factura;
                    let tipo_factura = '';
                    if(dataFactura.tipo_factura == '01' || dataFactura.tipo_factura == 'Factura Electrónica') {
                        tipo_factura='Factura Electrónica'
                    } else if(tipo_factura == '04' || dataFactura.tipo_factura =='Tiquete Electrónico') {
                        tipo_factura='Tiquete Electrónico'
                    } else if(tipo_factura == '03' || dataFactura.tipo_factura =='Nota de Crédito') {
                        tipo_factura=`Nota Crédito \n Electrónica`
                    }
                    
                    var content = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title></title>
                        <style>
                        body {
                            height: auto;   
                            align-items: center; 
                        }
                        header {
                            margin-top: 10px;
                            text-align: center;
                            font-size: 10px;
                        }
                        footer {
                            text-align: center;
                        }
                        #descricionComprobante, #descricionLineas,#totales {
                            margin: 0 auto;
                            border: 1px solid black;
                            border-radius: 5px;
                            width: 560px;
                            margin-bottom: 2px;
                        }
                        
                        #descricionComprobante p {
                            margin-left: 5px;
                        }
                
                        p {
                            font-size: 8px;
                        }
                
                        #lineas {
                            width: 100%;
                            text-align: center;
                        }
                
                        #lineas tr {
                            font-size: 8px;
                        }
                
                        #nombreCliente {
                            margin-left: 5px;
                        }
                
                        #totalDolares {
                            margin-left: 5px;
                            float: left;
                        }
                        .cajaLogo img {
                            width:150px;
                            height:80px;
                            object-fit:contain;
                            
                        }
                        .comprobante {
                            word-break: break-all
                        }

                        .notasEmisor {
                            text-align: center;
                        }
                        </style>
                    </head>
                    <body>
                        <header>
                        <div id="cabecera">
                            <table style="width: 100%">
                                <tbody>
                                ${dataFactura.numeroReferencia? `
                                    <div style="width: 100%; text-align:center;"> 
                                        <div><b>Nota Credito electrónico:</b> ${dataFactura.consecutivo}</div>
                                    </div>
                                `: ''}
                                    ${dataFactura.logo ? `
                                    <td>
                                        <section class="cajaLogo" style="width: 10%">
                                            <img src=${dataFactura.logo} alt="logo">
                                        </section>
                                    </td>    
                                    `
                                    : ''}
                                        <td style="margin-right: 1px;">
                                            <section class="datEmisor" style="width: 100%">
                                                <div id="emisor"><b>${dataFactura.emisor_nombre || dataFactura.emisor_nombrecomercial }</b></div>
                                                <div id="telefono"> <span><b>Tel:</b></span> ${dataFactura.emisor_telefono_numtelefono}</div>
                                                <div id="Identificación"> <span><b>Identificación:</b></span> ${cedula}</div>
                                                <div id="email"> <span><b>Correo:</b></span> ${dataFactura.emisor_correo}</div> 
                                                <div id="direccion"> <span><b>Direccion:</b></span> ${dataFactura.emisor_otras_senas}</div>
                                            </section>
                                        </td>
                                        <td style="margin-right: 1px;">
                                            ${dataFactura.numeroReferencia? `
                                                <div id="comprobante"><b>Documento afectado</b>
                                                    <p>${dataFactura.numeroReferencia}</p>
                                                </div>
                                            ` : `                                            
                                                <div id="comprobante"><b>${tipo_factura}</b></div>
                                                <div> ${dataFactura.consecutivo}</div>
                                            `}
                                    </td>
                                </tbody>
                            </table>
                        </div>
                        </header><br>
                        <div id="descricionComprobante">
                            <p><b>Fecha:</b> ${fecha}</p>
                            <p><b>Condicion venta:</b> ${medioPago} &nbsp;<span><b>Plazo:</b></span> ${dataFactura.plazo_credito}</p>
                            <p><b>Número Externo:</b> ${dataFactura.num_documento}</p>
                            <p id="nombreCliente"><span><b>Cliente:</b></span> ${cliente.cliente_nombre}&nbsp;<span><b>Identificación:</b></span> ${cliente.cedula_cliente}</p>
                        </div>
                        <div id="descricionLineas">
                            
                            <table id="lineas">
                                <thead style="border: 1px solid black;">
                                    <tr>
                                        <th id="cant" style="width: 5%;">Cantidad</th>
                                        <th id="cod" style="width: 10%;">Código</th>
                                        <th id="descr" style="width:25;">Descripción</th>
                                        <th id="desc" style="width:10;">Precio U</th>
                                        <th id="imp" style="width:15;">Impuesto</th>
                                        <th id="pre" style="width:15;">Descuento</th>
                                        <th id="tot" style="width:20;">Tot Linea</th>
                                    </tr>
                                </thead>
                                <tbody>
                                   ${ordenes}
                                </tbody>
                            </table>
                        </div>
                        <div id="descricionComprobante">
                            <table style="width: 100%;">
                                <tbody>
                                    <tr>
                                        ${(dataFactura.codigomoneda === 'CRC')?
                                            `<td>
                                                <p style="width: 100%;">Total a pagar en USD: $${Number(totalDolares).toFixed(2)}</p>
                                            </td>`:''
                                        }
                                       
                                        <td style="margin-right: 1px;">
                                            <div id="totalColones" style="float: right; width: ${anchoTotales}%; float: rigth;">
                                                <p><b>Subtotal:</b> ${subTotal}</p>    
                                                <p><b>Total IVA:</b> ${impuesto}</p>
                                                <p><b>Total Imp.Servicio:</b> ${otrosCargos}</p>
                                                <p><b>Total Descuentos:</b> ${descuento}</p>
                                                <p><b>Total ${simboloMoneda}:</b> ${total}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <footer>
                            ${(dataFactura.notas)?
                                `            
                                <p><b>Notas:</b>${dataFactura.notas}</p>
                                `:''
                            }    
                            ${(dataFactura.TipodocRef)?
                                `
                                <td>
                                    <p style="width: 100%;"><b>Tipo Cliente:</b> ${dataFactura.TipodocRef}</p>
                                    <p style="width: 100%;"><b>Orden:</b> ${dataFactura.NumeroRef}</p>
                                    <p style="width: 100%;"><b>Fecha:</b> ${dataFactura.FechaRef}</p>
                                    <p style="width: 100%;"><b>Razon:</b> ${dataFactura.RazonRef}</p>
                                </td>`:''
                            }
                            <p id="clavenumerica" ><b>Clave:</b> ${dataFactura.clavenumerica}</p>
                            ${(dataFactura.notas_emisor)? `
                              <p class="notasEmisor"> 
                                <b> Notas del Emisor </b>
                                <p> ${dataFactura.notas_emisor}
                              </p>
                            ` : ''  }
                            <p id="autorizacion">Autorización mediante Resolución No. DGT-R-033-2019 del 27/06/2019 de la DGTD</p>
                        </footer> 
                    </body>
                    </html>`;
                    resolve(content);
                })
                .catch(err => {
                    console.log(err);
                    reject(err)
                })
            })
            .catch(err => {
                console.log(err);
                reject(err)
            })
        }
    });
}


exports.crearReporteFacturaCompra = (dataOrdenes, dataFactura) => {
    console.log("ordenes desde reporte con receptor ", dataOrdenes)
    console.log("datafactura",dataFactura)
    console.log("fca")
    return new Promise((resolve, reject) => {

        const cliente = dataFactura.datosCliente;
        if (typeof dataFactura.consecutivo === "undefined" || JSON.stringify(dataOrdenes) === "{}" ||
            typeof dataFactura.numero_emisor === "undefined" || typeof cliente.numero_cliente === "undefined") {
            let error = new Error("informacion indefinida");
            reject(error)
        } else {

            facturaFunciones.obtenerTipoCambio().then(responseTipoCambio => {
                const datosTipoCambios = convert.xml2json(responseTipoCambio, {compact: true, spaces: 4});
                let totalTipoCambio = 0;
                let xml = JSON.parse(datosTipoCambios)
                if(typeof xml.DataSet === 'undefined' || xml.DataSet == null ){
                    totalTipoCambio = 570;
                } else{

                    totalTipoCambio =xml.DataSet['diffgr:diffgram']['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']._text;
                }

                let medioPago = 'No especificado';
                    for(let medio of mediosPagoService){
                        if(medio.id == dataFactura.medio_pago) {
                            medioPago = medio.medio;
                        }   
                    }

                totalTipoCambio =xml.DataSet['diffgr:diffgram']['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']._text;
                totalTipoCambio = Number(totalTipoCambio).toFixed(2);
                listaOrdenes(dataOrdenes).then(data => {
                    console.log("Entró");
                    let ordenes = data;
                    let impuesto = parseFloat(dataFactura.totalimpuesto).toFixed(2);
                    let descuento = parseFloat(dataFactura.totaldescuentos).toFixed(2);
                    let subTotal = parseFloat(dataFactura.totalventa).toFixed(2);
                    let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let cedula = obtenerNumeros_Emisor_Receptor(cliente.cedula_proveedor);
                    let totalDolares = total / totalTipoCambio;//proveedor arreglado 1
                    let direccion = !cliente.otras_senas || cliente.otras_senas == '' ? 'ND': cliente.otras_senas;
                    let otrosCargos = Number(dataFactura.TotalOtrosCargos).toFixed(2);
                    var content = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title></title>
                        <style>
                            body {
                                height: auto;   
                                align-items: center; 
                            }
                            header {
                                margin-top: 10px;
                                text-align: center;
                                font-size: 10px;
                            }
                            footer {
                                text-align: center;
                            }
                            #descricionComprobante, #descricionLineas,#totales {
                                margin: 0 auto;
                                border: 1px solid black;
                                border-radius: 5px;
                                width: 560px;
                                margin-bottom: 2px;
                            }
                            
                            #descricionComprobante p {
                                margin-left: 5px;
                            }
                    
                            p {
                                font-size: 8px;
                            }
                    
                            #lineas {
                                width: 100%;
                                text-align: center;
                            }
                    
                            #lineas tr {
                                font-size: 8px;
                            }
                    
                            #nombreCliente {
                                margin-left: 5px;
                            }
                    
                            #totalDolares {
                                margin-left: 5px;
                                float: left;
                            }
                    
                        </style>
                    </head>
                    <body>
                        <header>
                            <div id="emisor"><b>${cliente.proveedor_nombre || cliente.proveedor_nombre_comercial }</b></div>
                            <div id="telefono"> <span><b>Tel:</b></span> ${cliente.proveedor_telefono_numtelefono}</div>
                            <div id="Identificación"> <span><b>Identificación:</b></span> ${cedula}</div>
                            <div id="email"> <span><b>Correo:</b></span> ${cliente.proveedor_correo}</div> 
                            <div id="direccion"> <span><b>Direccion:</b></span> <br> ${direccion}</div>
                        </header><br>
                        <div id="descricionComprobante">
                            <p><b>Factura Compra Electrónica:</b> ${dataFactura.consecutivo}</p>
                            <p><b>Fecha:</b> ${dataFactura.fecha_factura.substring(0,10)}</p>
                            <p><b>Tipo pago:</b> ${medioPago}</p>
                            <p><b>Número Externo:</b> 2008596</p>
                        </div>
                        <div id="descricionLineas">
                            <p id="nombreCliente"><span><b>Cliente:</b></span> ${dataFactura.emisor_nombre}</p>
                            <table id="lineas">
                                <thead style="border: 1px solid black;">
                                    <tr>
                                        <th id="cant" style="width: 5%;">Cantidad</th>
                                        <th id="cod" style="width: 10%;">Código</th>
                                        <th id="descr" style="width:25;">Descripción</th>
                                        <th id="desc" style="width:10;">Descuento</th>
                                        <th id="imp" style="width:15;">Impuesto</th>
                                        <th id="pre" style="width:15;">Precio</th>
                                        <th id="tot" style="width:20;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                   ${ordenes}
                                </tbody>
                            </table>
                        </div>
                        <div id="descricionComprobante">
                            <table style="width: 100%;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <p style="width: 100%;">Total a pagar en USD: $${Number(totalDolares).toFixed(2)}</p>
                                        </td>
                                        <td style="margin-right: 1px;">
                                            <div id="totalColones" style="float: right; width: 100%; float: rigth;">
                                                <p><b>Total Descuentos:</b> ${descuento}</p>
                                                <p><b>Subtotal:</b> ${subTotal}</p>
                                                <p><b>Total IVA:</b> ${impuesto}</p>
                                                <p><b>Total Imp.Servicio:</b> ${otrosCargos}</p>
                                                <p><b>Total:</b> ${total}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <footer>
                            <p>
                                <b>Notas:</b>
                                ${dataFactura.notas ? dataFactura.notas: ''}
                            </p>                                                                                                                                        
                            <p id="clavenumerica" ><b>Clave:</b> ${dataFactura.clavenumerica}</p>
                            <p id="autorizacion">Autorización mediante Resolución No. DGT-R-033-2019 del 27/06/2019 de la DGTD</p>
                        </footer> 
                    </body>
                    </html>`;
                    resolve(content);
                })
            }) .catch(err => reject('No se pudo obtener el tipo de cambio'));
        }

    });
}
//----------------------------------REPORTE POS SEGUNDO DISEÑO ----------------------------------------------------

exports.crearReportePos2 = (dataFactura, lineas) => {

    return new Promise((resolve,reject) => {
        if(typeof lineas === 'undefined' || typeof dataFactura ===  'undefined'){
            reject('Informacion indefinida');
        }   else  {

            console.log({dataFactura})
            let reporteHTML ='';
            let emisor = '';
            let clienteNombre = '', telefonoCliente = '', direccionCliente = '';
            let totalDolares = 0;
            if(!dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }
            if(dataFactura.emisor_nombre && !dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombre;
            }
            if(dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }

            if(dataFactura.datosReceptor){
                clienteNombre = dataFactura.datosReceptor.nombre,
                telefonoCliente = dataFactura.datosReceptor.telefono ? dataFactura.datosReceptor.telefono : '' ,
                direccionCliente = dataFactura.datosReceptor.direccion ? dataFactura.datosReceptor.direccion : '';
            } else {
                clienteNombre = 'Cliente contado',
                telefonoCliente = '-' ,
                direccionCliente = '-';
            }

            totalDolares = Number(dataFactura.total) / Number(dataFactura.tipocambio);

            listarsOrdenesPos2(lineas).then(ordenes => {
                reporteHTML += `
                        <style>
                        #invoice-POS{
                            box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5);
                            height: 100%;
                            background: #FFF;
                            margin: 0px;
                            padding: 0px;
                            
                          ::selection {background: #f31544; color: #FFF;}
                          ::moz-selection {background: #f31544; color: #FFF;}
                          h1{
                            font-size: 1.5em;
                            color: #222;
                          }
                          h2{font-size: .9em;}
                          h3{
                            font-size: 1.2em;
                            font-weight: 300;
                            line-height: 2em;
                          }
                          p{
                            font-size: .7em;
                            color: #666;
                            line-height: 1.2em;
                          }
                           
                          #top, #mid,#bot{ /* Targets all id with 'col-' */
                            border-bottom: 1px solid #EEE;
                          }
                          
                          #top{min-height: 100px;}
                          #mid{min-height: 80px;} 
                          #bot{ min-height: 50px;}
                          
                          #top .logo{
                            //float: left;
                            height: 60px;
                            width: 60px;
                            ${dataFactura.logo ? `background: url(${dataFactura.logo}) no-repeat;`: ''}
                            background-size: 60px 60px;
                          }
                          .clientlogo{
                            float: left;
                              height: 60px;
                              width: 60px;
                              background-size: 60px 60px;
                            border-radius: 50px;
                          }
                          .info{
                            display: block;
                            //float:left;
                            margin-left: 0;
                          }
                          .title{
                            float: right;
                          }
                          .title p{text-align: right;} 
                          table{
                            width: 100%;
                            border-collapse: collapse;
                          }
                          td{
                            //padding: 5px 0 5px 15px;
                            //border: 1px solid #EEE
                          }
                          .tabletitle{
                            //padding: 5px;
                            font-size: .5em;
                            background: #EEE;
                          }
                          .service{border-bottom: 1px solid #EEE;}
                          .item{width: 24mm;}
                          .itemtext{font-size: 5px; width: 20px; word-break: break-all}
                          
                          #legalcopy{
                            margin-top: 5mm;
                          }
                          
                            
                            
                          }
                          .cabeceras {
                              font-size: 15px;
                          }
                        hr {
                            border-bottom: 1px dosed black;
                        }
                        </style>
                        <div id="invoice-POS">
                            
                        <center id="top">
                            <div class="logo"></div>
                            <div class="info"> 
                            <h2>${emisor}</h2>
                            </div><!--End Info-->
                        </center><!--End InvoiceTop-->
                        <div id="mid">
                            <p class="cabeceras"> 
                                Tiquete : ${dataFactura.num_documento}</br>
                            </p>
                        </div>
                        <hr>
                        <div id="mid">
                            <div class="info">
                            <h4>Cliente</h4>
                            <p class="cabeceras"> 
                                Dirección : ${direccionCliente}</br>
                                Nombre   : ${clienteNombre}</br>
                                Teléfono   : ${telefonoCliente}</br>
                            </p>
                            </div>
                        </div><!--End Invoice Mid-->
                        <hr>
                        <div id="bot">

                                <div id="table">
                                    <table>
                                    ${ordenes}
                                    </table>
                                </div><!--End Table-->

                                <div id="legalcopy">
                                    <p class="legal"><strong>Gracias por su compra!</strong>
                                    </p>
                                </div>

                            </div><!--End InvoiceBot-->
                        </div><!--End Invoice-->

                `;
                resolve(reporteHTML);
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        }
    })
}
//-----------------------------------------------------------------------------------------------------------------

exports.crearReportePos = (dataFactura, lineas) => {

    return new Promise((resolve,reject) => {
        if(typeof lineas === 'undefined' || typeof dataFactura ===  'undefined'){
            reject('Informacion indefinida');
        }   else  {
            let reporteHTML ='';
            let emisor = '';
            let direccionEmisor = '';
            let resolucion =  dataFactura.numeroresolucion  +' del '+ dataFactura.fecharesolucion;
            let clienteNombre = '', telefonoCliente = '', direccionCliente = '';
            let totalDolares = 0, telefonoEmisor = '-';
            let emisorCorreo = '';
            if(!dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }
            if(dataFactura.emisor_nombre && !dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombre;
            }
            if(dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }

            if(dataFactura.emisor_correo && dataFactura.emisor_correo.length > 0) {
                emisorCorreo = dataFactura.emisor_correo;
            }

            if(dataFactura.datosReceptor){
                clienteNombre = dataFactura.datosReceptor.nombre,
                telefonoCliente = !dataFactura.datosReceptor.telefono || dataFactura.datosReceptor.telefono == '' ? '-':  dataFactura.datosReceptor.telefono ,
                direccionCliente = !dataFactura.datosReceptor.direccion || dataFactura.datosReceptor.direccion.length == '' ? '': dataFactura.datosReceptor.direccion;
            } else {
                clienteNombre = 'Cliente contado',
                telefonoCliente = '-' ,
                direccionCliente = '-';
            }

            if(dataFactura.emisor_telefono_numtelefono && dataFactura.emisor_telefono_numtelefono.length > 0) {
                telefonoEmisor = dataFactura.emisor_telefono_numtelefono;
            }

            if(!dataFactura.senas || dataFactura.senas == ''){
                direccionEmisor = 'Sin dirección registrada';
            } else {
                direccionEmisor = dataFactura.senas;
            }

            totalDolares = Number(dataFactura.total) / Number(dataFactura.tipocambio);

            listarsOrdenesPos(lineas).then(ordenes => {
                reporteHTML += `
                <!DOCTYPE html>
                <html>
                    <head>
                    <style>
                    html{
                        margin: 0px;
                        padding: 0px;
                    }
        
                    body{
                        margin: 0px;
                        padding: 0px;
                    }
                        * {
                font-size: 12px;
                font-family: 'Times New Roman';
            }
        
            td,
            th,
            tr,
            table {
                border-top: 1px solid black;
                border-collapse: collapse;
            }
        
            td.producto,
            th.producto {
                width: 37px;
                max-width: 37px;
                word-break: break-all;
                
            }
        
            td.cantidad,
            th.cantidad {
                width: 37px;
                max-width: 37px;
                word-break: break-all;
                
            }
        
            td.precio,
            th.precio {
                width: 36px;
                max-width: 36px;
                word-break: break-all;
                
            }

            td.total,
            th.total {
                width: 36px;
                max-width: 36px;
                word-break: break-all;
                
            }
        
            .centrado {
                text-align: center;
                align-content: center;
                margin-left: 40px;
            }
        
            .ticket {
                width: 148px;
                max-width: 148px;
                margin-left: 27px;
            }
        
            img {
                max-width: inherit;
                width: inherit;
            }
        
            .foot {
                font-size: 10px;
                text-align: center
            }
        
            .cabecera {
                margin: 0 auto;
            }
            b {
                font-size: 10px;
            }
        
            #parrafo {
               
              } 
              #titulo{
                
              }
              .encebezados {
                font-size: 20px;
              }
        
              #direccionEncabezado {
                word-break: break-all;
                font-size: 8px;
                margin-top: -7px;
              }
              #cedulaEncabezado {
                word-break: break-all;
                font-size: 13px;
                margin-top: -7px;
              }
        
              #resolucionEncabezado {
                word-break: break-all;
                font-size: 9px;
                margin-top: -10px;
              }

              #telefonoEncabezado {
                word-break: break-all;
                font-size: 11px;
                margin-top: -7px;
              }

              #correoEncabezado {
                word-break: break-all;
                font-size: 10px;
                margin-top: -7px;
            }

            .totales {
                margin-top: -7px;
            }
            #claveEncabezado,#consecutivoEncabezado  {
                word-break: break-all;
                font-size: 8px;
                margin-top: -7px;
            }

            #notas{
                word-break: break-all;
                font-size: 5px;
                margin-top: 5px;
              }

                    </style>
                    </head>
                    <body>
                        <div class="ticket">
                        
                                <p class="centrado cabecera" style="width: 100%;" id="parrafo">
                                <br>
                                <center>
                                  <h1 id="titulo" style="font-size: 12px;word-break: break-all;margin-bottom: -5px;font-weight: bold">
                                  ${emisor}
                                  </h1>
                                  <p style="margin-top: 5px;" id="direccionEncabezado"> ${direccionEmisor}
                                  <p id="cedulaEncabezado"> <b>RUC: ${dataFactura.cedula}</b>
                                  <p id="telefonoEncabezado"> <b>Teléfono:</b> ${telefonoEmisor}
                                  <p id="correoEncabezado"> <b>${emisorCorreo}</b> 
                                  <p id="claveEncabezado"> <b>Clavenumérica:</b> ${dataFactura.clavenumerica}
                                  <p id="consecutivoEncabezado"> <b>Consecutivo:</b> ${dataFactura.consecutivo} 
                                 
                                </center>
                              </p>
                              <p class="centrado cabecera" style="width: 100%;margin-top: 10px;" id="parrafo">
                                <h4 style="font-size: 12px;">Datos Cliente</h4>
                                <div style='margin-top: -3px;'
                                    <b>Fecha:</b> &nbsp;&nbsp;${dataFactura.fecha}
                                    <br><b>Cliente:</b> &nbsp;&nbsp;${clienteNombre}
                                    ${
                                        dataFactura.datosReceptor ?  `<br><b>Dirección: </b> &nbsp;&nbsp;${direccionCliente}
                                        <br><b>Teléfono</b> &nbsp;&nbsp;${telefonoCliente}` : ''
                                    }
                                    ${(dataFactura.datosReceptor) ? `<br><b>Nro Factura:</b> &nbsp;&nbsp;${dataFactura.num_documento}`
                                    : `<br><b>Nro Tiquete:</b> &nbsp;&nbsp;${dataFactura.num_documento}`
                                    }
                                    
                                </div>
                              </p>



                            <table>
                                <thead>
                                    <tr>
                                        <th style="font-size: 8px;" class="cantidad">Cant</th>
                                        <th style="font-size: 8px;" class="producto">Prod</th>
                                        <th style="font-size: 8px;" class="precio">Precio</th>
                                        <th style="font-size: 8px;" class="total">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ordenes}
                                </tbody>
                            </table>
                            <p class="centrado cabecera" style="text-align: right">
                                <p><b>Subtotal:</b> ${Number(dataFactura.totalVentaNeta).toFixed(2)}
                                <p class="totales"><b>Descuento:</b> ${Number(dataFactura.descuentos).toFixed(2)}
                                <p class="totales"><b>IVA:</b> ${Number(dataFactura.impuestos).toFixed(2)}
                                <p class="totales"><b>Total:</b> ${Number(dataFactura.total).toFixed(2)}
                            </p>
                            <p class="foot">¡GRACIAS POR SU COMPRA!</p>
                            <br>
                            <p id="resolucionEncabezado"> ${resolucion}</p>
                            ${dataFactura.notas ? `
                                <p id="notas"> Notas: ${dataFactura.notas}</p>
                            
                            `: ''}
                        </div>
                    </body>
                </html>
                `;

                console.log(reporteHTML);
                resolve(reporteHTML);
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        }
    })
}

exports.crearReporteProformaTipoFactura = (dataOrdenes, dataFactura) => {
    return new Promise((resolve, reject) => {
        
        if (typeof dataFactura.consecutivo === "undefined" || JSON.stringify(dataOrdenes) === "{}" ||
            typeof dataFactura.numero_emisor === "undefined") {
            let error = new Error("informacion indefinida");
            reject(error)

        } else {
            const fechaSubstr = fecha().toString().substring(0,10) 
            tipoCambioController.obtenerTipoCambio(fechaSubstr).then(responseTipoCambioActual => {

                let totalTipoCambio = Number(responseTipoCambioActual[0].tipocambio).toFixed(2);

                listaOrdenes(dataOrdenes).then(data => {

                    let ordenes = data;
                    let codigomoneda = dataFactura.codigomoneda;
                    let impuesto = parseFloat(dataFactura.totalimpuesto).toFixed(2);
                    let descuento = parseFloat(dataFactura.totaldescuentos).toFixed(2);
                    let subTotal = parseFloat(dataFactura.totalventa).toFixed(2);
                    let total = parseFloat(dataFactura.totalcomprobante).toFixed(2);
                    let cedula = obtenerNumeros_Emisor_Receptor(dataFactura.numero_emisor);
                    let totalDolares = total / totalTipoCambio;
                    let direccion = typeof dataFactura.emisor_otras_senas === 'undefined' || dataFactura.emisor_otras_senas == null ? '': dataFactura.emisor_otras_senas;
                    let otrosCargos = Number(dataFactura.TotalOtrosCargos).toFixed(2);
                    let cliente = dataFactura.datosCliente;
                    let simboloMoneda = '';
                    if(codigomoneda === 'CRC'){
                        simboloMoneda = '¢'
                    } else {
                        simboloMoneda = '$'
                    }
                    //const numero_cliente = obtenerNumeros_Emisor_Receptor(cliente.cedula_cliente);
                    const content = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title></title>
                        <style>
                            body {
                                height: auto;   
                                align-items: center; 
                            }
                            header {
                                margin-top: 10px;
                                text-align: center;
                                font-size: 10px;
                            }
                            footer {
                                text-align: center;
                            }
                            #descricionComprobante, #descricionLineas,#totales {
                                margin: 0 auto;
                                border: 1px solid black;
                                border-radius: 5px;
                                width: 560px;
                                margin-bottom: 2px;
                            }
                            
                            #descricionComprobante p {
                                margin-left: 5px;
                            }
                    
                            p {
                                font-size: 8px;
                            }
                    
                            #lineas {
                                width: 100%;
                                text-align: center;
                            }
                    
                            #lineas tr {
                                font-size: 8px;
                            }
                    
                            #nombreCliente {
                                margin-left: 5px;
                            }
                    
                            #totalDolares {
                                margin-left: 5px;
                                float: left;
                            }
                            .cajaLogo img {
                                width:80px;
                                height:80px;
                                object-fit:contain;
                                
                            }

                        </style>
                    </head>
                    <body>
                        <header>
                        <div id="cabecera">
                        <table style="width: 100%">
                            <tbody>
                                ${dataFactura.logo ? `
                                <td>
                                    <section class="cajaLogo" style="width: 100%">
                                        <img src=${dataFactura.logo} alt="logo">
                                    </section>
                                </td>    
                                `
                                : ''}
                                    <td style="margin-right: 1px;">
                                        <section class="datEmisor" style="width: 100%">
                                            <div id="emisor"><b>${dataFactura.emisor_nombre || dataFactura.emisor_nombrecomercial }</b></div>
                                            <div id="telefono"> <span><b>Tel:</b></span> ${dataFactura.emisor_telefono_numtelefono}</div>
                                            <div id="Identificación"> <span><b>Identificación:</b></span> ${cedula}</div>
                                            <div id="email"> <span><b>Correo:</b></span> ${dataFactura.emisor_correo}</div> 
                                            <div id="direccion"> <span><b>Direccion:</b></span> ${direccion}</div>
                                        </section>
                                    </td>
                                    <td style="margin-right: 1px;">
                                    <section class="datEmisor" style="width: 100%">
                                        <div id="comprobante"><b>Número Proforma</b></div>
                                        <div> ${dataFactura.num_documento}</div>
                                    </section>
                                </td>
                            </tbody>
                        </table>
                    </div>
                        </header><br>
                        <div id="descricionComprobante">
                            <p><b>Fecha:</b> ${dataFactura.fecha_factura.substring(0,10)}</p>
                            <p><b>Tipo pago:</b> No especificado</p>
                        </div>
                        <div id="descricionLineas">
                        
                        ${(cliente) ?
                                `<p id="nombreCliente"><span><b>Cliente:</b></span>${cliente.cliente_nombre}<span>&nbsp;<b>Identificación:</b></span> ${cliente.cedula_cliente}</p>`:
                                ''
                            }
                                        
                            <table id="lineas">
                                <thead style="border: 1px solid black;">
                                    <tr>
                                        <th id="cant" style="width: 5%;">Cantidad</th>
                                        <th id="cod" style="width: 10%;">Código</th>
                                        <th id="descr" style="width:25;">Descripción</th>
                                        <th id="desc" style="width:10;">Precio</th>
                                        <th id="imp" style="width:15;">Impuesto</th>
                                        <th id="pre" style="width:15;">Descuento</th>
                                        <th id="tot" style="width:20;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ordenes}
                                </tbody>
                            </table>
                        </div>
                        <div id="descricionComprobante">
                            <table style="width: 100%;">
                                <tbody>
                                    <tr>
                                        ${(dataFactura.codigomoneda === 'CRC')?
                                            `<td>
                                                <p style="width: 100%;">Total a pagar en USD: $${Number(totalDolares).toFixed(2)}</p>
                                            </td>`:''
                                        }
                                        <td style="margin-right: 1px;">
                                            <div id="totalColones" style="float: right; width: 100%; float: rigth;">
                                                <p><b>Total Descuentos:</b> ${descuento}</p>
                                                <p><b>Subtotal:</b> ${subTotal}</p>
                                                <p><b>IVA:</b> ${impuesto}</p>
                                                <p><b>Total Imp.Servicio:</b> ${otrosCargos}</p>
                                                <p><b>Total ${simboloMoneda}:</b> ${total}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <footer>
                                <p>
                                    <b>Notas:</b>
                                    ${dataFactura.notas}
                                    ${(dataFactura.TipodocRef)?
                                        `
                                        <td>
                                            <p style="width: 100%;"><b>Tipo Cliente:</b> ${dataFactura.TipodocRef}</p>
                                            <p style="width: 100%;"><b>Orden:</b> ${dataFactura.NumeroRef}</p>
                                            <p style="width: 100%;"><b>Fecha:</b> ${dataFactura.FechaRef}</p>
                                            <p style="width: 100%;"><b>Razon:</b> ${dataFactura.RazonRef}</p>
                                        </td>`:''
                                    }
                                </p>
                                <p id="autorizacion"><b>Documento válido por 15 días</b></p>
                        </footer>
                    </body>
                    </html>`;

                    console.log(content);
                    resolve(content);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
        }
    });
}

const listarsOrdenesPos = (ordenes) => {
    
    return new Promise((resolve,reject) => {

        if(typeof ordenes === 'undefined'){
            reject(new Error('Información indefinida'));
        } else {
            let lineasPOS = '';

            for(let linea of ordenes){

                lineasPOS += ` 
                <tr>
                    <td style="font-size: 8px;">${Number(linea.cantidad).toFixed(2)}</td>
                    <td style="font-size: 8px;">${linea.descripcion}</td>
                    <td style="font-size: 8px;">${Number(linea.precio_linea).toFixed(2)}</td>
                    <td style="font-size: 8px;">${Number(linea.montoitotallinea).toFixed(2)}</td>
                </tr>`
            }

            resolve(lineasPOS);
        }
    })

}

const listarsOrdenesPos2 = (ordenes) => {
    
    return new Promise((resolve,reject) => {

        if(typeof ordenes === 'undefined'){
            reject(new Error('Información indefinida'));
        } else {
            let lineasPOS = '';

            for(let linea of ordenes){

                lineasPOS += `  
                <tr class="service">
                    <td class="tableitem"><p class="itemtext">${linea.descripcion}</p></td>
                    <td class="tableitem"><p class="itemtext">${Number(linea.cantidad).toFixed(2)}</p></td>
                    <td class="tableitem"><p class="itemtext">$${Number(linea.montototal).toFixed(2)}</p></td>
                </tr>`;
            }

            resolve(lineasPOS);
        }
    })

}

const listaOrdenes = (dataOrdenes) => {
    console.log("lista de ordenes desde lista ordenes", dataOrdenes);
    return new Promise((resolve, reject) => {

        if (JSON.stringify(dataOrdenes) === "{}") {

            let error = new Error("Informacion indefinida");
            reject(error);
        } else {
            let content = "";

            for (let i in dataOrdenes) {
                
                let precio = parseFloat(dataOrdenes[i].precio_linea).toFixed(2);
                let descuento = parseFloat(dataOrdenes[i].montodescuento).toFixed(2);
                let total = parseFloat(dataOrdenes[i].montoitotallinea).toFixed(2);
                let impuesto = parseFloat(dataOrdenes[i].monto).toFixed(2);
                let cantidad = parseFloat(dataOrdenes[i].cantidad).toFixed(2);
                let descripcion = dataOrdenes[i].descripcioDetalle;
                let codigoBarra = dataOrdenes[i].codigobarra_producto;
                content += ` <tr>
                                <td>
                                    ${cantidad}
                                </td>
                                <td>
                                    ${codigoBarra}
                                </td>
                                <td>
                                    ${descripcion}
                                </td>
                                <td>
                                    ${precio}
                                </td>
                                <td>
                                    ${impuesto}
                                </td>
                                <td>
                                    ${descuento}
                                </td>
                                <td>
                                    ${total}
                                </td>
                            </tr>`;
            }
            resolve(content);
        }
    })
}
const obtenerNumeros_Emisor_Receptor = function(numero) {
    let contador = 0;

    for (let i = 0; i < numero.length; i++) {
        if (i < 3) {
            if (numero[i] == "0") {
                contador++;
            }
        }
    }
    numero = numero.substring(contador, numero.length);
    return numero;
}
//"height": "10.5in",        // allowed units: mm, cm, in, px


exports.generarPDFDeComprobante = (content, ruta,altura) => {

    return new Promise((resolve, reject) => {

        const base = altura ? (225 + Number(altura)).toString() + 'mm' : '225mm'
        const options = {
            "width": '219mm',
            "height": base,
            "timeout": "100000"
        };
        pdf.create(content,options).toFile(ruta, function(err, res) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(res);
                resolve(true);
            }
        });
    })
}

exports.generarPDFDeComprobantePOS = (content, ruta,altura) => {
    
    return new Promise((resolve, reject) => {
        const base = 215 + altura;
        const options = {
            "width": "75mm",
            "height": base+"mm",
            "timeout": "100000"
        };
        pdf.create(content,options).toFile(ruta, function(err, res) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(res);
                resolve(true);
            }
        });
    })
}

exports.generarReporteEstadoCuenta = (obj) => {
    
    return new Promise((resolve,reject) => {
        if(typeof obj === 'undefined') return reject('Error al generar estado de cuenta');
        else {
            try {
                            //this.saldoDisponibleNumber = Number(this.objDataCliente.limi_credit) - Number(this.objDataCliente.saldo);
            const enplazo = (Number(!obj.saldo?0:obj.saldo) - (Number(!obj.vence1?0:obj.vence1) + Number(!obj.vence2?0:obj.vence2) + Number(!obj.vence3?0:obj.vence3) + Number(!obj.vence4?0:obj.vence4) + Number(!obj.vence5?0:obj.vence5))).toFixed(2);
            
            const fechaSubstr = fecha().toString().substring(0,10)  
            const saldoDisponible = (!obj.limi_credi?0 :Number(obj.limi_credi)) - (!obj.saldo? 0 :Number(obj.saldo));
            const content = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title></title>
                <style>
                    body {
                        height: auto;   
                        align-items: center; 
                    }
                    header {
                        margin-top: 10px;
                        text-align: center;
                        font-size: 10px;
                    }
                    footer {
                        text-align: center;
                    }
                    #descricionComprobante, #descricionLineas,#totales {
                        margin: 0 auto;
                        border: 1px solid black;
                        border-radius: 5px;
                        width: 560px;
                        margin-bottom: 2px;
                    }
                    
                    #descricionComprobante p {
                        margin-left: 5px;
                    }
            
                    p {
                        font-size: 8px;
                    }
            
                    #lineas {
                        width: 100%;
                        text-align: center;
                    }
            
                    #lineas tr {
                        font-size: 8px;
                    }
            
                    #nombreCliente {
                        margin-left: 5px;
                    }
            
                    #totalDolares {
                        margin-left: 5px;
                        float: left;
                    }
                    .cajaLogo img {
                        width:80px;
                        height:80px;
                        object-fit:contain;
                        
                    }

                </style>
            </head>
            <body>
                <header>
                <div id="cabecera">
                <table style="font-size: 6px;"width: 100%">
                    <tbody>
                        
                            ${obj.logo? `
                            <td>
                                <section class="cajaLogo" style="width: 100%">
                                    <img src=${obj.logo} alt="logo">
                                </section>
                            </td>    
                            `: ''}      
                            <td style="margin-right: 1px;">
                                <section class="datEmisor" style="width: 100%">
                                    <div id="emisor"><b>${obj.emisor_nombre || obj.emisor_nombrecomercial} </b></div>
                                    <div id="telefono"> <span><b>Tel:</b></span> ${obj.emisor_telefono_numtelefono}</div>
                                    <div id="email"> <span><b>Correo:</b></span> ${obj.emisor_correo}</div> 
                                    <div id="direccion"> <span><b>Direccion:</b></span>${obj.emisor_otras_senas || ''} </div>
                                </section>
                            </td>
                            <td style="margin-right: 1px;">
                            <section class="datEmisor" style="width: 100%">
                                <div id="comprobante"><b>Fecha:</b> ${fechaSubstr} </div>
                            </section>
                        </td>
                    </tbody>
                </table>
            </div>
                </header><br>
                <div id="descricionComprobante">
                    <center><h5>ESTADO DE CUENTA</h5></center>
                </div>
                <div id="descricionComprobante">
                    <p id="nombreCliente"><span><b>Cliente:</b></span>${obj.cliente_nombre} <span>&nbsp;<b>Identificación:</b></span> ${obj.cedula_cliente} </p>
                </div>
                <div id="descricionLineas">     
                        <p id="nombreCliente"><span><b>Saldo Disponible:</b> ${saldoDisponible == 0? '0.00':saldoDisponible} </p>
                    <hr>
                    <center><p id="nombreCliente"><span><b>Saldos Por Antiguedad</b></p></center>           
                    <table id="lineas">
                        <thead style="border: 1px solid black;">
                            <tr>
                                <th id="cant" style="width: 15%;">En plazo</th>
                                <th id="cod" style="width: 15%;">15</th>
                                <th id="descr" style="width:15;">30</th>
                                <th id="desc" style="width:15;">45</th>
                                <th id="imp" style="width:15;">60</th>
                                <th id="pre" style="width:10;">90 o más</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    ${enplazo == 0? '0.00': enplazo }
                                </td>
                                <td>
                                    ${Number(!obj.vence1 || obj.vence1 == 0?'0.00':obj.vence1)}
                                </td>
                                <td>
                                    ${Number(!obj.vence2 || obj.vence2 == 0?'0.00':obj.vence2)}
                                </td>
                                <td>
                                    ${Number(!obj.vence3 || obj.vence3 == 0?'0.00':obj.vence3)}
                                </td>
                                <td>
                                    ${Number(!obj.vence4 || obj.vence4 == 0?'0.00':obj.vence4)}
                                </td>
                                <td>
                                    ${Number(!obj.vence5 || obj.vence5 == 0?'0.00':obj.vence5)}
                                </td>
                            </tr> 
                        </tbody>
                    </table>
                </div>
            </body>
            </html>`;

                    console.log(content);
                resolve(content);
            } catch (error) {
                console.log(error)
                reject(error)
            }
        }
    })
}
/*

    exports.crearReportePos = (dataFactura, lineas) => {

    return new Promise((resolve,reject) => {
        if(typeof lineas === 'undefined' || typeof dataFactura ===  'undefined'){
            reject('Informacion indefinida');
        }   else  {
            let reporteHTML ='';
            let emisor = '';
            let clienteNombre = '', telefonoCliente = '', direccionCliente = '';
            let totalDolares = 0;
            if(!dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }
            if(dataFactura.emisor_nombre && !dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombre;
            }
            if(dataFactura.emisor_nombre && dataFactura.emisor_nombrecomercial){
                emisor = dataFactura.emisor_nombrecomercial;
            }

            if(dataFactura.datosReceptor){
                clienteNombre = dataFactura.datosReceptor.nombre,
                telefonoCliente = dataFactura.datosReceptor.telefono ? dataFactura.datosReceptor.telefono : '' ,
                direccionCliente = dataFactura.datosReceptor.direccion ? dataFactura.datosReceptor.direccion : '';
            }

            totalDolares = Number(dataFactura.total) / Number(dataFactura.tipocambio);

            listarsOrdenesPos(lineas).then(ordenes => {
                reporteHTML += `
                
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title></title>
                    <style>
                        html : {
                            padding: 0px;
                            margin: 0px;
                        }
                        body {
                            height: auto;   
                            align-items: center; 
                            padding: 0px;
                            margin: 0px;
                        }
                        header {
                            margin-top: 10px;
                            text-align: center;
                            font-size: 10px;
                        }
                        footer {
                            text-align: center;
                        }
                        #descricionComprobante, #descricionLineas,#totales {
                            margin: 0 auto;
                            
                
                            width: 280px;
                            margin-bottom: 2px;
                        }
                        
                        #descricionComprobante p {
                            margin-left: 5px;
                        }
                
                        p {
                            font-size: 8px;
                        }
                
                        #lineas {
                            width: 100%;
                            text-align: center;
                        }
                
                        #lineas tr {
                            font-size: 8px;
                        }
                
                        #nombreCliente {
                            margin-left: 5px;
                        }
                
                        #totalDolares {
                            margin-left: 5px;
                            float: left;
                        }

                        img {
                                width:50px;
                                height:50px;
                                object-fit:contain;
                                border-radius:100%;
                            }
                
                        hr{
                            border-style: solid;
                            font-size: 1px;
                        }
                        @media print {body{ width: 8.5in; height: 11in; } }

                    </style>
                </head>
                <body>
                    <header>
                        <div id="emisor"><b>${emisor}</b></div>
                    </header>
                    <br>
                    <div id="descricionComprobante">
                        <hr>
                        <p><b>Fecha:</b>${dataFactura.fecha}</p>
                        <p><b>Cliente:</b> ${clienteNombre}</p>
                        <p><b>Direccion:</b> ${direccionCliente}</p>
                        <div style="width: 100%; justify-content: center;">
                            <p><b>Tiquete</b>${dataFactura.consecutivo}</p>
                        </div>
                    </div>
                    <div id="descricionLineas">
                
                        <hr>
                        <table id="lineas">
                            <thead>
                                <tr>
                                    <th id="cant" style="width: 5%;">Cantidad</th>
                                    <th id="descr" style="width:25;">Descripción</th>
                                    <th id="imp" style="width:15;">Impuesto</th>
                                    <th id="pre" style="width:15;">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ordenes}
                            </tbody>
                        </table>
                
                    </div>
                 
                    <div id="descricionComprobante">
                        <hr>
                        <table style="width: 100%;">
                            <tbody>
                                <tr>
                                    <td>
                                        <p style="width: 100%;">Total a pagar en USD: $${totalDolares.toFixed(2)}</p>
                                    </td>
                                    <td style="margin-right: 1px;">
                                        <div id="totalColones" style="float: right; width: 100%; float: rigth;">
                                            <p><b>Total Descuentos:</b> ${Number(dataFactura.descuentos).toFixed(2)}</p>
                                            <p><b>Subtotal:</b> ${Number(dataFactura.totalVenta).toFixed(2)}</p>
                                            <p><b>IVA:</b> ${Number(dataFactura.impuestos).toFixed(2)}</p>
                                            <p><b>Total:</b> ${Number(dataFactura.total).toFixed(2)}</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <hr>
                    </div>
                    <footer>
                        <p id="autorizacion">Gracias por su compra</p>
                    </footer> 
                </body>
                </html>
                `;

                resolve(reporteHTML);
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        }
    })

}

*/