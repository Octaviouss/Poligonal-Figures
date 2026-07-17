// 1. CONEXIÓN CON EL LIENZO Y HERRAMIENTAS DEL HTML
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const selector = document.getElementById('selector-plantilla');
const btnExportar = document.getElementById('btn-exportar');
const btnColor = document.getElementById('btn-color'); // Conectamos el botón de color

// 2. LAS MEMORIAS (BITÁCORAS DE ESTADO)
let puntosActuales = [];      
let historialTriangulos = []; 
let imagenFondo = null;       

// 3. SISTEMA DE PALETAS DE COLORES (Definimos combinaciones listas para usar)
const paletas = [
    { relleno: 'rgba(255, 255, 255, 0.85)', borde: '#000000' }, // 0. Blanco Técnico (Ideal para imprimir)
    { relleno: 'rgba(255, 107, 107, 0.6)',  borde: '#ff6b6b' }, // 1. Coral Neón
    { relleno: 'rgba(78, 205, 196, 0.6)',   borde: '#4ecdc4' }, // 2. Verde Agua Cyberpunk
    { relleno: 'rgba(255, 217, 61, 0.6)',   borde: '#ffd93d' }, // 3. Amarillo Sol
    { relleno: 'rgba(165, 94, 234, 0.6)',   borde: '#a55eff' }  // 4. Morado Místico
];
let paletaActualIndex = 0; // Empezamos con la paleta blanca

// 4. FUNCIÓN MAESTRA DE REDIBUJO
function actualizarPantalla() {
    // A. Limpiamos el lienzo para evitar encimados
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    // B. Si hay una foto de animal seleccionada, la dibujamos de fondo
    if (imagenFondo) {
        ctx.drawImage(imagenFondo, 0, 0, lienzo.width, lienzo.height);
    }

    // C. Dibujamos la silueta geométrica guía si está activa
    dibujarPlantillaDeFondo(selector.value);

    // D. Dibujamos las Pestañas de Pegado de la memoria primero (abajo)
    historialTriangulos.forEach(function(triangulo) {
        calcularYDibujaPestañas(triangulo.p1, triangulo.p2);
        calcularYDibujaPestañas(triangulo.p2, triangulo.p3);
        calcularYDibujaPestañas(triangulo.p3, triangulo.p1);
    });

    // E. Redibujamos todos los triángulos con sus colores actualizados
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

    // F. Dibujamos los clics temporales activos (Puntos de anclaje)
    puntosActuales.forEach(function(punto) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 5. ALGORITMO DE PESTAÑAS TRAPEZOIDALES AUTOMÁTICAS
function calcularYDibujaPestañas(A, B) {
    const H = 14; 
    const indent = 6;
    const vx = B.x - A.x;
    const vy = B.y - A.y;
    const longitud = Math.sqrt(vx * vx + vy * vy);

    if (longitud === 0) return;

    const ux = vx / longitud;
    const uy = vy / longitud;
    const nx = -uy;
    const ny = ux;

    const t1x = A.x + ux * indent;       const t1y = A.y + uy * indent;
    const t2x = t1x + nx * H;             const t2y = t1y + ny * H;
    const t4x = B.x - ux * indent;       const t4y = B.y - uy * indent;
    const t3x = t4x + nx * H;             const t3y = t4y + ny * H;

    // Cuerpo de la pestaña
    ctx.fillStyle = 'rgba(200, 200, 210, 0.4)';
    ctx.beginPath();
    ctx.moveTo(t1x, t1y); ctx.lineTo(t2x, t2y); ctx.lineTo(t3x, t3y); ctx.lineTo(t4x, t4y);
    ctx.closePath(); ctx.fill();

    // Borde de corte de la pestaña
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(t1x, t1y); ctx.lineTo(t2x, t2y); ctx.lineTo(t3x, t3y); ctx.lineTo(t4x, t4y);
    ctx.stroke();

    // Línea de doblez (Punteada)
    ctx.strokeStyle = '#666677';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    ctx.setLineDash([]); 
}

// 6. DETECTOR DE CLICS EN EL LIENZO
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
            // Nace con el color de la paleta activa en ese momento
            colorRelleno: paletas[paletaActualIndex].relleno,
            colorBorde: paletas[paletaActualIndex].borde
        };

        historialTriangulos.push(nuevoTriangulo);
        puntosActuales = []; 
    }
    actualizarPantalla();
});

