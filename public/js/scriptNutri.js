let selectedRow = null; // Para almacenar la fila seleccionada
let inventarioVisible = false;

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

            document.getElementById('menuModal').style.display = 'block';
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
    const dayOfWeek = currentDate.getUTCDay();
    const daysUntilNextMonday = (dayOfWeek === 0 ? 1 : (8 - dayOfWeek));
    const nextWeekStartDate = new Date(Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + daysUntilNextMonday
    ));
    return nextWeekStartDate.toISOString().split('T')[0];
}

function handleNextWeekClick() {
    const nextWeekStartDate = getNextWeekStartDate();

    fetch(`/menuSemanalNutri?startDate=${nextWeekStartDate}`)
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

function modifySelectedRow() {
    const selectedRow = document.querySelector('#menuTableBody tr.selected');

    if (!selectedRow) {
        alert("Por favor selecciona una fila para modificar.");
        return;
    }

    const diaSemana = selectedRow.cells[0].innerText;
    const desayuno = selectedRow.cells[1].innerText;
    const almuerzo = selectedRow.cells[2].innerText;

    document.getElementById('fecha').value = getFechaFromDiaSemana(diaSemana);
    document.getElementById('menuType').value = desayuno ? 'Desayuno' : 'Almuerzo';
    document.getElementById('comidaNombre').value = desayuno || almuerzo;

    document.getElementById('addMenuAndFoodModal').style.display = 'block';
    document.getElementById('submitButton').style.display = 'none';
    document.getElementById('updateButton').style.display = 'block';
}

// Añadir el manejador de eventos para el clic en las celdas
document.addEventListener('DOMContentLoaded', function() {
    const menuTable = document.getElementById('menuTable');
    let selectedCells = [];

    // Agregar eventos a las celdas para la selección
    menuTable.addEventListener('click', function(event) {
        if (event.target.tagName === 'TD') {
            const cell = event.target;
            const row = cell.parentElement;
            const cells = row.getElementsByTagName('td');

            // Limpiar selección previa
            selectedCells.forEach(cell => cell.classList.remove('selected'));
            selectedCells = [];

            // Resaltar celdas específicas según la columna
            const columnIndex = cell.cellIndex;

            for (let i = 0; i < cells.length; i++) {
                if (i === columnIndex) {
                    cell.classList.add('selected');
                    selectedCells.push(cell);
                }
                // Resaltar todas las celdas de la columna de desayuno
                if (columnIndex === 1) {
                    if (cells[i].cellIndex === 1 || cells[i].cellIndex === 2 || cells[i].cellIndex === 3) {
                        cells[i].classList.add('selected');
                        selectedCells.push(cells[i]);
                    }
                }
                // Resaltar todas las celdas de la columna de almuerzo
                if (columnIndex === 4) {
                    if (cells[i].cellIndex === 4 || cells[i].cellIndex === 5 || cells[i].cellIndex === 6) {
                        cells[i].classList.add('selected');
                        selectedCells.push(cells[i]);
                    }
                }
            }
        }
    });

    // Función para limpiar la selección
    function clearSelection() {
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        selectedCells = [];
    }
});




function updateMenuAndFood() {
    const fecha = document.getElementById('fecha').value;
    const menuType = document.getElementById('menuType').value;
    const comidaNombre = document.getElementById('comidaNombre').value;
    const infoNutricional = document.getElementById('infoNutricional').value;
    const ingredientes = document.getElementById('ingredientes').value;

    if (!fecha || !menuType || !comidaNombre || !infoNutricional || !ingredientes) {
        alert("Todos los campos son obligatorios. Por favor completa el formulario.");
        return;
    }

    fetch('/updateMenuNutri', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fecha: fecha,
            menuType: menuType,
            comidaNombre: comidaNombre,
            infoNutricional: infoNutricional,
            ingredientes: ingredientes
        })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        closeModal();
    })
    .catch(error => console.error('Error al modificar:', error));
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
