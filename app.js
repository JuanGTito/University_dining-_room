// 1 - Invocamos a Express
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./conection/conexion'); // Importamos la conexión a la base de datos

const app = express();

// 2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // además le decimos a express que vamos a usar json

// 3 - Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

// 4 - seteamos el directorio de assets
app.use('/assets', express.static(path.join(process.cwd(), 'public')));
app.use(express.static('views'));

// 5 - Establecemos el motor de plantillas
app.set('view engine', 'ejs');

// 7 - variables de session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

// Ruta para obtener el inventario
app.get('/inventario', (req, res) => {
    const sql = 'SELECT * FROM Inventario';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// 8 - Invocamos a la ruta
app.use('/', require('./router'));

// función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Logout - Destruye la sesión.
app.get('/logout', function (req, res) {
    req.session.destroy(() => {
        res.redirect('/'); // siempre se ejecutará después de que se destruya la sesión
    });
});

app.listen(5000, () => {
    console.log("servidor corriendo en http://localhost:5000");
});
