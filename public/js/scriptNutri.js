let inventarioVisible = false;
let selectedCells = [];
let selectedRow = null;

// Función para abrir el modal con el contenido del menú
function openMenuModal() {
    fetch('/menuSemanalNutriconal')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('menuTableBody');
            tableBody.innerHTML = ''; // Limpia el contenido previo

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.dia_semana}</td>
                    <td>${row.desayuno || 'N/A'}</td>
                    <td>${row.desayuno_idMenu !== null ? row.desayuno_idMenu : 'N/A'}</td>
                    <td>${row.desayuno_idComida !== null ? row.desayuno_idComida : 'N/A'}</td>
                    <td>${row.almuerzo || 'N/A'}</td>
                    <td>${row.almuerzo_idMenu !== null ? row.almuerzo_idMenu : 'N/A'}</td>
                    <td>${row.almuerzo_idComida !== null ? row.almuerzo_idComida : 'N/A'}</td>
                `;
                tableBody.appendChild(tr);
            });

            // Muestra el modal
            document.getElementById('menuModal').style.display = 'block';
            
            // Oculta las columnas no deseadas
            hideUnwantedColumns();
        })
        .catch(error => console.error('Error al cargar el menú:', error));
}

function closeMenuModal() {
    document.getElementById('menuModal').style.display = 'none';
}

function openModalEnc() {
    fetch('/encuestas')
        .then(response => response.json())
        .then(data => {
            const surveyList = document.getElementById('surveyList');
            surveyList.innerHTML = ''; // Limpiar la lista antes de agregar los datos

            data.forEach(survey => {
                const listItem = document.createElement('li');
                listItem.classList.add('survey-item');
                listItem.innerHTML = `<div class="survey-comment">${survey.Comentario}</div>
                                      <div class="survey-score">Puntuación: ${survey.Puntuacion}</div>`;
                surveyList.appendChild(listItem);
            });

            document.getElementById('surveysModal').style.display = 'flex';
        })
        .catch(error => console.error('Error:', error));
}

function closeModalEnc() {
    document.getElementById('surveysModal').style.display = 'none';
}

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('surveysModal')) {
        closeModalEnc();
    }
});

function toggleInventario() {
    const inventarioDiv = document.getElementById('inventario');
    const Informacion = document.getElementById('ocultar');

    if (inventarioVisible) {
        inventarioDiv.style.display = 'none';
        Informacion.style.display = 'block';
    } else {
        inventarioDiv.style.display = 'block';
        Informacion.style.display = 'none';
    }

    inventarioVisible = !inventarioVisible;
}

$(document).ready(function() {
    $('#resultsTable').DataTable({
        language: {
            processing:     "Procesando...",
            search:         "",
            lengthMenu:     "Mostrar _MENU_ elementos",
            info:           "Mostrando elementos del _START_ al _END_ de un total de _TOTAL_ elementos",
            infoEmpty:      "Mostrando elementos del 0 al 0 de un total de 0 elementos",
            infoFiltered:   "(filtrado de un total de _MAX_ elementos)",
            infoPostFix:    "",
            loadingRecords: "Cargando...",
            zeroRecords:    "No se encontraron resultados",
            emptyTable:     "No hay datos disponibles en la tabla",
            paginate: {
                first:      "Primero",
                previous:   "Anterior",
                next:       "Siguiente",
                last:       "Último"
            },
            aria: {
                sortAscending:  ": activar para ordenar la columna de manera ascendente",
                sortDescending: ": activar para ordenar la columna de manera descendente"
            }
        },
        dom: 'lrtip',
        lengthMenu: [25, 50, 100],
        pageLength: 25
    });
});

// Función para obtener la fecha del primer día de la próxima semana
function getNextWeekStartDate() {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getUTCDay();
    const daysUntilNextMonday = (currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek); 
    const nextWeekStartDate = new Date(currentDate);
    nextWeekStartDate.setUTCDate(currentDate.getUTCDate() + daysUntilNextMonday);
    return nextWeekStartDate.toISOString().split('T')[0];
}

// Función para obtener la fecha del último día de la próxima semana
function getNextWeekEndDate(startDate) {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setUTCDate(start.getUTCDate() + 6);
    return endDate.toISOString().split('T')[0];
}

// Función para manejar el clic del botón de la próxima semana
function handleNextWeekClick() {
    const nextWeekStartDate = getNextWeekStartDate();
    const nextWeekEndDate = getNextWeekEndDate(nextWeekStartDate);

    console.log(`Fecha de inicio de la próxima semana: ${nextWeekStartDate}`);
    console.log(`Fecha de fin de la próxima semana: ${nextWeekEndDate}`);

    fetch(`/menuSemanalNutri?startDate=${nextWeekStartDate}&endDate=${nextWeekEndDate}`)
        .then(response => response.json())
        .then(data => {
            const menuTableBody = document.getElementById('menuTableBody');
            menuTableBody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.dia_semana}</td>
                        <td>${item.desayuno}</td>
                        <td>${item.almuerzo}</td>
                    `;
                    menuTableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3">No hay menú para la próxima semana. Agrega un nuevo menú.</td>';
                menuTableBody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Error al verificar el menú:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nextWeekButton').addEventListener('click', handleNextWeekClick);
});

