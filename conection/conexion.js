function conexion(){
    const Connection = require('mysql');  
    var config = Connection.createConnection({
    host: "localhost",
    database: "comedor_universitario",
    user: "admin", //admin
    password: "admin" //admin
});

config.connect(function(err){
    if(err){
        throw err;
    } else{
        console.log("conexion exitosa")
    }
    
});
config.query('SELECT * FROM estudiante WHERE dni = "60177245"', (error, resultados) => 
    { if (error) throw error; console.log('Registros de la tabla "usuarios":', resultados); });
  };
  conexion();