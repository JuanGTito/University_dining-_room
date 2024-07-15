    const mysql = require('mysql');
      
    var conexion = mysql.createConnection({
    host: "localhost",
    database: "comedor_universitario",
    user: "root", //admin
    password: "root" //admin
});

conexion.connect((error)=>{
    if(error){
        console.error('el error de conexion es: '+error);
        return
    }
    console.log("conexion exitosa");
});

module.exports = conexion;