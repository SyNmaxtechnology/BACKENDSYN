const Visitas = require("../models/Visita");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const fechaActual = require("../db/fecha");
const Emisor = require("../models/Emisor");
const { generate } = require("shortid");

const agregarVisita = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const {tipo_movimiento, ubicacion,idcliente,razon} = req.body;
        const fechaIngresar = fechaActual().substr(0,19).replace('T',' ');
        let visita = null;
        
        if(tipo_movimiento == 'SALIDA'){
    
            const responseUbicacion  = await Cliente.obtenerUbicacionCliente({idcliente,idemisor});
            console.log();
            //if(!responseUbicacion[0]) return res.status(400).json({message: 'El cliente no tiene una ubicacion valida'});
            //const response = responseUbicacion[0] && responseUbicacion[0].ubicacion && responseUbicacion[0].ubicacion.split(' ')? 
              //   responseUbicacion: null;
            
            if(responseUbicacion[0].ubicacion == null){
                console.log("entro al if")
                const {affectedRows} = await Visitas.agregarVisita({
                    idemisor,idusuario,idcliente, tipo_movimiento, 
                    fecha: fechaIngresar,ubicacion,
                    visita:false,razon,distancia: -1
                })

                if(affectedRows > 0) {res.status(201).json({ message: 'Salida agregada'}); return;}
                else {res.status(400).json({ message: 'No se pudo agregar la salida'}); return;}
                
                
            } 
            const tieneEspacio = responseUbicacion[0].ubicacion.indexOf(' ');

            if(tieneEspacio === -1){
               
                console.log("entro al if")
                const {affectedRows} = await Visitas.agregarVisita({
                    idemisor,idusuario,idcliente, tipo_movimiento, 
                    fecha: fechaIngresar,ubicacion,
                    visita:false,razon,distancia: -1
                })

                if(affectedRows > 0) {res.status(201).json({ message: 'Salida agregada'}); return;}
                else {res.status(400).json({ message: 'No se pudo agregar la salida'}); return;}
                
            }

            const arrUbicacion = responseUbicacion[0].ubicacion.split(' ')
           
            if(isNaN(responseUbicacion[0].ubicacion.split(' ')[0]) || responseUbicacion[0].ubicacion.split(' ')[0].trim() === ''){
                console.log("entro al if")
                const {affectedRows} = await Visitas.agregarVisita({
                    idemisor,idusuario,idcliente, tipo_movimiento, 
                    fecha: fechaIngresar,ubicacion,
                    visita:false,razon,distancia: -1
                })

                if(affectedRows > 0) {res.status(201).json({ message: 'Salida agregada'}); return;}
                else {res.status(400).json({ message: 'No se pudo agregar la salida'}); return;}    
            }
            
            else {
                console.log("paso el if"); 
                const ubicacionCliente={
                    lat: responseUbicacion[0].ubicacion.split(' ')[0],
                    lng: responseUbicacion[0].ubicacion.split(' ')[1]
                };
    
                const ubicacionSalida = {
                    lat: ubicacion.lat,
                    lng: ubicacion.lng
                };
    
                const distanciaResponse = await Visitas.obtenerDistanciaEntreLocalizaciones({ubicacionCliente,ubicacionSalida});
                //const {distancia} = distanciaResponse[0];
    
                console.log("distancia response",distanciaResponse);
    
                const responseCerca = await Emisor.obtenerCercaPerimetral(idemisor);
                console.log("cerca",responseCerca);

                const expresion = /^-{0,1}\d*\.{0,1}\d+$/;
                if(!responseCerca[0].cerca_perimetral || !expresion.test(responseCerca[0].cerca_perimetral)) 
                    return res.status(400).json({message: 'El emisor no tiene configurada una cerca perimetral válida'});
    
                const {cerca_perimetral} = responseCerca[0];
    
                if(Number(distanciaResponse) > Number(cerca_perimetral)) {
                    visita = false;
                } else {
                    visita = true;
                }
    
                const {affectedRows} = await Visitas.agregarVisita({
                    idemisor,idusuario,idcliente, tipo_movimiento, 
                    fecha: fechaIngresar,ubicacion,
                    visita,razon,distancia:distanciaResponse
                })
                if(affectedRows > 0){
                    return res.status(201).json({
                        message: 'Salida agregada' //comentariop
                    })
                } else {
                    return res.status(400).json({
                        message: 'No se pudo agregar la salida'
                    })
                }
            }
            
        } else {

           /* const fechaUltimaSalida = await Visitas.obtenerFechaUltimaVisitaPorCliente({idemisor,idcliente});
            
            if(fechaUltimaSalida[0]){
                const {fecha} = fechaUltimaSalida[0];
                const fechaComparar = fechaActual().substr(0,10);

                if(fechaComparar === fecha) {
                    res.status(400).json({
                        message: 'Solo se puede agregar una visita por día en cada cliente'
                    })

                    return;
                } else {
                    console.log("paso la validacion")
                }
            }*/

            const {affectedRows} = await Visitas.agregarVisita({
                idemisor,idusuario,idcliente, tipo_movimiento, fecha:fechaIngresar,ubicacion,idlinea: generate()
                });          

            if(affectedRows > 0){
                res.status(201).json({
                    message: 'Visita agregada'
                })
            } else {
                res.status(400).json({
                    message: 'No se pudo agregar la visita'
                })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ocurrió un error al agregar la visita'
        })
    }

}

