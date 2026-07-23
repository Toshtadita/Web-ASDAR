// =========================================
// OBTENER LOS ELEMENTOS DEL HTML
// =========================================

// Canvas donde dibujaremos la cuadrícula
const canvas = document.getElementById("fondo-interactivo");

// Portada donde detectaremos el movimiento
const hero = document.querySelector(".hero");

// Herramienta para dibujar en dos dimensiones
const ctx = canvas.getContext("2d");


// =========================================
// POSICIÓN DEL PUNTERO
// =========================================

/*
    Guardamos la posición del mouse o del dedo.

    Comienza fuera del canvas para que ningún
    hexágono aparezca seleccionado al cargar.
*/
const mouse = {
    x: -1000,
    y: -1000,
    activo: false
};


// =========================================
// CONFIGURACIÓN DE LOS HEXÁGONOS
// =========================================

// Tamaño de cada hexágono
const tamañoHexagono = 36;

// Aquí guardaremos las posiciones calculadas
let hexagonos = [];


// =========================================
// AJUSTAR EL TAMAÑO DEL CANVAS
// =========================================

function ajustarCanvas() {
    /*
        Obtenemos el tamaño visual real del canvas.
    */
    const medidas = canvas.getBoundingClientRect();

    /*
        Ajustamos el tamaño interno del canvas
        utilizando las medidas reales.

        Math.round evita valores con decimales.
    */
    canvas.width = Math.round(medidas.width);
    canvas.height = Math.round(medidas.height);

    /*
        Después de cambiar el tamaño debemos
        reconstruir y dibujar la cuadrícula.
    */
    crearHexagonos();
    dibujarHexagonos();
}


// =========================================
// CALCULAR LA POSICIÓN DE LOS HEXÁGONOS
// =========================================

function crearHexagonos() {
    // Eliminamos las posiciones anteriores
    hexagonos = [];

    /*
        Distancias necesarias para que los
        hexágonos encajen correctamente.
    */
    const distanciaHorizontal =
        tamañoHexagono * 1.5;

    const distanciaVertical =
        Math.sqrt(3) * tamañoHexagono;

    /*
        Recorremos columnas y filas hasta cubrir
        todo el ancho y alto del canvas.
    */
    for (
        let columna = -1;
        columna * distanciaHorizontal <
        canvas.width + tamañoHexagono;
        columna++
    ) {
        for (
            let fila = -1;
            fila * distanciaVertical <
            canvas.height + distanciaVertical;
            fila++
        ) {
            /*
                Posición horizontal del hexágono.
            */
            const x =
                columna * distanciaHorizontal;

            /*
                Las columnas impares bajan la mitad
                de la distancia vertical para formar
                la cuadrícula tipo panal.
            */
            const desplazamiento =
                columna % 2 === 0
                    ? 0
                    : distanciaVertical / 2;

            /*
                Posición vertical del hexágono.
            */
            const y =
                fila * distanciaVertical
                + desplazamiento;

            /*
                Guardamos las coordenadas.
            */
            hexagonos.push({
                x: x,
                y: y
            });
        }
    }
}


// =========================================
// CREAR LA FORMA DE UN HEXÁGONO
// =========================================

function crearFormaHexagono(x, y, tamaño) {
    /*
        Comenzamos una figura nueva.
    */
    ctx.beginPath();

    /*
        Un hexágono tiene seis lados.
    */
    for (let lado = 0; lado < 6; lado++) {
        /*
            Calculamos el ángulo correspondiente
            a cada uno de los seis puntos.
        */
        const angulo =
            (Math.PI / 3) * lado;

        /*
            Calculamos las coordenadas del punto.
        */
        const puntoX =
            x + tamaño * Math.cos(angulo);

        const puntoY =
            y + tamaño * Math.sin(angulo);

        /*
            El primer punto inicia la figura.
            Los siguientes crean las líneas.
        */
        if (lado === 0) {
            ctx.moveTo(puntoX, puntoY);
        } else {
            ctx.lineTo(puntoX, puntoY);
        }
    }

    /*
        Cerramos el último lado del hexágono.
    */
    ctx.closePath();
}


// =========================================
// BUSCAR EL HEXÁGONO MÁS CERCANO
// =========================================