// 7. INTERRUPTOR DE PALETAS DE COLORES (Interactividad)
btnColor.addEventListener('click', function() {
    // Avanzamos a la siguiente paleta de la lista de forma cíclica
    paletaActualIndex = (paletaActualIndex + 1) % paletas.length;

    // Actualizamos el color de TODOS los triángulos que ya están guardados en la memoria
    historialTriangulos.forEach(function(triangulo) {
        triangulo.colorRelleno = paletas[paletaActualIndex].relleno;
        triangulo.colorBorde = paletas[paletaActualIndex].borde;
    });

    // Refrescamos la pantalla para ver el cambio de colores inmediatamente
    actualizarPantalla();
});

// 8. EXPORTADOR VECTORIAL SVG
btnExportar.addEventListener('click', function() {
    if (historialTriangulos.length === 0) {
        alert("¡Primero dibuja algunos triángulos antes de exportar!");
        return;
    }

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lienzo.width} ${lienzo.height}" width="${lienzo.width}" height="${lienzo.height}">`;
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`; 

    // Pestañas al archivo SVG
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

            svg += `<polygon points="${t1x},${t1y} ${t2x},${t2y} ${t3x},${t3y} ${t4x},${t4y}" fill="#f1f5f9" stroke="#000000" stroke-width="1.5"/>`;
            svg += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#666677" stroke-width="1" stroke-dasharray="4,4"/>`;
        });
    });

    // Triángulos al archivo SVG
    historialTriangulos.forEach(t => {
        svg += `<polygon points="${t.p1.x},${t.p1.y} ${t.p2.x},${t.p2.y} ${t.p3.x},${t.p3.y}" fill="none" stroke="#000000" stroke-width="2"/>`;
    });

    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const descarga = document.createElement('a');
    descarga.href = url;
    descarga.download = 'patron_vectorial_papercraft.svg';
    document.body.appendChild(descarga);
    descarga.click();
    document.body.removeChild(descarga);
    URL.revokeObjectURL(url);
});

// 9. RECEPTOR DE CLICS EN LAS TARJETAS DE ANIMALES
const tarjetas = document.querySelectorAll('.tarjeta-diseno');
tarjetas.forEach(function(tarjeta) {
    tarjeta.addEventListener('click', function() {
        const urlImagen = tarjeta.getAttribute('data-img');
        const nuevaImagen = new Image();
        nuevaImagen.src = urlImagen;
        nuevaImagen.crossOrigin = "anonymous"; 

        nuevaImagen.onload = function() {
            imagenFondo = nuevaImagen;
            selector.value = 'ninguna'; 
            actualizarPantalla(); 
        };
    });
});

// 10. SILUETAS GEOMÉTRICAS PREESTABLECIDAS
function dibujarPlantillaDeFondo(tipo) {
    ctx.strokeStyle = '#444455'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); 
    if (tipo === 'corazon') {
        ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(380, 80); ctx.lineTo(460, 150); ctx.lineTo(300, 350); ctx.lineTo(140, 150); ctx.lineTo(220, 80); ctx.closePath(); ctx.stroke();
    } else if (tipo === 'diamante') {
        ctx.beginPath(); ctx.moveTo(300, 50); ctx.lineTo(450, 150); ctx.lineTo(300, 350); ctx.lineTo(150, 150); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(150, 150); ctx.lineTo(450, 150); ctx.moveTo(300, 50); ctx.lineTo(300, 350); ctx.stroke();
    }
    ctx.setLineDash([]); 
}

selector.addEventListener('change', actualizarPantalla)