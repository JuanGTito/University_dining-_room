const conexion = require('../conection/conexion');

// Mostrar lista de estudiantes
function showListAdm(req, res) {
    const query = 'SELECT * FROM estudiantes';
    conexion.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.render('adm', { results, login: req.session.loggedin, name: req.session.name });
        }
    });
}

// Agregar estudiante
function addStudent(req, res) {
    const { dni, nombre, est_beca, idcarrera } = req.body;
    const query = 'INSERT INTO estudiantes (dni, nombre, est_beca, idcarrera) VALUES (?, ?, ?, ?)';
    conexion.query(query, [dni, nombre, est_beca, idcarrera], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.redirect('/adm');
        }
    });
}

// Modificar estudiante
function updateStudent(req, res) {
    const { codigoestudiante, dni, nombre, est_beca, idcarrera } = req.body;
    const query = 'UPDATE estudiantes SET dni = ?, nombre = ?, est_beca = ?, idcarrera = ? WHERE codigoestudiante = ?';
    conexion.query(query, [dni, nombre, est_beca, idcarrera, codigoestudiante], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.redirect('/adm');
        }
    });
}

// Eliminar estudiante
function deleteStudent(req, res) {
    const { selectedStudent } = req.body;
    const query = 'DELETE FROM estudiantes WHERE codigoestudiante = ?';
    conexion.query(query, [selectedStudent], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.redirect('/adm');
        }
    });
}

module.exports = {
    showListAdm: showListAdm,
    addStudent: addStudent,
    updateStudent: updateStudent,
    deleteStudent: deleteStudent
};

