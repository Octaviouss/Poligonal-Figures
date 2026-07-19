JavaScript
// 1. Seleccionamos el lienzo grande y su contexto de dibujo
const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');

// 2. Seleccionamos las tarjetas del catálogo y controles
const tarjetas = document.querySelectorAll('.tarjeta-diseno');
const selectorPlantilla = document.getElementById('selector-plantilla');

let imagenFondo = null; // Aquí guardamos la imagen del animal para calcar
let puntos = [];       // Aquí guardaremos los puntos (nodos) que el usuario dibuje

// ==========================================
// FUNCIÓN PRINCIPAL: REDIBUJAR EL LIENZO
// ==========================================
function redibujarLienzo() {
    // Limpiamos el lienzo por completo para actualizar la vista
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si hay un animal seleccionado, lo dibujamos de fondo con transparencia para poder calcar encima
    if (imagenFondo) {
        ctx.globalAlpha = 0.25; // Transparencia estilo "papel calca" (25%)
        ctx.drawImage(imagenFondo, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;  // Regresamos la opacidad al 100% para nuestras líneas
    }

    // Si el usuario ha hecho clics, dibujamos sus líneas y puntos
    if (puntos.length > 0) {
        ctx.strokeStyle = '#38bdf8'; // Azul brillante premium para las líneas de trazo
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#ffffff';   // Blanco para los pequeños puntos/nodos

        // Comenzamos el camino del trazo lineal
        ctx.beginPath();
        ctx.moveTo(puntos[0].x, puntos[0].y);

        for (let i = 1; i < puntos.length; i++) {
            ctx.lineTo(puntos[i].x, puntos[i].y);
        }
        ctx.stroke();

        // Dibujamos circulitos en cada esquina donde el usuario hizo clic
        puntos.forEach(punto => {
            ctx.beginPath();
            ctx.arc(punto.x, punto.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }
}

// ==========================================
// DETECTAR CLICS EN EL CATÁLOGO DE ANIMALES
// ==========================================
tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        const rutaImagen = tarjeta.getAttribute('data-img');
        const img = new Image();
        
        img.onload = function() {
            imagenFondo = img;
            puntos = []; // Borramos los trazos viejos al cambiar de animal para empezar limpios
            redibujarLienzo();
        };
        img.src = rutaImagen;
    });
});

// ==========================================
// DETECTAR CLICS DENTRO DEL LIENZO PARA CALCAR
// ==========================================
canvas.addEventListener('click', (evento) => {
    // Calculamos la posición exacta del clic dentro del recuadro grande
    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    // Guardamos la coordenada en nuestra lista de puntos
    puntos.push({ x: x, y: y });

    // Redibujamos todo instantáneamente para mostrar la nueva línea
    redibujarLienzo();
});

// ==========================================
// CONTROL DEL SELECTOR (LIENZO EN BLANCO)
// ==========================================
if (selectorPlantilla) {
    selectorPlantilla.addEventListener('change', (e) => {
        if (e.target.value === 'ninguna') {
            imagenFondo = null;
            puntos = [];
            redibujarLienzo();
        }
    });
}