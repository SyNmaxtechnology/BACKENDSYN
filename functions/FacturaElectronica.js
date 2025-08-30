//METODOS PARA FACTURACION ELECTRONICA
//SE DEBEN CREAR LOS DOCUMENTOS XML, CREAR UNA FUNCION PARA FIRMARLOS Y LUEGO SE ENVIAN A HACIENDA
//COMENTARIO DE PRUEBA
const Signer = require('haciendacostarica-signer');
const path = require("path");
const facturaFunciones = require("../functions/Factura");
const base64 = require("file-base64");
const axios = require("axios");
const qs = require('qs');
const Xml = require("../functions/Xml");
const Factura = require("../models/Factura");
const Entrada = require("../models/Entrada");
const tipoCambioController = require("../controllers/TipoCambioController");
//axios.defaults.timeout = 60000;
const crearXML = (obj, ordenes, tipoComprobante, llave, clave, idfactura) => {
    return new Promise((resolve, reject) => {
        console.log("llave ", llave);
        console.log("clave ", clave);
        console.log("crear XML");
        console.log("tipoComprobante",tipoComprobante);
        //08A es factura compra anulacion
        if (typeof obj === 'undefined')
           return reject("No se pudo obtener la informacion de la factura");
        if (tipoComprobante == '01')
            genXMLFactura(obj, ordenes, llave, clave, idfactura, tipoComprobante).then(dataFactura => {
                resolve(dataFactura)
            }).catch(err => reject(err));
        if (tipoComprobante == '04')
            genXMLTiquete(obj, ordenes, llave, clave, idfactura, tipoComprobante).then(dataTiquete => {
                resolve(dataTiquete)
            }).catch(err => reject(err));
        if (tipoComprobante == '03')
            genNotaCredito(obj, ordenes, llave, clave, idfactura, tipoComprobante).then(dataNotaCredito => {
                resolve(dataNotaCredito)
            }).catch(err => reject(err));
        if(tipoComprobante == '05') // factura de recepcion
            genMensajeRecepcionXML(obj, llave, clave, idfactura, tipoComprobante).then(dataMensajeRecepcion => {
                resolve(dataMensajeRecepcion)
            }).catch(err => reject(err));
        if(tipoComprobante == '08') // factura de compra
            genXMLFacturaCompra(obj, ordenes,llave, clave, idfactura, tipoComprobante).then(dataMensajeRecepcion => {
                resolve(dataMensajeRecepcion)
            }).catch(err => reject(err));
        if(tipoComprobante == '08R')
            genXMLFacturaCompraReemplazo(obj, ordenes,llave, clave, idfactura, tipoComprobante).then(dataMensajeRecepcion => {
                resolve(dataMensajeRecepcion)
            }).catch(err => reject(err));
        if(tipoComprobante == '08A')
            genXMLFacturaCompraAnular(obj, ordenes,llave, clave, idfactura, tipoComprobante).then(dataMensajeRecepcion => {
                resolve(dataMensajeRecepcion)
            }).catch(err => reject(err));
        
    })
}

