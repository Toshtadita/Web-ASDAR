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

    /*
        Por último dibujamos las ondas de agua activas.
    */
    dibujarOndas();
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
    (La llamada está al final del archivo, después de
    preparar las ondas, porque el dibujo las necesita.)
*/

// =========================================
// ONDAS DE AGUA AL TOCAR LA PORTADA
// =========================================

/*
    Cada toque o clic crea una onda que se expande por la
    cuadrícula, como cuando cae una gota en el agua.
    Guardamos las ondas activas con su centro y su hora de inicio.
*/
const ondas = [];

// Velocidad de la onda en píxeles por milisegundo.
const VELOCIDAD_ONDA = 0.5;

// Tiempo que dura cada onda en milisegundos.
const DURACION_ONDA = 1700;

// Grosor del anillo de la onda.
const GROSOR_ONDA = 60;

// Respetamos a quienes prefieren menos movimiento.
const prefiereMenosMovimiento =
    window.matchMedia("(prefers-reduced-motion: reduce)");

let animandoOndas = false;


function dibujarOndas() {
    const ahora = performance.now();

    for (const onda of ondas) {
        const tiempo = ahora - onda.inicio;
        const radio = tiempo * VELOCIDAD_ONDA;

        // La onda se desvanece a medida que pasa el tiempo.
        const desvanecido = 1 - tiempo / DURACION_ONDA;

        if (desvanecido <= 0) continue;

        for (const hexagono of hexagonos) {
            const distancia = Math.hypot(
                hexagono.x - onda.x,
                hexagono.y - onda.y
            );

            // Qué tan cerca está el hexágono del anillo de la onda.
            const cercania =
                1 - Math.abs(distancia - radio) / GROSOR_ONDA;

            if (cercania <= 0) continue;

            const intensidad = cercania * desvanecido;

            crearFormaHexagono(
                hexagono.x,
                hexagono.y,
                tamañoHexagono - 2
            );

            ctx.fillStyle =
                "rgba(0, 168, 232, " + (0.13 * intensidad) + ")";
            ctx.fill();

            ctx.strokeStyle =
                "rgba(0, 112, 192, " + (0.6 * intensidad) + ")";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}


function animarOndas() {
    const ahora = performance.now();

    // Quitamos las ondas que ya terminaron.
    for (let i = ondas.length - 1; i >= 0; i--) {
        if (ahora - ondas[i].inicio > DURACION_ONDA) {
            ondas.splice(i, 1);
        }
    }

    dibujarHexagonos();

    if (ondas.length > 0) {
        requestAnimationFrame(animarOndas);
    } else {
        animandoOndas = false;
    }
}


function crearOnda(x, y) {
    if (prefiereMenosMovimiento.matches) return;

    // Máximo cinco ondas a la vez para no recargar el dibujo.
    if (ondas.length >= 5) ondas.shift();

    ondas.push({
        x: x,
        y: y,
        inicio: performance.now()
    });

    if (!animandoOndas) {
        animandoOndas = true;
        requestAnimationFrame(animarOndas);
    }
}


hero.addEventListener("pointerdown", function (evento) {
    /*
        Si la persona toca un botón o enlace, no creamos la onda
        para no distraer de la acción que eligió.
    */
    if (evento.target.closest("a, button")) return;

    const posicionCanvas = canvas.getBoundingClientRect();

    crearOnda(
        (evento.clientX - posicionCanvas.left)
            * (canvas.width / posicionCanvas.width),
        (evento.clientY - posicionCanvas.top)
            * (canvas.height / posicionCanvas.height)
    );
});


/*
    Una primera onda suave al cargar invita a interactuar.
*/
window.setTimeout(function () {
    crearOnda(canvas.width / 2, canvas.height * 0.45);
}, 900);


// =========================================
// RECORRIDO DEL AGUA (GOTA QUE BAJA CON EL SCROLL)
// =========================================

/*
    Medimos cuánto ha avanzado la persona dentro del recorrido
    (de 0 a 1) y lo guardamos en la variable de CSS --avance.
    El CSS usa ese valor para mover la gota y llenar la línea.
    Cada etapa recibe la clase "alcanzada" cuando la gota llega a ella.
*/
(function () {
    const recorrido = document.querySelector("[data-recorrido]");
    if (!recorrido) return;

    const etapas = Array.from(recorrido.querySelectorAll(".recorrido-etapa"));
    let pendiente = false;

    function actualizar() {
        pendiente = false;

        // Punto de referencia: un poco por debajo de la mitad de la pantalla.
        const referencia = window.innerHeight * 0.55;
        const medidas = recorrido.getBoundingClientRect();

        const avance = Math.min(
            Math.max((referencia - medidas.top) / medidas.height, 0),
            1
        );

        recorrido.style.setProperty("--avance", avance.toFixed(4));

        etapas.forEach(function (etapa) {
            const punto = etapa.querySelector(".recorrido-etapa-punto");
            const posicion = punto.getBoundingClientRect().top;
            etapa.classList.toggle("alcanzada", posicion < referencia);
        });
    }

    function pedirActualizacion() {
        if (!pendiente) {
            pendiente = true;
            requestAnimationFrame(actualizar);
        }
    }

    if (prefiereMenosMovimiento.matches) {
        // Sin animación: mostramos el recorrido completo.
        recorrido.classList.add("recorrido-estatico");
        etapas.forEach(function (etapa) {
            etapa.classList.add("alcanzada");
        });
        return;
    }

    window.addEventListener("scroll", pedirActualizacion, { passive: true });
    window.addEventListener("resize", pedirActualizacion);
    actualizar();
})();


// =========================================
// CIFRAS QUE CUENTAN
// =========================================

/*
    data-contador="anios" calcula los años desde la fundación
    (27 de julio de 2007), así la cifra se actualiza sola cada año.
    data-contador="100" (o cualquier número) cuenta hasta ese valor.
*/
(function () {
    const contadores = document.querySelectorAll("[data-contador]");
    if (!contadores.length) return;

    function aniosDesdeFundacion() {
        const hoy = new Date();
        const fundacion = new Date(2007, 6, 27); // Los meses empiezan en 0: 6 = julio.
        let anios = hoy.getFullYear() - fundacion.getFullYear();

        const aunNoCumple =
            hoy.getMonth() < fundacion.getMonth() ||
            (hoy.getMonth() === fundacion.getMonth() &&
                hoy.getDate() < fundacion.getDate());

        if (aunNoCumple) anios--;
        return anios;
    }

    function valorFinal(elemento) {
        const tipo = elemento.dataset.contador;
        return tipo === "anios" ? aniosDesdeFundacion() : Number(tipo);
    }

    function contar(elemento) {
        const final = valorFinal(elemento);
        const duracion = 1400;
        const inicio = performance.now();

        function paso(ahora) {
            const progreso = Math.min((ahora - inicio) / duracion, 1);
            // Suavizado: empieza rápido y frena al final.
            const suave = 1 - Math.pow(1 - progreso, 3);
            elemento.textContent = Math.round(final * suave);
            if (progreso < 1) requestAnimationFrame(paso);
        }

        requestAnimationFrame(paso);
    }

    if (prefiereMenosMovimiento.matches || !("IntersectionObserver" in window)) {
        contadores.forEach(function (elemento) {
            elemento.textContent = valorFinal(elemento);
        });
        return;
    }

    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                contar(entrada.target);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.6 });

    contadores.forEach(function (elemento) {
        elemento.textContent = "0";
        observador.observe(elemento);
    });
})();


// Primer dibujo de la cuadrícula.
ajustarCanvas();
