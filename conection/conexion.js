const Connection = require('mysql');  
var config = Connection.createConnection({
    host: "localhost",
    database: "comedor_universitario",
    user: "admin",
    password: "admin"
});

config.connect(function(err){
    if(err){
        throw err;
    } else{
        console.log("conexion exitosa")
    }
});