function showAddDialog() {
    document.getElementById('addMenuAndFoodModal').style.display = 'block';
    document.getElementById('submitButton').style.display = 'block';
    document.getElementById('updateButton').style.display = 'none';
    document.getElementById('menuAndFoodForm').reset();
}

function closeModal() {
    document.getElementById('addMenuAndFoodModal').style.display = 'none';
}

function submitMenuAndFoodForm() {
    const fecha = document.getElementById('fecha').value;
    const menuType = document.getElementById('menuType').value;
    const comidaNombre = document.getElementById('comidaNombre').value;
    const infoNutricional = document.getElementById('infoNutricional').value;
    const ingredientes = document.getElementById('ingredientes').value;

    fetch('/addMenuNutri', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fecha, menuType, comidaNombre, infoNutricional, ingredientes })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        closeModal();
    })
    .catch(error => console.error('Error:', error));
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.innerText = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000); // La notificación desaparecerá después de 3 segundos
}

document.addEventListener('DOMContentLoaded', function() {
    const menuTable = document.getElementById('menuTable');

    // Agregar eventos a las celdas para la selección
    menuTable.addEventListener('click', function(event) {
        if (event.target.tagName === 'TD') {
            const cell = event.target;
            const row = cell.parentElement;
            const cells = row.getElementsByTagName('td');

            // Limpiar selección previa
            clearSelection();

            // Marcar la fila seleccionada
            if (selectedRow) {
                selectedRow.classList.remove('selected-row');
            }
            selectedRow = row;
            selectedRow.classList.add('selected-row');

            // Resaltar celdas específicas según la columna
            const columnIndex = cell.cellIndex;

            // Limpiar la selección previa
            clearSelection();

            // Marcar celdas seleccionadas según la columna
            if (columnIndex >= 1 && columnIndex <= 3) { // Columnas de desayuno
                for (let i = 1; i <= 3; i++) {
                    cells[i].classList.add('selected');
                    selectedCells.push(cells[i]);
                }
            } else if (columnIndex >= 4 && columnIndex <= 6) { // Columnas de almuerzo
                for (let i = 4; i <= 6; i++) {
                    cells[i].classList.add('selected');
                    selectedCells.push(cells[i]);
                }
            }
        }
    });
});

// Función para limpiar la selección
function clearSelection() {
    selectedCells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
    if (selectedRow) {
        selectedRow.classList.remove('selected-row');
        selectedRow = null;
    }
}

