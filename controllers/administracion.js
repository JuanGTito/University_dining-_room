const ExcelJS = require('exceljs');
const connection = require('../conection/conexion');
const baseQuery = `
    SELECT estudiante.codigoestudiante, estudiante.dni, estudiante.nombre, estudiante.est_beca, carrera.nom_carrera 
    FROM estudiante 
    JOIN carrera ON estudiante.idcarrera = carrera.idcarrera
`;

// Función para obtener todos los estudiantes
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



module.exports = {
    showListAdm: showListAdm,
    searchListAdm: searchListAdm
};