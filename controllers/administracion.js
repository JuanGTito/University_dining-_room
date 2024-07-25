const express = require('express');
const ExcelJS = require('exceljs');
const connection = require('../conection/conexion');
const baseQuery = `
SELECT estudiante.codigoestudiante, estudiante.dni, estudiante.nombre, estudiante.est_beca, carrera.nom_carrera 
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
    const searchTerm = req.body.searchTerm.trim();
    const login = req.session.loggedin || false;

    if (searchTerm) {
        let query = baseQuery;
        let queryParams = [];
        let alertMessage = '';
        let alertType = 'message';
        let redirect = false;
        let redirectUrl = '';
        let redirectDelay = 0;

        if (!isNaN(searchTerm)) {
            query += ' WHERE codigoestudiante = ? OR dni = ?';
            queryParams = [searchTerm, searchTerm];
        } else {
            alertMessage = 'El campo Código/DNI debe ser numérico.';
            alertType = 'error';
            redirect = true;
            redirectUrl = '/adm';
            redirectDelay = 2000;
        }

        connection.query(query, queryParams, (error, results) => {
            if (error) {

                alertMessage = 'Error en la consulta';
                alertType = 'error';
                redirect = true;
                redirectUrl = '/adm';
                redirectDelay = 2000;
            }
            console.log(error)
            res.render('adm', {
                results: results,
                login: login,
                name: req.session.name || '',
                alertMessage: alertMessage || 'Encontrado',
                alertType: alertType || 'success',
                redirect: false,
                redirectUrl: redirectUrl,
                redirectDelay: 20000
            });
        });
    } else {
        res.render('adm', {
            results: [],
            login: login,
            name: req.session.name || '',
            alertMessage: 'El campo Código/DNI no puede estar vacío.',
            alertType: 'error',
            redirect: true,
            redirectUrl: '/adm',
            redirectDelay: 2000
        });
    }
}


// Function to add a new student
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

// Function to delete a student
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
    getStudent,
    editStudent
};
