require('dotenv').config({ path: 'variables.env' });
const mysql = require('mysql2');
//Variables de entorno para conexion a la base de datos
const database = process.env.DB;
const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const password = process.env.DB_PASSW;
//console.log(process.env);
let instanciaConexion = null;
const connection = mysql.createPool({
    host,
    user,
    password,
    database,
    //waitForConnections: true
    connectionLimit: 10
});

connection.getConnection(function(errCon,con){
    if(errCon) {
        console.log('Error al conectar la bd: '+errCon);

    } else {
        connection.query(`USE ${database}`,
        function(err, results, fields) {
            if(err) {
                console.log('Error al cargar la base de datos '+errCon);

            } else {
                instanciaConexion =con;
                console.log("Base de datos ONLINE")
            }
        }); 
    }
});//generar la conexion

if (instanciaConexion === null) { //Patron singleton para retornar una misma instancia de conexion a base de datos
    instanciaConexion = connection
    console.log('Instancia');
};
module.exports = instanciaConexion; // retonar una unica conexion
