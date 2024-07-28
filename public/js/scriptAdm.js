//<!-- Funciones dentro del html oejs-->
function prepareEdit() {
    // Encuentra el radio button seleccionado
    const selectedRadio = document.querySelector('input[name="selectedStudent"]:checked');
    if (!selectedRadio) {
        alertify.error('Por favor, seleccione un estudiante.');
        return;
    }

    const codigoestudiante = selectedRadio.value;

    // Solicita los datos del estudiante al servidor
    fetch(`/getStudent/${codigoestudiante}`)
        .then(response => response.json())
        .then(student => {
            // Llena el modal con los datos del estudiante
            document.getElementById('modifyCodigoEstudiante').value = student.codigoestudiante;
            document.getElementById('modifyDni').value = student.dni;
            document.getElementById('modifyNombre').value = student.nombre;
            document.getElementById('modifyApePaterno').value = student.ape_paterno;
            document.getElementById('modifyApeMaterno').value = student.ape_materno;
            document.getElementById('modifyEstBeca').value = student.est_beca;
            document.getElementById('modifyTipBeca').value = student.tip_beca;
            document.getElementById('modifyIdCarrera').value = student.idCarrera;
        
            // Muestra el modal
            document.getElementById('modifyModal').style.display = "block";
        })
        .catch(error => {
            console.error('Error al obtener los datos del estudiante:', error);
            alertify.error('Error al obtener los datos del estudiante');
        });
}

function submitModifyStudentForm() {
    const form = document.getElementById('modifyStudentForm');
    const data = {
        codigoestudiante: form.codigoestudiante.value,
        dni: form.dni.value,
        nombre: form.nombre.value,
        ape_paterno: form.ape_paterno.value,
        ape_materno: form.ape_materno.value,
        est_beca: form.est_beca.value,
        tip_beca: form.tip_beca.value,
        idCarrera: form.idCarrera.value
    };

    fetch('/editStudent', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alertify.success('Estudiante modificado exitosamente');
            closeModifyModal();
            location.reload();
        } else {
            alertify.error(result.message || 'Error al modificar estudiante');
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
        alertify.error('Error al modificar estudiante');
    });
}

function closeModifyModal() {
    document.getElementById('modifyModal').style.display = "none";
}

function showAddDialog() {
    document.getElementById('addModal').style.display = "block";
}

function closeModal() {
    document.getElementById('addModal').style.display = "none";
}

function submitAddStudentForm() {
    const form = document.getElementById('addStudentForm');
    console.log(form);
    const data = {
        codigoestudiante: form.codigoestudiante.value,
        dni: form.dni.value,
        nombre: form.nombre.value,
        ape_paterno: form.ape_paterno.value,
        ape_materno: form.ape_materno.value,
        est_beca: form.est_beca.value,
        tip_beca: form.tip_beca.value,
        idCarrera: form.idCarrera.value
    };
    
    fetch('/addStudent', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(result => {
          if (result.success) {
              alertify.success('Estudiante agregado exitosamente');
              closeModal();
              location.reload();
          } else {
              alertify.error(result.message || 'Error al agregar estudiante');
          }
      }).catch(error => {
          console.error('Error en la solicitud:', error);
          alertify.error('Error al agregar estudiante');
      });
}

function confirmDelete() {
    // Obtener el radio seleccionado
    const selectedRadio = document.querySelector('input[name="selectedStudent"]:checked');

    if (!selectedRadio) {
        alertify.error('Por favor, selecciona un estudiante');
        return;
    }

    const codigoestudiante = selectedRadio.value;

    // Confirmar la eliminación
    alertify.confirm('Confirmar Eliminación', '¿Estás seguro de que deseas eliminar este estudiante?',
        function() {
            // Confirmado, enviar la solicitud de eliminación
            fetch(`/deleteStudent/${codigoestudiante}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alertify.success('Estudiante eliminado exitosamente');
                    location.reload();
                } else {
                    alertify.error(result.message || 'Error al eliminar estudiante');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                alertify.error('Error al eliminar estudiante');
            });
        },
        function() {
            // Cancelado
            alertify.error('Eliminación cancelada');
        }
    );
}

window.onclick = function(event) {
    if (event.target == document.getElementById('addModal')) {
        closeModal();
    } else if (event.target == document.getElementById('modifyModal')) {
        closeModifyModal();
    }
}

// <!-- Inicializar DataTables -->
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
        dom: 'lrtip', // Oculta la barra de búsqueda
        lengthMenu: [25, 50, 100], // Menú de longitud definido
        pageLength: 25 // Valor por defecto
    });
});

//<!-- Interaccion con la entrada input y muestra de resultados -->
$(document).ready(function() {
    let dataTable = $('#resultsTable').DataTable();

    $('#searchInput').on('input', function() {
        const searchTerm = $(this).val();
    
        fetch('/searchList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ searchTerm: searchTerm })
        })
        .then(response => response.json())
        .then(data => {
            dataTable.clear();
            data.results.forEach(row => {
                dataTable.row.add([
                    `<input type="radio" name="selectedStudent" value="${row.codigoestudiante}">`,
                    row.codigoestudiante,
                    row.dni,
                    row.nombre,
                    row.est_beca,
                    row.nom_carrera
                ]).draw();
            });
        })
        .catch(error => console.error('Error al buscar:', error));
    });
});