const genXMLFactura = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => {
    return new Promise( async (resolve, reject) => {

        try {
            console.log(obj);
            let xml = '';
            //'2020-11-30T22:26:23'.substr(0,10)
            const cliente = obj.datosCliente != null || typeof obj.datosCliente !== 'undefined'? obj.datosCliente : null; 
            const proveedor_sistemas= "3101335356";
            const CodigoActividadReceptor = await tipoCambioController.obtenerActividad(cliente.cedula_cliente);
            const fechaTipoCambio = obj.fecha_factura.substr(0,10);
            const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
            xml = `<?xml version="1.0" encoding="utf-8"?>
                    <FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
            
            /*CAMBIOS 4.4  PROVEEDOR SISTEMA Y CODIGO ACTIVIDD RECEPCION
                <CodigoActividad>${obj.codigo_actividad}</CodigoActividad>
            */      
           let codact ='' 
           
           if (cliente.CodActividad){
                codact=cliente.CodActividad
           } else {
               
              /*  if (CodigoActividadReceptor.data.resultcount > 0){
                    codact= CodigoActividadReceptor.data.actividades[1].codigo
                } else {*/
                    codact='721001'
               // }

            }
            xml += `<Clave>${obj.clavenumerica}</Clave>
                    <ProveedorSistemas>${proveedor_sistemas}</ProveedorSistemas>
                    <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>
                    <CodigoActividadReceptor>${codact}</CodigoActividadReceptor>
                    
                    <NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                    <FechaEmision>${obj.fecha_factura}</FechaEmision>
                    <Emisor>
                        <Nombre>${obj.emisor_nombre}</Nombre>
                        <Identificacion>
                            <Tipo>${obj.emisor_tipo_identificacion}</Tipo>
                            <Numero>${obj.cedula_emisor}</Numero>
                        </Identificacion>`;
    
            if (obj.emisor_nombrecomercial != null) {
                xml += `<NombreComercial>${obj.emisor_nombrecomercial}</NombreComercial>`;
            }
    
            const ubicacion_emisor = obj.ubicacion_emisor;
            
            xml += `<Ubicacion>
                            <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                            <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                            <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                            <Barrio>Central</Barrio>
                            <OtrasSenas>${obj.emisor_otras_senas}</OtrasSenas>
                        </Ubicacion>`;
    
            if (obj.emisor_telefono_codigopais != null && obj.emisor_telefono_numtelefono.length > 0) {
                xml += `<Telefono>
                            <CodigoPais>${obj.emisor_telefono_codigopais}</CodigoPais>
                            <NumTelefono>${obj.emisor_telefono_numtelefono}</NumTelefono>
                        </Telefono>`;
            }
    
            /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
                xml += `<Fax>
                            <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                            <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                        </Fax>`;
            }*/
    
            xml += `<CorreoElectronico>${obj.emisor_correo}</CorreoElectronico></Emisor>`;
    
            //cambio SYN se sube al inicio
            //const cliente = obj.datosCliente != null || typeof obj.datosCliente !== 'undefined'? obj.datosCliente : null; 
            
            if (typeof cliente.cedula_cliente !== 'undefined') {
                const ubicacion_cliente = cliente.ubicacion_cliente;
                //INFORMACION DEL CLIENTE
                console.log("UBicacion cliente ", ubicacion_cliente);
                xml += '<Receptor>';
                xml += `<Nombre>${cliente.cliente_nombre}</Nombre>`;
                xml += `<Identificacion>
                            <Tipo>${cliente.cliente_tipo_identificacion}</Tipo>
                            <Numero>${cliente.cedula_cliente}</Numero>
                        </Identificacion>`;
    
                if (cliente.identificacion_extranjero != null && cliente.identificacion_extranjero.length > 0) {
                    xml += `<IdentificacionExtranjero>${cliente.identificacion_extranjero}</IdentificacionExtranjero>`;
                }
    
                if (cliente.cliente_nombre_comercial != null && cliente.cliente_nombre_comercial.length > 0) {
                    xml += `<NombreComercial>${cliente.cliente_nombre_comercial}</NombreComercial>`;
                }
    
                xml += `<Ubicacion>
                            <Provincia>${ubicacion_cliente.provincia.trim()}</Provincia>
                            <Canton>${ubicacion_cliente.canton.trim()}</Canton>
                            <Distrito>${ubicacion_cliente.distrito.trim()}</Distrito>
                            <Barrio>Central</Barrio>
                            <OtrasSenas>${cliente.otras_senas}</OtrasSenas>
                        </Ubicacion>`;
    
                if (cliente.otras_senas_extranjero != null && cliente.otras_senas_extranjero.length > 0) {
                    xml += `<OtrasSenasExtranjero>${cliente.otras_senas_extranjero}</OtrasSenasExtranjero>`;
                }
    
                if (cliente.cliente_telefono_numtelefono != null && cliente.cliente_telefono_numtelefono.length > 0) {
                    xml += `<Telefono>
                                <CodigoPais>${cliente.cliente_telefono_codigopais}</CodigoPais>
                                <NumTelefono>${cliente.cliente_telefono_numtelefono}</NumTelefono>
                            </Telefono>`;
                }
                //CAMBIO SYN DESAHABILIT NODO FAX
                /*if (cliente.cliente_fax_codigopais != null && cliente.cliente_fax_numtelefono > 0) {
                    xml += `<Fax>
                                <CodigoPais>${cliente.cliente_fax_codigopais}</CodigoPais>
                                <NumTelefono>${cliente.cliente_fax_numtelefono}</NumTelefono>
                            </Fax>`;
                }*/
    
                xml += `<CorreoElectronico>${cliente.cliente_correo}</CorreoElectronico></Receptor>`;
                //--------------------------------
                xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;
    
                //if (obj.plazo_credito  && obj.plazo_credito > 0) { //CAMBIO SYN
                if (obj.plazo_credito) {
                    xml += `<PlazoCredito>${obj.plazo_credito}</PlazoCredito>`;
                }else{
                    if (obj.condicion_venta == '02'){
                        let plazo=1;
                        xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                    }else{
                        let plazo=0;
                        xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                    }
                }
                 //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                 xml += `<DetalleServicio>`;
                 let indice = 1;
                 let montofabrica=0;
                 let codigoTarifa  = 0;
                 let Tarifa  = 0;
                 let monto = 0;
                 let tc=1;
                 let acumulados= {};
                 let sumaserviciosgr=0;
                 let sumaserviciosex=0;
                 let sumamercanciagr=0;
                 let sumamercanciaex=0;
                 let matrizTarifas = ({
                     codigoTarifa: '',
                     total:0.00
                   });
 
                 for (let detalle in ordenes) {
     
                     let codigoProducto = ordenes[detalle].codigobarra_producto;
                     let existeCodigoCabys = false;
                     let codigoCabys = '';

                     if(ordenes[detalle].codigoCabys){
     
                         if(ordenes[detalle].codigoCabys.length > 13){

                             codigoCabys=ordenes[detalle].codigoCabys.substring(0,13);
                             existeCodigoCabys = true;
                             
                         } else {
                             codigoCabys=ordenes[detalle].codigoCabys
                             existeCodigoCabys = true;

                             //CAMBIO SYN V4.4
                             if (codigoCabys.substring(0,1) >4 ){
                                if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumaserviciosgr+=parseFloat(ordenes[detalle].montototal);
                                }else{
                                   sumaserviciosex+=parseFloat(ordenes[detalle].montototal);
                                }
                              
                            }else{
                               if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumamercanciagr+=parseFloat(ordenes[detalle].montototal);
                               }else{
                                   sumamercanciaex+=parseFloat(ordenes[detalle].montototal);
                               }
                            }
                         }  

                     }
     
                     if(codigoProducto){
                         if(codigoProducto.length > 13){
                             codigoProducto = codigoProducto.substring(0,13);
                         } else {
                             codigoProducto = codigoProducto;
                         }
                     }
     
                     //<Codigo>${(ordenes[detalle].codigoCabys.length > 13)? ordenes[detalle].codigoCabys.substring(0,13):ordenes[detalle].codigoCabys }</Codigo>`;
                     xml += `<LineaDetalle>
                             <NumeroLinea>${indice}</NumeroLinea>
                             ${existeCodigoCabys == true ? `<CodigoCABYS>${codigoCabys}</CodigoCABYS>`:`<Codigo/>`}`;
                     
 
                             //cambio por rechazo <Tipo>04</Tipo> 
                     if (ordenes[detalle].tipo_servicio != null) { //cambio 4.4 tipo_codigo_servicio
                         xml += `<CodigoComercial>
                                 <Tipo>${ordenes[detalle].tipo_servicio}</Tipo> 
                                 <Codigo>${codigoProducto}</Codigo>
                             </CodigoComercial>`;
                     }
     
                     xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                         <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;
     
                     /*if (ordenes[detalle].unidadMedidaComercial != null && ordenes[detalle].unidadMedidaComercial.length > 0 ) {
                         xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                     }*///CAMBIO 4.4
                     //xml += `<TipoTransaccion>01</TipoTransaccion>`;
                     //xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedida}</UnidadMedidaComercial>`;
                     //fin cambio 4.4
                     xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                             <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                             <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;
     
                     if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                         xml += `<Descuento>
                                 <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                                 <NaturalezaDescuento>${ ordenes[detalle].naturalezadescuento == null || ordenes[detalle].naturalezadescuento.length == 0  ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                             </Descuento>`;
                     }
     
                     xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;
     
                     if (ordenes[detalle].baseimponible == 0) {
                         xml += `<BaseImponible>${ordenes[detalle].subtotal}</BaseImponible>`;
                     }else{
                         xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                     }
     
                     if (ordenes[detalle].monto > 0) {
                         /*CAMBIOS 4.4 SE INSERTA EL CODIGO TARIFA IVA
                         
                                                
                         <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                         */
                        /*acumula en matriz los codigos de tarifa y monto*/
                        codigoTarifa  = ordenes[detalle].codigo_tarifa;
                        monto = parseFloat(ordenes[detalle].impuesto_neto);
                        
                         if (!acumulados[codigoTarifa]) {
                             acumulados[codigoTarifa] = 0;
                         }
                         acumulados[codigoTarifa] += monto;
                         console.log('Acumulados',acumulados)
 
                         matrizTarifas = Object.entries(acumulados).map(([codigoTarifa, total]) => ({
                             codigoTarifa,
                             total
                           }));
 
                           console.log('Matriz resultante:', matrizTarifas); 
 
                         /* fin de acumula tarifas */
 
                         Tarifa= parseInt(ordenes[detalle].tarifa);
                         xml += `<Impuesto>
                                 <Codigo>${ordenes[detalle].codigo}</Codigo>
                                 <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                                 <Tarifa>${Tarifa}</Tarifa>`;
     
     
                         if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                             xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                         }
     
                         xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
     
                     }
                     if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                         xml += `<Exoneracion>
                                     <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                     <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                     <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                     <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                     <PorcentajeExoneracion>${Number(ordenes[detalle].PorcentajeExonerado).toFixed(0)}</PorcentajeExoneracion>
                                     <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                                 </Exoneracion></Impuesto>`;
                         
                     } {
                          
                         xml += `</Impuesto>`;
                     }
                     /*CAMBIOS 4.4 SE impuesto emisor fabric */
                     xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                     xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                     xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                     indice++;
                 };
     
                 xml += `</DetalleServicio>`;
     
                 /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                     detalle.otrosCargos.forEach(cargo => {
                         
                     })
                 }*/
                 if(obj.TotalOtrosCargos > 0) {
                     const porcentajeOtrosCargos = Number(obj.totalventa) / Number(obj.TotalOtrosCargos);
                     xml += ` <OtrosCargos>
                     <TipoDocumentoOC>06</TipoDocumentoOC>
                     <Detalle>Servicio Restaurante</Detalle>
                     <PorcentajeOC>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</PorcentajeOC>
                     <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                    </OtrosCargos>`;
                 }
                 
                 xml += `<ResumenFactura>`;
                 if (obj.codigomoneda == 'CRC'){
                         tc=1.00;
                 }else{
                     tc=response[0].tipocambio;
                 }
                 xml += `<CodigoTipoMoneda>
                             <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                             <TipoCambio>${tc}</TipoCambio>
                         </CodigoTipoMoneda>`;
                 
                //CAMBIO SYN V4.4         
                /* xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                         <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                         <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                         <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                         <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                         <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                         <TotalGravado>${obj.totalgravado}</TotalGravado>
                         <TotalExento>${obj.totalexento}</TotalExento>
                         <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                         <TotalVenta>${obj.totalventa}</TotalVenta>
                         <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                         <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>`;*/
                         let tgravado=sumamercanciagr+sumaserviciosgr;
                         tgravado=tgravado.toFixed(4);
                         let texento=sumamercanciaex+sumaserviciosex;
                         texento=texento.toFixed(4);
                         sumamercanciaex= sumamercanciaex.toFixed(4);
                         sumamercanciagr= sumamercanciagr.toFixed(4);
                         sumaserviciosex=sumaserviciosex.toFixed(4);
                         sumaserviciosgr=sumaserviciosgr.toFixed(4);
                         xml += `<TotalServGravados>${sumaserviciosgr}</TotalServGravados>
                         <TotalServExentos>${sumamercanciaex}</TotalServExentos>
                         <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                         <TotalMercanciasGravadas>${sumamercanciagr}</TotalMercanciasGravadas>
                         <TotalMercanciasExentas>${sumamercanciaex}</TotalMercanciasExentas>
                         <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                         <TotalGravado>${tgravado}</TotalGravado>
                         <TotalExento>${texento}</TotalExento>
                         <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                         <TotalVenta>${obj.totalventa}</TotalVenta>
                         <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                         <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>`;     
                   
                         //SE AGREGA version 4.4  IVa en codigotarifas matrizTarifas
                         matrizTarifas.forEach(({ codigoTarifa, total }) => {
                            let montoiva=parseFloat(total);
                            montoiva=montoiva.toFixed(4);
                             //console.log(`Código: ${codigoTarifa}`);
                             //console.log(`Total: ${total}`);
                             xml += `<TotalDesgloseImpuesto>`;
                             xml += `<Codigo>01</Codigo>`;
                             xml += `<CodigoTarifaIVA>${codigoTarifa}</CodigoTarifaIVA>`;
                             xml += `<TotalMontoImpuesto>${montoiva}</TotalMontoImpuesto>`;
                             xml += `</TotalDesgloseImpuesto>`;
 
                           });
                         
                   
                 
     
                 if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                     xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
                 }
                 //SE AGREGA version 4.4  
                 xml += `<TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;
                 xml += `<TotalImpAsumEmisorFabrica>${montofabrica}</TotalImpAsumEmisorFabrica>`;
                 if(obj.TotalOtrosCargos > 0) {
                    xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
                }
                 //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                 xml += `<MedioPago>
                 <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                 <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                 </MedioPago>`;
                 //fin agrega versiob 4.4
                 xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
                 xml += `</ResumenFactura>`;
 
                 // XolidoSing investigar
                 //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
                 
                 //SE AGREGA PARA CLIENTE PANAMA
                 if(obj.TipodocRef) {
                     
                     xml += ` <InformacionReferencia>
                                 <TipoDoc>${obj.TipodocRef}</TipoDoc>
                                 <Numero>${obj.NumeroRef}</Numero>
                                 <FechaEmision>${obj.FechaRef}</FechaEmision>
                                 <Codigo>${obj.CodigoRef}</Codigo>
                                 <Razon>${obj.RazonRef}</Razon>
                             </InformacionReferencia>`;
                 }
                 
                



               /* VERSION 4.3
                xml += `<DetalleServicio>`;
                let indice = 1;
                let montofabrica=0;
                let codigoTarifa  = 0;
                let Tarifa  = 0;
                let monto = 0;
                let tc=1;
                let acumulados= {};
                let matrizTarifas = ({
                    codigoTarifa: '',
                    total:0.00
                  });

                for (const detalle in ordenes) {
                    
                    let codigoProducto = ordenes[detalle].codigobarra_producto;
                    let existeCodigoCabys = false;
                    let codigoCabys = '';
                   
                    if(ordenes[detalle].codigoCabys){    
                        if(ordenes[detalle].codigoCabys.length > 13){
                            codigoCabys=ordenes[detalle].codigoCabys.substring(0,13);
                            existeCodigoCabys = true;
                        } else {
                            codigoCabys=ordenes[detalle].codigoCabys
                            existeCodigoCabys = true;
                        }                    
                    }   
    
                    if(codigoProducto){
                        if(codigoProducto.length > 13){
                            codigoProducto = codigoProducto.substring(0,13);
                        } else {
                            codigoProducto = codigoProducto;
                        }
                    }   
                    //<Codigo>${(existeCodigoCabys == true)? codigoCabys: codigoProducto}</Codigo>`
                    // ${existeCodigoCabys == true ? `<Codigo>${codigoCabys}</Codigo>`:`<Codigo/>`}
                    xml += `<LineaDetalle>
                                <NumeroLinea>${indice}</NumeroLinea>
                                ${existeCodigoCabys == true ? `<CodigoCABYS>${codigoCabys}</CodigoCABYS>`:`<CodigoCABYS/>`}
                                `;
                                
                    if (ordenes[detalle].tipo_codigo_servicio != null) {
                        xml += `<CodigoComercial>
                                <Tipo>${ordenes[detalle].tipo_codigo_servicio}</Tipo>
                                <Codigo>${codigoProducto}</Codigo>
                            </CodigoComercial>`;
                    }
    
                    xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                        <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;
    
                    if (ordenes[detalle].unidadMedidaComercial != null) {
                        xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                    }
    
                    xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                            <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                            <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;
    
                    if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                        xml += `<Descuento>
                                <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                                <NaturalezaDescuento>${ ordenes[detalle].naturalezadescuento == null || ordenes[detalle].naturalezadescuento.length == 0  ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                            </Descuento>`;
                    }
    
                    xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;
    
                    //if (ordenes[detalle].baseimponible != null || ordenes[detalle].baseimponible > 0) {
                    //   xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                   //}
    
                    if (ordenes[detalle].monto > 0) {
                      //CAMBIOS 4.4 SE INSERTA EL CODIGO TARIFA IVA
                        
                                               
                       // <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                     
                      //acumula en matriz los codigos de tarifa y monto
                       codigoTarifa  = ordenes[detalle].codigo_tarifa;
                       monto = parseFloat(ordenes[detalle].impuesto_neto);
                       
                        if (!acumulados[codigoTarifa]) {
                            acumulados[codigoTarifa] = 0;
                        }
                        acumulados[codigoTarifa] += monto;
                        console.log('Acumulados',acumulados)

                         const matrizTarifas = Object.entries(acumulados).map(([codigoTarifa, total]) => ({
                            codigoTarifa,
                            total
                          }));

                          console.log('Matriz resultante:', matrizTarifas); 

                        //fin de acumula tarifas 
                        //cambio 4.4
                        Tarifa= parseInt(ordenes[detalle].tarifa);

                        xml += `<Impuesto>
                                <Codigo>${ordenes[detalle].codigo}</Codigo>
                                <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                                <Tarifa>${Tarifa}</Tarifa>`; //cambio 4.4
    
    
                        if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                            xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                        }
    
                        xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
    
    
                    } //50625032000010832073300100001030000000023181635427 NOTA RECHAZADA
    
                    if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                        xml += `<Exoneracion>
                                    <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                    <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                    <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                    <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                    <PorcentajeExoneracion>${Number(ordenes[detalle].PorcentajeExonerado).toFixed(0)}</PorcentajeExoneracion>
                                    <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                                </Exoneracion></Impuesto>`;
                        //CAMBIOS 4.4 SE impuesto emisor fabric 
                        xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                        xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                    } {
                        xml += `</Impuesto>`;
                    }
                    //CAMBIOS 4.4 SE impuesto emisor fabric 
                    xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                    xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;

                    xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                    indice++;
                };
    
                xml += `</DetalleServicio>`;
    
                /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                        detalle.otrosCargos.forEach(cargo => {
                            
                        })
                    }
    
                if(obj.TotalOtrosCargos > 0) {
                    const porcentajeOtrosCargos = Number(obj.totalventa) / Number(obj.TotalOtrosCargos);
                    xml += ` <OtrosCargos>
                                <TipoDocumento>06</TipoDocumento>
                                <Detalle>Servicio Restaurante</Detalle>
                                <Porcentaje>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</Porcentaje>
                                <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                            </OtrosCargos>`;
                }
    
                xml += `<ResumenFactura>`;
                //cambio 4.4
                if (obj.codigomoneda == 'CRC'){
                    tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio> 
                        </CodigoTipoMoneda>`;
    
                xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                        <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                        <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                        <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                        <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                        <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                        <TotalGravado>${obj.totalgravado}</TotalGravado>
                        <TotalExento>${obj.totalexento}</TotalExento>
                        <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                        <TotalVenta>${obj.totalventa}</TotalVenta>
                        <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                        <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>` ;


                  //SE AGREGA version 4.4  IVa en codigotarifas

                //SE AGREGA version 4.4  IVa en codigotarifas matrizTarifas
                matrizTarifas.forEach(({ codigoTarifa, total }) => {
                           
                    //console.log(`Código: ${codigoTarifa}`);
                    //console.log(`Total: ${total}`);
                    xml += `<TotalDesgloseImpuesto>`;
                    xml += `<Codigo>01</Codigo>`;
                    xml += `<CodigoTarifaIVA>${codigoTarifa}</CodigoTarifaIVA>`;
                    xml += `<TotalMontoImpuesto>${total}</TotalMontoImpuesto>`;
                    xml += `</TotalDesgloseImpuesto>`;

                  });       

                    
                if(obj.TotalOtrosCargos > 0) {
                    xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
                }
    
                if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                    xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
                }

                //SE AGREGA version 4.4  
                xml += `<TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;
                xml += `<TotalImpAsumEmisorFabrica>${montofabrica}</TotalImpAsumEmisorFabrica>`;
                //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                xml += `<MedioPago>
                <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                </MedioPago>`;
                //fin agrega versiob 4.4

                xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
                xml += `</ResumenFactura>`;
                
                //SE AGREGA PARA CLIENTE PANAMA
                if(obj.TipodocRef) {
                    
                    xml += ` <InformacionReferencia>
                                <TipoDoc>${obj.TipodocRef}</TipoDoc>
                                <Numero>${obj.NumeroRef}</Numero>
                                <FechaEmision>${obj.FechaRef}</FechaEmision>
                                <Codigo>${obj.CodigoRef}</Codigo>
                                <Razon>${obj.RazonRef}</Razon>
                            </InformacionReferencia>`;
                }
                //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO*/
                xml += `</FacturaElectronica>`;
    
                console.log("XML GENERADO ", xml);
                
                firmarXML(xml, llave, clave).then(xmlSigned => {
                        const objFirma = {
                            id: idfactura,
                            xml: xmlSigned,
                            tipo_factura: tipoComprobante
                        }
                        Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                            .then(data => {
    
                                const root = path.resolve(__dirname);
                                const objetoXML = {
                                    comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                    path: root + '/../xml/' + obj.clavenumerica + '.xml'
                                }
    
    
                                console.log("objetoXML", objetoXML);
                                facturaFunciones.generarArchivoXML(objetoXML)
                                    .then(xmlCreado => {
    
                                        
                                        console.log("respuests archivo creado ", xmlCreado);
                                        
                                        resolve(xmlSigned);
                                    })
                                    .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
            } else {
                return reject("No se pudo obtener la informacion del cliente");
            }
        } catch(err){
            console.log(err);
            reject('Error al obtener el tipo de cambio');
        }
    })
}

/*
    const fechaTipoCambio = obj.fecha_factura.substr(0,10);
    const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
*/
const genXMLTiquete = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => {

    return new Promise(async (resolve, reject) => {

        try {
            let xml = '';
            const proveedor_sistemas= "3101335356";
            //const CodigoActividadReceptor = "721001"
            const fechaTipoCambio = obj.fecha_factura.substr(0,10);
            const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
            if (typeof obj !== 'undefined' || obj == null) {
            
                const ubicacion_emisor = obj.ubicacion_emisor;
                xml += `<?xml version="1.0" encoding="utf-8"?>
                 <TiqueteElectronico xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">`;
                /*CAMBIOS 4.4  PROVEEDOR SISTEMA Y CODIGO ACTIVIDD RECEPCION
                <CodigoActividad>${obj.codigo_actividad}</CodigoActividad>
                */
                xml += `
                <Clave>${obj.clavenumerica}</Clave>
                <ProveedorSistemas>${proveedor_sistemas}</ProveedorSistemas>
                <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>
                <NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                <FechaEmision>${obj.fecha_factura}</FechaEmision>
                <Emisor>
                    <Nombre>${obj.emisor_nombre}</Nombre>
                    <Identificacion>
                        <Tipo>${obj.emisor_tipo_identificacion}</Tipo>
                        <Numero>${obj.cedula_emisor}</Numero>
                    </Identificacion>
                    <NombreComercial>${obj.emisor_nombrecomercial}</NombreComercial>
                    <Ubicacion>
                        <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                        <Barrio>Central</Barrio>
                        <OtrasSenas>${obj.emisor_otras_senas}</OtrasSenas>
                    </Ubicacion>`;
    
                if (obj.emisor_telefono_codigopais != null && obj.emisor_telefono_numtelefono.length > 0) {
                    xml += `<Telefono>
                            <CodigoPais>${obj.emisor_telefono_codigopais}</CodigoPais>
                            <NumTelefono>${obj.emisor_telefono_numtelefono}</NumTelefono>
                        </Telefono>`;
                }
    
                /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
                xml += `<Fax>
                            <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                            <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                        </Fax>`;
                }*/
    
                xml += `<CorreoElectronico>${obj.emisor_correo}</CorreoElectronico>`;
                xml += `</Emisor>`;
    
                xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;
    
                //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                xml += `<DetalleServicio>`;
                let indice = 1;
                let montofabrica=0;
                let codigoTarifa  = 0;
                let Tarifa  = 0;
                let monto = 0;
                let tc=1;
                let acumulados= {};
                let sumaserviciosgr=0.00;
                let sumaserviciosex=0.00;
                let sumamercanciagr=0.00;
                let sumamercanciaex=0.00;
                let matrizTarifas = ({
                    codigoTarifa: '',
                    total:0.00
                  });

                for (let detalle in ordenes) {
    
                    let codigoProducto = ordenes[detalle].codigobarra_producto;
                    let existeCodigoCabys = false;
                    let codigoCabys = '';
                   

                    if(ordenes[detalle].codigoCabys){
    
                        if(ordenes[detalle].codigoCabys.length > 13){
                            codigoCabys=ordenes[detalle].codigoCabys.substring(0,13);
                            existeCodigoCabys = true;
                        } else {
                            codigoCabys=ordenes[detalle].codigoCabys
                            console.log(codigoProducto)
                            existeCodigoCabys = true;
                            if (codigoCabys.substring(0,1) >4 ){
                                if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumaserviciosgr+=parseFloat(ordenes[detalle].montototal);
                                }else{
                                   sumaserviciosex+=parseFloat(ordenes[detalle].montototal);
                                }
                              
                            }else{
                               if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumamercanciagr+=parseFloat(ordenes[detalle].montototal);
                               }else{
                                   sumamercanciaex+=parseFloat(ordenes[detalle].montototal);
                               }
                            }
                        }                    
                    }
    
                    if(codigoProducto){
                        if(codigoProducto.length > 13){
                            codigoProducto = codigoProducto.substring(0,13);
                        } else {
                            codigoProducto = codigoProducto;
                        }
                    }
    
                    //<Codigo>${(ordenes[detalle].codigoCabys.length > 13)? ordenes[detalle].codigoCabys.substring(0,13):ordenes[detalle].codigoCabys }</Codigo>`;
                    xml += `<LineaDetalle>
                            <NumeroLinea>${indice}</NumeroLinea>
                            ${existeCodigoCabys == true ? `<CodigoCABYS>${codigoCabys}</CodigoCABYS>`:`<CodigoCABYS/>`}`;
                    

                            //cambio por rechazo <Tipo>04</Tipo> 
                    if (ordenes[detalle].tipo_servicio != null) { //cambio 4.4 tipo_codigo_servicio
                        xml += `<CodigoComercial>
                                <Tipo>${ordenes[detalle].tipo_servicio}</Tipo> 
                                <Codigo>${codigoProducto}</Codigo>
                            </CodigoComercial>`;
                    }
    
                    xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                        <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;
    
                    /*if (ordenes[detalle].unidadMedidaComercial != null && ordenes[detalle].unidadMedidaComercial.length > 0 ) {
                        xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                    }*///CAMBIO 4.4
                    //xml += `<TipoTransaccion>01</TipoTransaccion>`;
                    //xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedida}</UnidadMedidaComercial>`;
                    //fin cambio 4.4
                    xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                            <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                            <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;
    
                    if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                        xml += `<Descuento>
                                <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                                <NaturalezaDescuento>${ ordenes[detalle].naturalezadescuento == null || ordenes[detalle].naturalezadescuento.length == 0  ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                            </Descuento>`;
                    }
    
                    xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;
    
                    if (ordenes[detalle].baseimponible == 0) {
                        xml += `<BaseImponible>${ordenes[detalle].subtotal}</BaseImponible>`;
                    }else{
                        xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                    }
    
                    if (ordenes[detalle].monto > 0) {
                        /*CAMBIOS 4.4 SE INSERTA EL CODIGO TARIFA IVA
                        
                                               
                        <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                        */
                       /*acumula en matriz los codigos de tarifa y monto*/
                       codigoTarifa  = ordenes[detalle].codigo_tarifa;
                       monto = parseFloat(ordenes[detalle].impuesto_neto);
                       
                        if (!acumulados[codigoTarifa]) {
                            acumulados[codigoTarifa] = 0;
                        }
                        acumulados[codigoTarifa] += monto;
                        console.log('Acumulados',acumulados)

                        matrizTarifas = Object.entries(acumulados).map(([codigoTarifa, total]) => ({
                            codigoTarifa,
                            total
                          }));

                          console.log('Matriz resultante:', matrizTarifas); 

                        /* fin de acumula tarifas */

                        Tarifa= parseInt(ordenes[detalle].tarifa);
                        xml += `<Impuesto>
                                <Codigo>${ordenes[detalle].codigo}</Codigo>
                                <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                                <Tarifa>${Tarifa}</Tarifa>`;
    
    
                        if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                            xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                        }
    
                        xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
    
                    }
                    if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                        xml += `<Exoneracion>
                                    <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                    <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                    <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                    <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                    <PorcentajeExoneracion>${Number(ordenes[detalle].PorcentajeExonerado).toFixed(0)}</PorcentajeExoneracion>
                                    <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                                </Exoneracion></Impuesto>`;
                        
                    } {
                         
                        xml += `</Impuesto>`;
                    }
                    /*CAMBIOS 4.4 SE impuesto emisor fabric */
                    xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                    xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                    xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                    indice++;
                };
    
                xml += `</DetalleServicio>`;
    
                /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                    detalle.otrosCargos.forEach(cargo => {
                        
                    })
                }*/
                if(obj.TotalOtrosCargos > 0) {
                    const porcentajeOtrosCargos = Number(obj.totalventa) / Number(obj.TotalOtrosCargos);
                    xml += ` <OtrosCargos>
                                <TipoDocumentoOC>06</TipoDocumentoOC>
                                <Detalle>Servicio Restaurante</Detalle>
                                <PorcentajeOC>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</PorcentajeOC>
                                <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                            </OtrosCargos>`;
                }
                
                xml += `<ResumenFactura>`;
                if (obj.codigomoneda == 'CRC'){
                        tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio>
                        </CodigoTipoMoneda>`;
                
                //CAMBIO SYN V4.4        
                /*xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                        <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                        <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                        <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                        <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                        <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                        <TotalGravado>${obj.totalgravado}</TotalGravado>
                        <TotalExento>${obj.totalexento}</TotalExento>
                        <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                        <TotalVenta>${obj.totalventa}</TotalVenta>
                        <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                        <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>`;*/
                        let tgravado=sumamercanciagr+sumaserviciosgr;
                         tgravado=tgravado.toFixed(4);
                         let texento=sumamercanciaex+sumaserviciosex;
                         texento=texento.toFixed(4);
                         sumamercanciaex= sumamercanciaex.toFixed(4);
                         sumamercanciagr= sumamercanciagr.toFixed(4);
                         sumaserviciosex=sumaserviciosex.toFixed(4);
                         sumaserviciosgr=sumaserviciosgr.toFixed(4);
                        xml += `<TotalServGravados>${sumaserviciosgr}</TotalServGravados>
                        <TotalServExentos>${sumamercanciaex}</TotalServExentos>
                        <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                        <TotalMercanciasGravadas>${sumamercanciagr}</TotalMercanciasGravadas>
                        <TotalMercanciasExentas>${sumamercanciaex}</TotalMercanciasExentas>
                        <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                        <TotalGravado>${tgravado}</TotalGravado>
                        <TotalExento>${texento}</TotalExento>
                        <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                        <TotalVenta>${obj.totalventa}</TotalVenta>
                        <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                        <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>`;         
                  
                        //SE AGREGA version 4.4  IVa en codigotarifas matrizTarifas
                        matrizTarifas.forEach(({ codigoTarifa, total }) => {
                            let montoiva=parseFloat(total);
                            montoiva=montoiva.toFixed(4);
                            //console.log(`Código: ${cosdigoTarifa}`);
                            //console.log(`Total: ${total}`);
                            xml += `<TotalDesgloseImpuesto>`;
                            xml += `<Codigo>01</Codigo>`;
                            xml += `<CodigoTarifaIVA>${codigoTarifa}</CodigoTarifaIVA>`;
                            xml += `<TotalMontoImpuesto>${montoiva}</TotalMontoImpuesto>`;
                            xml += `</TotalDesgloseImpuesto>`;

                          });
                        
                  
                   
                if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                    xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
                }
                //SE AGREGA version 4.4  
                xml += `<TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;
                xml += `<TotalImpAsumEmisorFabrica>${montofabrica}</TotalImpAsumEmisorFabrica>`;
                if(obj.TotalOtrosCargos > 0) {
                    xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
                }
                //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                xml += `<MedioPago>
                <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                </MedioPago>`;
                //fin agrega versiob 4.4
                xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
                xml += `</ResumenFactura>`;

                // XolidoSing investigar
                //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
                
                //SE AGREGA PARA CLIENTE PANAMA
                if(obj.TipodocRef) {
                    
                    xml += ` <InformacionReferencia>
                                <TipoDoc>${obj.TipodocRef}</TipoDoc>
                                <Numero>${obj.NumeroRef}</Numero>
                                <FechaEmision>${obj.FechaRef}</FechaEmision>
                                <Codigo>${obj.CodigoRef}</Codigo>
                                <Razon>${obj.RazonRef}</Razon>
                            </InformacionReferencia>`;
                }
                xml += `</TiqueteElectronico>`;
                console.log("XML GENERADO ", xml);
                
                firmarXML(xml, llave, clave).then(xmlSigned => {
                        const objFirma = {
                            id: idfactura,
                            xml: xmlSigned,
                            tipo_factura: tipoComprobante
                        }
                        Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                            .then(data => {
    
                                const root = path.resolve(__dirname);
                                const objetoXML = {
                                    comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                    path: root + '/../xml/' + obj.clavenumerica + '.xml'
                                }
    
    
                                console.log("objetoXML", objetoXML);
                                facturaFunciones.generarArchivoXML(objetoXML)
                                    .then(xmlCreado => {
                                        console.log("respuests archivo creado ", xmlCreado);
                                       
                                        resolve(xmlSigned);
                                    })
                                    .catch(err => console.error(err));
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                //return xml;
                //crear una tabla de nota de credito
    
                /*
                Errorres a arrelglar de la factura 
    
                Fecha debe ser 2020-03-05T16:34:33-06:00 (Sin decimales)
                -No deben haber espacios en los datos de los tags, ver -Provincia y Canton, tienen espacios a la derecha 
                -Puede obviar el Nodo Receptor
                -MontoTotal debe llevar decimales
                -Subtotal debe llevar decimales
                -BaseImponible debe llevar decimales
                -BaseImponible solo se usa para un cálculo de Iva especial del que no tengo idea
                -Tipo de Cambio debe ser 1.00 si Moneda es CRC
                -DateTime, lo separo y agrego el -06:00 a mano
                        
                */
            } else {
                reject("No se pudo obtener la informacion del tiquete electronico")
            }
        } catch(err) {
            console.log(err);
            reject('Error al obtener el tipo de cambio');
        }
    })
}


//-- FUNCION PARA GENERAR NOTAS DE CREDITO QUE ANULEN FACTURAS O PARTE DE ELLAS 

/*
    const fechaTipoCambio = obj.fecha_factura.substr(0,10);
    const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
*/
const genNotaCredito = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => { //anular
    return new Promise(async (resolve, reject) => {

        try {
            if (typeof obj !== 'undefined' || obj != null) {
                let xml = '';
                const cliente = obj.datosCliente != null || typeof obj.datosCliente !== 'undefined'? obj.datosCliente : null; 
                const fechaTipoCambio = obj.fecha_factura.substr(0,10);
                const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
                console.log("obj nota de credito", obj);
                xml += '<?xml version = "1.0" encoding = "utf-8"?>\n<NotaCreditoElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaCreditoElectronica" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
    
                
                //ENCABEZADO DE LA NOTA DE CREDITO Cambios 4.4
                xml += `<Clave>${obj.clavenumerica}</Clave>
                <ProveedorSistemas>3101335356</ProveedorSistemas>
                <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>`;
                //se agrega Codigo actividad Receptor cambio 4.4
                if (cliente != null) {                    
                    xml += `<CodigoActividadReceptor>552004</CodigoActividadReceptor>`;
                }
                xml += `<NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                <FechaEmision>${obj.fecha_factura}</FechaEmision>
                <Emisor>
                    <Nombre>${obj.emisor_nombre}</Nombre>
                    <Identificacion>
                        <Tipo>${obj.emisor_tipo_identificacion}</Tipo>
                        <Numero>${obj.cedula_emisor}</Numero>
                    </Identificacion>`;
    
                if (obj.emisor_nombrecomercial != null && obj.emisor_telefono_codigopais.length > 0) {
                    xml += `<NombreComercial>${obj.emisor_nombrecomercial}</NombreComercial>`;
                }
                const ubicacion_emisor = obj.ubicacion_emisor;
                xml += `<Ubicacion>
                            <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                            <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                            <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                            <Barrio>Central</Barrio>
                            <OtrasSenas>${obj.emisor_otras_senas}</OtrasSenas>
                        </Ubicacion>`;
    
                if (obj.emisor_telefono_codigopais != null && obj.emisor_telefono_numtelefono.length > 0) {
                    xml += `<Telefono>
                                <CodigoPais>${obj.emisor_telefono_codigopais}</CodigoPais>
                                <NumTelefono>${obj.emisor_telefono_numtelefono}</NumTelefono>
                            </Telefono>`;
                }
    
                /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
                xml += `<Fax>
                            <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                            <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                        </Fax>`;
            }*/
    
                xml += `<CorreoElectronico>${obj.emisor_correo}</CorreoElectronico></Emisor>`;
    
                //const cliente = obj.datosCliente != null || typeof obj.datosCliente !== 'undefined'? obj.datosCliente : null; 
                
                if (cliente != null) {
                    console.log("INFORMACION CLIENTE ",cliente);
                     
                    const  ubicacion_cliente = cliente.ubicacion_cliente;
                    console.log("ubicacion cliente ",ubicacion_cliente)
                    if(ubicacion_cliente != null && typeof ubicacion_cliente !== 'undefined'){
                        xml += '<Receptor>';
                        xml += `<Nombre>${cliente.cliente_nombre}</Nombre>`;
                        xml += `<Identificacion>
                                <Tipo>${cliente.cliente_tipo_identificacion}</Tipo>
                                <Numero>${cliente.cedula_cliente}</Numero>
                            </Identificacion>`;
    
                        if (cliente.identificacion_extranjero != null && cliente.identificacion_extranjero.length > 0) {
                            xml += `<IdentificacionExtranjero>${cliente.identificacion_extranjero}</IdentificacionExtranjero>`;
                        }
    
                        if (cliente.cliente_nombre_comercial != null && cliente.cliente_nombre_comercial.length > 0) {
                            xml += `<NombreComercial>${cliente.cliente_nombre_comercial}</NombreComercial>`;
                        }
    
                        xml += `<Ubicacion>
                                    <Provincia>${ubicacion_cliente.provincia.trim()}</Provincia>
                                    <Canton>${ubicacion_cliente.canton.trim()}</Canton>
                                    <Distrito>${ubicacion_cliente.distrito.trim()}</Distrito>
                                    <Barrio>Central</Barrio>
                                    <OtrasSenas>${cliente.otras_senas}</OtrasSenas>
                                </Ubicacion>`;
    
                        if (cliente.otras_senas_extranjero != null && cliente.otras_senas_extranjero.length > 0) {
                            xml += `<OtrasSenasExtranjero>${cliente.otras_senas_extranjero}</OtrasSenasExtranjero>`;
                        }
    
                        if (cliente.cliente_telefono_numtelefono != null && cliente.cliente_telefono_numtelefono.length > 0) {
                            xml += `<Telefono>
                                            <CodigoPais>${cliente.cliente_telefono_codigopais}</CodigoPais>
                                            <NumTelefono>${cliente.cliente_telefono_numtelefono}</NumTelefono>
                                        </Telefono>`;
                        }
    
                        if (cliente.cliente_fax_codigopais != null && cliente.cliente_fax_numtelefono > 0) {
                            xml += `<Fax>
                                        <CodigoPais>${cliente.cliente_fax_codigopais}</CodigoPais>
                                        <NumTelefono>${cliente.cliente_fax_numtelefono}</NumTelefono>
                                    </Fax>`;
                        }
    
                        xml += `<CorreoElectronico>${cliente.cliente_correo}</CorreoElectronico></Receptor>`;
                    }
                }
    
                xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;
                //if (obj.plazo_credito  && obj.plazo_credito > 0) {//CAMBIO SYN
                if (obj.plazo_credito) {
                    xml += `<PlazoCredito>${obj.plazo_credito}</PlazoCredito>`;
                }else{
                    if (obj.condicion_venta == '02'){
                        let plazo=0;
                        xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                    }
                }
    
                //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                xml += `<DetalleServicio>`;
                let indice = 1;
                let montofabrica=0;
                let codigoTarifa  = 0;
                let Tarifa  = 0;
                let monto = 0;
                let tc=1;
                let acumulados= {};
                let sumaserviciosgr=0.00;
                let sumaserviciosex=0.00;
                let sumamercanciagr=0.00;
                let sumamercanciaex=0.00;
                let matrizTarifas = ({
                    codigoTarifa: '',
                    total:0.00
                  });
                for (const detalle in ordenes) {
    
                    let codigoProducto = ordenes[detalle].codigobarra_producto;
                    let existeCodigoCabys = false;
                    let codigoCabys = '';
    
                    if(ordenes[detalle].codigoCabys){
    
                        if(ordenes[detalle].codigoCabys.length > 13){
                            codigoCabys=ordenes[detalle].codigoCabys.substring(0,13);
                            existeCodigoCabys = true;
                        } else {
                            codigoCabys=ordenes[detalle].codigoCabys
                            existeCodigoCabys = true;
                            //CAMBIO SYN V4.4
                            if (codigoCabys.substring(0,1) >4 ){
                                if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumaserviciosgr+=parseFloat(ordenes[detalle].montototal);
                                }else{
                                   sumaserviciosex+=parseFloat(ordenes[detalle].montototal);
                                }
                              
                            }else{
                               if(ordenes[detalle].impuesto_neto > 0 ){
                                   sumamercanciagr+=parseFloat(ordenes[detalle].montototal);
                               }else{
                                   sumamercanciaex+=parseFloat(ordenes[detalle].montototal);
                               }
                            }
                        }                    
                    }
    
                    if(codigoProducto){
                        if(codigoProducto.length > 13){
                            codigoProducto = codigoProducto.substring(0,13);
                        } else {
                            codigoProducto = codigoProducto;
                        }
                    }
    
                 //   if (ordenes[detalle].unidadMedida != null || typeof ordenes[detalle].unidadMedida !== 'undefined') {
                    xml += `<LineaDetalle>
                    <NumeroLinea>${indice}</NumeroLinea>
                    ${existeCodigoCabys == true ? `<CodigoCABYS>${codigoCabys}</CodigoCABYS>`:`<Codigo/>`}`;
            

                    //cambio por rechazo <Tipo>04</Tipo> 
                     if (ordenes[detalle].tipo_servicio != null) { //cambio 4.4 tipo_codigo_servicio
                        xml += `<CodigoComercial>
                            <Tipo>${ordenes[detalle].tipo_servicio}</Tipo> 
                            <Codigo>${codigoProducto}</Codigo>
                            </CodigoComercial>`;
                        }

                        xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                        <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;
    
                       /* if (ordenes[detalle].unidadMedidaComercial != null) {
                            xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                        }*/
    
                        xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                            <PrecioUnitario>${parseFloat(ordenes[detalle].precio_linea).toFixed(2)}</PrecioUnitario>
                            <MontoTotal>${parseFloat(ordenes[detalle].montototal).toFixed(2)}</MontoTotal>`;
    
                        if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                            xml += `<Descuento>
                                <MontoDescuento>${parseFloat(ordenes[detalle].montodescuento).toFixed(2)}</MontoDescuento>
                                <NaturalezaDescuento>${ ordenes[detalle].naturalezadescuento == null || ordenes[detalle].naturalezadescuento.length == 0  ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                            </Descuento>`;
                        }
    
                        xml += `<SubTotal>${parseFloat(ordenes[detalle].subtotal).toFixed(2)}</SubTotal>`;
    
                        /*if (ordenes[detalle].baseimponible != null || ordenes[detalle].baseimponible > 0) {
                            xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                        }*/
                        if (ordenes[detalle].baseimponible == 0) {
                            xml += `<BaseImponible>${ordenes[detalle].subtotal}</BaseImponible>`;
                        }else{
                            xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                        }
                        if (ordenes[detalle].monto > 0) {
    

                            /*acumula en matriz los codigos de tarifa y monto*/
                            codigoTarifa  = ordenes[detalle].codigo_tarifa;
                            monto = parseFloat(ordenes[detalle].impuesto_neto);
                            
                                if (!acumulados[codigoTarifa]) {
                                    acumulados[codigoTarifa] = 0;
                                }
                                acumulados[codigoTarifa] += monto;
                                console.log('Acumulados',acumulados)

                                matrizTarifas = Object.entries(acumulados).map(([codigoTarifa, total]) => ({
                                    codigoTarifa,
                                    total
                                }));

                                console.log('Matriz resultante:', matrizTarifas); 

                             /* fin de acumula tarifas */

                            Tarifa= parseInt(ordenes[detalle].tarifa);
                            //cambio 4.4
                            xml += `<Impuesto>
                                <Codigo>${ordenes[detalle].codigo}</Codigo>
                                <CodigoTarifaIVA>${ordenes[detalle].codigo_tarifa}</CodigoTarifaIVA>
                                <Tarifa>${Tarifa}</Tarifa>`;
    
    
                            if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                                xml += `<FactorIVA>${ordenes[detalle].factorIVA.toFixed(2)}</FactorIVA>`;
                            }
    
                            xml += `<Monto>${parseFloat(ordenes[detalle].monto).toFixed(2)}</Monto>`;
                        }
    
                        if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                            xml += `<Exoneracion>
                                    <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                    <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                    <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                    <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                    <PorcentajeExoneracion>${Number(ordenes[detalle].PorcentajeExonerado).toFixed(0)}</PorcentajeExoneracion>
                                    <MontoExoneracion>${parseFloat(ordenes[detalle].MontoExoneracion).toFixed(2)}</MontoExoneracion>
                                </Exoneracion></Impuesto>`;
    
                            xml += `<ImpuestoNeto>${parseFloat(ordenes[detalle].impuesto_neto).toFixed(2)}</ImpuestoNeto>`;
                        } else {
                            xml += `</Impuesto>`;
                        }
                        /*CAMBIOS 4.4 SE impuesto emisor fabric */
                        xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                        xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                        xml += `<MontoTotalLinea>${parseFloat(ordenes[detalle].montoitotallinea).toFixed(2)}</MontoTotalLinea></LineaDetalle>`;
                    //}
                    indice++;
                };
                xml += `</DetalleServicio>`;
    
                /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                        detalle.otrosCargos.forEach(cargo => {
                            
                        })
                    }*/
                if(Number(obj.TotalOtrosCargos) > 0) {
                    const porcentajeOtrosCargos = Number(obj.totalventa) / Number(obj.TotalOtrosCargos);
                    xml += ` <OtrosCargos>
                    <TipoDocumentoOC>06</TipoDocumentoOC>
                    <Detalle>Servicio Restaurante</Detalle>
                    <PorcentajeOC>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</PorcentajeOC>
                    <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                    </OtrosCargos>`;
                }
    
                xml += `<ResumenFactura>`;
                ///cambio 4.4
                if (obj.codigomoneda == 'CRC'){
                    tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio>
                        </CodigoTipoMoneda>`;
                //CAMBIO SYN V4.4        
                /*
                xml += `<TotalServGravados>${parseFloat(obj.totalservgravados).toFixed(2)}</TotalServGravados>
                        <TotalServExentos>${parseFloat(obj.totalservexentos).toFixed(2)}</TotalServExentos>
                        <TotalServExonerado>${parseFloat(obj.totalservexonerado).toFixed(2)}</TotalServExonerado>
                        <TotalMercanciasGravadas>${parseFloat(obj.totalmercanciasgravadas).toFixed(2)}</TotalMercanciasGravadas>
                        <TotalMercanciasExentas>${parseFloat(obj.totalmercanciasexentas).toFixed(2)}</TotalMercanciasExentas>
                        <TotalMercExonerada>${parseFloat(obj.totalmercanciaexonerada).toFixed(2)}</TotalMercExonerada>
                        <TotalGravado>${parseFloat(obj.totalgravado).toFixed(2)}</TotalGravado>
                        <TotalExento>${parseFloat(obj.totalexento).toFixed(2)}</TotalExento>
                        <TotalExonerado>${parseFloat(obj.totalexonerado).toFixed(2)}</TotalExonerado>
                        <TotalVenta>${parseFloat(obj.totalventa).toFixed(2)}</TotalVenta>
                        <TotalDescuentos>${parseFloat(obj.totaldescuentos).toFixed(2)}</TotalDescuentos>
                        <TotalVentaNeta>${parseFloat(obj.totalventaneta).toFixed(2)}</TotalVentaNeta>`;*/

                        let tgravado=sumamercanciagr+sumaserviciosgr;
                        tgravado=tgravadoto.toFixed(4);
                        let texento=sumamercanciaex+sumaserviciosex;
                        texento=texento.toFixed(4);
                        sumamercanciaex= sumamercanciaex.toFixed(4);
                        sumamercanciagr= sumamercanciagr.toFixed(4);
                        sumaserviciosex=sumaserviciosex.toFixed(4);
                        sumaserviciosgr=sumaserviciosgr.toFixed(4);
                        xml += `<TotalServGravados>${sumaserviciosgr}</TotalServGravados>
                        <TotalServExentos>${sumamercanciaex}</TotalServExentos>
                        <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                        <TotalMercanciasGravadas>${sumamercanciagr}</TotalMercanciasGravadas>
                        <TotalMercanciasExentas>${sumamercanciaex}</TotalMercanciasExentas>
                        <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                        <TotalGravado>${tgravado}</TotalGravado>
                        <TotalExento>${texento}</TotalExento>
                        <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                        <TotalVenta>${obj.totalventa}</TotalVenta>
                        <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                        <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>`;         
                        


                //SE AGREGA version 4.4  IVa en codigotarifas matrizTarifas
                matrizTarifas.forEach(({ codigoTarifa, total }) => {
                    let montoiva=parseFloat(total);
                    montoiva=montoiva.toFixed(4);      
                    //console.log(`Código: ${codigoTarifa}`);
                    //console.log(`Total: ${total}`);
                    xml += `<TotalDesgloseImpuesto>`;
                    xml += `<Codigo>01</Codigo>`;
                    xml += `<CodigoTarifaIVA>${codigoTarifa}</CodigoTarifaIVA>`;
                    xml += `<TotalMontoImpuesto>${montoiva}</TotalMontoImpuesto>`;
                    xml += `</TotalDesgloseImpuesto>`;

                  });
                      
    
                if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                    xml += `<TotalIVADevuelto>${parseFloat(obj.totalIVADevuelto).toFixed(2)}</TotalIVADevuelto>`;
                }

                //SE AGREGA version 4.4  
                xml += `<TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;
                xml += `<TotalImpAsumEmisorFabrica>${montofabrica}</TotalImpAsumEmisorFabrica>`;

                if(Number(obj.TotalOtrosCargos)  > 0) { //cambia posicion en 4.4
                    xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
                }
                //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`;
                xml += `<MedioPago>
                <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                </MedioPago>`;
                //fin agrega versiob 4.4


                xml += `<TotalComprobante>${parseFloat(obj.totalcomprobante).toFixed(2)}</TotalComprobante>`;
                xml += `</ResumenFactura>`;
    
                //AQUI ES DONDE SE APLICA LA PARTE DE LA REFERENCIA A LA FACTURA
    
                xml += `<InformacionReferencia>
                            <TipoDocIR>${obj.tipoDocReferencia}</TipoDocIR>  
                            <Numero>${obj.numeroReferencia}</Numero>
                            <FechaEmisionIR>${obj.fecha_emision}</FechaEmisionIR>
                            <Codigo>${obj.codigo}</Codigo>
                            <Razon>${obj.razon}</Razon>
                        </InformacionReferencia>`;
    
                //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
               
                /*
                    TipoDoc es el tipo de documento de referencia es decir la factura que se va anular
                    NUmero es la clave numerica de referencia
                    fechaEmision es la fecha de la nota de credito,
                    Codigo es el codigo de tipo de nota credito que se va aplicar 
                    razon es la razon del porque se aplica la nota
                */
    
                xml += `</NotaCreditoElectronica>`;
                console.log(xml);
    
                firmarXML(xml, llave, clave).then(xmlSigned => {
                        const objFirma = {
                            id: idfactura,
                            xml: xmlSigned,
                            tipo_factura: tipoComprobante
                        }
                        Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                            .then(data => {
    
                                const root = path.resolve(__dirname);
                                const objetoXML = {
                                    comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                    path: root + '/../xml/' + obj.clavenumerica + '.xml'
                                }
    
    
                                console.log("objetoXML", objetoXML);
                                facturaFunciones.generarArchivoXML(objetoXML)
                                    .then(xmlCreado => {
                                        
                                        console.log("respuests archivo creado ", xmlCreado);
                                        
                                        resolve(xmlSigned);
                                    })
                                    .catch(err => console.error(err));
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
    
            } else {
                reject("No se pudo obtener la informacion de la nota de crédito");
            }
        } catch (error) {
            console.log(error);
            reject('Error al obtener el tipo de cambio');
        }
    
    })
}


