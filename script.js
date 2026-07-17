// 1. CONEXIÓN CON EL LIENZO Y HERRAMIENTAS
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const selector = document.getElementById('selector-plantilla');
const btnExportar = document.getElementById('btn-exportar');

// 2. LAS MEMORIAS (BITÁCORAS)
let puntosActuales = [];      
let historialTriangulos = []; 

// 3. FUNCIÓN MAESTRA DE REDIBUJO
function actualizarPantalla() {
    // A. Limpiamos el lienzo
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    // B. Dibujamos la plantilla seleccionada al fondo (silueta guía)
    dibujarPlantillaDeFondo(selector.value);

    // C. Dibujamos las Pestañas de Pegado automáticas PRIMERO (para que queden abajo del triángulo)
    historialTriangulos.forEach(function(triangulo) {
        calcularYDibujaPestañas(triangulo.p1, triangulo.p2);
        calcularYDibujaPestañas(triangulo.p2, triangulo.p3);
        calcularYDibujaPestañas(triangulo.p3, triangulo.p1);
    });

    // D. Redibujamos todos los triángulos guardados en la memoria
    historialTriangulos.forEach(function(triangulo) {
        ctx.fillStyle = triangulo.colorRelleno;
        ctx.strokeStyle = '#000000'; // Línea de corte exterior: Sólida y Negra
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(triangulo.p1.x, triangulo.p1.y);
        ctx.lineTo(triangulo.p2.x, triangulo.p2.y);
        ctx.lineTo(triangulo.p3.x, triangulo.p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // E. Dibujamos los clics temporales activos
    puntosActuales.forEach(function(punto) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 4. ALGORITMO VECTORIAL PARA GENERAR PESTAÑAS (Trapecios de Pegado)
function calcularYDibujaPestañas(A, B) {
    // Ancho de la pestaña (H) e indentación para el doblez en píxeles
    const H = 14; 
    const indent = 6;

    // Vector director del segmento (B - A)
    const vx = B.x - A.x;
    const vy = B.y - A.y;
    const longitud = Math.sqrt(vx * vx + vy * vy);

    if (longitud === 0) return;

    // Vectores unitarios directores
    const ux = vx / longitud;
    const uy = vy / longitud;

    // Vector normal hacia el exterior (rotado 90 grados)
    const nx = -uy;
    const ny = ux;

    // Ecuaciones de los 4 puntos del trapecio de la pestaña
    const t1x = A.x + ux * indent;
    const t1y = A.y + uy * indent;

    const t2x = A.x + ux * indent + nx * H;
    const t2y = A.y + uy * indent + ny * H;

    const t3x = B.x - ux * indent + nx * H;
    const t3y = B.y - uy * indent + ny * H;

    const t4x = B.x - ux * indent;
    const t4y = B.y - uy * indent;

    // RENDERIZADO EN PANTALLA
    // Relleno suave para la pestaña
    ctx.fillStyle = 'rgba(200, 200, 210, 0.3)';
    ctx.beginPath();
    ctx.moveTo(t1x, t1y);
    ctx.lineTo(t2x, t2y);
    ctx.lineTo(t3x, t3y);
    ctx.lineTo(t4x, t4y);
    ctx.closePath();
    ctx.fill();

    // Líneas Exteriores de la pestaña (Corte: Sólidas)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(t1x, t1y);
    ctx.lineTo(t2x, t2y);
    ctx.lineTo(t3x, t3y);
    ctx.lineTo(t4x, t4y);
    ctx.stroke();

    // Base de la pestaña (Doblez: Línea Punteada)
    ctx.strokeStyle = '#666677';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
    ctx.setLineDash([]); // Reseteamos
}

// 5. DETECTOR DE CLICS
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
            colorRelleno: 'rgba(255, 255, 255, 0.8)', // Blanco semi-transparente ideal para imprimir
            colorBorde: '#000000'
        };

        historialTriangulos.push(nuevoTriangulo);
        puntosActuales = []; 
    }
    actualizarPantalla();
});

// 6. MOTOR DE EXPORTACIÓN VECTORIAL (Bajar Archivo Imprimible)
btnExportar.addEventListener('click', function() {
    if (historialTriangulos.length === 0) {
        alert("¡Primero dibuja algunos triángulos antes de exportar!");
        return;
    }

    // Iniciamos la cadena de texto SVG estructurada
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lienzo.width} ${lienzo.height}" width="${lienzo.width}" height="${lienzo.height}">`;
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`; // Fondo blanco puro para impresión

    // Exportamos las pestañas primero en el código SVG
    historialTriangulos.forEach(t => {
        [ [t.p1, t.p2], [t.p2, t.p3], [t.p3, t.p1] ].forEach(arista => {
            const A = arista[0]; const B = arista[1];
            const vx = B.x - A.x; const vy = B.y - A.y;
            const len = Math.sqrt(vx*vx + vy*vy);
            if(len === 0) return;
            const ux = vx/len; const uy = vy/len;
            const nx = -uy; const ny = ux;
            const H = 14; const ind = 6;

            const t1x = A.x + ux * ind;   const t1y = A.y + uy * ind;
            const t2x = t1x + nx * H;     const t2y = t1y + ny * H;
            const t4x = B.x - ux * ind;   const t4y = B.y - uy * ind;
            const t3x = t4x + nx * H;     const t3y = t4y + ny * H;

            // Trapecio
            svg += `<polygon points="${t1x},${t1y} ${t2x},${t2y} ${t3x},${t3y} ${t4x},${t4y}" fill="#f1f5f9" stroke="#000000" stroke-width="1.5"/>`;
            // Línea interna de doblez discontinua
            svg += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#666677" stroke-width="1" stroke-dasharray="4,4"/>`;
        });
    });

    // Exportamos los triángulos principales
    historialTriangulos.forEach(t => {
        svg += `<polygon points="${t.p1.x},${t.p1.y} ${t.p2.x},${t.p2.y} ${t.p3.x},${t.p3.y}" fill="none" stroke="#000000" stroke-width="2"/>`;
    });

    svg += `</svg>`;

    // Crear la descarga en el navegador instantánea
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const descarga = document.createElement('a');
    descarga.href = url;
    descarga.download = 'patron_escultura_papercraft.svg';
    document.body.appendChild(descarga);
    descarga.click();
    document.body.removeChild(descarga);
    URL.revokeObjectURL(url);
});

