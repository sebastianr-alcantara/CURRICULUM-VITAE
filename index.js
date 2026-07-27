// ==============================
// RESUMEN PROFESIONAL
// ==============================
var summaryMap;
var provinceSummaryMap = null;
var featureSelected = null;
var summaryModalControl = null;
var departamentosExperiencia = [];

function initializeMapSummary() {
    // Creamos el mapa
    summaryMap = L.map(
        'map-summary', 
        {
            center: [-9.19, -75.0152],
            dragging: false,
            scrollWheelZoom: false,
            zoomControl: false,
            doubleClickZoom: false
        }
    );

    // Inicializamos el modal antes de usarlo
    summaryModalControl = initializeSummaryModal();

    // Determinamos los departamentos con experiencia
    informacion.experience.forEach(
        function(experiencia) {
            if (!departamentosExperiencia.includes(experiencia.departamento)) {
                departamentosExperiencia.push(experiencia.departamento)
            }
        }
    );

    // Cargamos el Layer por defecto
    var departamentosLayer = L.geoJSON(
        geojsonDepartamentos,
        {
            style: function(feature) {
                var nombreDepartamentoGeojson = feature.properties.nombdep; // Obtenemos el nombre del departamento
                var verificarNombreDepartamento = departamentosExperiencia.includes(nombreDepartamentoGeojson) // Verificamos el nombre del departamento
                return {
                    color: '#0D2236',
                    weight: 1,
                    fillColor: verificarNombreDepartamento ? '#173B5C' : '#255E91', // Oscuro cuando hay experiencia
                    fillOpacity: verificarNombreDepartamento ? 0.7 : 0.2
                }
            },
            onEachFeature: function(feature, layer) {
                // Verificamos si el departamento tiene experiencia relacionada
                var nombreDepartamento = feature.properties.nombdep;
                var haveExperience = departamentosExperiencia.includes(nombreDepartamento);
                // Efecto seleccionado
                layer.on(
                    'click',
                    function() {
                        // Ignoramos si no hay experiencia
                        if (!haveExperience) {
                            return
                        }
                        // Buscamos todas las provincias con experiencia
                        var provinciasExperiencia = [];
                        informacion.experience.forEach(
                                function(experiencia) {
                                    if (experiencia.departamento === nombreDepartamento) {
                                        experiencia.provincia.forEach(
                                            function(provincia) {
                                                if (!provinciasExperiencia.includes(provincia)) {
                                                    provinciasExperiencia.push(provincia);
                                                }
                                            }
                                        );
                                    }
                                }
                        );
                        // Si el feature ya se encuentra seleccionado, lo deseleccionamos
                        if (featureSelected === this) {
                            var defaultStyleFeature = getDefaultStyle(feature);
                            this.setStyle(defaultStyleFeature);
                            featureSelected = null;
                            summaryModalControl.hide();
                        } else {
                            // Si el feature no esta seleccionado, lo seleccionamos
                            if (featureSelected) {
                                var defaultStyleFeature = getDefaultStyle(featureSelected.feature);
                                featureSelected.setStyle(defaultStyleFeature);
                            } 
                            this.setStyle({
                                weight: 4
                            });

                            featureSelected = this
                            summaryModalControl.show(nombreDepartamento, provinciasExperiencia, feature)
                        }
                    }
                );
                // Efecto Hover
                layer.on(
                    'mouseover',
                    function() {
                        if (featureSelected != this) {
                            this.setStyle({
                                weight: 2
                            });
                        }    
                    }
                );
                layer.on(
                    'mouseout',
                    function() {
                        if (featureSelected != this) {
                            var defaultStyleFeature = getDefaultStyle(feature);
                            this.setStyle(defaultStyleFeature);
                        }
                    }
                );
            }
        }
    ).addTo(summaryMap);
    
    summaryMap.fitBounds(departamentosLayer.getBounds());
};

