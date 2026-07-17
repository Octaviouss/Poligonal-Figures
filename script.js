// 1. Conectamos nuestro código con el lienzo de la página web
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d'); // "ctx" es el pincel virtual para dibujar en 2D

// 2. Creamos una caja (array) vacía para ir guardando los clics del usuario
let puntos = [];

// 3. Le decimos al lienzo que se quede "escuchando" cuando el usuario haga clic
lienzo.addEventListener('click', function(evento) {
    
    // Calculamos la posición exacta del ratón dentro del recuadro del lienzo
    const rect = lienzo.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    // Guardamos las coordenadas (X y Y) en nuestra lista de puntos
    puntos.push({ x: x, y: y });

    // Dibujamos un pequeño círculo rojo donde el usuario hizo clic
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2); // Crea un circulito de 5 píxeles de radio
    ctx.fill();

    // ¡La magia poligonal!: Si el usuario ya hizo 3 clics, formamos un triángulo
    if (puntos.length === 3) {
        
        // Definimos el color de relleno (un verde agua semi-transparente) y el borde
        ctx.fillStyle = 'rgba(78, 205, 196, 0.4)';
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;

        // Trazamos las líneas uniendo el punto 1, con el 2, con el 3
        ctx.beginPath();
        ctx.moveTo(puntos[0].x, puntos[0].y); // Va al primer clic
        ctx.lineTo(puntos[1].x, puntos[1].y); // Traza línea al segundo clic
        ctx.lineTo(puntos[2].x, puntos[2].y); // Traza línea al tercer clic
        ctx.closePath();                      // Cierra el triángulo volviendo al primero
        
        ctx.fill();   // Pinta el interior del triángulo
        ctx.stroke(); // Dibuja el borde brillante

        // Vaciamos la lista de puntos para que el usuario pueda empezar un nuevo triángulo
        puntos = [];
    }
});

// 4. SECCIÓN DE PLANTILLAS PREHECHAS
const selector = document.getElementById('selector-plantilla');

// Función para dibujar las líneas guía de fondo
function dibujarPlantilla(tipo) {
    // Limpiamos el lienzo para borrar la plantilla anterior (pero sin borrar tus clics)
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    
    // Configuramos un estilo de línea tenue y punteada para la guía
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Hace la línea punteada

    if (tipo === 'corazon') {
        // Trazamos una silueta simple de corazón geométrico
        ctx.beginPath();
        ctx.moveTo(300, 150);
        ctx.lineTo(380, 80);
        ctx.lineTo(460, 150);
        ctx.lineTo(300, 350); // Punta inferior
        ctx.lineTo(140, 150);
        ctx.lineTo(220, 80);
        ctx.closePath();
        ctx.stroke();
    } else if (tipo === 'diamante') {
        // Trazamos una silueta de diamante geométrico
        ctx.beginPath();
        ctx.moveTo(300, 50);  // Punta superior
        ctx.lineTo(450, 150); // Esquina derecha
        ctx.lineTo(300, 350); // Punta inferior
        ctx.lineTo(150, 150); // Esquina izquierda
        ctx.closePath();
        ctx.stroke();
        
        // Línea interna del diamante para darle efecto 3D
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(450, 150);
        ctx.moveTo(300, 50);
        ctx.lineTo(300, 350);
        ctx.stroke();
    }

    // Volvemos a activar la línea sólida para cuando el usuario dibuje
    ctx.setLineDash([]);
}

// Escuchamos cuando el usuario cambie la opción del menú desplegable
selector.addEventListener('change', function() {
    dibujarPlantilla(selector.value);
    puntos = []; // Reiniciamos los puntos para que empiece limpio
});