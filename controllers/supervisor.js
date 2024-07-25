const ExcelJS = require('exceljs');
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
            console.error(error);
            return res.status(500).send('Error en la consulta');
        }
        res.render('register', { 
            results: results, 
            login: req.session.loggedin || false, 
            name: req.session.name || ''
        });
    });
}

// Función para buscar estudiante por código
function searchList(req, res) {
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
            redirectUrl = '/register';
            redirectDelay = 2000;
        }

        connection.query(query, queryParams, (error, results) => {
            if (error) {

                alertMessage = 'Error en la consulta';
                alertType = 'error';
                redirect = true;
                redirectUrl = '/register';
                redirectDelay = 2000;
            }
            console.log(error)
            res.render('register', {
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
        res.render('register', {
            results: [],
            login: login,
            name: req.session.name || '',
            alertMessage: 'El campo Código/DNI no puede estar vacío.',
            alertType: 'error',
            redirect: true,
            redirectUrl: '/register',
            redirectDelay: 2000
        });
    }
}

// Función para registrar asistencia
function registerAttendance(req, res) {
    const codigoestudiante = req.body.selectedStudent;
    const login = req.session.loggedin || false;
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    

    if (!codigoestudiante) {

        return res.render('register', {
            results: [], // Asegura que se pase results aunque esté vacío
            login: login,
            name: req.session.name || '',
            alertMessage: 'Código del estudiante no proporcionado.',
            alertType: 'error',
            redirect: true,
            redirectUrl: '/register',
            redirectDelay: 4000
        });
    }

    const checkQuery = `
        SELECT COUNT(*) AS count
        FROM asistencia
        WHERE codigoestudiante1 = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 3 HOUR)
    `;

    connection.query(checkQuery, [codigoestudiante], (error, results) => {
        if (error) {
            console.error('Error en la consulta de verificación de asistencia:', error);
            return res.render('register', {
                results: [], // Asegura que se pase results aunque esté vacío
                login: login,
                name: req.session.name || '',
                alertMessage: 'Error en la verificación de asistencia',
                alertType: 'error',
                redirect: true,
                redirectUrl: '/register',
                redirectDelay: 4000
            });
        }

        const count = results[0].count;

        if (count > 0) {
            return res.render('register', {
                results: [], // Asegura que se pase results aunque esté vacío
                login: login,
                name: req.session.name || '',
                alertMessage: 'Ya has registrado asistencia recientemente. Regresa dentro de 3 horas.',
                alertType: 'warning',
                redirect: true,
                redirectUrl: '/register',
                redirectDelay: 4000
            });
        }

        const insertQuery = `
            INSERT INTO asistencia (fecha_hora, codigoestudiante1)
            VALUES (?, ?)
        `;

        connection.query(insertQuery, [currentDateTime, codigoestudiante], (error) => {
            if (error) {
                console.error('Error en la consulta de registro de asistencia:', error);
                return res.render('register', {
                    results: [], // Asegura que se pase results aunque esté vacío
                    login: login,
                    name: req.session.name || '',
                    alertMessage: 'Error en el registro de asistencia',
                    alertType: 'error',
                    redirect: true,
                    redirectUrl: '/register',
                    redirectDelay: 4000
                });
            }

            res.render('register', {
                results: [], // Asegura que se pase results aunque esté vacío
                login: login,
                name: req.session.name || '',
                alertMessage: 'Asistencia registrada correctamente.',
                alertType: 'success',
                redirect: true,
                redirectUrl: '/register',
                redirectDelay: 4000
            });
        });
    });
}

// Función para registrar asistencia automáticamente
function autoRegister(req, res) {
    const codigo = req.body.codigo;
    const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!codigo) {
        return res.render('register', {
            results: [], // Asegura que se pase results aunque esté vacío
            login: req.session.loggedin || false,
            name: req.session.name || '',
            alertMessage: 'Código de estudiante no proporcionado.',
            alertType: 'error',
            redirect: false,
            redirectUrl: '/register',
            redirectDelay: 4000
        });
    }

    const checkStudentQuery = `
        SELECT COUNT(*) AS count
        FROM estudiante
        WHERE codigoestudiante = ?
    `;
    
    connection.query(checkStudentQuery, [codigo], (error, results) => {
        if (error) {
            console.error("Error al verificar el estudiante: ", error);
            return res.render('register', {
                results: [], // Asegura que se pase results aunque esté vacío
                login: req.session.loggedin || false,
                name: req.session.name || '',
                alertMessage: 'Error en la verificación del estudiante',
                alertType: 'error',
                redirect: false,
                redirectUrl: redirectUrl,
                redirectDelay: 4000
            });
        }

        const studentExists = results[0].count > 0;

        if (!studentExists) {
            return res.render('register', {
                results: [], // Asegura que se pase results aunque esté vacío
                login: req.session.loggedin || false,
                name: req.session.name || '',
                alertMessage: 'El estudiante no existe en la base de datos.',
                alertType: 'error',
                redirect: false,
                redirectUrl: redirectUrl,
                redirectDelay: 4000
            });
        }

        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM asistencia
            WHERE codigoestudiante1 = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 3 HOUR)
        `;
        
        connection.query(checkQuery, [codigo], (error, results) => {
            if (error) {
                console.error("Error al verificar la asistencia: ", error);
                return res.render('register', {
                    results: [], // Asegura que se pase results aunque esté vacío
                    login: req.session.loggedin || false,
                    name: req.session.name || '',
                    alertMessage: 'Error en la verificación de asistencia',
                    alertType: 'error',
                    redirect: false,
                    redirectUrl: '/register',
                    redirectDelay: 4000
                });
            }

            const count = results[0].count;

            if (count > 0) {
                return res.render('register', {
                    results: [], // Asegura que se pase results aunque esté vacío
                    login: req.session.loggedin || false,
                    name: req.session.name || '',
                    alertMessage: 'El estudiante ya está registrado. Vuelve a intentarlo después de 3 horas.',
                    alertType: 'warning',
                    redirect: false,
                    redirectUrl: '/register',
                    redirectDelay: 4000
                });
            }

            const insertQuery = `
                INSERT INTO asistencia (fecha_hora, codigoestudiante1)
                VALUES (?, ?)
            `;
            
            connection.query(insertQuery, [fechaHora, codigo], (error) => {
                if (error) {
                    console.error("Error al registrar la asistencia: ", error);
                    return res.render('register', {
                        results: [], // Asegura que se pase results aunque esté vacío
                        login: req.session.loggedin || false,
                        name: req.session.name || '',
                        alertMessage: 'Error en el registro de asistencia',
                        alertType: 'error',
                        redirect: false,
                        redirectUrl: '/register',
                        redirectDelay: 4000
                    });
                }

                res.render('register', {
                    results: [], // Asegura que se pase results aunque esté vacío
                    login: req.session.loggedin || false,
                    name: req.session.name || '',
                    alertMessage: 'Asistencia registrada correctamente.',
                    alertType: 'success',
                    redirect: false,
                    redirectUrl: '/register',
                    redirectDelay: 4000
                });
            });
        });
    });
}

/// PARTE START

async function generateReport(req, res) {
    const today = new Date().toISOString().slice(0, 10); // Fecha de hoy en formato YYYY-MM-DD
    const sql = `
        SELECT estudiante.codigoestudiante, estudiante.dni, estudiante.nombre, estudiante.est_beca, carrera.nom_carrera
        FROM asistencia
        JOIN estudiante ON asistencia.codigoestudiante1 = estudiante.codigoestudiante
        JOIN carrera ON estudiante.idcarrera = carrera.idcarrera
        WHERE DATE(fecha_hora) = CURDATE()`;

    try {
        const results = await new Promise((resolve, reject) => {
            connection.query(sql, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        // Crear un nuevo libro de trabajo
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asistencia');

        // Añadir los encabezados
        worksheet.columns = [
            { header: 'Código', key: 'codigoestudiante', width: 15 },
            { header: 'DNI', key: 'dni', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 25 },
            { header: 'Beca', key: 'est_beca', width: 10 },
            { header: 'Carrera', key: 'nom_carrera', width: 25 },
            { header: 'Fecha', key: 'fecha', width: 15 }
        ];

        // Añadir los datos
        results.forEach(row => {
            worksheet.addRow({
                codigoestudiante: row.codigoestudiante,
                dni: row.dni,
                nombre: row.nombre,
                est_beca: row.est_beca,
                nom_carrera: row.nom_carrera,
                fecha: today
            });
        });

        // Establecer el nombre del archivo
        const fileName = `Asistencia_${today}.xlsx`;

        // Enviar el archivo al cliente
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error al generar el reporte');
    }
}

function getTotalStudents(req, res) {
    const sql = 'SELECT COUNT(*) AS total FROM estudiante';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener el total de estudiantes:', error);
            return res.status(500).send('Error al obtener el total de estudiantes');
        }
        res.json({ total: results[0].total });
    });
}

function getRegisteredStudentsCount(req, res) {
    const sql = 'SELECT COUNT(*) AS count FROM asistencia WHERE DATE(fecha_hora) = CURDATE()';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener el número de estudiantes registrados:', error);
            return res.status(500).send('Error al obtener el número de estudiantes registrados');
        }
        res.json({ count: results[0].count });
    });
}

module.exports = {
    showList : showList,
    searchList: searchList,
    registerAttendance: registerAttendance,
    autoRegister: autoRegister,
    generateReport: generateReport,
    getTotalStudents: getTotalStudents,
    getRegisteredStudentsCount: getRegisteredStudentsCount
};
