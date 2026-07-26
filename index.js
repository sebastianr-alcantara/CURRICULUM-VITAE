// ==============================
// RESUMEN PROFESIONAL
// ==============================
let geovisor;

function initializeMapSummary() {
    geovisor = L.map('map-summary', {
        center: [-9.19, -75.0152],
        zoom: 5,
        dragging: true,
        scrollWheelZoom: false,
        zoomControl: false,
        maxBounds: L.latLngBounds([[-18.5, -81.5], [0.5, -68.0]]),
        maxBoundsViscosity: 1
    });

    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps'
    }).addTo(geovisor);
};

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
}


// ==============================
// INICIALIZACION DEL SISTEMA
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Mapa del Resumen
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