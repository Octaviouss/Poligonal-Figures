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