const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const connection = require('../conection/conexion');
const baseQuery = `
    SELECT estudiante.codigoestudiante, estudiante.dni, CONCAT(estudiante.nombre, ' ', estudiante.ape_paterno, ' ', estudiante.ape_materno) AS nombre, estudiante.est_beca, carrera.nom_carrera 
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
                redirect: false,
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
                redirect: false,
                redirectUrl: '/register',
                redirectDelay: 3000
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
            results: results, // Asegura que se pase results aunque esté vacío
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

async function generateExcelReport(req, res) {
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

async function generatePDFReport(req, res) {
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

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        const fileName = `Asistencia_${today}.pdf`;

        // Establecer los encabezados
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(16).text('Reporte de Asistencia', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);

        results.forEach(row => {
            doc.text(`Código: ${row.codigoestudiante}`);
            doc.text(`DNI: ${row.dni}`);
            doc.text(`Nombre: ${row.nombre}`);
            doc.text(`Beca: ${row.est_beca}`);
            doc.text(`Carrera: ${row.nom_carrera}`);
            doc.text(`Fecha: ${today}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error al generar el reporte');
    }
}

async function printReport(req, res) {
    const today = new Date().toISOString().slice(0, 10);
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

        let html = `
            <html>
            <head>
                <title>Reporte de Asistencia</title>
                <style>
                    @media print {
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .no-print { display: none; }
                    }
                    @media screen {
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .no-print { display: block; }
                    }
                </style>
            </head>
            <body>
                <h1>Reporte de Asistencia</h1>
                <button class="no-print" onclick="window.print()">Imprimir Reporte</button>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>DNI</th>
                            <th>Nombre</th>
                            <th>Beca</th>
                            <th>Carrera</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>`;

        results.forEach(row => {
            html += `
                <tr>
                    <td>${row.codigoestudiante}</td>
                    <td>${row.dni}</td>
                    <td>${row.nombre}</td>
                    <td>${row.est_beca}</td>
                    <td>${row.nom_carrera}</td>
                    <td>${today}</td>
                </tr>`;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>`;

        // Enviar HTML al navegador en una nueva ventana
        res.send(`
            <html>
            <head>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.location.href = document.referrer || '/';
                        };
                    };
                </script>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `);
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
    generateExcelReport: generateExcelReport,
    generatePDFReport: generatePDFReport,
    printReport: printReport,
    getTotalStudents: getTotalStudents,
    getRegisteredStudentsCount: getRegisteredStudentsCount
};