const genMensajeRecepcionXML = (obj, llave, clave, idfactura, tipoComprobante) => {
    return new Promise((resolve,reject) => {

        let descripcionEstado = '';
        let impuesto = 0, montoAplicable = 0;
        
        if(obj.status_factura == '1') descripcionEstado = 'Aprobado';
        if(obj.status_factura == '2') descripcionEstado = 'Aprobado Parcial';
        if(obj.status_factura == '3') descripcionEstado = 'Rechazado';
            
        if(obj.codicion_impuesto == '04'){ // ES GASTO
            impuesto = 0;
            montoAplicable = Number(obj.totalimpuesto).toFixed(2);
        } else { // NO ES UN GASTO
            impuesto =  Number(obj.totalimpuesto).toFixed(2);
            montoAplicable = 0;
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?><MensajeReceptor xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/mensajeReceptor"><Clave>${obj.clavenumerica}</Clave><NumeroCedulaEmisor>${obj.cedula_proveedor}</NumeroCedulaEmisor><FechaEmisionDoc>${obj.fecha_factura}</FechaEmisionDoc><Mensaje>${obj.status_factura}</Mensaje><DetalleMensaje>${descripcionEstado}</DetalleMensaje><MontoTotalImpuesto>${impuesto}</MontoTotalImpuesto><CodigoActividad>${obj.codigo_actividad}</CodigoActividad><CondicionImpuesto>${obj.codicion_impuesto}</CondicionImpuesto><MontoTotalImpuestoAcreditar>${impuesto}</MontoTotalImpuestoAcreditar><MontoTotalDeGastoAplicable>${montoAplicable}</MontoTotalDeGastoAplicable><TotalFactura>${Number(obj.totalcomprobante).toFixed(2)}</TotalFactura><NumeroCedulaReceptor>${obj.cedula_emisor}</NumeroCedulaReceptor><NumeroConsecutivoReceptor>${obj.consecutivo}</NumeroConsecutivoReceptor></MensajeReceptor>`;
        
        console.log("GENERADO",xml);
        firmarXML(xml, llave, clave).then(xmlSigned => {
           
            const objFirma = {
                id: idfactura,
                xml: xmlSigned,
                tipo_factura: tipoComprobante
            }
            console.log(objFirma);
            Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                .then(data => {
                    resolve(xmlSigned);
                    
            }).catch(err => reject(err));

        }).catch(err => {
            console.log(err);
            reject(err)});
    })
}


/*
    const fechaTipoCambio = obj.fecha_factura.substr(0,10);
    const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
*/
const genXMLFacturaCompra = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => {
    return new Promise( async (resolve, reject) => {
        
        try {

        /*
            El proveedor va ser el emisor de la factura 
            El emisor actual desistema va ser el receptor de la factura
        */
        
        let xml = '';

        const fechaTipoCambio = obj.fecha_factura.substr(0,10);
        const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
        const CodigoActividadReceptor = "552004";
        const proveedor_sistemas= "3101335356";
        xml = `<?xml version="1.0" encoding="utf-8"?>
                <FacturaElectronicaCompra xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronicaCompra" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
        xml += `<Clave>${obj.clavenumerica}</Clave>
                <ProveedorSistemas>${proveedor_sistemas}</ProveedorSistemas>
                <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>
                <CodigoActividadReceptor>${CodigoActividadReceptor}</CodigoActividadReceptor>
                <NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                <FechaEmision>${obj.fecha_factura}</FechaEmision>
                <Emisor>
                    <Nombre>${obj.proveedor_nombre}</Nombre>
                    <Identificacion>
                        <Tipo>${obj.proveedor_tipo_identificacion}</Tipo>
                        <Numero>${obj.cedula_proveedor}</Numero>
                    </Identificacion>`;

        if (obj.proveedor_nombre_comercial != null && obj.proveedor_nombre_comercial.length > 0) {
            xml += `<NombreComercial>${obj.proveedor_nombre_comercial}</NombreComercial>`;
        }

        const ubicacion_proveedor = obj.ubicacion_proveedor;
        const barrio = "Central";
        
        xml += `<Ubicacion>
                        <Provincia>${ubicacion_proveedor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_proveedor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_proveedor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!obj.otras_senas ||obj.otras_senas == ''? 'ND': obj.otras_senas }</OtrasSenas>
                    </Ubicacion>`;

        if (obj.proveedor_telefono_codigopais != null && obj.proveedor_telefono_codigopais.length > 0) {
            xml += `<Telefono>
                        <CodigoPais>${obj.proveedor_telefono_codigopais}</CodigoPais>
                        <NumTelefono>${obj.proveedor_telefono_numtelefono}</NumTelefono>
                    </Telefono>`;
        }

        /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
            xml += `<Fax>
                        <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                        <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                    </Fax>`;
        }*/

        xml += `<CorreoElectronico>${obj.proveedor_correo}</CorreoElectronico></Emisor>`;


        const cliente = obj; 
        
        if (cliente.cedula_emisor) {
            const ubicacion_emisor = cliente.ubicacion_emisor;
            //INFORMACION DEL CLIENTE
            console.log("UBicacion cliente ", ubicacion_emisor);
            xml += '<Receptor>';
            xml += `<Nombre>${cliente.emisor_nombre}</Nombre>`;
            xml += `<Identificacion>
                        <Tipo>${cliente.emisor_tipo_identificacion}</Tipo>
                        <Numero>${cliente.cedula_emisor}</Numero>
                    </Identificacion>`;

            /*if (cliente.identificacion_extranjero != null && cliente.identificacion_extranjero.length > 0) {
                xml += `<IdentificacionExtranjero>${cliente.identificacion_extranjero}</IdentificacionExtranjero>`;
            }*/

            if (cliente.emisor_nombrecomercial != null && cliente.emisor_nombrecomercial.length > 0) {
                xml += `<NombreComercial>${cliente.emisor_nombrecomercial}</NombreComercial>`;
            }

            xml += `<Ubicacion>
                        <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!cliente.emisor_otras_senas ||cliente.emisor_otras_senas == ''? 'ND': cliente.emisor_otras_senas}</OtrasSenas>
                    </Ubicacion>`;

            /*if (cliente.otras_senas_extranjero != null && cliente.otras_senas_extranjero.length > 0) {
                xml += `<OtrasSenasExtranjero>${cliente.otras_senas_extranjero}</OtrasSenasExtranjero>`;
            }*/

            if (cliente.emisor_telefono_numtelefono != null && cliente.emisor_telefono_numtelefono.length > 0) {
                xml += `<Telefono>
                                    <CodigoPais>${cliente.emisor_telefono_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_telefono_numtelefono}</NumTelefono>
                                </Telefono>`;
            }

            if (cliente.emisor_fax_numtelefono != null && cliente.emisor_fax_numtelefono > 0) {
                xml += `<Fax>
                                    <CodigoPais>${cliente.emisor_fax_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_fax_numtelefono}</NumTelefono>
                                </Fax>`;
            }

            xml += `<CorreoElectronico>${cliente.emisor_correo}</CorreoElectronico></Receptor>`;
            //--------------------------------
            xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;

            //if (obj.plazo_credito  && obj.plazo_credito > 0) {//CAMBIO SYN
            if (obj.plazo_credito) {
                xml += `<PlazoCredito>${obj.plazo_credito}</PlazoCredito>`;
            }else{
                if (obj.condicion_venta == '02'){
                    let plazo=0;
                    xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                }
            }

            //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`; // Cambio 4.4
            xml += `<DetalleServicio>`;
            let indice = 1;
            let montofabrica=0;
            let tc=1;
            for (const detalle in ordenes) {


                xml += `<LineaDetalle>
                        <NumeroLinea>${indice}</NumeroLinea>
                        <CodigoCABYS>${(ordenes[detalle].codigoCabys.length > 13)? ordenes[detalle].codigoCabys.substring(0,13):ordenes[detalle].codigoCabys}</CodigoCABYS>`;

                if (ordenes[detalle].tipo_codigo_servicio != null) {
                    xml += `<CodigoComercial>
                            <Tipo>${ordenes[detalle].tipo_codigo_servicio}</Tipo>
                            <Codigo>${(ordenes[detalle].codigobarra_producto.length > 13)? ordenes[detalle].codigobarra_producto.substring(0,13):ordenes[detalle].codigobarra_producto}</Codigo>
                        </CodigoComercial>`;
                }

                xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                    <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;

                if (ordenes[detalle].unidadMedidaComercial != null) {
                    xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                }

                xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                        <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                        <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;

                if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                    xml += `<Descuento>
                            <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                            <NaturalezaDescuento>${ordenes[detalle].naturalezadescuento.length == 0 || ordenes[detalle].naturalezadescuento == null ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                        </Descuento>`;
                }

                xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;

                if (ordenes[detalle].baseimponible != null || ordenes[detalle].baseimponible > 0) {
                    xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                } 

                //if (ordenes[detalle].monto > 0) { // cambio 4.4

                    xml += `<Impuesto>
                            <Codigo>${ordenes[detalle].codigo}</Codigo>
                            <CodigoTarifaIVA>10</CodigoTarifaIVA>
                        <Tarifa>${ordenes[detalle].tarifa}</Tarifa>`;


                    if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                        xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                    }

                    xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
                    
                    ///cambio 4.4
                    xml += `</Impuesto>`;

              //  } //50625032000010832073300100001030000000023181635427 NOTA RECHAZADA

                /* if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                    xml += `<Exoneracion>
                                <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                <PorcentajeExoneracion>${obj.datosCliente.PorcentajeExoneracion}</PorcentajeExoneracion>
                                <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                            </Exoneracion></Impuesto>`;

                    xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                } {
                    xml += `</Impuesto>`;
                }*/

                /*CAMBIOS 4.4 SE impuesto emisor fabric */
                //xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                indice++;
            };

            xml += `</DetalleServicio>`;

            /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                    detalle.otrosCargos.forEach(cargo => {
                        
                    })
                }*/

            if(obj.TotalOtrosCargos > 0) {
                const porcentajeOtrosCargos = Number(obj.totalventaneta) / Number(obj.TotalOtrosCargos);
                xml += ` <OtrosCargos>
                            <TipoDocumento>06</TipoDocumento>
                            <Detalle>Servicio Restaurante</Detalle>
                            <Porcentaje>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</Porcentaje>
                            <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                        </OtrosCargos>`;
            }

            xml += `<ResumenFactura>`;
            /*xml += `<CodigoTipoMoneda>
                        <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                        <TipoCambio>${response[0].tipocambio}</TipoCambio>
                    </CodigoTipoMoneda>`;*/
                //cambio 4.4
                if (obj.codigomoneda == 'CRC'){
                        tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio>
                        </CodigoTipoMoneda>`;

            xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                    <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                    <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                    <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                    <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                    <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                    <TotalGravado>${obj.totalgravado}</TotalGravado>
                    <TotalExento>${obj.totalexento}</TotalExento>
                    <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                    <TotalVenta>${obj.totalventa}</TotalVenta>
                    <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                    <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>
                    <TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;

            if(obj.TotalOtrosCargos > 0) {
                xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
            }

            if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
            }
            // cambio 4.4
            xml += `<MedioPago>
                 <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                 <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                 </MedioPago>`;
                 //fin agrega version 4.4
            xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
            xml += `</ResumenFactura>`;
            
            /*AQUI ES DONDE SE APLICA LA PARTE DE LA REFERENCIA A LA FACTURA cambio 4.4
             */
    
           xml += `<InformacionReferencia>
                    <TipoDocIR>16</TipoDocIR>
                    <Numero>${obj.clavenumerica}</Numero>
                    <FechaEmisionIR>${obj.fecha_factura}</FechaEmisionIR>
                    <Codigo>11</Codigo>
                    <Razon>Factura de Compra Electronica</Razon>
                </InformacionReferencia>`;


            //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
            xml += `</FacturaElectronicaCompra>`;
          
            firmarXML(xml, llave, clave).then(xmlSigned => {
                    const objFirma = {
                        id: idfactura,
                        xml: xmlSigned,
                        tipo_factura: tipoComprobante
                    }
                    Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                        .then(data => {

                            const root = path.resolve(__dirname);
                            const objetoXML = {
                                comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                path: root + '/../xml/' + obj.clavenumerica + '.xml'
                            }


                            console.log("objetoXML", objetoXML);
                            facturaFunciones.generarArchivoXML(objetoXML)
                                .then(xmlCreado => {

                                    
                                    console.log("respuests archivo creado ", xmlCreado);
                                    
                                    resolve(xmlSigned);
                                })
                                .catch(err => console.error(err));
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        } else {
            return reject("No se pudo obtener la informacion del cliente");
        }
        } catch (error) {
            console.log(error);
            reject('Error al obtener el tipo de cambio');
        }
    })
}


const genXMLFacturaCompraReemplazo = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => {

    return new Promise( async (resolve, reject) => {
        
        try {

        /*
            El proveedor va ser el emisor de la factura 
            El emisor actual desistema va ser el receptor de la factura
        */
        
        let xml = '';

        const fechaTipoCambio = obj.fecha_factura.substr(0,10);
        const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
        const CodigoActividadReceptor = "552004";
        const proveedor_sistemas= "3101335356";
        const barrio = "Central";

        xml = `<?xml version="1.0" encoding="utf-8"?>
                <FacturaElectronicaCompra xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronicaCompra" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
        xml += `<Clave>${obj.clavenumerica}</Clave>
                <ProveedorSistemas>${proveedor_sistemas}</ProveedorSistemas>
                <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>
                <CodigoActividadReceptor>${CodigoActividadReceptor}</CodigoActividadReceptor>
                <NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                <FechaEmision>${obj.fecha_factura}</FechaEmision>
                <Emisor>
                    <Nombre>${obj.proveedor_nombre}</Nombre>
                    <Identificacion>
                        <Tipo>${obj.proveedor_tipo_identificacion}</Tipo>
                        <Numero>${obj.cedula_proveedor}</Numero>
                    </Identificacion>`;

        if (obj.proveedor_nombre_comercial != null && obj.proveedor_nombre_comercial.length > 0) {
            xml += `<NombreComercial>${obj.proveedor_nombre_comercial}</NombreComercial>`;
        }

        const ubicacion_proveedor = obj.ubicacion_proveedor;
        
        xml += `<Ubicacion>
                        <Provincia>${ubicacion_proveedor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_proveedor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_proveedor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!obj.otras_senas ||obj.otras_senas == ''? 'ND': obj.otras_senas }</OtrasSenas>
                    </Ubicacion>`;

        if (obj.proveedor_telefono_codigopais != null && obj.proveedor_telefono_codigopais.length > 0) {
            xml += `<Telefono>
                        <CodigoPais>${obj.proveedor_telefono_codigopais}</CodigoPais>
                        <NumTelefono>${obj.proveedor_telefono_numtelefono}</NumTelefono>
                    </Telefono>`;
        }

        /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
            xml += `<Fax>
                        <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                        <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                    </Fax>`;
        }*/

        xml += `<CorreoElectronico>${obj.proveedor_correo}</CorreoElectronico></Emisor>`;


        const cliente = obj; 
        
        if (cliente.cedula_emisor) {
            const ubicacion_emisor = cliente.ubicacion_emisor;
            //INFORMACION DEL CLIENTE
            console.log("UBicacion cliente ", ubicacion_emisor);
            xml += '<Receptor>';
            xml += `<Nombre>${cliente.emisor_nombre}</Nombre>`;
            xml += `<Identificacion>
                        <Tipo>${cliente.emisor_tipo_identificacion}</Tipo>
                        <Numero>${cliente.cedula_emisor}</Numero>
                    </Identificacion>`;

            /*if (cliente.identificacion_extranjero != null && cliente.identificacion_extranjero.length > 0) {
                xml += `<IdentificacionExtranjero>${cliente.identificacion_extranjero}</IdentificacionExtranjero>`;
            }*/

            if (cliente.emisor_nombrecomercial != null && cliente.emisor_nombrecomercial.length > 0) {
                xml += `<NombreComercial>${cliente.emisor_nombrecomercial}</NombreComercial>`;
            }

            xml += `<Ubicacion>
                        <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!cliente.emisor_otras_senas || cliente.emisor_otras_senas == '' ? 'ND': cliente.emisor_otras_senas}</OtrasSenas>
                    </Ubicacion>`;

            /*if (cliente.otras_senas_extranjero != null && cliente.otras_senas_extranjero.length > 0) {
                xml += `<OtrasSenasExtranjero>${cliente.otras_senas_extranjero}</OtrasSenasExtranjero>`;
            }*/

            if (cliente.emisor_telefono_numtelefono != null && cliente.emisor_telefono_numtelefono.length > 0) {
                xml += `<Telefono>
                                    <CodigoPais>${cliente.emisor_telefono_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_telefono_numtelefono}</NumTelefono>
                                </Telefono>`;
            }

            if (cliente.emisor_fax_numtelefono != null && cliente.emisor_fax_numtelefono > 0) {
                xml += `<Fax>
                                    <CodigoPais>${cliente.emisor_fax_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_fax_numtelefono}</NumTelefono>
                                </Fax>`;
            }

            xml += `<CorreoElectronico>${cliente.emisor_correo}</CorreoElectronico></Receptor>`;
            //--------------------------------
            xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;

            //if (obj.plazo_credito != null && obj.plazo_credito > 0) {//CAMBIO SYN
            if (obj.plazo_credito) {
                xml += `<PlazoCredito>${obj.plazo_credito}</PlazoCredito>`;
            }else{
                if (obj.condicion_venta == '02'){
                    let plazo=0;
                    xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                }
            }

            //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`; // Cambio 4.4
            xml += `<DetalleServicio>`;
            let indice = 1;
            let montofabrica=0;
            let tc=1;
            for (const detalle in ordenes) {


                xml += `<LineaDetalle>
                        <NumeroLinea>${indice}</NumeroLinea>
                        <CodigoCABYS>${(ordenes[detalle].codigoCabys.length > 13)? ordenes[detalle].codigoCabys.substring(0,13):ordenes[detalle].codigoCabys}</CodigoCABYS>`;

                if (ordenes[detalle].tipo_codigo_servicio != null) {
                    xml += `<CodigoComercial>
                            <Tipo>${ordenes[detalle].tipo_codigo_servicio}</Tipo>
                            <Codigo>${(ordenes[detalle].codigobarra_producto.length > 13)? ordenes[detalle].codigobarra_producto.substring(0,13):ordenes[detalle].codigobarra_producto}</Codigo>
                        </CodigoComercial>`;
                }

                xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                    <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;

                if (ordenes[detalle].unidadMedidaComercial != null) {
                    xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                }

                xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                        <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                        <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;

                if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                    xml += `<Descuento>
                            <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                            <NaturalezaDescuento>${ordenes[detalle].naturalezadescuento.length == 0 || ordenes[detalle].naturalezadescuento == null ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                        </Descuento>`;
                }

                xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;

                if (ordenes[detalle].baseimponible != null || ordenes[detalle].baseimponible > 0) {
                    xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                }

               // if (ordenes[detalle].monto > 0) { // cambio 4.4

                    xml += `<Impuesto>
                            <Codigo>${ordenes[detalle].codigo}</Codigo>
                            <CodigoTarifaIVA>10</CodigoTarifaIVA> 
                        <Tarifa>${ordenes[detalle].tarifa}</Tarifa>`;


                    if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                        xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                    }

                    xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
                    
                    ///cambio 4.4
                    xml += `</Impuesto>`;

                //} //50625032000010832073300100001030000000023181635427 NOTA RECHAZADA

                /*if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                    xml += `<Exoneracion>
                                <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                <PorcentajeExoneracion>${obj.datosCliente.PorcentajeExoneracion}</PorcentajeExoneracion>
                                <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                            </Exoneracion></Impuesto>`;

                    xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                } {
                    xml += `</Impuesto>`;
                }*/
                 /*CAMBIOS 4.4 SE impuesto emisor fabric */
                //xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                indice++;
            };

            xml += `</DetalleServicio>`;

            /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                    detalle.otrosCargos.forEach(cargo => {
                        
                    })
                }*/

            if(obj.TotalOtrosCargos > 0) {
                const porcentajeOtrosCargos = Number(obj.totalventaneta) / Number(obj.TotalOtrosCargos);
                xml += ` <OtrosCargos>
                            <TipoDocumento>06</TipoDocumento>
                            <Detalle>Servicio Restaurante</Detalle>
                            <Porcentaje>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</Porcentaje>
                            <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                        </OtrosCargos>`;
            }

            xml += `<ResumenFactura>`;


            /*xml += `<CodigoTipoMoneda>
                        <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                        <TipoCambio>${response[0].tipocambio}</TipoCambio>
                    </CodigoTipoMoneda>`;*/

                    if (obj.codigomoneda == 'CRC'){
                        tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio>
                        </CodigoTipoMoneda>`;

            xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                    <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                    <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                    <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                    <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                    <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                    <TotalGravado>${obj.totalgravado}</TotalGravado>
                    <TotalExento>${obj.totalexento}</TotalExento>
                    <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                    <TotalVenta>${obj.totalventa}</TotalVenta>
                    <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                    <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>
                    <TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;

            if(obj.TotalOtrosCargos > 0) {
                xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
            }

            if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
            }

           // cambio 4.4
           xml += `<MedioPago>
                    <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
                    <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
                    </MedioPago>`;
           //fin agrega version 4.4
            xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
            xml += `</ResumenFactura>
            
                <InformacionReferencia>
                    <TipoDocIR>15</TipoDocIR>
                    <Numero>${obj.claveReferencia}</Numero>
                    <FechaEmisionIR>${obj.fechaReferencia}</FechaEmisionIR>
                    <Codigo>04</Codigo>
                    <Razon>Reemplaza Factura de Compra Electronica</Razon>
                </InformacionReferencia>`;

            //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
            xml += `</FacturaElectronicaCompra>`;
          
            firmarXML(xml, llave, clave).then(xmlSigned => {
                    const objFirma = {
                        id: idfactura,
                        xml: xmlSigned,
                        tipo_factura: tipoComprobante
                    }
                    console.log({
                        objFirma
                    })
                    Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                        .then(data => {

                            const root = path.resolve(__dirname);
                            const objetoXML = {
                                comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                path: root + '/../xml/' + obj.clavenumerica + '.xml'
                            }


                            console.log("objetoXML", objetoXML);
                            facturaFunciones.generarArchivoXML(objetoXML)
                                .then(xmlCreado => {

                                    
                                    console.log("respuests archivo creado ", xmlCreado);
                                    
                                    resolve(xmlSigned);
                                })
                                .catch(err => {
                                    console.log("Error al generar el archivo  el xml");
                                    reject(err)
                                });
                        })
                        .catch(err =>{
                            console.log("Error al guardar el xml");
                            reject(err)
                        });
                })
                .catch(err => reject(err));
        } else {
            return reject("No se pudo obtener la informacion del cliente");
        }
        } catch (error) {
            console.log(error);
            reject('Error al obtener el tipo de cambio');
        }
    })
}

const genXMLFacturaCompraAnular = (obj, ordenes, llave, clave, idfactura, tipoComprobante) => {

    return new Promise( async (resolve, reject) => {
        
        try {

        /*
            El proveedor va ser el emisor de la factura 
            El emisor actual desistema va ser el receptor de la factura
        */
        
        let xml = '';
        const CodigoActividadReceptor = "552004";
        const proveedor_sistemas= "3101335356";
        const barrio = "Central";

        const fechaTipoCambio = obj.fecha_factura.substr(0,10);
        const response = await tipoCambioController.obtenerTipoCambio(fechaTipoCambio);
        
        xml = `<?xml version="1.0" encoding="utf-8"?>
                <FacturaElectronicaCompra xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronicaCompra" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
        xml += `<Clave>${obj.clavenumerica}</Clave>
                <ProveedorSistemas>${proveedor_sistemas}</ProveedorSistemas>
                <CodigoActividadEmisor>${obj.codigo_actividad}</CodigoActividadEmisor>
                <CodigoActividadReceptor>${CodigoActividadReceptor}</CodigoActividadReceptor>
                <NumeroConsecutivo>${obj.consecutivo}</NumeroConsecutivo>
                <FechaEmision>${obj.fecha_factura}</FechaEmision>
                <Emisor>
                    <Nombre>${obj.proveedor_nombre}</Nombre>
                    <Identificacion>
                        <Tipo>${obj.proveedor_tipo_identificacion}</Tipo>
                        <Numero>${obj.cedula_proveedor}</Numero>
                    </Identificacion>`;

        if (obj.proveedor_nombre_comercial != null && obj.proveedor_nombre_comercial.length > 0) {
            xml += `<NombreComercial>${obj.proveedor_nombre_comercial}</NombreComercial>`;
        }

        const ubicacion_proveedor = obj.ubicacion_proveedor;
        
        xml += `<Ubicacion>
                        <Provincia>${ubicacion_proveedor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_proveedor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_proveedor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!obj.otras_senas ||obj.otras_senas == ''? 'ND': obj.otras_senas }</OtrasSenas>
                    </Ubicacion>`;

        if (obj.proveedor_telefono_codigopais != null && obj.proveedor_telefono_codigopais.length > 0) {
            xml += `<Telefono>
                        <CodigoPais>${obj.proveedor_telefono_codigopais}</CodigoPais>
                        <NumTelefono>${obj.proveedor_telefono_numtelefono}</NumTelefono>
                    </Telefono>`;
        }

        /*if (obj.emisor_fax_codigopais != null && obj.emisor_fax_codigopais.length > 0) {
            xml += `<Fax>
                        <CodigoPais>${obj.emisor_fax_codigopais}</CodigoPais>
                        <NumTelefono>${obj.emisor_fax_numtelefono}</NumTelefono>
                    </Fax>`;
        }*/

        xml += `<CorreoElectronico>${obj.proveedor_correo}</CorreoElectronico></Emisor>`;


        const cliente = obj; 
        
        if (cliente.cedula_emisor) {
            const ubicacion_emisor = cliente.ubicacion_emisor;
            //INFORMACION DEL CLIENTE
            console.log("UBicacion cliente ", ubicacion_emisor);
            xml += '<Receptor>';
            xml += `<Nombre>${cliente.emisor_nombre}</Nombre>`;
            xml += `<Identificacion>
                        <Tipo>${cliente.emisor_tipo_identificacion}</Tipo>
                        <Numero>${cliente.cedula_emisor}</Numero>
                    </Identificacion>`;

            /*if (cliente.identificacion_extranjero != null && cliente.identificacion_extranjero.length > 0) {
                xml += `<IdentificacionExtranjero>${cliente.identificacion_extranjero}</IdentificacionExtranjero>`;
            }*/

            if (cliente.emisor_nombrecomercial != null && cliente.emisor_nombrecomercial.length > 0) {
                xml += `<NombreComercial>${cliente.emisor_nombrecomercial}</NombreComercial>`;
            }

            xml += `<Ubicacion>
                        <Provincia>${ubicacion_emisor.provincia.trim()}</Provincia>
                        <Canton>${ubicacion_emisor.canton.trim()}</Canton>
                        <Distrito>${ubicacion_emisor.distrito.trim()}</Distrito>
                        <Barrio>${barrio}</Barrio>
                        <OtrasSenas>${!cliente.emisor_otras_senas || cliente.emisor_otras_senas == '' ? 'ND': cliente.emisor_otras_senas}</OtrasSenas>
                    </Ubicacion>`;

            /*if (cliente.otras_senas_extranjero != null && cliente.otras_senas_extranjero.length > 0) {
                xml += `<OtrasSenasExtranjero>${cliente.otras_senas_extranjero}</OtrasSenasExtranjero>`;
            }*/

            if (cliente.emisor_telefono_numtelefono != null && cliente.emisor_telefono_numtelefono.length > 0) {
                xml += `<Telefono>
                                    <CodigoPais>${cliente.emisor_telefono_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_telefono_numtelefono}</NumTelefono>
                                </Telefono>`;
            }

            if (cliente.emisor_fax_numtelefono != null && cliente.emisor_fax_numtelefono > 0) {
                xml += `<Fax>
                                    <CodigoPais>${cliente.emisor_fax_codigopais}</CodigoPais>
                                    <NumTelefono>${cliente.emisor_fax_numtelefono}</NumTelefono>
                                </Fax>`;
            }

            xml += `<CorreoElectronico>${cliente.emisor_correo}</CorreoElectronico></Receptor>`;
            //--------------------------------
            xml += `<CondicionVenta>${obj.condicion_venta}</CondicionVenta>`;

            //if (obj.plazo_credito != null && obj.plazo_credito > 0) {//CAMBIO SYN
            if (obj.plazo_credito ) {
                xml += `<PlazoCredito>${obj.plazo_credito}</PlazoCredito>`;
            }else{
                if (obj.condicion_venta == '02'){
                    let plazo=0;
                    xml += `<PlazoCredito>${plazo}</PlazoCredito>`;
                }
            }

            //xml += `<MedioPago>${obj.medio_pago}</MedioPago>`; // Cambio 4.4
            xml += `<DetalleServicio>`;
            let indice = 1;
            let montofabrica=0;
            let tc=1;

            for (const detalle in ordenes) {


                xml += `<LineaDetalle>
                        <NumeroLinea>${indice}</NumeroLinea>
                        <CodigoCABYS>${(ordenes[detalle].codigoCabys.length > 13)? ordenes[detalle].codigoCabys.substring(0,13):ordenes[detalle].codigoCabys}</CodigoCABYS>`;

                if (ordenes[detalle].tipo_codigo_servicio != null) {
                    xml += `<CodigoComercial>
                            <Tipo>${ordenes[detalle].tipo_codigo_servicio}</Tipo>
                            <Codigo>${(ordenes[detalle].codigobarra_producto.length > 13)? ordenes[detalle].codigobarra_producto.substring(0,13):ordenes[detalle].codigobarra_producto}</Codigo>
                        </CodigoComercial>`;
                }

                xml += `<Cantidad>${ordenes[detalle].cantidad}</Cantidad>
                    <UnidadMedida>${ordenes[detalle].unidadMedida}</UnidadMedida>`;

                if (ordenes[detalle].unidadMedidaComercial != null) {
                    xml += `<UnidadMedidaComercial>${ordenes[detalle].unidadMedidaComercial}</UnidadMedidaComercial>`;
                }

                xml += `<Detalle>${ordenes[detalle].descripcioDetalle}</Detalle>
                        <PrecioUnitario>${ordenes[detalle].precio_linea}</PrecioUnitario>
                        <MontoTotal>${ordenes[detalle].montototal}</MontoTotal>`;

                if (ordenes[detalle].montodescuento != null && ordenes[detalle].montodescuento > 0) {
                    xml += `<Descuento>
                            <MontoDescuento>${ordenes[detalle].montodescuento}</MontoDescuento>
                            <NaturalezaDescuento>${ordenes[detalle].naturalezadescuento.length == 0 || ordenes[detalle].naturalezadescuento == null ?'Descuento Aplicado':ordenes[detalle].naturalezadescuento}</NaturalezaDescuento>
                        </Descuento>`;
                }

                xml += `<SubTotal>${ordenes[detalle].subtotal}</SubTotal>`;

                if (ordenes[detalle].baseimponible != null || ordenes[detalle].baseimponible > 0) {
                    xml += `<BaseImponible>${ordenes[detalle].baseimponible}</BaseImponible>`;
                }

                //if (ordenes[detalle].monto > 0) { // cambio 4.4
                
                    xml += `<Impuesto>
                            <Codigo>${ordenes[detalle].codigo}</Codigo>
                            <CodigoTarifaIVA>10</CodigoTarifaIVA>
                        <Tarifa>${ordenes[detalle].tarifa}</Tarifa>`;


                    if (ordenes[detalle].factorIVA != null && ordenes[detalle].factorIVA > 0) {
                        xml += `<FactorIVA>${ordenes[detalle].factorIVA}</FactorIVA>`;
                    }

                    xml += `<Monto>${ordenes[detalle].monto}</Monto>`;
                    
                    ///cambio 4.4
                    xml += `</Impuesto>`;

                //} //50625032000010832073300100001030000000023181635427 NOTA RECHAZADA 

                /*if (ordenes[detalle].MontoExoneracion != null && ordenes[detalle].MontoExoneracion > 0) {
                    xml += `<Exoneracion>
                                <TipoDocumento>${obj.datosCliente.TipoDocumentoExoneracion}</TipoDocumento>
                                <NumeroDocumento>${obj.datosCliente.documentoExoneracion}</NumeroDocumento>
                                <NombreInstitucion>${obj.datosCliente.nombreInstitucion}</NombreInstitucion>
                                <FechaEmision>${obj.datosCliente.FechaEmision}</FechaEmision>
                                <PorcentajeExoneracion>${obj.datosCliente.PorcentajeExoneracion}</PorcentajeExoneracion>
                                <MontoExoneracion>${ordenes[detalle].MontoExoneracion}</MontoExoneracion>
                            </Exoneracion></Impuesto>`;

                    xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                } {
                    xml += `</Impuesto>`;
                }*/

                /*CAMBIOS 4.4 SE impuesto emisor fabric */
                //xml += `<ImpuestoAsumidoEmisorFabrica>${montofabrica}</ImpuestoAsumidoEmisorFabrica>`;
                xml += `<ImpuestoNeto>${ordenes[detalle].impuesto_neto}</ImpuestoNeto>`;
                xml += `<MontoTotalLinea>${ordenes[detalle].montoitotallinea}</MontoTotalLinea></LineaDetalle>`;
                indice++;
            };

            xml += `</DetalleServicio>`;

            /*  if(detalle.otrosCargos && detalle.otrosCargos.length > 0){ // esta parte es otros cargos pero eso por ahora no aplica
                    detalle.otrosCargos.forEach(cargo => {
                        
                    })
                }*/

            if(obj.TotalOtrosCargos > 0) {
                const porcentajeOtrosCargos = Number(obj.totalventaneta) / Number(obj.TotalOtrosCargos);
                xml += ` <OtrosCargos>
                            <TipoDocumento>06</TipoDocumento>
                            <Detalle>Servicio Restaurante</Detalle>
                            <Porcentaje>${parseFloat(porcentajeOtrosCargos).toFixed(2)}</Porcentaje>
                            <MontoCargo>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</MontoCargo>
                        </OtrosCargos>`;
            }

            xml += `<ResumenFactura>`;

           /*xml += `<CodigoTipoMoneda>
                        <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                        <TipoCambio>${response[0].tipocambio}</TipoCambio>
                    </CodigoTipoMoneda>`;*/
                //cambio 4.4
                if (obj.codigomoneda == 'CRC'){
                        tc=1.00;
                }else{
                    tc=response[0].tipocambio;
                }
                xml += `<CodigoTipoMoneda>
                            <CodigoMoneda>${obj.codigomoneda}</CodigoMoneda>
                            <TipoCambio>${tc}</TipoCambio>
                        </CodigoTipoMoneda>`;

            xml += `<TotalServGravados>${obj.totalservgravados}</TotalServGravados>
                    <TotalServExentos>${obj.totalservexentos}</TotalServExentos>
                    <TotalServExonerado>${obj.totalservexonerado}</TotalServExonerado>
                    <TotalMercanciasGravadas>${obj.totalmercanciasgravadas}</TotalMercanciasGravadas>
                    <TotalMercanciasExentas>${obj.totalmercanciasexentas}</TotalMercanciasExentas>
                    <TotalMercExonerada>${obj.totalmercanciaexonerada}</TotalMercExonerada>
                    <TotalGravado>${obj.totalgravado}</TotalGravado>
                    <TotalExento>${obj.totalexento}</TotalExento>
                    <TotalExonerado>${obj.totalexonerado}</TotalExonerado>
                    <TotalVenta>${obj.totalventa}</TotalVenta>
                    <TotalDescuentos>${obj.totaldescuentos}</TotalDescuentos>
                    <TotalVentaNeta>${obj.totalventaneta}</TotalVentaNeta>
                    <TotalImpuesto>${obj.totalimpuesto}</TotalImpuesto>`;

            if(obj.TotalOtrosCargos > 0) {
                xml += `<TotalOtrosCargos>${parseFloat(obj.TotalOtrosCargos).toFixed(2)}</TotalOtrosCargos>`;
            }

            if (obj.totalIVADevuelto != null && obj.totalIVADevuelto > 0) {
                xml += `<TotalIVADevuelto>${obj.totalIVADevuelto}</TotalIVADevuelto>`;
            }
             // cambio 4.4
             xml += `<MedioPago>
             <TipoMedioPago>${obj.medio_pago}</TipoMedioPago>
             <TotalMedioPago>${obj.totalcomprobante}</TotalMedioPago>
             </MedioPago>`;
             //fin agrega version 4.4
            xml += `<TotalComprobante>${obj.totalcomprobante}</TotalComprobante>`;
            xml += `</ResumenFactura>
            
                <InformacionReferencia>
                    <TipoDocIR>17</TipoDocIR>
                    <Numero>${obj.claveReferencia}</Numero>
                    <FechaEmisionIR>${obj.fechaReferencia}</FechaEmisionIR>
                    <Codigo>01</Codigo>
                    <Razon>Anulacion Factura de Compra Electronica</Razon>
                </InformacionReferencia>
            
            `;

            //PONERLE UNA DESCRIPCION A LA ORDEN PORQUE EL PRODUCTO PUEDE CAMBIAR DE NOMBRE Y YA NO HARIA MATCH CON EL HISTORICO
            xml += `</FacturaElectronicaCompra>`;
          
            firmarXML(xml, llave, clave).then(xmlSigned => {
                    const objFirma = {
                        id: idfactura,
                        xml: xmlSigned,
                        tipo_factura: tipoComprobante
                    }
                    Xml.guardarXML(objFirma) // esto lo guarda en la base de datos
                        .then(data => {

                            const root = path.resolve(__dirname);
                            const objetoXML = {
                                comprobante: Buffer.from(xmlSigned, "base64").toString("ascii"),
                                path: root + '/../xml/' + obj.clavenumerica + '.xml'
                            }


                            console.log("objetoXML", objetoXML);
                            facturaFunciones.generarArchivoXML(objetoXML)
                                .then(xmlCreado => {

                                    
                                    console.log("respuests archivo creado ", xmlCreado);
                                    
                                    resolve(xmlSigned);
                                })
                                .catch(err => console.error(err));
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        } else {
            return reject("No se pudo obtener la informacion del cliente");
        }
        } catch (error) {
            console.log(error);
            reject('Error al obtener el tipo de cambio');
        }
    })
}
const firmarXML = async(xmlString, llavecriptografica, PassLlaveCriptografica) => {
    //se debe obtener el token con la API de obtener token de hacienda
    //esto debe devolver el xml en base 64 y firmado

    //EL USUARIO DE HACIENDA SE USA PÁRA GENERAR EL TOKEN PARA ENVIAR LAS FACTURAS
    return new Promise((resolve, reject) => {

        try {

            const llave = String(PassLlaveCriptografica);
            const direccion = path.join(__dirname, '/../public/p12_files');
            const fullPath = direccion + '/' + llavecriptografica;

            console.log("path",fullPath);
            // const dataFile= fs.createReadStream(direccion+'/'+llavecriptografica); 

            //const JSONStream = JSON.stringify(dataFile);
            //const JSONStreamBase64 = new Buffer.from(JSONStream).toString('base64');
            //console.log(JSONStreamBase64); R(qC$>A;KaCh@g_}s[_[

            // convertir a base64 el stream del archivo .p12
            //Enviar a .sign el XML en string, la llave criptografica (.p12) en BASE64, y el pass en string.
            //Se retornara el XML ya firmado en BASE64.

            //Tambien esetá el function verifySignature el cuál verifica que la llave criptografica y el pass de la misma sean correctas, además nos retornara cuando expira la misma.
            //Si es correcto retorna true, caso contrario el error.
            //Ej de uso: antes de guardar los datos del contribuyente y usar el Sign se puede verificar con antelación la llave. Si es true se guarda.

            //la function verify nos retorna lo siguiente si es correcta y no ha expirado:
            //{ isValid: true, expiresOn: 2021-06-20T01:29:49.000Z }
            base64.encode(fullPath, async(err, base64String) => {
                if (err) {
                    console.log(err);
                    return reject("No se pudo obtener la informacion de la llave criptográfica");
                }

                try {
                    let xml = '';
                    const verify = await Signer.verifySignature(base64String, llave);

                    if (verify.isValid) {
                        xml = await Signer.sign(xmlString, base64String, llave);
                        // console.log("Buffer ",new Buffer.from(xml,"base64").toString("ascii")); // CONVERTIR DE BASE64 A TEXTO LEGIBLE 
                        console.log("xml firmado ", xml);
                        resolve(xml);
                    } else {
                        return reject("Los datos de validación de la llave criptográfica no son correctos");
                    }
                } catch(err){
                    console.log("falló la firma",err);
                    reject("Error en la llave criptográfica y clave de la misma. Verificar la información en ATV hacienda https://www.hacienda.go.cr/ATV/Login.aspx");
                }
            })
        } catch (err) {
            reject(err);
        }
    })
}

const validarExpiracionArchivoP12 = (llavecriptografica,PassLlaveCriptografica) => {

    return new Promise((resolve, reject) => {

        try {

            const llave = String(PassLlaveCriptografica);
            const direccion = path.join(__dirname, '/../public/p12_files');
            const fullPath = direccion + '/' + llavecriptografica;

            console.log("path",fullPath);
            // const dataFile= fs.createReadStream(direccion+'/'+llavecriptografica); 

            //const JSONStream = JSON.stringify(dataFile);
            //const JSONStreamBase64 = new Buffer.from(JSONStream).toString('base64');
            //console.log(JSONStreamBase64); R(qC$>A;KaCh@g_}s[_[

            // convertir a base64 el stream del archivo .p12
            //Enviar a .sign el XML en string, la llave criptografica (.p12) en BASE64, y el pass en string.
            //Se retornara el XML ya firmado en BASE64.

            //Tambien esetá el function verifySignature el cuál verifica que la llave criptografica y el pass de la misma sean correctas, además nos retornara cuando expira la misma.
            //Si es correcto retorna true, caso contrario el error.
            //Ej de uso: antes de guardar los datos del contribuyente y usar el Sign se puede verificar con antelación la llave. Si es true se guarda.

            //la function verify nos retorna lo siguiente si es correcta y no ha expirado:
            //{ isValid: true, expiresOn: 2021-06-20T01:29:49.000Z }
            base64.encode(fullPath, async(err, base64String) => {
                if (err) {
                    console.log(err);
                    return reject("No se pudo obtener la informacion de la llave criptográfica");
                }

                try {
                    const verify = await Signer.verifySignature(base64String, llave);
                    console.log(verify);

                    resolve(verify);
                
                } catch(err){

                    reject("El archivo P12 está vencido, por favor proceder a actualizarlo");
                }
            })
        } catch (err) {
            reject(err);
        }
    })
}

const generarAuthToken = (obj) => {

    return new Promise((resolve, reject) => {

        const { userHacienda, passHacienda, TOKEN_API, Client_ID, userAgent } = obj.objToken;
        console.log()
        //crear objeto para obtener el token
        const objToken = {
            grant_type: 'password',
            client_id: Client_ID,
            username: userHacienda,
            password: passHacienda
        }
        console.log("TOken",objToken);
        const options = {
            method: 'POST', //codigo comercial, tipo es el codigo de producto o servicio que le asigan el emisor, codigo es el codigo comercial de producto(codigo de barra).
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "user-agent": userAgent
            },
            data: qs.stringify(objToken),
            url: TOKEN_API
        };
        axios(options).then(response => {
            //console.log(response);
            const dataToken = response.data;
            resolve(dataToken);

        }).catch(err => {
            console.log("error token ", err);
            reject(err)
        });
    })
}

