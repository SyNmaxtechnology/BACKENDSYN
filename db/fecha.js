const moment = require("moment-timezone");
require("dotenv").config({ path: '../variables.env'});
moment.tz.setDefault(process.env.TZ);

module.exports = () => {

    const f = Date.now();
    const fechaEmision = moment(f).toISOString(true);

    return fechaEmision
}
//