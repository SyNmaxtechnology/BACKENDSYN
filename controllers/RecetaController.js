const Receta = require("../models/Receta");
const jwt = require("jsonwebtoken");

const rutaGuardarReceta = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const obj = req.body;
    let indice = 0;

    console.log(req.body); 

    for(linea of obj){
        //idproducto, idarticulo, costo,cantidad
        guardarReceta({
            idproducto: linea.idproducto, 
            idarticulo: linea.idarticulo, 
            costo: linea.costo,
            cantidad: linea.cantidad,
            idemisor
        }).then(response => {

            const {affectedRows} = response;

            if(affectedRows === 0){
                
               return res.status(400).json({
                    message: 'No se pudo agregar la receta'
                })
            }
            indice++;
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Hubo un error en el servidor'
            })
         
        })
    }

    return res.status(200).json({
        message: 'Receta agregada'
    })
}


const rutaActualizarReceta = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const obj = req.body;
    
    for(let linea of obj){

        Receta.eliminarReceta({
            idemisor, 
            idproducto: linea.idproducto
        })
        .then(response => {
            console.log(response);
            const { affectedRows } = response;
            
            if(affectedRows === 0){
                return res.status(400).json({
                    message: 'No se pudo actualizar la receta'
                })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                message: 'Ha ocurido un error en el servidor'
            })
        })
    }

    for(let elemento of obj){
        Receta.guardarReceta({
                idproducto: elemento.idproducto, 
                idarticulo: elemento.idarticulo, 
                costo: elemento.costo,
                cantidad: elemento.cantidad,
                idemisor
        }).then(response => {
            const { affectedRows } = response;
            
            if(affectedRows === 0){
                return res.status(400).json({
                    message: 'No se pudo actualizar la receta'
                })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                message: 'Ha ocurido un error en el servidor'
            })
        })
    }

    res.status(200).json({
        message: 'Receta actualizada'
    });
}

const rutaObtenerReceta = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const query = req.body;
    obtenerReceta({idemisor, query: query.query}).then(response => {
        res.status(200).json({
            receta: response
        })
    })
    .catch(err => {
        const {length} = err;
        if(typeof length !== 'undefined'){
            res.status(404).json({
                message: 'No hay resultados'
            })
        } else {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        }
    })
} 

const obtenerDatosReceta = (obj) => {
    return Receta.obtenerDatosReceta(obj);
}

const guardarReceta = (obj) => {
    return Receta.guardarReceta(obj);
}

const obtenerReceta = (obj) => {

    return Receta.obtenerRcecetaPorProducto(obj);
}

module.exports = {
    rutaGuardarReceta,
    rutaObtenerReceta,
    rutaActualizarReceta,
    obtenerDatosReceta,
    guardarReceta //comentarioZXbckzjsasbn
}