const obtenerEstado = (obj) => {

    return new Promise((resolve, reject) => {

        const { clave, token, userAgent, API } = obj;
        const url = `${API}/${clave}`;

        const headers = {
            "user-agent": userAgent,
            "Authorization": `bearer ${token}`
        }

        const options = {
            method: "GET",
            headers,
            url
        }

        axios(options).then(data => {
            console.log(data);
            resolve(data)
        }).catch(err => {
            console.log("Error recepcio ", err);
            reject(err)
        });
    })
}

const enviarDoc = (obj) => {

    return new Promise((resolve, reject) => {

        generarAuthToken(obj).then(dataToken => {

            const { API, emisor, receptor, clave, fecha, userAgent, comprobanteXml,idemisor } = obj.objSendComprobante;
            const { access_token } = dataToken;
            
            let objXml = {};
            let tipoDoc = '';
            if (typeof receptor !== 'undefined') { //Estructura para saber si el comprobante es 
                //factura o tiquete
                objXml = {
                    clave,
                    fecha,
                    emisor,
                    receptor,
                    comprobanteXml
                }
                tipoDoc= '01';
            } else {
                objXml = {
                    clave,
                    fecha,
                    emisor,
                    comprobanteXml
                }

                tipoDoc= '04';
            } //506090720003101638499001001030000000002141532687

            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "user-agent": userAgent,
                    "Authorization": `bearer ${access_token}`
                },
                data: JSON.stringify(objXml),
                url: API
            }
            console.log("objeto envio factura ", options);
            console.log("enviando factura");
            axios(options)
                .then(response => {
                    console.log("response envio factura ", response);
                    const { status } = response;

                    if (status == '202' || status == '400') {
                        const tipo_factura = clave.substring(29, 31);
                        const obj = {
                            tipo_factura,
                            status,
                            clave,
                            idemisor
                        };
                        Factura.actualizarCodigoEstado(obj)
                            .then(data => {
                                resolve({
                                    codigo: status,
                                    estado: 'recibido',
                                    token: access_token,
                                    access_token
                                })
                            })

                    } else {
                        reject({
                            estado: status,
                            estado: 'No recibido'
                        })
                    }
                })
                .catch(async err => {
                   try {
                     console.log({error: err.response}); //x-error-cause
                    const errorEnvio = err?.response.headers["x-error-cause"];
                    if(!(typeof errorEnvio === 'undefined') && errorEnvio != ''){
                        
                        const tipo_factura = clave.substring(29,31);
                        const {status} = err.response;
                        await Factura.actualizarCodigoEstado({tipo_factura, status: err.response.status, clave, error: errorEnvio,idemisor});
                        //await Factura.actualizarEstadoFactura({tipo_factura, status: 'rebotado', clave,error: errorEnvio});     
                    
                    }
                    reject(err)
                   } catch(err)  {
                    reject(err);
                   }
                });
        }).catch(err => {
            console.log("err token",err.response)
            
            if(err.response.status == 401) {
                return reject('Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.');
            } else {
                return reject('Hubo un error en la generación del token de envío de comprobantes');
            }
            
        })
    })
}


