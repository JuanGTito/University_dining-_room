const express = require('express');
const ExcelJS = require('exceljs');
const connection = require('../conection/conexion');
const baseQuery = `
SELECT estudiante.codigoestudiante, estudiante.dni, CONCAT(estudiante.nombre, ' ', estudiante.ape_paterno, ' ', estudiante.ape_materno) AS nombre, estudiante.est_beca, carrera.nom_carrera 
    FROM estudiante 
    JOIN carrera ON estudiante.idcarrera = carrera.idcarrera
`;

// Function to get all students and render the 'adm' view
function showListAdm(req, res) {
    connection.query(baseQuery, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error en la consulta');
        }
        res.render('adm', { 
            results: results, 
            login: req.session.loggedin || false, 
            name: req.session.name || ''
        });
    });
}

// Function to get all students and render the 'adm' view
function searchListAdm(req, res) {
    const { searchTerm } = req.body;

    const query = `
        SELECT e.codigoestudiante, e.dni, CONCAT(e.nombre, ' ', e.ape_paterno, ' ', e.ape_materno) AS nombre,
        e.est_beca, c.nom_carrera
        FROM estudiante e
        JOIN Carrera c ON e.idCarrera = c.idCarrera
        WHERE e.nombre LIKE ? OR e.dni LIKE ? OR e.codigoestudiante LIKE ? OR e.ape_paterno LIKE ? OR e.ape_materno LIKE ? OR c.nom_carrera LIKE ?
    `;

    const likeTerm = `%${searchTerm}%`;

    connection.query(query, [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm], (err, results) => {
        if (err) {
            console.error('Error al buscar estudiantes:', err);
            return res.status(500).json({ error: 'Error al buscar estudiantes.' });
        }

        res.json({ results });
    });
}

// Funcion para agregar estudiante
function addStudent(req, res) {
    const { codigoestudiante, dni, nombre, ape_paterno, ape_materno, est_beca, tip_beca, idCarrera } = req.body;

    // Valores predeterminados para idAdministracion e idusers
    const idAdministracion = 1;
    const idusers = 2;

    // Consulta SQL para agregar el estudiante
    const query = `
        INSERT INTO estudiante (
            codigoestudiante, 
            dni, 
            nombre, 
            ape_paterno, 
            ape_materno, 
            est_beca, 
            tip_beca, 
            idAdministracion, 
            idCarrera, 
            idusers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta para agregar el estudiante
    connection.query(query, [codigoestudiante, dni, nombre, ape_paterno, ape_materno, est_beca, tip_beca, idAdministracion, idCarrera, idusers], (error) => {
        if (error) {
            console.error('Error al agregar estudiante:', error);
            return res.status(500).json({ success: false, message: 'Error al agregar estudiante' });
        }
        res.json({ success: true });
    });
}

// Función para obtener los datos del estudiante
function getStudent(req, res) {
    const { codigoestudiante } = req.params;
    const query = 'SELECT * FROM estudiante WHERE codigoestudiante = ?';

    connection.query(query, [codigoestudiante], (error, results) => {
        if (error) {
            console.error('Error al obtener datos del estudiante:', error);
            return res.status(500).json({ success: false, message: 'Error al obtener datos del estudiante' });
        }
        res.json(results[0]);
    });
}

// Función para actualizar los datos del estudiante
function editStudent(req, res) {
    const { codigoestudiante, dni, nombre, ape_paterno, ape_materno, est_beca, tip_beca, idCarrera } = req.body;

    const query = `
        UPDATE estudiante SET
            dni = ?, 
            nombre = ?, 
            ape_paterno = ?, 
            ape_materno = ?, 
            est_beca = ?, 
            tip_beca = ?, 
            idCarrera = ?
        WHERE codigoestudiante = ?
    `;

    connection.query(query, [dni, nombre, ape_paterno, ape_materno, est_beca, tip_beca, idCarrera, codigoestudiante], (error) => {
        if (error) {
            console.error('Error al modificar estudiante:', error);
            return res.status(500).json({ success: false, message: 'Error al modificar estudiante' });
        }
        res.json({ success: true });
    });
}

// Funciona para eliminar estudiante
function deleteStudent(req, res) {
    const { codigoestudiante } = req.params;

    // Primero, elimina los registros dependientes en la tabla `encuesta`
    const deleteEncuestaQuery = `
        DELETE FROM encuesta
        WHERE codigoestudiante2 = ?
    `;

    connection.query(deleteEncuestaQuery, [codigoestudiante], (error) => {
        if (error) {
            console.error('Error al eliminar registros dependientes en encuesta:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar registros dependientes en encuesta' });
        }

        // Luego, elimina los registros dependientes en la tabla `asistencia`
        const deleteAsistenciaQuery = `
            DELETE FROM asistencia
            WHERE codigoestudiante1 = ?
        `;

        connection.query(deleteAsistenciaQuery, [codigoestudiante], (error) => {
            if (error) {
                console.error('Error al eliminar registros dependientes en asistencia:', error);
                return res.status(500).json({ success: false, message: 'Error al eliminar registros dependientes en asistencia' });
            }

            // Finalmente, elimina el estudiante
            const deleteEstudianteQuery = `
                DELETE FROM estudiante
                WHERE codigoestudiante = ?
            `;

            connection.query(deleteEstudianteQuery, [codigoestudiante], (error) => {
                if (error) {
                    console.error('Error al eliminar estudiante:', error);
                    return res.status(500).json({ success: false, message: 'Error al eliminar estudiante' });
                }
                res.json({ success: true });
            });
        });
    });
}



module.exports = {
    showListAdm,
    searchListAdm,
    addStudent,
    editStudent,
    deleteStudent,
    getStudent
};
