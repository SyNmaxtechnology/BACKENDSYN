const { obtenerTokenEmisor } = require("../../controllers/EmisorController");

const validarAcesso = async (req,res,next) => { //prueba de comentario1

    try {

        const token = req.get('Authorization');
        
        if(!token) {
            return res.status(401).json({
                message: 'El token es requerido para procesar la petición'
            })
        } else {
            const existe = await obtenerTokenEmisor(token);

            if(!existe[0]) {
                return res.status(401).json({
                    message: 'Token inválido'
                })
            } else {
                
                if(req.route.path ==='/api/factura/estado') {
                    
                    const body = req.body;

                    if(!body.idemisor) {
                        return res.status(400).json({ message: 'El valor del idemisor es requerido'})
                    } else if(existe[0].id !== Number(body.idemisor)) {
                        return res.status(401).json({ message: 'El idemisor enviado en la factura no tiene permisos de acceso' });
                    } else if(req.body.tipo_factura != '01' && req.body.tipo_factura != '03' && req.body.tipo_factura != '04'){
                        return res.status(401).json({ message: 'El tipo de factura es inválido' });
                    } else {
                        return next();
                    }

                } else if(req.route.path ==='/api/agregar-factura') {
                    const body = req.body;

                    if(!body.factura) {
                        return res.status(400).json({ message: 'El cuerpo de la factura es requerido'})
                    } else if(!body.factura.idemisor) {
                        return res.status(400).json({ message: 'El valor del idemisor es requerido'})
                    } if(existe[0].id !== Number(body.factura.idemisor)) {
                        return res.status(401).json({ message: 'El idemisor enviado en la factura no tiene permisos de acceso' });
                    }  else {
                        return next();
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Hubo un error en la sesión'
        })
    }
}

const validarFactura = (req,res,next) => {//com

    const {body: {detalles, factura}} = req;
    let {  condicion_venta, medio_pago, porcentaje_descuento_total, monto_descuento_total, subtotal, fecha_emision,
            totalservgravados, totalservexentos, totalservexonerado, totalmercanciasgravadas, totalmercanciasexentas, 
            totalmercanciaexonerada, totalgravado, totalexento, totalexonerado, totalventa, totaldescuentos, totalventaneta,
            totalimpuesto, totalcomprobante, codigomoneda, tipo_factura, otrosCargos, notas,plazo_credito,idemisor, factorIVA,
            cliente,tipocambio,TipodocRef,NumeroRef,FechaRef,CodigoRef,RazonRef
    } = factura;

    const expresionDecimal = /^-{0,1}\d*\.{0,1}\d+$/;
    const expresionEntero = /^\d*$/;
    const expressionLetras = /^[A-Z]+$/;
    const expressionLetrasEspaciosAcentos = /^[A-Za-z&ÁÉÍÓÚáéíóúñÑ0123456789. ]+$/g;

    let erroresFactura = [];
    let erroresLineas = [];
    const tipoDocPermiido = ['01','04','03'] ;

    if(!factura) return res.status(400).json({message: 'La información del encabezado de la factura es requerida'});

    if(!detalles || typeof detalles.length === 'undefined' || detalles.length === 0) return res.status(400).json(
        {message: 'La factura debe contener al menos una línea de detalle'}
    );

    if(!tipoDocPermiido.includes(factura.tipo_factura)) {

        return res.status(400).json({
            message: 'El tipo de factura no es válido'
        })
    }
    console.log(factura.infoReferencia );
    console.log(factura.InformacionReferencia );

    if(factura.infoReferencia && (tipo_factura == '01' || tipo_factura == '04')) {
        erroresFactura.push("Si el tipo de comprobante es diferente a nota de crédito, no debe contener la información de referencia");
    }

    if(cliente && tipo_factura == '04') {
        erroresFactura.push("Si el comprobante es de tipo tiquete electrónico, no contener la información de un cliente")
    }

    if(!cliente && tipo_factura == '01') {
        erroresFactura.push("Si el comprobante es de tipo factura electrónico, debe contener la información del cliente")
    }
   
   
    if(cliente) {
        if(!cliente.cedula) {
            erroresFactura.push('Debe contener la cédula del cliente');
        } else if(!expresionEntero.test(cliente.cedula)){
            erroresFactura.push('Cédula inválida');
        } else if(cliente.cedula.trim().length > 12 || cliente.cedula.trim().length < 9 ) {
            erroresFactura.push('La cédula debe contener un mínimo de 9 dígitos y un máximo de 12');
        } else if(!cliente.nombre) {
            erroresFactura.push('El nombre del cliente es requerido');
        } else if(!expressionLetrasEspaciosAcentos.test(cliente.nombre)) {
            erroresFactura.push('El nombre del cliente es inválido');
        } else if(!cliente.correo) {
            erroresFactura.push('El correo del cliente es requerido');
        } else if(cliente.correo.trim().length > 80) {
            erroresFactura.push('El correo del cliente tiene un tamaño máximo de 80 caracteres');
        }
    }
    
    if(factura.infoReferencia && factura.tipo_factura == '03' ) {
        const { infoReferencia } = factura;
        //tipoDocReferencia, NumeroReferencia, fecha_emision, codigo, razon
        if(!infoReferencia.NumeroReferencia || infoReferencia.NumeroReferencia.trim().length != 50 || !expresionEntero.test(infoReferencia.NumeroReferencia.trim())) {
            erroresFactura.push("El número de referencia no es válido")
        } else if(!infoReferencia.tipoDocReferencia || infoReferencia.tipoDocReferencia.trim().length != 2 || !expresionEntero.test(infoReferencia.tipoDocReferencia.trim())) {
            erroresFactura.push("El tipo documento de referencia no es válido");
        } else if(!infoReferencia.fecha_emision) {
            erroresFactura.push("Debe contener la fecha de emisión de la información de referencia");
        } else if(!infoReferencia.codigo || infoReferencia.codigo.trim().length != 2 || !expresionEntero.test(infoReferencia.codigo.trim())) {
            erroresFactura.push("El código de referencia no es válido");
        } else if(!infoReferencia.razon) {
            erroresFactura.push("La razón de la nota crédito es requerido");
        }
    } else if(!factura.infoReferencia && factura.tipo_factura == '03') {
        erroresFactura.push("La nota de crédito debe contener la información de referencia");
    }

    if(!expresionEntero.test(idemisor)) 
        erroresFactura.push('El campo idemisor debe ser de tipo numerico entero');
    if(!(expresionEntero.test(condicion_venta) && condicion_venta.length === 2)) 
        erroresFactura.push('El campo condicion venta debe ser de contener dos caracteres de tipo numerico');
    if(!(expresionEntero.test(medio_pago) && medio_pago.length === 2)) 
        erroresFactura.push('El campo medio debe ser de contener dos caracteres de tipo numerico');
    if(!expresionDecimal.test(porcentaje_descuento_total) ) 
        erroresFactura.push('El campo porcentaje descuento debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(monto_descuento_total) ) 
        erroresFactura.push('El campo monto descuento debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(subtotal) ) 
        erroresFactura.push('El campo subtotal debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalservgravados) ) 
        erroresFactura.push('El campo total servicios gravados debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalservexentos) ) 
        erroresFactura.push('El campo total servicios exentos debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalservexonerado) ) 
        erroresFactura.push('El campo total servicios exonerados debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalmercanciasgravadas) ) 
        erroresFactura.push('El campo total mercancías gravadas debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalmercanciasexentas) ) 
        erroresFactura.push('El campo total mercancías exentas debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalmercanciaexonerada) ) 
        erroresFactura.push('El campo total mercancías exoneradas debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalgravado) ) 
        erroresFactura.push('El campo total gravado debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalexento) ) 
        erroresFactura.push('El campo total exento debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalexonerado) ) 
        erroresFactura.push('El campo total exonerado debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalventa) ) 
        erroresFactura.push('El campo total venta debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totaldescuentos) ) 
        erroresFactura.push('El campo total descuentos debe ser de tipo numerico decimal o entero');
        //otrosCargos
    if(!expresionDecimal.test(totalventaneta) ) 
        erroresFactura.push('El campo total venta neta debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalimpuesto) ) 
        erroresFactura.push('El campo total impuesto debe ser de tipo numerico decimal o entero');
    if(!expresionDecimal.test(totalcomprobante) ) 
        erroresFactura.push('El campo total comprobante debe ser de tipo numerico decimal o entero');    
    if(!(expressionLetras.test(codigomoneda) && codigomoneda.length == 3)) 
        erroresFactura.push('El campo codigomoneda debe contener 3 caracteres alfabéticos');
    if(!(expresionEntero.test(tipo_factura) && tipo_factura.length === 2)) 
        erroresFactura.push('El campo tipo factura debe ser de contener dos caracteres de tipo numerico');
    if(!expresionDecimal.test(otrosCargos) ) 
        erroresFactura.push('El campo otros cargos debe ser de tipo numerico decimal o entero');
    if(notas?.length > 1000) 
        erroresFactura.push('El campo notas tiene un tamaño máximo de 1000 carácteres');
    if(!fecha_emision ){
        erroresFactura.push('El campo fechaEmisión es requerido');
    }
    if(tipocambio && !expresionDecimal.test(tipocambio)) {
        erroresFactura.push('El tipo de cambio es inválido');
    }
    if(!detalles || typeof detalles.length === 'undefined' || detalles.length === 0) {
        erroresFactura.push('El cuerpo de la factura debe contener al menos una línea de detalle');
    }

    for(const linea of detalles) {

        /*
            idfactura, idproducto, precio_linea, cantidad, descripcioDetalle, porcentajedescuento, montodescuento, naturalezadescuento, numerolineadetalle, subtotal, montototal, codigo, codigo_tarifa, tarifa, monto, baseimponible, impuesto_neto, numerodocumento, montoitotallinea, tipo_factura, MontoExoneracion, idemisor,otrosCargos, PorcentajeExonerado,unidad_medida
        
        */
        if(!expresionDecimal.test(linea.precio_linea) ) 
            erroresFactura.push(`El campo precio línea de la línea con descripcioón ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal`);
        if(!expresionDecimal.test(linea.cantidad) ) 
            erroresFactura.push(`El campo cantidad de la línea con descripcioón ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal`);
        if(linea.descripcioDetalle.length === 0)
            erroresFactura.push('Las líneas del comprobante deben contener una descripción');
        
        if(linea.montodescuento && linea.montodescuento > 0 || linea.naturalezadescuento || linea.porcentajedescuento) {

            if(!linea.naturalezadescuento) {
                erroresFactura.push(`El campo con descripcioón ${linea.descripcioDetalle} debe contener la naturaleza de descuento`);
            }

            if(!expresionDecimal.test(linea.porcentajedescuento) ){ 
                erroresFactura.push(`El campo porcentaje descuento de la línea con descripcioón ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal`);
            }
            if(!expresionDecimal.test(linea.montodescuento) ){ 
                erroresFactura.push(`El campo monto descuento de la línea con descripcioón ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal`);
            }            
        }
            
        if(!expresionDecimal.test(linea.subtotal) ) 
            erroresFactura.push(`El subtotal de la línea con descripción ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal `);
        
        if(!expresionDecimal.test(linea.montototal) ) 
            erroresFactura.push(`El montototal de la línea con descripción ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal `);

        if(!(expresionEntero.test(linea.codigo) && linea.codigo.trim().length === 2)) 
            erroresFactura.push(`El campo codigo de la línea con descripción ${linea.descripcioDetalle} debe ser dos caracteres de tipo numerico`);
            
        if(!(expresionEntero.test(linea.codigo_tarifa) && linea.codigo_tarifa.trim().length === 2)) 
            erroresFactura.push(`El campo codigo tarifa de la línea con descripción ${linea.descripcioDetalle} debe ser dos caracteres de tipo numerico`);
        
        if(!(expresionEntero.test(linea.tarifa) && linea.tarifa < 14)) 
            erroresFactura.push(`El campo  tarifa de la línea con descripción ${linea.descripcioDetalle} debe ser de tipo númerico con un valor máximo de 13`);
        if(!expresionDecimal.test(linea.monto) ) 
            erroresFactura.push(`El monto de la línea con descripción ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal `);

        if(!expresionDecimal.test(linea.montoitotallinea) ) 
            erroresFactura.push(`El montoitotallinea de la línea con descripción ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal `);

        if(!expresionDecimal.test(linea.montoitotallinea) ) 
            erroresFactura.push(`El montoitotallinea de la línea con descripción ${linea.descripcioDetalle} debe ser un valor numérico entero o decimal `);
        if(!linea.unidad_medida || linea.unidad_medida.trim().length > 5) {
            erroresFactura.push(`El campo con descripción ${linea.descripcioDetalle} tiene una unidad de medida inválida`);
        } 
        
        if(!linea.codigoBarraProducto) {
            erroresFactura.push(`El campo con descripción ${linea.descripcioDetalle} debe tener el codigo de producto`);
        }

        if(!linea.codigoCabys) {
            erroresFactura.push(`El campo con descripción ${linea.descripcioDetalle} debe tener el codigo cabys`);
        }

        else if(linea.codigoCabys.trim().length > 13) {
            erroresFactura.push(`El campo con descripción ${linea.descripcioDetalle} debe tener el codigo cabys con un tamaño de 13 caracteres `);
        } else if(!expresionEntero.test(linea.codigoCabys.trim().length)) {
            erroresFactura.push(`El campo con descripción ${linea.descripcioDetalle} tiene un código cabys inválido`);
        } 
    }

    if(erroresFactura.length === 0 && erroresLineas.length === 0) {
        return next();
    } else {

        return res.status(400).json({
            data: {
                errores: erroresFactura
            }
        })
    }
} 

module.exports = {
    validarFactura,
    validarAcesso
}