const enviarRecepcion = (obj) => {

    return new Promise((resolve, reject) => {

            const { API, emisor, receptor, clave, fecha, comprobanteXml, consecutivoReceptor, token, userAgent } = obj;
            //console.log("Token ",access_token);
            const objEnvio = {
                clave,
                fecha,
                emisor,
                receptor,
                consecutivoReceptor,
                comprobanteXml
            }

            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "user-agent": userAgent,
                    "Authorization": `bearer ${token}`
                },
                data: JSON.stringify(objEnvio),
                url: API
            }
            console.log("objeto envio factura ", options);
            console.log("enviando factura");
            axios(options)
                .then(response => {
                    console.log("response envio factura ", response);
                    const { status, headers } = response;
                    if(status == 202){
                        
                        resolve(status)
                    } else {
                        reject('La factura no ha sido recibida por el ministerio de hacienda');
                    }
                })
                .catch(err => {
                    console.log("error envio ", err)
                    const {status} = err.response;

                    console.log();
                    reject(status)
                });
    })
}

const obtenerEstadoComprobante = (clave, token, API, userAgent, idfactura,tipo_factura) => {
    return new Promise((resolve, reject) => {
        const data = {
                clave,
                token,
                API,
                userAgent
            }
            /*if(response.data['ind-estado'] !== 'procesando'){
                resolve(response);
            }*/

        setTimeout(() => {
            obtenerEstado(data)
                .then(response => {
                    
                    if (response.data['ind-estado'] === 'procesando' || response.data['ind-estado'] === 'recibido') {
                        console.log("estado del comprobante X SIN ESTADO");
                        response.reject('Sin estado'); 
                        
                    }else {
                           

                        console.log("estado del comprobante X ", response.data['respuesta-xml']);
                        const acuseXml = response.data['respuesta-xml'];
                        const objAcuse = {
                            id: idfactura,
                            acuseXml,
                            tipo_factura
                        }

                        Xml.guardarAcuse(objAcuse)
                            .then(data => {

                                const root = path.resolve(__dirname);
                                const objetoXML = {
                                        comprobante: Buffer.from(response.data['respuesta-xml'], "base64").toString("ascii"),
                                        path: root + '/../AcuseRespuesta/Respuesta_' + clave + '.xml'
                                    } //response.data

                                facturaFunciones.generarArchivoXML(objetoXML)
                                    .then(xmlGenerado => {
                                        console.log(response.data);

                                        resolve(response.data['ind-estado']);
                                    })
                                    .catch(err => {     
                                        console.log(err);
                                        reject(err)
                                    });
                            })
                            .catch( err => {       //agregado async x SYN
                                try{
                                    console.log(err);
                                    reject("error al guardar acuse ",err);
                                }catch(err)  {
                                    reject(err);
                                }   
                            });
                    
                    }
                })
                .catch(err => {         
                    console.log(err);
                    //reject("err estado " + err)
                    response.reject("err estado " + err);
                });
        }, 7000); ///eran 9000 cambio syn
    })
}


