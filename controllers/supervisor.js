const connection = require('../conection/conexion');

function search(req, res) {
    connection.query('SELECT * FROM estudiante', (error, results) => {
        console.log(results);
        if (error) {
            console.log(error);
            return res.status(500).send('Error en la consulta');
        } else {
            res.render('register', { results: results, login: req.session.loggedin || false, name: req.session.name || '' });
        }
    });
}

module.exports = search;
