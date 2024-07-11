var Connection = require('mysql');  
var config = mysql.createConnection({
    host: "localhost",
    database: "comedor_universitario",
    user: "root",
    password: "admin"
});

config.connect(function(err){
    if(err){
        throw err;
    } else{
        console.log("conexion exitosa")
    }
});