const enviarFacturaCompra = (obj) => {

    return new Promise((resolve, reject) => {

        generarAuthToken(obj).then(dataToken => {

            const { API, emisor, receptor, clave, fecha, userAgent, comprobanteXml,identrada } = obj.objSendComprobante;

            const { access_token } = dataToken;
            //console.log("Token ",access_token);

            let objXml = {};

            if (receptor.tipoIdentificacion != null) { //Estructura para saber si el comprobante es 
                //factura o tiquete
                objXml = {
                    clave,
                    fecha,
                    emisor,
                    receptor,
                    comprobanteXml
                }
            } else {
                objXml = {
                    clave,
                    fecha,
                    emisor,
                    comprobanteXml
                }
            }

            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "user-agent": userAgent,
                    "Authorization": `bearer ${access_token}`
                },
                data: JSON.stringify(objXml),
                url: API
            }
            console.log("objeto envio factura ", options);
            console.log("enviando factura");
            axios(options)
                .then(response => {
                    console.log("response envio factura ", response);
                    const { status } = response;

                    if (status == 202) {
                        const tipo_factura = clave.substring(29, 31);
                        const obj = {
                            tipo_factura,
                            status,
                            clave
                        };
                      
                    resolve({
                        codigo: status,
                        estado: 'recibido',
                        token: access_token,
                    })
                    
                    } else {
                        reject({
                            codigo: status,
                            estado: 'No recibido'
                        })
                    }
                })
                .catch(async err => {
                    try {
                        console.log(err.response.headers["x-error-cause"]);
                       const errorEnvio = err.response.headers["x-error-cause"];
                       if(!(typeof errorEnvio === 'undefined') && errorEnvio != ''){
                           const {status} = err.response;
                           //clavenumerica, codigo_estado,error,estado
                           const codResponse = await Entrada.actualizarCodigoEstadoEntradaRebotada({ codigo_estado: err.response.status, clave, error: errorEnvio,estado:'rebotado'});
                                                 
                       }
                       reject('rebotada');
                      } catch(err)  {
                       reject(err);
                      }
                    // console.log("error envio ",err.response.status)
                   // reject(err.response.status)
                });
        }).catch(err => {
            console.log("err token",err.response)
            
            if(err.response.status == 401) {
                return reject('Los credenciales para generación del token de envío de comprobantes tienen errores. Por favor actualizarlos.');
            } else {
                return reject('Hubo un error en la generación del token de envío de comprobantes');
            }
            
        })
    })
}
module.exports = {
    crearXML,
    generarAuthToken,
    enviarDoc,
    obtenerEstadoComprobante,
    enviarRecepcion,
    obtenerEstado,
    enviarFacturaCompra,
    validarExpiracionArchivoP12
}