const habilitarTipoMovimientoVisita = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid; 

    Visitas.habilitarTipoMovimientoVisita(idusuario).then(response => {

        res.status(200).json({
            response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener la información de la visita'
        })
    })
}

const obtenerVisitas = async (req,res) => {

    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio,fechaFin,idusuario,idcliente,visita,zona} = req.body;
        //res.status(200).json(visitas))
        const visitas = Visitas.obtenerVisitas({idemisor,idcliente,fechaInicio,fechaFin,idusuario,visita,zona});
        const totalProformadoYFacturado = Visitas.obtenerTotalFacturadoYProformadoPorCliente({idemisor,idcliente,fechaInicio,fechaFin,idusuario,visita,zona});

        const [responseVisita,responseTotales] = await Promise.all([visitas,totalProformadoYFacturado]);
        console.log({responseVisita})
        console.log({responseTotales});
        res.status(200).json({
            visitas: responseVisita,
            responseTotales
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error al cargar la información del reporte'
        })    
    }
}

const obtenerClientesVisita = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);   
    const idusuario = decodedToken.uid;
    const idemisor = decodedToken.id;

    Cliente.obtenerClientesPorAgente({idemisor,idusuario})
    .then(response => {
        res.status(200).json({
            clientes: response
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar los clientes'
        })
    })
    
}

const obtenerUsuariosVisitas = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);   
    const idemisor = decodedToken.id;

    Usuario.obtenerUsuariosVisitasPorIdEmisor(idemisor)
        .then(response => {
            res.status(200).json(response);
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener los usuarios'
        })
    })
    //Usuario
}

const obtenerClientesPorIdEmisor = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);   
    const idemisor = decodedToken.id;

    Cliente.obtenerClientesVisita(idemisor)
        .then(response => {
            res.status(200).json({
                clientes: response
            })
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener los clientes'
        })
    })
}

const obtenerReporteRazonesNoCompra = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);   
        const idemisor = decodedToken.id;
        const { idrazon,fechaInicio,fechaFin } = req.body;

        const response = await Visitas.obtenerReporteRazonesNoCompra({idrazon,fechaInicio,fechaFin,idemisor});

        res.status(200).json(response)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Hubo un error'
        })
    }
}
module.exports =  {
    agregarVisita,
    habilitarTipoMovimientoVisita,
    obtenerVisitas,
    obtenerClientesVisita,
    obtenerUsuariosVisitas,
    obtenerClientesPorIdEmisor,
    obtenerReporteRazonesNoCompra
}