// 7. DIBUJANTE DE PLANTILLAS DE FONDO
function dibujarPlantillaDeFondo(tipo) {
    ctx.strokeStyle = '#444455'; 
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); 

    if (tipo === 'corazon') {
        ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(380, 80); ctx.lineTo(460, 150);
        ctx.lineTo(300, 350); ctx.lineTo(140, 150); ctx.lineTo(220, 80); ctx.closePath(); ctx.stroke();
    } else if (tipo === 'diamante') {
        ctx.beginPath(); ctx.moveTo(300, 50); ctx.lineTo(450, 150); ctx.lineTo(300, 350); ctx.lineTo(150, 150); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(150, 150); ctx.lineTo(450, 150); ctx.moveTo(300, 50); ctx.lineTo(300, 350); ctx.stroke();
    }
    ctx.setLineDash([]); 
}

selector.addEventListener('change', actualizarPantalla);

// 8. MOTOR DE CARGA DE IMÁGENES DE FONDO (Para calcar figuras complejas)
const cargadorImagen = document.getElementById('cargador-imagen');
let imagenFondo = null; // Aquí guardaremos la foto del Dóberman o mascota

cargadorImagen.addEventListener('change', function(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    
    // Cuando el navegador termine de leer el archivo...
    lector.onload = function(e) {
        imagenFondo = new Image();
        imagenFondo.onload = function() {
            selector.value = 'ninguna'; // Desactivamos las plantillas prehechas
            actualizarPantalla(); // Redibujamos el lienzo con la nueva foto atrás
        };
        imagenFondo.src = e.target.result; // Asignamos la imagen guardada
    };
    
    lector.readAsDataURL(archivo);
});