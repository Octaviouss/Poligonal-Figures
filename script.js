// 1. CONEXIÓN CON EL LIENZO Y HERRAMIENTAS
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const selector = document.getElementById('selector-plantilla');

// 2. LAS MEMORIAS (BITÁCORAS)
let puntosActuales = [];      // Guarda los clics del triángulo que estás haciendo ahorita
let historialTriangulos = []; // La "memoria permanente" de todos los triángulos listos

// 3. FUNCIÓN MAESTRA DE REDIBUJO (La que mantiene todo vivo)
function actualizarPantalla() {
    // A. Limpiamos el lienzo por completo para evitar encimados
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    // B. Dibujamos la plantilla seleccionada al fondo
    dibujarPlantillaDeFondo(selector.value);

    // C. Redibujamos todos los triángulos guardados en la memoria permanente
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

    // D. Dibujamos los puntitos rojos del triángulo que se está trazando en este momento
    puntosActuales.forEach(function(punto) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 4. DETECTOR DE CLICS DEL USUARIO
lienzo.addEventListener('click', function(evento) {
    const rect = lienzo.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    // Guardamos el punto en el triángulo actual
    puntosActuales.push({ x: x, y: y });

    // Si ya completamos 3 clics, guardamos el triángulo en la memoria permanente
    if (puntosActuales.length === 3) {
        const nuevoTriangulo = {
            p1: puntosActuales[0],
            p2: puntosActuales[1],
            p3: puntosActuales[2],
            colorRelleno: 'rgba(78, 205, 196, 0.4)', // Color base verde agua
            colorBorde: '#4ecdc4'
        };

        historialTriangulos.push(nuevoTriangulo); // Se guarda en la bitácora principal
        puntosActuales = []; // Vaciamos los clics temporales para el siguiente triángulo
    }

    // Le ordenamos a la pantalla actualizarse para mostrar los cambios inmediatamente
    actualizarPantalla();
});

// 5. DIBUJANTE DE PLANTILLAS
function dibujarPlantillaDeFondo(tipo) {
    ctx.strokeStyle = '#555566'; // Líneas guía un poco más visibles sobre fondo oscuro
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Efecto punteado

    if (tipo === 'corazon') {
        ctx.beginPath();
        ctx.moveTo(300, 150);
        ctx.lineTo(380, 80);
        ctx.lineTo(460, 150);
        ctx.lineTo(300, 350);
        ctx.lineTo(140, 150);
        ctx.lineTo(220, 80);
        ctx.closePath();
        ctx.stroke();
    } else if (tipo === 'diamante') {
        ctx.beginPath();
        ctx.moveTo(300, 50);
        ctx.lineTo(450, 150);
        ctx.lineTo(300, 350);
        ctx.lineTo(150, 150);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(450, 150);
        ctx.moveTo(300, 50);
        ctx.lineTo(300, 350);
        ctx.stroke();
    }

    ctx.setLineDash([]); // Quitamos el punteado para no afectar los triángulos del usuario
}

// 6. DETECTOR DE CAMBIO DE PLANTILLA
selector.addEventListener('change', function() {
    // Al cambiar la plantilla, solo refrescamos la pantalla (la memoria se mantiene intacta)
    actualizarPantalla();
});