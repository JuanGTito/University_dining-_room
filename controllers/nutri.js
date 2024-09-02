const connection = require('../conection/conexion');
const moment = require('moment');
const baseQuery = `
SELECT 
    inventario.idInventario, 
    inventario.nombre, 
    inventario.cant_disponible, 
     DATE_FORMAT(inventario.fecha_caducidad, '%d-%m-%Y') AS fecha_caducidad,
    categoria.nom_categoria
FROM 
    inventario
JOIN 
    categoria ON inventario.idCategoria = categoria.idCategoria;
`;

function getNextWeekDates() {
    const startDate = moment().startOf('isoWeek').add(1, 'week').format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('week').format('YYYY-MM-DD');
    return { startDate, endDate };
}

// Function to get all students and render the 'adm' view
function showListNutri(req, res) {
    connection.query(baseQuery, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error en la consulta');
        }
        res.render('nutri', { 
            results: results, 
            login: req.session.loggedin || false, 
            name: req.session.name || ''
        });
    });
}

function menuSemanalNutri(req, res) {
    connection.query('SET lc_time_names = \'es_ES\'', (err) => {
        if (err) return res.status(500).send('Error en la configuración del idioma');
        
        const { startDate, endDate } = getNextWeekDates();

        console.log('Consulta para menú semanal:', startDate, endDate); // Mensaje de depuración

        const query = `
        SELECT 
            DATE_FORMAT(m.fecha, '%W') AS dia_semana, 
            MAX(CASE WHEN m.tip_menu = 'Desayuno' THEN c.nombre ELSE '' END) AS desayuno,
            MAX(CASE WHEN m.tip_menu = 'Almuerzo' THEN c.nombre ELSE '' END) AS almuerzo
        FROM Menu m
        LEFT JOIN Comida c ON m.idMenu = c.idMenu
        WHERE m.fecha BETWEEN ? AND ?
        GROUP BY m.fecha, DATE_FORMAT(m.fecha, '%W')
        ORDER BY m.fecha;
        `;

        connection.query(query, [startDate, endDate], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).send('Error en la consulta');
            }
            console.log('Datos obtenidos:', results); // Mensaje de depuración
            res.json(results);
        });
    });
}

function addMenuNutri(req, res) {
    const { fecha, menuType, comidaNombre, infoNutricional, ingredientes } = req.body;
    const idConcesionaria = 1; // Valor predeterminado

    // Insertar el menú
    const insertMenuQuery = `
        INSERT INTO Menu (fecha, tip_menu, idConcecionaria)
        VALUES (?, ?, ?)
    `;
    
    connection.query(insertMenuQuery, [fecha, menuType, idConcesionaria], (menuError, menuResults) => {
        if (menuError) {
            console.error('Error en la inserción del menú:', menuError); // Mensaje de depuración
            return res.status(500).send('Error en la inserción del menú');
        }

        // Obtener el id del menú recién insertado
        const idMenu = menuResults.insertId;

        // Insertar la comida
        const insertFoodQuery = `
            INSERT INTO Comida (nombre, info_nutricional, ingredientes, idMenu)
            VALUES (?, ?, ?, ?)
        `;
        
        connection.query(insertFoodQuery, [comidaNombre, infoNutricional, ingredientes, idMenu], (foodError) => {
            if (foodError) {
                console.error('Error en la inserción de la comida:', foodError); // Mensaje de depuración
                return res.status(500).send('Error en la inserción de la comida');
            }
            res.status(200).send('Menú y comida agregados exitosamente');
        });
    });
}

