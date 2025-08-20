const pool = require("../db/config");
const Parametros = {};

Parametros.guardarParametros= (obj) =>{
    const {servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion} = obj;
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO Parametros(servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion) VALUES(?,?,?,?,?)",[servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion],
        function(err,rows,fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            
            return resolve(rows); //tema
        })
    })
}

Parametros.actualizarParametros= (obj) =>{
    return new Promise((resolve, reject) => {
        const {servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion} = obj;

        pool.query("UPDATE Parametros SET servidorcorreo=? ,usuariocorreo=? ,clavecorreo=? , numeroresolucion=?, fecharesolucion=? WHERE id=1", [servidorcorreo,usuariocorreo,clavecorreo,numeroresolucion,fecharesolucion], function(err, rows, fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            
            return resolve(rows);
        })
    })
}

Parametros.obtenerParametros = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM Parametros",[], function(err,rows,fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            
            return resolve(rows)
        })
    })
}


module.exports = Parametros;