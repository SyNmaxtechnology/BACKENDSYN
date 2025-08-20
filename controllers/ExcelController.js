const xlsx = require('excel4node');
const fs = require("fs");
const json2xls = require("json2xls");
var data = [{"Vehicle":"BMW","Date":"30, Jul 2013 09:24 AM","Location":"Hauz Khas, Enclave, New Delhi, Delhi, India","Speed":42},{"Vehicle":"Honda CBR","Date":"30, Jul 2013 12:00 AM","Location":"Military Road,  West Bengal 734013,  India","Speed":0},{"Vehicle":"Supra","Date":"30, Jul 2013 07:53 AM","Location":"Sec-45, St. Angel's School, Gurgaon, Haryana, India","Speed":58},{"Vehicle":"Land Cruiser","Date":"30, Jul 2013 09:35 AM","Location":"DLF Phase I, Marble Market, Gurgaon, Haryana, India","Speed":83},{"Vehicle":"Suzuki Swift","Date":"30, Jul 2013 12:02 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Civic","Date":"30, Jul 2013 12:00 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Accord","Date":"30, Jul 2013 11:05 AM","Location":"DLF Phase IV, Super Mart 1, Gurgaon, Haryana, India","Speed":71}]
const path = require("path");
const reporteFacturaOTiquete = (obj) => {
    return new Promise((resolve,reject) => {
        if(typeof obj === 'undefined') {
            return reject('No se puede generar un reporte sin datos');
        } else {
          
          var json = [{"Vehicle":"BMW","Date":"30, Jul 2013 09:24 AM","Location":"Hauz Khas, Enclave, New Delhi, Delhi, India","Speed":42},{"Vehicle":"Honda CBR","Date":"30, Jul 2013 12:00 AM","Location":"Military Road,  West Bengal 734013,  India","Speed":0},{"Vehicle":"Supra","Date":"30, Jul 2013 07:53 AM","Location":"Sec-45, St. Angel's School, Gurgaon, Haryana, India","Speed":58},{"Vehicle":"Land Cruiser","Date":"30, Jul 2013 09:35 AM","Location":"DLF Phase I, Marble Market, Gurgaon, Haryana, India","Speed":83},{"Vehicle":"Suzuki Swift","Date":"30, Jul 2013 12:02 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Civic","Date":"30, Jul 2013 12:00 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Accord","Date":"30, Jul 2013 11:05 AM","Location":"DLF Phase IV, Super Mart 1, Gurgaon, Haryana, India","Speed":71}]

        // setup workbook and sheet
            var wb = new xlsx.Workbook();

            var ws = wb.addWorksheet('Sheet');

            // Add a title row

            ws.cell(1, 1)
              .string('Vehicle')

            ws.cell(1, 2)
              .string('Date')

            ws.cell(1, 3)
              .string('Location')

            ws.cell(1, 4)
              .string('Speed')

            // add data from json

            for (let i = 0; i < json.length; i++) {

              let row = i + 2

              ws.cell(row, 1)
                .string(json[i].Vehicle)

              ws.cell(row, 2)
                .date(json[i].Date)

              ws.cell(row, 3)
                .string(json[i].Location)

              ws.cell(row, 4)
                .number(json[i].Speed)
            }

            resolve( wb )

        }
    })
}

const reporteNotaCreditoAnulacion =  (obj) => {
    return new Promise((resolve,reject) => {
        if(typeof obj === 'undefined') {
            return reject('No se puede generar un reporte sin datos');
        } else {
            
        }
    })
}

const reporteRecepcion =  (obj) => {
    return new Promise((resolve,reject) => {
        if(typeof obj === 'undefined') {
            return reject('No se puede generar un reporte sin datos');
        } else {
            
        }
    })
}

const reporteFacturaCompra =  (obj) => {
    return new Promise((resolve,reject) => {
        if(typeof obj === 'undefined') {
            return reject('No se puede generar un reporte sin datos');
        } else {
            
        }
    })
}
 
const generarReporte= (req) => {

    const {obj, tipoReporte} = req.query;

    if(tipoReporte == '01' || tipoReporte == '04') return reporteFacturaOTiquete(obj);
    if(tipoReporte == '03') return reporteNotaCreditoAnulacion(obj);
    if(tipoReporte == '05') return reporteRecepcion(obj);
    if(tipoReporte == '08') return reporteFacturaCompra(obj);
}

const descargarReporte = (req, res) => {
  console.log(req.query);
    generarReporte(req).then( file => {

        const nombreArchivo = 'ReporteComprobante_'+'variable'+'.xlsx';
        //fs.writeFileSync(nombreArchivo, file, 'binary');
        //file.write(nombreArchivo);
        const xls = json2xls(data);
        fs.writeFileSync('../data.xlsx', xls, 'binary');
        res.download(path.join(__dirname, '../data.xlsx'), (err) => { // el archivo se descarga
          if (err) {
              console.log(err);
          
            };
          

      })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: err
        });
    })

    
}


module.exports = {
    descargarReporte
}


/*
var json = [{"Vehicle":"BMW","Date":"30, Jul 2013 09:24 AM","Location":"Hauz Khas, Enclave, New Delhi, Delhi, India","Speed":42},{"Vehicle":"Honda CBR","Date":"30, Jul 2013 12:00 AM","Location":"Military Road,  West Bengal 734013,  India","Speed":0},{"Vehicle":"Supra","Date":"30, Jul 2013 07:53 AM","Location":"Sec-45, St. Angel's School, Gurgaon, Haryana, India","Speed":58},{"Vehicle":"Land Cruiser","Date":"30, Jul 2013 09:35 AM","Location":"DLF Phase I, Marble Market, Gurgaon, Haryana, India","Speed":83},{"Vehicle":"Suzuki Swift","Date":"30, Jul 2013 12:02 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Civic","Date":"30, Jul 2013 12:00 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Accord","Date":"30, Jul 2013 11:05 AM","Location":"DLF Phase IV, Super Mart 1, Gurgaon, Haryana, India","Speed":71}]

const createSheet = () => {

  return new Promise(resolve => {

// setup workbook and sheet
var wb = new xl.Workbook();

var ws = wb.addWorksheet('Sheet');

// Add a title row

ws.cell(1, 1)
  .string('Vehicle')

ws.cell(1, 2)
  .string('Date')

ws.cell(1, 3)
  .string('Location')

ws.cell(1, 4)
  .string('Speed')

// add data from json

for (let i = 0; i < json.length; i++) {

  let row = i + 2

  ws.cell(row, 1)
    .string(json[i].Vehicle)

  ws.cell(row, 2)
    .date(json[i].Date)

  ws.cell(row, 3)
    .string(json[i].Location)

  ws.cell(row, 4)
    .number(json[i].Speed)
}

resolve( wb )

  })
}

*/