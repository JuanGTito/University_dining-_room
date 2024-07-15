    const mysql = require('mysql');
      
    var conexion = mysql.createConnection({
    host: "localhost",
    database: "comedor_universitario",
    user: "admin", //admin
    password: "admin" //admin
});

conexion.connect((error)=>{
    if(error){
        console.error('el error de conexion es: '+error);
        return
    }
    console.log("conexion exitosa");
});

module.exports = conexion;