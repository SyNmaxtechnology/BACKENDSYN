const Parametros = require("../models/Parametros");

exports.guardarParametros = async (req, res) => {
    const {servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion} = req.body;

    try {
       const response = await  Parametros.guardarParametros({servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion});

       const {affectedRows} = response;

       if(affectedRows > 0){
           res.status(200).json({
               messsage: 'Parámetros registrados correctamente'
           })
       }

    } catch (error) {
        console.log(error)
    }
}

exports.obtenerParametros = async (req, res) => {

    try{

        const response = await Parametros.obtenerParametros();
    
        if(!response[0]){
            return res.status(200).json({
                message: 'No hay resultados'
            })
        }
    
        res.json(response[0])
    }catch(err){
        console.log(err)
    }
}

exports.actualizarParametros = async (req, res) => {
    const {servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion} = req.body;

    try {
        const response = await Parametros.actualizarParametros({servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion}); 

        const {affectedRows} = response;
        
        if(affectedRows > 0){
            res.status(200).json({
                messsage: 'Parámetros actualizado correctamente'
            })
        }
    } catch (error) {
        console.log(error);
    }

}
