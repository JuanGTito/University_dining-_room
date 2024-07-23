const connection = require('../conection/conexion');
const baseQuery = `
    SELECT estudiante.codigoestudiante, estudiante.dni, estudiante.nombre, estudiante.est_beca, carrera.nom_carrera 
    FROM estudiante 
    JOIN carrera ON estudiante.idcarrera = carrera.idcarrera
`;

// Función para obtener todos los estudiantes
function showList(req, res) {
    connection.query(baseQuery, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error en la consulta');
        } else {
            res.render('register', { results: results, login: req.session.loggedin || false, name: req.session.name || '' });
        }
    });
}

// Función para buscar estudiante por código
function searchList(req, res) {
    
    // Obtiene el término de búsqueda y elimina espacios innecesarios
    const searchTerm = req.body.codigo.trim();

    console.log('Código de búsqueda:', searchTerm);

    // Verificar si el usuario está autenticado
    const login = req.session.loggedin || false;

    if (searchTerm) {
        let query = baseQuery;
        let queryParams = [];

        if (!isNaN(searchTerm)) {
            // Si el término de búsqueda es un número, busca por código o DNI
            query += 'WHERE codigoestudiante = ? OR dni = ?';
            queryParams = [searchTerm, searchTerm];
        } else {
            // Si no es un número, podrías manejarlo como un error o simplemente no realizar la búsqueda
            return res.status(400).send('El término de búsqueda debe ser un número.');
        }

        connection.query(query, queryParams, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error en la consulta');
            }
            res.render('register', { results: results, login: req.session.loggedin || false, name: req.session.name || '' });
        });
    } else {
        res.render('register', { results: [], login: req.session.loggedin || false, name: req.session.name || '' });
    }

}

// Función para registrar asistencia
function registerAttendance(req, res) {
    const codigoestudiante = req.body.selectedStudent;
    const fechaHora = new Date(); // Obtiene la fecha y hora actual del servidor

    if (codigoestudiante) {
        const query = 'INSERT INTO asistencia (fecha_hora, codigoestudiante1) VALUES (?, ?)';
        connection.query(query, [fechaHora, codigoestudiante], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al registrar asistencia');
            }
            res.redirect('/register');
            console.log("ASISTENCIA REGISTRADA")
        });
    } else {
        res.status(400).send('No se ha seleccionado ningún estudiante.');
    }
}

module.exports = {
    showList: showList, 
    searchList: searchList,
    registerAttendance: registerAttendance
};