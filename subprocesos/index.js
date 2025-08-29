const { fork } = require('child_process');
const child = fork(__dirname + '/../controllers/FacturasNoEnvidasController',{
    detached: true
});
let tipo = '';
let contador = 1;//com

setInterval(() => {
    
    //contador ++; //DESACTIVA SYN
    console.log('Contador', contador);
    //contador=1;///AGREGADO X SYN
    if(contador === 1) {
        tipo = 'Facturas';
        contador ++;
    } else if(contador === 2) {
        tipo = 'FacturasSinCorreo';
        contador ++;  
    } else if (contador === 3) {
        tipo = 'Entradas';
        contador ++;
         
    } else if (contador === 4) {
        tipo = 'NotaCredito';
        contador = 1;
    } 
    
    child.send(tipo);
    child.on('message', (message) => {
        console.log('Iniciando subproceso', tipo);
        console.log(child.pid);
        //process.kill(child.pid)
    });

},120000);////estaba en 120000