function initializeSummaryModal() {
    // Creamos la estructura del modal en HTML
    var modalSummaryHTML = `
        <div class="summary-modal" style="display: none;">
            <div class="modal-header">
                <div class="departamento"></div>
                <span class="material-symbols-outlined">cancel</span>
            </div>
            <div class="modal-body"></div>
        </div>
    `;
    // Seleccionamos el contenedor padre del modal
    var mapContainer = document.querySelector('.map');
    mapContainer.insertAdjacentHTML('beforeend', modalSummaryHTML)

    // Seleccionamos los elementos del modal que son configurables
    var summaryModalContainer = document.querySelector('.summary-modal');
    var summaryModalTitle = summaryModalContainer.querySelector('.departamento');
    var summaryModalCloseButton = summaryModalContainer.querySelector('.material-symbols-outlined');
    var summaryModalBody = summaryModalContainer.querySelector('.modal-body');

    // Funcion para mostrar el modal
    function showSummaryModal(departamento, provincias, feature) {
        summaryModalContainer.style.position = 'absolute';
        summaryModalContainer.style.display = 'flex';
        summaryModalTitle.textContent = `${'Departamento de ' + departamento}`;
        
        // Mostramos todas las provincias con experiencia
        summaryModalBody.innerHTML = '';

        summaryModalBody.innerHTML += `
            <div class="provincia">
                <strong>Provincia:&nbsp;</strong>${provincias.join(', ')}
            </div>
            <div id="province-map-summary" class="geovisor"></div>
        `;

        // Creamos el mapa provincial
        provinceSummaryMap = L.map(
            'province-map-summary', 
            {
                center: [-9.19, -75.0152],
                dragging: false,
                scrollWheelZoom: false,
                zoomControl: false,
                doubleClickZoom: false
            }
        );

        provinceSummaryMap.eachLayer(function(layer) {
            provinceSummaryMap.removeLayer(layer);
        });

        // Agregamos el departamento seleccionado
        var departamentSelectedLayer = L.geoJSON(
            feature,
            {
                style: {
                    color: '#000000',
                    weight: 4,
                    fillColor: 'transparent',
                    fillOpacity: 0
                }
            }
        ).addTo(provinceSummaryMap);

        // Filtramos las provincias seleccionadas
        var provincesByDepartmentSelected = {
            type: 'FeatureCollection',
            features: geojsonProvincias.features.filter(
                function(provincia) {
                    return provincia.properties.nombdep === departamento;
                }
            )
        };

        // Agregamos las provincias del departamento
        var provincesSelectedLayer = L.geoJSON(
            provincesByDepartmentSelected,
            {
                style: function(feature) {
                    var nombreProvinciaGeojson = feature.properties.nombprov;
                    var verificarNombreProvincia = provincias.includes(nombreProvinciaGeojson);

                    return {
                        color: '#0D2236',
                        weight: 1, 
                        fillColor: verificarNombreProvincia ? '#173B5C' : '#255E91',
                        fillOpacity: verificarNombreProvincia ? 0.7 : 0.3
                    };
                },
            }
        ).addTo(provinceSummaryMap);

        // Ajustamos el mapa al departamento seleccionado
        provinceSummaryMap.fitBounds(departamentSelectedLayer.getBounds());
    }

    // Funcion para ocultar el modal
    function hideSummaryModal() {
        summaryModalContainer.style.display = 'none';
    }

    // Agregamos el evento de mostrar y cerrar el modal
    summaryModalCloseButton.addEventListener(
        'click', 
        function() {
            if (featureSelected) {
                var defaultStyleFeature = getDefaultStyle(featureSelected.feature);
                featureSelected.setStyle(defaultStyleFeature);
                featureSelected = null
            }
            summaryModalControl.hide();
        }
    );

    // Retornamos las funciones
    return {
        show: showSummaryModal,
        hide: hideSummaryModal
    };
}

// ==============================
// EDUCACIÓN PROFESIONAL
// ==============================

// ==============================
// EXPERIENCIA PROFESIONAL
// ==============================

// ==============================
// FUNCIONES AUXILIARES
// ==============================
function changeSectionView(buttonIDSelected, sectionIDSelected) {
    // Activamos y desactivamos los botones
    const buttons = document.querySelectorAll('footer button');
    buttons.forEach(btn => {
        if (btn.id === buttonIDSelected) {
            btn.setAttribute('state', 'activated');
        } else {
            btn.setAttribute('state', 'deactivated');
        }
    });
    // Activamos y desactivamos las secciones
    const sections = document.querySelectorAll('main .section');
    sections.forEach(sect => {
        if (sect.id === sectionIDSelected) {
            sect.setAttribute('state', 'activated');
        } else {
            sect.setAttribute('state', 'deactivated');
        }
    });
    // Refrescamos el mapa cuando se vuelve a resumen
    if (sectionIDSelected === 'sec-summary' && summaryMap) {
        setTimeout(
            function() {
                summaryMap.invalidateSize()
            },
            100
        );
    }
}

function getDefaultStyle(feature) {
    var nombre = feature.properties.nombdep;
    var tieneExperiencia = departamentosExperiencia.includes(nombre);
    
    return {
        color: '#0D2236',
        weight: 1,
        fillColor: tieneExperiencia ? '#173B5C' : '#255E91',
        fillOpacity: tieneExperiencia ? 0.7 : 0.2
    };
}

// ==============================
// INICIALIZACION DEL SISTEMA
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Resumen Profesional
    initializeMapSummary();

    // Cambio de Seccion
    const buttons = document.querySelectorAll('footer button');
    changeSectionView('btn-summary', 'sec-summary');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionID = button.id.replace('btn', 'sec');
            changeSectionView(button.id, sectionID)
        });
    });
});