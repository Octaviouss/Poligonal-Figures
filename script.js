// 1. CONEXIÓN CON EL LIENZO Y HERRAMIENTAS
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const selector = document.getElementById('selector-plantilla');

// 2. LAS MEMORIAS (BITÁCORAS)
let puntosActuales = [];      // Guarda los clics del triángulo actual
let historialTriangulos = []; // Memoria de todos los triángulos listos
let imagenFondo = null;       // NUEVO: Guarda la foto del animal elegido

// 3. FUNCIÓN MAESTRA DE REDIBUJO
function actualizarPantalla() {
    // A. Limpiamos el lienzo
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    // B. NUEVO: Si hay una foto de animal seleccionada, la dibujamos al fondo
    if (imagenFondo) {
        ctx.drawImage(imagenFondo, 0, 0, lienzo.width, lienzo.height);
    }

    // C. Dibujamos las líneas guía (corazón o diamante) si están activas
    dibujarPlantillaDeFondo(selector.value);

    // D. Redibujamos todos los triángulos guardados en la memoria
    historialTriangulos.forEach(function(triangulo) {
        ctx.fillStyle = triangulo.colorRelleno;
        ctx.strokeStyle = triangulo.colorBorde;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(triangulo.p1.x, triangulo.p1.y);
        ctx.lineTo(triangulo.p2.x, triangulo.p2.y);
        ctx.lineTo(triangulo.p3.x, triangulo.p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // E. Dibujamos los puntitos rojos del triángulo en proceso
    puntosActuales.forEach(function(punto) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 4. DETECTOR DE CLICS EN EL LIENZO (Para dibujar)
lienzo.addEventListener('click', function(evento) {
    const rect = lienzo.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    puntosActuales.push({ x: x, y: y });

    if (puntosActuales.length === 3) {
        const nuevoTriangulo = {
            p1: puntosActuales[0],
            p2: puntosActuales[1],
            p3: puntosActuales[2],
            // Color semi-transparente para poder seguir viendo la foto de fondo al calcar
            colorRelleno: 'rgba(78, 205, 196, 0.5)', 
            colorBorde: '#4ecdc4'
        };

        historialTriangulos.push(nuevoTriangulo);
        puntosActuales = [];
    }

    actualizarPantalla();
});

// 5. DIBUJANTE DE PLANTILLAS GEOMÉTRICAS
function dibujarPlantillaDeFondo(tipo) {
    ctx.strokeStyle = '#555566';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    if (tipo === 'corazon') {
        ctx.beginPath();
        ctx.moveTo(300, 150); ctx.lineTo(380, 80); ctx.lineTo(460, 150);
        ctx.lineTo(300, 350); ctx.lineTo(140, 150); ctx.lineTo(220, 80);
        ctx.closePath(); ctx.stroke();
    } else if (tipo === 'diamante') {
        ctx.beginPath();
        ctx.moveTo(300, 50); ctx.lineTo(450, 150); ctx.lineTo(300, 350); ctx.lineTo(150, 150);
        ctx.closePath(); ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 150); ctx.lineTo(450, 150);
        ctx.moveTo(300, 50); ctx.lineTo(300, 350);
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

// 6. DETECTOR DE CAMBIO DE PLANTILLA GEOMÉTRICA
selector.addEventListener('change', function() {
    actualizarPantalla();
});

// 7. NUEVO: DETECTOR DE CLICS EN LAS TARJETAS DE ANIMALES
// Buscamos todas las tarjetas en el HTML
const tarjetas = document.querySelectorAll('.tarjeta-diseno');

tarjetas.forEach(function(tarjeta) {
    tarjeta.addEventListener('click', function() {
        // Obtenemos la URL de la imagen guardada en el "data-img"
        const urlImagen = tarjeta.getAttribute('data-img');
        
        // Creamos una imagen virtual en JavaScript
        const nuevaImagen = new Image();
        nuevaImagen.src = urlImagen;
        
        // Evita problemas de seguridad al intentar descargar el lienzo después
        nuevaImagen.crossOrigin = "anonymous"; 

        // Cuando la imagen termine de cargar en internet, la metemos al lienzo
        nuevaImagen.onload = function() {
            imagenFondo = nuevaImagen;
            actualizarPantalla(); // Refrescamos la pantalla para mostrarla
        };
    });
});