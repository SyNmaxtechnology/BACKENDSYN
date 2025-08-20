const { fork } = require('child_process');
const child = fork(__dirname + '/../controllers/FacturasNoEnvidasController',{
    detached: true
});
let tipo = '';
let contador = 0;//com

setInterval(() => {
    
    //contador ++;
    contador=1;///AGREGADO X SYN
    if(contador === 1) {
        //tipo = 'NotaCredito';
        tipo = 'Entradas';
       // tipo = 'Facturas';
        contador =0;
    } else if(contador === 2) {
        //tipo = 'FacturasSinCorreo';
        //tipo = 'Facturas2'; 
        contador = 1;  
    }/* else if (contador === 3) {
        tipo = 'FacturasSinCorreo';
     //   contador = 0;
         
    } else if (contador === 4) {
        tipo = 'NotaCredito';
     //   contador = 0;
    } 
    else if(contador === 5){
        tipo = 'Entradas';
     
        
    }*/
    child.send(tipo);
    child.on('message', (message) => {
        console.log('Iniciando subproceso', tipo);
        console.log(child.pid);
        //process.kill(child.pid)
    });

},120000);////estaba en 120000
