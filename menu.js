// =========================================
// FUNCIONES COMPARTIDAS POR TODAS LAS PÁGINAS
// - Menú desplegable en celulares (botón hamburguesa)
// - Barra de navegación compacta al hacer scroll
// - Franja de aviso que se puede cerrar
// - Aparición suave de las secciones al hacer scroll
// =========================================

(function () {
    const navegacion = document.querySelector(".navegacion");
    const botonMenu = document.querySelector(".menu-boton");
    const menu = document.getElementById("menu-principal");


    // ---------- MENÚ EN CELULARES ----------

    if (navegacion && botonMenu && menu) {
        function abrirOCerrar(abrir) {
            navegacion.classList.toggle("menu-abierto", abrir);
            botonMenu.setAttribute("aria-expanded", String(abrir));
            botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
        }

        botonMenu.addEventListener("click", function () {
            abrirOCerrar(!navegacion.classList.contains("menu-abierto"));
        });

        // Al tocar un enlace del menú, este se cierra.
        menu.querySelectorAll("a").forEach(function (enlace) {
            enlace.addEventListener("click", function () {
                abrirOCerrar(false);
            });
        });

        // Se cierra con la tecla Escape o al tocar fuera del menú.
        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") abrirOCerrar(false);
        });

        document.addEventListener("click", function (evento) {
            if (!navegacion.contains(evento.target)) abrirOCerrar(false);
        });

        // Si la pantalla se agranda (por ejemplo, al girar la tableta), se reinicia.
        window.matchMedia("(min-width: 851px)").addEventListener("change", function () {
            abrirOCerrar(false);
        });
    }


    // ---------- NAVEGACIÓN COMPACTA AL HACER SCROLL ----------

    if (navegacion) {
        function revisarScroll() {
            navegacion.classList.toggle("navegacion-compacta", window.scrollY > 40);
        }

        revisarScroll();
        window.addEventListener("scroll", revisarScroll, { passive: true });
    }


    // ---------- FRANJA DE AVISO ----------

    /*
        Si la persona cierra la franja, lo recordamos en su navegador.
        try/catch evita errores cuando el navegador bloquea el almacenamiento.
    */
    const franja = document.querySelector("[data-franja]");

    if (franja) {
        const clave = "asdar-franja-" + franja.dataset.franja;
        let estaCerrada = false;

        try {
            estaCerrada = localStorage.getItem(clave) === "cerrada";
        } catch (error) {
            estaCerrada = false;
        }

        if (estaCerrada) {
            franja.remove();
        } else {
            const botonCerrar = franja.querySelector("[data-cerrar-franja]");

            if (botonCerrar) {
                botonCerrar.addEventListener("click", function () {
                    franja.remove();
                    try {
                        localStorage.setItem(clave, "cerrada");
                    } catch (error) {
                        // Sin almacenamiento: la franja volverá a aparecer en la próxima visita.
                    }
                });
            }
        }
    }


    // ---------- APARICIÓN SUAVE AL HACER SCROLL ----------

    /*
        Los elementos con el atributo data-aparecer se muestran con una
        animación cuando entran en pantalla. Si el navegador es antiguo o la
        persona prefiere menos movimiento, se muestran directamente.
    */
    const elementos = document.querySelectorAll("[data-aparecer]");
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (elementos.length && "IntersectionObserver" in window && !menosMovimiento) {
        document.documentElement.classList.add("js-aparecer");

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        elementos.forEach(function (elemento) {
            observador.observe(elemento);
        });
    }
})();
