const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

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

    // Iniciar una transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).json({ success: false, message: 'Error al iniciar la transacción' });
        }

        // Eliminar registros dependientes en `encuesta`
        const deleteEncuestaQuery = 'DELETE FROM encuesta WHERE codigoestudiante2 = ?';
        connection.query(deleteEncuestaQuery, [codigoestudiante], (error) => {
            if (error) {
                return connection.rollback(() => {
                    console.error('Error al eliminar registros dependientes en encuesta:', error);
                    res.status(500).json({ success: false, message: 'Error al eliminar registros dependientes en encuesta' });
                });
            }

            // Eliminar registros dependientes en `asistencia`
            const deleteAsistenciaQuery = 'DELETE FROM asistencia WHERE codigoestudiante1 = ?';
            connection.query(deleteAsistenciaQuery, [codigoestudiante], (error) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error al eliminar registros dependientes en asistencia:', error);
                        res.status(500).json({ success: false, message: 'Error al eliminar registros dependientes en asistencia' });
                    });
                }

                // Finalmente, eliminar el estudiante
                const deleteEstudianteQuery = 'DELETE FROM estudiante WHERE codigoestudiante = ?';
                connection.query(deleteEstudianteQuery, [codigoestudiante], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error al eliminar estudiante:', error);
                            res.status(500).json({ success: false, message: 'Error al eliminar estudiante' });
                        });
                    }

                    // Commit de la transacción
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al hacer commit de la transacción:', err);
                                res.status(500).json({ success: false, message: 'Error al hacer commit de la transacción' });
                            });
                        }
                        res.json({ success: true });
                    });
                });
            });
        });
    });
}

// Función para obtener el ID de carrera basado en el nombre
async function getIdCarrera(nom_carrera) {
    const query = 'SELECT idCarrera FROM carrera WHERE nom_carrera = ?';
    const [rows] = await connection.promise().query(query, [nom_carrera]);
    return rows.length > 0 ? rows[0].idCarrera : null;
}

async function importRelation(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
        }

        const filePath = path.join(__dirname, '../uploads', req.file.filename);

        // Leer el archivo Excel
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const row of data) {
            // Verificar el mapeo de idCarrera
            const idCarrera = await getIdCarrera(row.nom_carrera);

            if (idCarrera === null) {
                console.warn(`No se encontró ID de carrera para: ${row.nom_carrera}`);
                continue; // O maneja el caso según sea necesario
            }

            const existingStudentQuery = 'SELECT COUNT(*) AS count FROM estudiante WHERE codigoestudiante = ?';
            const [rows] = await connection.promise().query(existingStudentQuery, [row.codigoestudiante]);
            const studentExists = rows[0].count > 0;

            if (studentExists) {
                const updateQuery = `
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
                await connection.promise().query(updateQuery, [row.dni, row.nombre, row.ape_paterno, row.ape_materno, row.est_beca, row.tip_beca, idCarrera, row.codigoestudiante]);
            } else {
                const insertQuery = `
                    INSERT INTO estudiante (
                        codigoestudiante, dni, nombre, ape_paterno, ape_materno, est_beca, tip_beca, idAdministracion, idCarrera, idusers
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await connection.promise().query(insertQuery, [row.codigoestudiante, row.dni, row.nombre, row.ape_paterno, row.ape_materno, row.est_beca, row.tip_beca, 1, idCarrera, 2]);
            }
        }

        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Relación importada correctamente.' });
    } catch (error) {
        console.error('Error al importar relación:', error);
        res.status(500).json({ success: false, message: 'Error al importar relación', error: error.message });
    }
}