function buscarHexagonoSeleccionado() {
    /*
        Si el puntero no está dentro de la portada,
        no seleccionamos ningún hexágono.
    */
    if (!mouse.activo) {
        return null;
    }

    let seleccionado = null;
    let distanciaMenor = Infinity;

    /*
        Recorremos todos los hexágonos.
    */
    for (const hexagono of hexagonos) {
        /*
            Math.hypot calcula la distancia entre
            el puntero y el centro del hexágono.
        */
        const distancia = Math.hypot(
            hexagono.x - mouse.x,
            hexagono.y - mouse.y
        );

        /*
            Conservamos el hexágono que tenga
            la menor distancia.
        */
        if (distancia < distanciaMenor) {
            distanciaMenor = distancia;
            seleccionado = hexagono;
        }
    }

    /*
        Solo seleccionamos el hexágono cuando
        el puntero está dentro de su zona.
    */
    if (distanciaMenor <= tamañoHexagono) {
        return seleccionado;
    }

    return null;
}


// =========================================
// DIBUJAR LA CUADRÍCULA COMPLETA
// =========================================

function dibujarHexagonos() {
    /*
        Limpiamos el dibujo anterior.
    */
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
        Averiguamos cuál hexágono está
        debajo del puntero.
    */
    const seleccionado =
        buscarHexagonoSeleccionado();

    /*
        Primero dibujamos todos los hexágonos
        con una línea azul muy suave.
    */
    for (const hexagono of hexagonos) {
        crearFormaHexagono(
            hexagono.x,
            hexagono.y,
            tamañoHexagono - 2
        );

        ctx.strokeStyle =
            "rgba(11, 45, 99, 0.12)";

        ctx.lineWidth = 1;

        ctx.stroke();
    }

    /*
        Después dibujamos nuevamente solamente
        el hexágono seleccionado.

        No usamos relleno para que permanezca
        transparente.
    */
    if (seleccionado !== null) {
        crearFormaHexagono(
            seleccionado.x,
            seleccionado.y,
            tamañoHexagono - 2
        );

        ctx.strokeStyle =
            "rgba(0, 112, 192, 0.55)";

        ctx.lineWidth = 1.5;

        ctx.stroke();
    }
}


// =========================================
// ACTUALIZAR LA POSICIÓN DEL PUNTERO
// =========================================

function actualizarPosicionPuntero(evento) {
    /*
        Obtenemos la ubicación y el tamaño visual
        actual del canvas.
    */
    const posicionCanvas =
        canvas.getBoundingClientRect();

    /*
        Calculamos la diferencia entre el tamaño
        interno y el tamaño visual del canvas.

        Esto evita que se seleccione un hexágono
        diferente al que está bajo el mouse.
    */
    const escalaX =
        canvas.width / posicionCanvas.width;

    const escalaY =
        canvas.height / posicionCanvas.height;

    /*
        Convertimos las coordenadas del navegador
        en coordenadas internas del canvas.
    */
    mouse.x =
        (evento.clientX - posicionCanvas.left)
        * escalaX;

    mouse.y =
        (evento.clientY - posicionCanvas.top)
        * escalaY;

    mouse.activo = true;

    /*
        Volvemos a dibujar para mostrar
        el hexágono seleccionado.
    */
    dibujarHexagonos();
}


// =========================================
// EVENTOS DEL PUNTERO
// =========================================

/*
    pointermove funciona con mouse, lápiz
    digital y, cuando es compatible, tacto.
*/
hero.addEventListener(
    "pointermove",
    actualizarPosicionPuntero
);

/*
    En pantallas táctiles también reaccionamos
    cuando la persona presiona la portada.
*/
hero.addEventListener(
    "pointerdown",
    actualizarPosicionPuntero
);


// =========================================
// CUANDO EL PUNTERO SALE DE LA PORTADA
// =========================================

hero.addEventListener("pointerleave", function () {
    /*
        Movemos el puntero fuera del canvas.
    */
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.activo = false;

    /*
        Redibujamos la cuadrícula sin selección.
    */
    dibujarHexagonos();
});


// =========================================
// OBSERVAR CAMBIOS DE TAMAÑO
// =========================================

/*
    ResizeObserver detecta cambios reales en el
    tamaño de la portada.

    Esto es importante porque el logo y los textos
    pueden modificar la altura después de cargar.
*/
const observadorHero =
    new ResizeObserver(function () {
        ajustarCanvas();
    });

/*
    Comenzamos a observar la portada.
*/
observadorHero.observe(hero);


// =========================================
// CUANDO TODA LA PÁGINA TERMINA DE CARGAR
// =========================================

window.addEventListener("load", function () {
    ajustarCanvas();
});


// =========================================
// CAMBIO DE TAMAÑO DE LA VENTANA
// =========================================

window.addEventListener("resize", function () {
    ajustarCanvas();
});


// =========================================
// INICIAR INMEDIATAMENTE
// =========================================

/*
    Dibujamos una primera vez sin esperar
    la carga completa de la página.
*/
ajustarCanvas();