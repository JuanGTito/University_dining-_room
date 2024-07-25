const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: './env/.env' });

// Crear la conexión a la base de datos usando las variables de entorno
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

// Conectar a la base de datos
conexion.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error);
        return;
    }
    console.log("Conexión exitosa");
});

// Función para registrar usuarios de prueba
async function registerUser(user, pass) {
    try {
        const passwordHash = await bcrypt.hash(pass, 8);
        conexion.query('INSERT INTO users SET ?', { usuario: user, contrasenia: passwordHash }, (error, results) => {
            if (error) {
                console.error('Error al registrar: ', error);
            } else {
                console.log('Usuario registrado');
                // res.redirect('/'); // Descomentar si deseas redirigir después del registro
            }
        });
    } catch (err) {
        console.error('Error al hashear la contraseña: ', err);
    }
}

// Llamar a la función de registro
registerUser("administrador", "54321");
registerUser("nutricionista", "987654");
registerUser("supervisor", "789456");
registerUser("concesionaria", "524862");

module.exports = conexion;
