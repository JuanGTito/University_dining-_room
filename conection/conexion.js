//2 - Invocamos a MySQL y realizamos la conexion
    const mysql = require('mysql');

    const bcrypt = require('bcryptjs');

    //Con variables de entorno      
    var conexion = mysql.createConnection({
    host    : process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user    : process.env.DB_USER,
    password: process.env.DB_PASS 
});

conexion.connect((error)=>{
    if(error){
        console.error('el error de conexion es: '+error);
        return;
    }
    
    console.log("conexion exitosa");
});

//REGISTRAR USUSARIO PRUEBA
//SOLO EJECUTAR 1 VEZ COMO PRUEBA ANTES DE ENVIAR LOS RESPECTIVOS USUARIOS

//async function registerUser(user, pass) {
//    try {
//        const passwordHash = await bcrypt.hash(pass, 8);
//        conexion.query('INSERT INTO users SET ?', { usuario: user, contrasenia: passwordHash }, (error, results) => {
//            if (error) {
//                console.error('Error al registrar: ', error);
//            } else {
//                console.log('Usuario registrado');
//                // res.redirect('/'); // Uncomment if you want to redirect after registration
//            }
//        });
//    } catch (err) {
//        console.error('Error al hashear la contraseña: ', err);
//    }
//}
//
// //Llamar a la función de registro
//registerUser("admin", "12345");
//
//module.exports = conexion;