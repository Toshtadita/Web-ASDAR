// =========================================
// GOTITA, LA MASCOTA DE ASDAR
// =========================================
/*
    Este archivo crea a Gotita en cualquier página donde se incluya.
    Gotita dice un mensaje cada vez que la persona llega a una sección
    (bajando o subiendo). Los mensajes están en el HTML, en el atributo
    data-mascota de cada sección, para poder cambiarlos fácil.

    - El mensaje se queda en pantalla 1 minuto (DURACION_MENSAJE).
    - Al volver a una sección, Gotita repite su mensaje.
    - Al tocar a Gotita se repite el mensaje de la sección actual.
    - "Ocultar a Gotita" la esconde durante la visita.
*/

// Tiempo que el mensaje queda en pantalla (en milisegundos): 60 000 = 1 minuto.
const DURACION_MENSAJE = 60000;

(function () {
    const secciones = Array.from(document.querySelectorAll("[data-mascota]"));
    if (!secciones.length) return;

    // Si la persona la ocultó en esta visita, no la mostramos.
    try {
        if (sessionStorage.getItem("asdar-gotita-oculta") === "si") return;
    } catch (error) {
        // Sin almacenamiento disponible: seguimos normalmente.
    }


    // ---------- Crear a Gotita ----------

    const contenedor = document.createElement("div");
    contenedor.className = "mascota";
    contenedor.hidden = true;
    contenedor.innerHTML = `
        <div class="mascota-burbuja">
            <p class="mascota-nombre">Gotita</p>
            <p class="mascota-texto" aria-hidden="true"></p>
            <p class="mascota-texto-lector" role="status" aria-live="polite"></p>
            <div class="mascota-acciones">
                <button type="button" class="mascota-ocultar">Ocultar a Gotita</button>
            </div>
            <button type="button" class="mascota-cerrar" aria-label="Cerrar mensaje">&times;</button>
        </div>

        <button type="button" class="mascota-boton" aria-label="Gotita, la mascota de ASDAR: ver su mensaje" aria-expanded="false">
            <svg class="mascota-dibujo" viewBox="0 0 120 140" aria-hidden="true">
                <defs>
                    <linearGradient id="gotita-cuerpo" x1="0" y1="0" x2="0.4" y2="1">
                        <stop offset="0" stop-color="#7ddcff"></stop>
                        <stop offset="1" stop-color="#0a7fd1"></stop>
                    </linearGradient>
                </defs>
                <g class="mascota-brazo mascota-brazo-izquierdo">
                    <path d="M24 96 Q10 102 12 114" fill="none" stroke="#1f97e0" stroke-width="7" stroke-linecap="round"></path>
                </g>
                <g class="mascota-brazo mascota-brazo-derecho">
                    <path d="M96 94 Q112 86 110 70" fill="none" stroke="#1f97e0" stroke-width="7" stroke-linecap="round"></path>
                </g>
                <path class="mascota-cuerpo" d="M60 10C60 10 18 60 18 92A42 42 0 0 0 102 92C102 60 60 10 60 10Z" fill="url(#gotita-cuerpo)"></path>
                <ellipse cx="38" cy="74" rx="6" ry="13" fill="#ffffff" opacity="0.45" transform="rotate(-22 38 74)"></ellipse>
                <g class="mascota-hoja">
                    <path d="M61 14C66 3 82 0 90 4C86 16 72 21 61 14Z" fill="#6aa84f"></path>
                    <path d="M63 13C70 10 78 7 86 5" fill="none" stroke="#4d8a36" stroke-width="1.6" stroke-linecap="round"></path>
                </g>
                <g class="mascota-ojos">
                    <ellipse cx="47" cy="88" rx="6" ry="8" fill="#0b2d63"></ellipse>
                    <ellipse cx="73" cy="88" rx="6" ry="8" fill="#0b2d63"></ellipse>
                    <circle cx="49.5" cy="85" r="2.2" fill="#ffffff"></circle>
                    <circle cx="75.5" cy="85" r="2.2" fill="#ffffff"></circle>
                </g>
                <ellipse cx="36" cy="102" rx="6" ry="3.5" fill="#ff8fa3" opacity="0.6"></ellipse>
                <ellipse cx="84" cy="102" rx="6" ry="3.5" fill="#ff8fa3" opacity="0.6"></ellipse>
                <path class="mascota-sonrisa" d="M52 103Q60 111 68 103" fill="none" stroke="#0b2d63" stroke-width="3" stroke-linecap="round"></path>
                <ellipse class="mascota-boca" cx="60" cy="106" rx="5" ry="4.5" fill="#0b2d63"></ellipse>
            </svg>
        </button>`;
    document.body.appendChild(contenedor);

    const burbuja = contenedor.querySelector(".mascota-burbuja");
    const texto = contenedor.querySelector(".mascota-texto");
    const textoLector = contenedor.querySelector(".mascota-texto-lector");
    const boton = contenedor.querySelector(".mascota-boton");
    const cerrar = contenedor.querySelector(".mascota-cerrar");
    const ocultar = contenedor.querySelector(".mascota-ocultar");

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seccionActual = null;
    let temporizadorOcultar = null;
    let temporizadorEscribir = null;


    // ---------- Mostrar y ocultar el mensaje ----------

    function ocultarBurbuja() {
        contenedor.classList.remove("mascota-con-mensaje", "mascota-hablando");
        boton.setAttribute("aria-expanded", "false");
        window.clearTimeout(temporizadorOcultar);
        window.clearInterval(temporizadorEscribir);
    }

    function decir(mensaje) {
        if (!mensaje || contenedor.hidden) return;

        window.clearTimeout(temporizadorOcultar);
        window.clearInterval(temporizadorEscribir);

        contenedor.classList.add("mascota-con-mensaje", "mascota-hablando");
        boton.setAttribute("aria-expanded", "true");

        // Los lectores de pantalla reciben el mensaje completo de una vez.
        textoLector.textContent = mensaje;

        if (menosMovimiento) {
            texto.textContent = mensaje;
            contenedor.classList.remove("mascota-hablando");
        } else {
            // Efecto de "escribir" letra por letra.
            let letra = 0;
            texto.textContent = "";
            temporizadorEscribir = window.setInterval(function () {
                letra++;
                texto.textContent = mensaje.slice(0, letra);
                if (letra >= mensaje.length) {
                    window.clearInterval(temporizadorEscribir);
                    contenedor.classList.remove("mascota-hablando");
                }
            }, 22);
        }

        temporizadorOcultar = window.setTimeout(ocultarBurbuja, DURACION_MENSAJE);
    }


    // ---------- Mensajes al llegar a cada sección ----------

    /*
        Una sección cuenta como "actual" cuando cruza la franja central de
        la pantalla. Cada vez que la sección actual cambia (bajando o
        subiendo), Gotita dice su mensaje.
    */
    function revisarSeccion(seccion) {
        if (seccion === seccionActual) return;
        seccionActual = seccion;
        decir(seccion.dataset.mascota);
    }

    if ("IntersectionObserver" in window) {
        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) revisarSeccion(entrada.target);
            });
        }, {
            rootMargin: "-45% 0px -45% 0px"
        });

        // Esperamos un momento para que Gotita entre antes de hablar.
        window.setTimeout(function () {
            secciones.forEach(function (seccion) {
                observador.observe(seccion);
            });
        }, 1200);
    } else {
        // Navegadores muy antiguos: solo el primer mensaje.
        window.setTimeout(function () {
            revisarSeccion(secciones[0]);
        }, 1200);
    }


    // ---------- Interacción ----------

    boton.addEventListener("click", function () {
        if (contenedor.classList.contains("mascota-con-mensaje")) {
            ocultarBurbuja();
            return;
        }

        const seccion = seccionActual || secciones[0];
        decir(seccion.dataset.mascota);

        // Pequeño salto de alegría al tocarla.
        contenedor.classList.remove("mascota-salto");
        void contenedor.offsetWidth; // Reinicia la animación.
        contenedor.classList.add("mascota-salto");
    });

    cerrar.addEventListener("click", ocultarBurbuja);

    ocultar.addEventListener("click", function () {
        ocultarBurbuja();
        contenedor.classList.add("mascota-saliendo");

        try {
            sessionStorage.setItem("asdar-gotita-oculta", "si");
        } catch (error) {
            // Sin almacenamiento: volverá a aparecer en la siguiente página.
        }

        window.setTimeout(function () {
            contenedor.hidden = true;
        }, menosMovimiento ? 0 : 400);
    });

    // Escape cierra el mensaje (salvo si hay otra ventana abierta, como el visor de fotos).
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && !document.querySelector("dialog[open]")) {
            ocultarBurbuja();
        }
    });

    // Mientras el mouse está sobre el mensaje, no se oculta.
    burbuja.addEventListener("mouseenter", function () {
        window.clearTimeout(temporizadorOcultar);
    });

    burbuja.addEventListener("mouseleave", function () {
        if (contenedor.classList.contains("mascota-con-mensaje")) {
            temporizadorOcultar = window.setTimeout(ocultarBurbuja, DURACION_MENSAJE);
        }
    });


    // ---------- Entrada de Gotita ----------

    window.setTimeout(function () {
        contenedor.hidden = false;
    }, 600);
})();
