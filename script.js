// =========================================================================
// 1. SELECCIÓN DE ELEMENTOS DEL LIENZO Y CONTROLES
// =========================================================================
const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const tarjetas = document.querySelectorAll('.tarjeta-diseno');
const selectorPlantilla = document.getElementById('selector-plantilla');
const inputSubir = document.getElementById('subir-imagen'); 
const areaDibujo = document.getElementById('area-dibujo');   
const sliderPuntos = document.getElementById('slider-puntos');
const valorPuntos = document.getElementById('valor-puntos');
const btnExportar = document.getElementById('btn-exportar');

let imagenOriginal = null; 

// Inicializar la ventana con un mensaje limpio de bienvenida
function inicializarVentana() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "300 16px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ARRASTRA TU FOTOGRAFÍA AQUÍ PARA TRANSFORMARLA", canvas.width / 2, canvas.height / 2);
}
inicializarVentana();

// =========================================================================
// 2. PROCESAMIENTO AUTOMÁTICO AL SUBIR LA IMAGEN
// =========================================================================
function procesarArchivo(archivo) {
    if (!archivo || !archivo.type.startsWith('image/')) {
        alert("Por favor, sube un archivo de imagen válido (JPG, PNG).");
        return;
    }

    const lector = new FileReader();
    lector.onload = function(evento) {
        imagenOriginal = new Image();
        imagenOriginal.onload = function() {
            // Ajustamos el lienzo manteniendo la proporción exacta de la fotografía
            const maxAncho = 600;
            const proporcion = imagenOriginal.height / imagenOriginal.width;
            canvas.width = maxAncho;
            canvas.height = maxAncho * proporcion;

            // Generar el arte geométrico inmediatamente
            generarLowPolyAutomatico();
        };
        imagenOriginal.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
}

// =========================================================================
// 3. MOTOR AUTOMÁTICO LOW POLY (ALTA CALIDAD BASADA EN CONTRASTE)
// =========================================================================
function generarLowPolyAutomatico() {
    if (!imagenOriginal) return;

    const ancho = canvas.width;
    const alto = canvas.height;
    const maxPuntos = parseInt(sliderPuntos.value) || 1200;

    // 1. Dibujar la imagen en un lienzo oculto para analizar sus pixeles
    const canvasOculto = document.createElement('canvas');
    canvasOculto.width = ancho;
    canvasOculto.height = alto;
    const ctxOculto = canvasOculto.getContext('2d');
    ctxOculto.drawImage(imagenOriginal, 0, 0, ancho, alto);
    const datosImagen = ctxOculto.getImageData(0, 0, ancho, alto);

    const puntos = [];
    
    // Asegurar esquinas y bordes para que la geometría cubra todo el lienzo
    puntos.push([0, 0], [ancho, 0], [0, alto], [ancho, alto]);
    for (let x = 0; x <= ancho; x += 50) { puntos.push([x, 0]); puntos.push([x, alto]); }
    for (let y = 0; y <= alto; y += 50) { puntos.push([0, y]); puntos.push([ancho, y]); }

    // 2. Algoritmo de dispersión inteligente: analiza el contraste (bordes)
    // Esto hace que los detalles importantes reciban más triángulos automáticamente
    let puntosGenerados = 0;
    let intentos = 0;
    
    while (puntosGenerados < maxPuntos && intentos < maxPuntos * 10) {
        intentos++;
        const rx = Math.floor(Math.random() * (ancho - 2)) + 1;
        const ry = Math.floor(Math.random() * (alto - 2)) + 1;
        
        // Medir el contraste comparando el pixel actual con sus vecinos (Filtro básico de bordes)
        const i = (ry * ancho + rx) * 4;
        const iDerecha = (ry * ancho + (rx + 1)) * 4;
        const iAbajo = ((ry + 1) * ancho + rx) * 4;
        
        const brilloActual = (datosImagen.data[i] + datosImagen.data[i+1] + datosImagen.data[i+2]) / 3;
        const brilloDerecha = (datosImagen.data[iDerecha] + datosImagen.data[iDerecha+1] + datosImagen.data[iDerecha+2]) / 3;
        const brilloAbajo = (datosImagen.data[iAbajo] + datosImagen.data[iAbajo+1] + datosImagen.data[iAbajo+2]) / 3;
        
        const diferencia = Math.abs(brilloActual - brilloDerecha) + Math.abs(brilloActual - brilloAbajo);
        
        // Si hay un borde fuerte o el azar lo decide, agregamos un vértice geométrico allí
        if (diferencia > 25 || Math.random() < 0.05) {
            puntos.push([rx, ry]);
            puntosGenerados++;
        }
    }

    // 3. Crear la malla matemática de triángulos usando Delaunay
    const delaunay = d3.Delaunay.from(puntos);
    const triangulosMalla = delaunay.trianglePolygons();

    // Limpiar pantalla y pintar la obra de arte final
    ctx.clearRect(0, 0, ancho, alto);

    for (const triangulo of triangulosMalla) {
        ctx.beginPath();
        ctx.moveTo(triangulo, triangulo);
        ctx.lineTo(triangulo, triangulo);
        ctx.lineTo(triangulo, triangulo);
        ctx.closePath();

        // Obtener el centro del triángulo para muestrear el color real de la foto
        const centroX = Math.floor((triangulo + triangulo + triangulo) / 3);
        const centroY = Math.floor((triangulo + triangulo + triangulo) / 3);

        if (centroX >= 0 && centroX < ancho && centroY >= 0 && centroY < alto) {
            const indicePixel = (centroY * ancho + centroX) * 4;
            const r = datosImagen.data[indicePixel];
            const g = datosImagen.data[indicePixel + 1];
            const b = datosImagen.data[indicePixel + 2];

            // Rellenar el triángulo con su color plano
            ctx.fillStyle = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
            ctx.fill();

            // Sellar los bordes con el mismo color para evitar líneas de separación vacías
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
}

// =========================================================================
// 4. CONTROLADORES DE EVENTOS (Arrastrar, Soltar y Sliders)
// =========================================================================

// Eventos de arrastrar y soltar archivos en la ventana oscura
if (areaDibujo) {
    ['dragenter', 'dragover'].forEach(evt => {
        areaDibujo.addEventListener(evt, (e) => {
            e.preventDefault();
            areaDibujo.style.borderColor = "#a38965"; // Iluminación premium al sostener foto
            canvas.style.opacity = "0.6";
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        areaDibujo.addEventListener(evt, (e) => {
            e.preventDefault();
            areaDibujo.style.borderColor = "#1e293b";
            canvas.style.opacity = "1";
        });
    });

    areaDibujo.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) {
            procesarArchivo(e.dataTransfer.files);
        }
    });
}

// Botón clásico de exploración de archivos
if (inputSubir) {
    inputSubir.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            procesarArchivo(e.target.files);
        }
    });
}

// Slider interactivo para cambiar la densidad de polígonos sobre la misma foto
if (sliderPuntos) {
    sliderPuntos.addEventListener('input', function() {
        if (valorPuntos) valorPuntos.textContent = `${this.value} pts`;
        if (imagenOriginal) generarLowPolyAutomatico();
    });
}

// Botón para descargar el arte terminado
if (btnExportar) {
    btnExportar.addEventListener('click', function() {
        if (!imagenOriginal) {
            alert("Primero debes subir una fotografía para poder exportar tu patrón.");
            return;
        }
        const enlace = document.createElement('a');
        enlace.download = 'arte-lowpoly.png';
        enlace.href = canvas.toDataURL('image/png');
        enlace.click();
    });
}

// Vincular las tarjetas precargadas del catálogo si el usuario hace clic en ellas
tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        const rutaImagen = tarjeta.getAttribute('data-img');
        imagenOriginal = new Image();
        imagenOriginal.crossOrigin = "anonymous";
        imagenOriginal.onload = function() {
            canvas.width = 600;
            canvas.height = 400;
            generarLowPolyAutomatico();
        };
        imagenOriginal.src = rutaImagen;
    });
});
