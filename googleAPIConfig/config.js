require("dotenv").config({ path: './../variables.env'});

module.exports =  {//
    client_secret: process.env.CLIENT_SECRET,
    cliente_id: process.env.CLIENT_ID,
    client_email: process.env.API_CLIENT_EMAIL,
    folder_id:process.env.API_FOLDER_ID
}
