// 1. Seleccionamos el lienzo grande y su contexto de dibujo
const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');

// 2. Seleccionamos todas las tarjetas de los animales
const tarjetas = document.querySelectorAll('.tarjeta-diseno');

// 3. Escuchamos el clic en cada una de las tarjetas
tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
        // Al hacer clic, obtenemos la imagen detallada guardada en 'data-img'
        const rutaImagen = tarjeta.getAttribute('data-img');
        
        // Creamos un objeto de imagen en memoria
        const imagenDetallada = new Image();
        
        // Cuando la imagen termine de cargarse, la dibujamos en el lienzo grande
        imagenDetallada.onload = function() {
            // Limpiamos el lienzo anterior para que no se encimen
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dibujamos la nueva imagen abarcando todo el tamaño del lienzo
            ctx.drawImage(imagenDetallada, 0, 0, canvas.width, canvas.height);
        };
        
        // Le asignamos la ruta para que empiece a cargar
        imagenDetallada.src = rutaImagen;
    });
});