//PARA HACER EL LOGIN USAR PASSPORT PARA USAR VARIABLES DE SESSION


//const encoded = encodeURIComponent(JSON.stringify(objXml));
/*axios.post(API,objXml,{
    
        headers:{
            'Content-Type':'application/x-www-form-urlencoded' ,
            'user-agent': userAgent,
            'Authorization': `bearer ${access_token}`
        }
}).then(data => {
    console.log(data);
}).catch(err => console.log("Error en el envio de la factura ",err));*/

/*let formBody = [];
for(let propiedad in objXml){
    
    if(typeof objXml[propiedad] == "object"){
        let encodedTipo = "tipoIdentificacion"
        let encodedValueTipo = encodeURIComponent(objXml[propiedad].tipoIdentificacion);
        formBody.push(encodedTipo + "=" + encodedValueTipo);
        let encodedNumero = "numeroIdentificacion"
        let encodedValueNumero = encodeURIComponent(objXml[propiedad].numeroIdentificacion);
        formBody.push(encodedNumero + "=" + encodedValueNumero);
    }else{
        let encodedKey = encodeURIComponent(propiedad);
        let encodedValue = encodeURIComponent(objXml[propiedad]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
}
            
    client_id=api-stag&grant_type=password
            
*/
//formBody = formBody.join("&"); 
//console.log(formBody); return;


/*request.post({
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded; charset=utf-8' ,
                    'user-agent': userAgent,
                    'Authorization': `bearer ${access_token}`
                },
                url: API,
                body: encoded
            },(err, response, body)=>{
                if(err) return console.log(err);
                
                console.log(body);
            })    
        })
        .catch(err => reject(err));*/


//formatear el body para enviarlo a la api de generar el token
/*
let formBody = [];
for(let propiedad in objToken){
    let encodedKey = encodeURIComponent(propiedad);
    let encodedValue = encodeURIComponent(objToken[propiedad]);
    formBody.push(encodedKey + "=" + encodedValue);
}
/*
    client_id=api-stag&grant_type=password
        
*/
/* formBody = formBody.join("&"); // separ el string por el signo &
 console.log("Body de funcion para generar el token ",formBody);*/

/*request.post({
    headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8' ,
        'user-agent': userAgent
    },
    url: TOKEN_API,
    mode: 'cors',
    body: formBody
},(err, response, body)=>{
    
    if(err) {
        console.log("Error en el token ", err);
        return reject("No se pudo obtener el token");}
        
    resolve(body);
})*/