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
        // Asegurarse de pasar un array vacío si no hay resultados
        res.render('adm', { 
            results: results || [], 
            login: req.session.loggedin || false, 
            name: req.session.name || ''
        });
    });
}

module.exports = {
    showListAdm
};