// Función para modificar la fila seleccionada
function modifySelectedRow() {
    if (selectedCells.length === 0) {
        alert('No se ha seleccionado ninguna celda.');
        return;
    }

    let menuType = '';
    let menuId = '';
    let comidaId = '';

    selectedCells.forEach((cell, index) => {
        const content = cell.textContent.trim();
        if (index === 1) {
            menuId = content;
        } else if (index === 2) {
            comidaId = content;
        }
    });

    const columnIndex = selectedCells[0].cellIndex;
    if (columnIndex >= 1 && columnIndex <= 3) {
        menuType = 'desayuno';
    } else if (columnIndex >= 4 && columnIndex <= 6) {
        menuType = 'almuerzo';
    } else {
        alert('Índice de columna no reconocido.');
        return;
    }

    console.log(`Tipo de menú: ${menuType}, ID Menú: ${menuId}, ID Comida: ${comidaId}`);

    if (!menuId || !comidaId) {
        alert('No se han encontrado IDs válidos.');
        return;
    }

    fetch(`/getMenuDetails?menuType=${menuType}&menuId=${menuId}&comidaId=${comidaId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos del backend:', data);

            // Mostrar el modal y actualizar el contenido con los datos
            const modal = document.getElementById('addMenuAndFoodModal');
            const modalTitle = modal.querySelector('#modalTitle');
            const fechaInput = modal.querySelector('#fecha');
            const menuTypeSelect = modal.querySelector('#menuType');
            const comidaNombreInput = modal.querySelector('#comidaNombre');
            const infoNutricionalTextarea = modal.querySelector('#infoNutricional');
            const ingredientesTextarea = modal.querySelector('#ingredientes');
            const updateButton = modal.querySelector('#updateButton');
            const submitButton = modal.querySelector('#submitButton');

            modalTitle.textContent = 'Modificar Menú y Comida';

            fechaInput.value = data.fecha;
            menuTypeSelect.value = data.menuType;
            comidaNombreInput.value = data.comidaNombre;
            infoNutricionalTextarea.value = data.infoNutricional;
            ingredientesTextarea.value = data.ingredientes;

            submitButton.style.display = 'none';
            updateButton.style.display = 'inline-block';

            // Guardar datos en atributos de datos para su uso posterior
            modal.dataset.menuId = menuId;
            modal.dataset.comidaId = comidaId;
            modal.dataset.menuType = menuType;

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
            alert('Error al obtener los datos.');
        });
}

function updateMenuAndFood() {
    // Obtener los valores del formulario
    const fecha = document.getElementById('fecha').value;
    const menuType = document.getElementById('menuType').value;
    const comidaNombre = document.getElementById('comidaNombre').value;
    const infoNutricional = document.getElementById('infoNutricional').value;
    const ingredientes = document.getElementById('ingredientes').value;

    // Obtener los IDs desde los atributos del modal
    const modal = document.getElementById('addMenuAndFoodModal');
    const menuId = modal.dataset.menuId;
    const comidaId = modal.dataset.comidaId;

    // Verificar que todos los campos requeridos estén llenos
    if (!fecha || !menuType || !comidaNombre || !infoNutricional || !ingredientes || !menuId || !comidaId) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Enviar los datos al servidor para actualización
    fetch('/updateMenuNutri', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            menuId,
            comidaId,
            menuType,
            fecha,
            comidaNombre,
            infoNutricional,
            ingredientes
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Error en la actualización');
        return response.json();
    })
    .then(data => {
        alert('Menú y comida actualizados exitosamente');
        closeModal(); // Cerrar el modal
        // Aquí puedes actualizar la tabla para reflejar los cambios
    })
    .catch(error => {
        console.error('Error al actualizar el menú:', error);
        alert('Error al actualizar el menú. Inténtalo de nuevo.');
    });
}


function getFechaFromDiaSemana(diaSemana) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const startDate = new Date("2024-08-26");

    const diaIndex = dias.indexOf(diaSemana);
    if (diaIndex !== -1) {
        const fecha = new Date(startDate);
        fecha.setDate(startDate.getDate() + diaIndex);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}

function getCurrentWeekStartDate() {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getUTCDay();
    const daysUntilMonday = (dayOfWeek === 0 ? 1 : (1 - dayOfWeek));
    const weekStartDate = new Date(Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + daysUntilMonday
    ));
    return weekStartDate.toISOString().split('T')[0];
}

// Esta función debería refrescar el menú para la semana actual
function refreshCurrentWeekMenu() {
    const currentWeekStartDate = getCurrentWeekStartDate(); // Usa la función existente para obtener la fecha de inicio de la semana actual
    fetch(`/menuSemanalNutri?startDate=${currentWeekStartDate}`)
        .then(response => response.json())
        .then(data => {
            const menuTableBody = document.getElementById('menuTableBody');
            menuTableBody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.dia_semana}</td>
                        <td>${item.desayuno}</td>
                        <td>${item.almuerzo}</td>
                    `;
                    menuTableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3">No hay menú para la semana actual. Agrega un nuevo menú.</td>';
                menuTableBody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Error al obtener el menú actual:', error);
        });
}

function hideUnwantedColumns() {
    // Selecciona las celdas de encabezado
    const headers = document.querySelectorAll('#menuTable th');
    // Selecciona las celdas de datos
    const rows = document.querySelectorAll('#menuTable tbody tr');

    headers.forEach((header, index) => {
        if (header.classList.contains('hide')) {
            header.style.display = 'none'; // Oculta el encabezado de la columna
            // Oculta todas las celdas en esa columna
            rows.forEach(row => {
                row.cells[index].style.display = 'none'; // Oculta la celda en esa columna
            });
        } else {
            header.style.display = 'table-cell'; // Muestra el encabezado de la columna
            // Muestra todas las celdas en esa columna
            rows.forEach(row => {
                row.cells[index].style.display = 'table-cell'; // Muestra la celda en esa columna
            });
        }
    });
}

function confirmDelete() {
    const selectedCells = document.querySelectorAll('td.selected');

    if (selectedCells.length === 0) {
        alert('No se ha seleccionado ninguna celda.');
        return;
    }

    let menuIdsToDelete = [];
    let comidaIdsToDelete = [];
    let menuType = '';

    selectedCells.forEach((cell, index) => {
        if (index === 0) {
            menuType = cell.textContent.trim();
        } else if (index === 1) {
            menuIdsToDelete.push(cell.textContent.trim());
        } else if (index === 2) {
            comidaIdsToDelete.push(cell.textContent.trim());
        }
    });

    if (menuIdsToDelete.length === 0 || comidaIdsToDelete.length === 0) {
        alert('No se encontraron IDs válidos para eliminar.');
        return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar los registros seleccionados?')) {
        fetch('/deleteMenuAndFood', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                menuIds: menuIdsToDelete,
                comidaIds: comidaIdsToDelete,
                menuType: menuType
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                alert('Registros eliminados exitosamente.');
                openMenuModal(); // Actualiza la tabla
            } else {
                alert('Error al eliminar los registros.');
            }
        })
        .catch(error => console.error('Error al eliminar los registros:', error));
    }
}


