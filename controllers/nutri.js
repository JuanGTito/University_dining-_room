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
        
        const startDate = req.query.startDate;
        const endDate = moment(startDate).add(6, 'days').format('YYYY-MM-DD');

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

// Backend: nutri.js
function updateMenuNutri(req, res) {
    const { menuId, foodId, fecha, menuType, comidaNombre, infoNutricional, ingredientes } = req.body;

    // Actualizar el menú
    const updateMenuQuery = `
        UPDATE Menu 
        SET fecha = ?, tip_menu = ? 
        WHERE idMenu = ?
    `;
    
    connection.query(updateMenuQuery, [fecha, menuType, menuId], (menuError) => {
        if (menuError) return res.status(500).send('Error en la actualización del menú');

        // Actualizar la comida
        const updateFoodQuery = `
            UPDATE Comida 
            SET nombre = ?, info_nutricional = ?, ingredientes = ? 
            WHERE idComida = ?
        `;
        
        connection.query(updateFoodQuery, [comidaNombre, infoNutricional, ingredientes, foodId], (foodError) => {
            if (foodError) return res.status(500).send('Error en la actualización de la comida');
            res.status(200).send('Menú y comida actualizados exitosamente');
        });
    });
}

module.exports = {
    showListNutri,
    menuSemanalNutri,
    addMenuNutri,
    updateMenuNutri,
};