// Función para exportar la asistencia
function exportarAsistencia(req, res) {
    const { fecha } = req.body;

    // Consulta a la base de datos para obtener la asistencia según la fecha
    const query = `
        SELECT a.codigoestudiante1 AS codigo_estudiante, e.dni, e.nombre, e.ape_paterno, e.ape_materno, e.est_beca, e.tip_beca, c.nom_carrera AS carrera
        FROM Asistencia a
        JOIN Estudiante e ON a.codigoestudiante1 = e.codigoestudiante
        JOIN Carrera c ON e.idCarrera = c.idCarrera
        WHERE DATE(a.fecha_hora) = ?;
    `;

    connection.query(query, [fecha], (error, rows) => {
        if (error) {
            console.error('Error al realizar la consulta:', error);
            res.status(500).send('Error al realizar la consulta.');
            return;
        }

        // Crear el libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asistencia');

        // Añadir encabezados
        worksheet.columns = [
            { header: 'Código Estudiante', key: 'codigo_estudiante', width: 20 },
            { header: 'DNI', key: 'dni', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Apellido Paterno', key: 'ape_paterno', width: 20 },
            { header: 'Apellido Materno', key: 'ape_materno', width: 20 },
            { header: 'Estado Beca', key: 'est_beca', width: 15 },
            { header: 'Tipo de Beca', key: 'tip_beca', width: 15 },
            { header: 'Carrera', key: 'carrera', width: 20 }
        ];

        // Añadir filas con los datos obtenidos de la consulta
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        // Configurar las cabeceras y exportar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=asistencia_${fecha}.xlsx`);

        workbook.xlsx.write(res)
            .then(() => {
                res.end();
            })
            .catch((error) => {
                console.error('Error al exportar asistencia:', error);
                res.status(500).send('Error al exportar asistencia.');
            });
    });
}

function menuSemanal(req, res){
    connection.query('SET lc_time_names = \'es_ES\'', (err) => {
        if (err) return res.status(500).send('Error en la configuración del idioma');
        
        // Consultar el menú semanal
        const query = `
        SELECT 
            DATE_FORMAT(m.fecha, '%W') AS dia_semana, 
            MAX(CASE WHEN m.tip_menu = 'Desayuno' THEN c.nombre ELSE '' END) AS desayuno,
            MAX(CASE WHEN m.tip_menu = 'Almuerzo' THEN c.nombre ELSE '' END) AS almuerzo
        FROM Menu m
        JOIN Comida c ON m.idMenu = c.idMenu
        WHERE m.fecha BETWEEN CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY AND CURDATE() + INTERVAL (6 - WEEKDAY(CURDATE())) DAY
        GROUP BY m.fecha, DATE_FORMAT(m.fecha, '%W')
        ORDER BY m.fecha;
        `;
    
        connection.query(query, (err, results) => {
          if (err) return res.status(500).send('Error en la consulta');
          res.json(results); // Enviar los datos al frontend en formato JSON
        });
      });
}

function encuestas(req, res) {
    connection.query('SELECT Comentario, Puntuacion FROM Encuesta', (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      res.json(results);
    });
  }

  async function getCarreraName(idCarrera) {
    const query = 'SELECT nom_carrera FROM carrera WHERE idCarrera = ?';
    const [rows] = await connection.promise().query(query, [idCarrera]);
    return rows.length > 0 ? rows[0].nom_carrera : null;
}

async function exportStudents(req, res) {
    try {
        // Obtener estudiantes
        const [students] = await connection.promise().query('SELECT * FROM estudiante');
    
        // Crear un nuevo libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Estudiantes');
    
        // Agregar encabezados
        worksheet.columns = [
          { header: 'Código Estudiante', key: 'codigoestudiante', width: 20 },
          { header: 'DNI', key: 'dni', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Apellido Paterno', key: 'ape_paterno', width: 30 },
          { header: 'Apellido Materno', key: 'ape_materno', width: 30 },
          { header: 'Estado Beca', key: 'est_beca', width: 20 },
          { header: 'Tipo de Beca', key: 'tip_beca', width: 20 },
          { header: 'Carrera', key: 'carrera', width: 30 }
        ];
    
        // Agregar filas
        for (const student of students) {
            // Obtener el nombre de la carrera
            const carreraName = await getCarreraName(student.idCarrera); // Asegúrate de usar el campo correcto
            worksheet.addRow({
              codigoestudiante: student.codigoestudiante,
              dni: student.dni,
              nombre: student.nombre,
              ape_paterno: student.ape_paterno,
              ape_materno: student.ape_materno,
              est_beca: student.est_beca,
              tip_beca: student.tip_beca,
              carrera: carreraName || 'No Disponible' // Muestra 'No Disponible' si el nombre de la carrera es nulo
            });
        }
    
        // Configurar la respuesta de archivo Excel
        res.setHeader('Content-Disposition', 'attachment; filename=estudiantes.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
        // Enviar archivo Excel al cliente
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error('Error al exportar estudiantes:', error);
        res.status(500).send('Error al exportar estudiantes');
      }
};

module.exports = {
    showListAdm,
    searchListAdm,
    addStudent,
    editStudent,
    deleteStudent,
    getStudent,
    importRelation,
    exportarAsistencia,
    menuSemanal,
    encuestas,
    exportStudents
};