function menuSemanalNutriconal(req, res) {
    connection.query('SET lc_time_names = \'es_ES\'', (err) => {
        if (err) return res.status(500).send('Error en la configuración del idioma');
        
        const query = `
        SELECT 
            DATE_FORMAT(m.fecha, '%W') AS dia_semana, 
            MAX(CASE WHEN m.tip_menu = 'Desayuno' THEN c.nombre ELSE '' END) AS desayuno,
            MAX(CASE WHEN m.tip_menu = 'Desayuno' THEN m.idMenu ELSE NULL END) AS desayuno_idMenu,
            MAX(CASE WHEN m.tip_menu = 'Desayuno' THEN c.idComida ELSE NULL END) AS desayuno_idComida,
            MAX(CASE WHEN m.tip_menu = 'Almuerzo' THEN c.nombre ELSE '' END) AS almuerzo,
            MAX(CASE WHEN m.tip_menu = 'Almuerzo' THEN m.idMenu ELSE NULL END) AS almuerzo_idMenu,
            MAX(CASE WHEN m.tip_menu = 'Almuerzo' THEN c.idComida ELSE NULL END) AS almuerzo_idComida
        FROM Menu m
        LEFT JOIN Comida c ON m.idMenu = c.idMenu
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

// Nueva función en el archivo back-end para obtener los datos del menú y la comida
function getMenuDetails(req, res) {
    const { menuType, menuId, comidaId } = req.query;

    // Verifica que todos los parámetros necesarios estén presentes
    if (!menuType || !menuId || !comidaId) {
        return res.status(400).send('Faltan parámetros en la solicitud.');
    }

    const query = `
        SELECT fecha, tip_menu AS menuType, nombre AS comidaNombre, info_nutricional AS infoNutricional, ingredientes
        FROM Menu
        LEFT JOIN Comida ON Menu.idMenu = Comida.idMenu
        WHERE Comida.idComida = ? OR Menu.idMenu = ?
    `;

    connection.query(query, [comidaId, menuId], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en la consulta');
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('No se encontraron datos para los IDs proporcionados');
        }
    });
}

// En el backend, manejador para la ruta '/updateMenuNutri'
function updateMenuNutri(req, res) {
    const { menuId, comidaId, menuType, fecha, comidaNombre, infoNutricional, ingredientes } = req.body;

    // Actualizar el menú
    const updateMenuQuery = `
        UPDATE Menu 
        SET fecha = ?, tip_menu = ? 
        WHERE idMenu = ?
    `;
    
    connection.query(updateMenuQuery, [fecha, menuType, menuId], (menuError) => {
        if (menuError) {
            console.error('Error en la actualización del menú:', menuError);
            return res.status(500).json({ error: 'Error en la actualización del menú' });
        }

        // Actualizar la comida
        const updateFoodQuery = `
            UPDATE Comida 
            SET nombre = ?, info_nutricional = ?, ingredientes = ? 
            WHERE idComida = ?
        `;
        
        connection.query(updateFoodQuery, [comidaNombre, infoNutricional, ingredientes, comidaId], (foodError) => {
            if (foodError) {
                console.error('Error en la actualización de la comida:', foodError);
                return res.status(500).json({ error: 'Error en la actualización de la comida' });
            }
            
            res.status(200).json({ message: 'Menú y comida actualizados exitosamente' });
        });
    });
}

// Suponiendo que estás usando Express.js para el backend
function deleteMenuAndFood (req, res) {
    const { menuIds, comidaIds, menuType } = req.body;

    console.log('Datos recibidos:', { menuIds, comidaIds, menuType });

    if (!Array.isArray(menuIds) || !Array.isArray(comidaIds) || !menuType) {
        return res.status(400).json({ success: false, message: 'Datos incompletos o inválidos.' });
    }

    // Paso 1: Eliminar las comidas relacionadas
    const deleteFoodQuery = `DELETE FROM Comida WHERE idComida IN (${comidaIds.map(id => `'${id}'`).join(',')})`;
    connection.query(deleteFoodQuery, (foodError) => {
        if (foodError) {
            console.error('Error al eliminar la comida:', foodError);
            return res.status(500).json({ success: false, message: 'Error al eliminar la comida.' });
        }

        // Paso 2: Eliminar el menú después de eliminar las comidas
        const deleteMenuQuery = `DELETE FROM Menu WHERE idMenu IN (${menuIds.map(id => `'${id}'`).join(',')})`;
        connection.query(deleteMenuQuery, (menuError) => {
            if (menuError) {
                console.error('Error al eliminar el menú:', menuError);
                return res.status(500).json({ success: false, message: 'Error al eliminar el menú.' });
            }

            res.status(200).json({ success: true, message: 'Registros eliminados exitosamente.' });
        });
    });
};


module.exports = {
    showListNutri,
    menuSemanalNutri,
    addMenuNutri,
    updateMenuNutri,
    menuSemanalNutriconal,
    getMenuDetails,
    deleteMenuAndFood
};