// =========================================
// PORTADA CON EXPANSIÓN AL HACER SCROLL
// =========================================
/*
    No bloqueamos el scroll: la persona baja normalmente y nosotros solo
    medimos cuánto ha avanzado dentro de la sección (de 0 a 1).
    Ese avance se guarda en variables de CSS y el CSS hace el resto:
      --p : expansión de la foto (ocurre en el primer 65 % del recorrido)
      --c : aparición del texto final (entre el 60 % y el 85 %)
*/
(function () {
    const expansion = document.querySelector("[data-expansion]");
    if (!expansion) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pendiente = false;

    // Limita un número entre 0 y 1.
    const limitar = (valor) => Math.min(Math.max(valor, 0), 1);

    function actualizar() {
        pendiente = false;

        const medidas = expansion.getBoundingClientRect();
        const recorrido = expansion.offsetHeight - window.innerHeight;
        const avance = recorrido > 0 ? limitar(-medidas.top / recorrido) : 1;

        const p = limitar(avance / 0.65);
        const c = limitar((avance - 0.6) / 0.25);

        expansion.style.setProperty("--p", p.toFixed(4));
        expansion.style.setProperty("--c", c.toFixed(4));
    }

    // requestAnimationFrame agrupa los cálculos para que la animación sea fluida.
    function pedirActualizacion() {
        if (!pendiente) {
            pendiente = true;
            window.requestAnimationFrame(actualizar);
        }
    }

    function configurar() {
        if (menosMovimiento.matches) {
            // Sin animación: se muestra directamente el resultado final.
            expansion.classList.add("expansion-estatica");
            window.removeEventListener("scroll", pedirActualizacion);
            window.removeEventListener("resize", pedirActualizacion);
        } else {
            expansion.classList.remove("expansion-estatica");
            window.addEventListener("scroll", pedirActualizacion, { passive: true });
            window.addEventListener("resize", pedirActualizacion);
            actualizar();
        }
    }

    menosMovimiento.addEventListener("change", configurar);
    configurar();
})();


// Busca todas las galerías de la página y configura cada una por separado.
document.querySelectorAll("[data-galeria]").forEach((galeria) => {
    // Reunimos las fotografías, los botones, la ventana visible y los indicadores.
    const fotos = Array.from(galeria.querySelectorAll(".galeria-foto"));
    const anterior = galeria.querySelector("[data-anterior]");
    const siguiente = galeria.querySelector("[data-siguiente]");
    const ventana = galeria.querySelector(".galeria-ventana");
    const indicadores = galeria.querySelector(".galeria-indicadores");
    const contadorFotos = galeria.querySelector("[data-contador-fotos]");

    // Si una galería está incompleta, evitamos que un error detenga el resto del JavaScript.
    if (!fotos.length || !anterior || !siguiente || !ventana || !indicadores) return;

    // Tiempo entre fotos cuando la galería avanza sola (10 000 ms = 10 segundos).
    const DURACION_AUTOMATICA = 10000;
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let indice = 0;
    let temporizador = null;
    let inicioX = 0;
    let inicioY = 0;

    // Crea automáticamente un punto indicador por cada fotografía.
    const puntos = fotos.map((foto, posicion) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.setAttribute("aria-label", "Ver fotografía " + (posicion + 1) + " de " + fotos.length);
        punto.addEventListener("click", () => mostrar(posicion, true));
        indicadores.appendChild(punto);
        return punto;
    });

    // Detiene el avance automático mientras la persona observa o manipula la galería.
    function detenerAutomatico() {
        window.clearInterval(temporizador);
        temporizador = null;
        galeria.classList.remove("reproduciendo");
    }

    // Inicia un cambio de fotografía cada 20 segundos.
    // Se respeta la preferencia del sistema de reducir animaciones.
    function iniciarAutomatico() {
        detenerAutomatico();
        if (movimientoReducido.matches || document.hidden) return;

        temporizador = window.setInterval(() => {
            mostrar(indice + 1, false);
        }, DURACION_AUTOMATICA);

        // Activa la barrita de progreso del punto actual (ver style.css).
        galeria.style.setProperty("--duracion-galeria", DURACION_AUTOMATICA + "ms");
        galeria.classList.add("reproduciendo");
    }

    function reiniciarAutomatico() {
        detenerAutomatico();
        iniciarAutomatico();
    }

    // Activa una foto, oculta las demás y actualiza su punto indicador.
    function mostrar(nuevoIndice, reiniciar = false) {
        indice = (nuevoIndice + fotos.length) % fotos.length;

        fotos.forEach((foto, posicion) => {
            const activa = posicion === indice;
            foto.classList.toggle("activa", activa);
            foto.setAttribute("aria-hidden", String(!activa));
        });

        if (contadorFotos) contadorFotos.textContent = (indice + 1) + " / " + fotos.length;

        puntos.forEach((punto, posicion) => {
            const activo = posicion === indice;
            punto.classList.toggle("activo", activo);
            punto.setAttribute("aria-current", activo ? "true" : "false");
        });

        if (reiniciar) reiniciarAutomatico();
    }

    // Las flechas funcionan con mouse, teclado y pantalla táctil.
    anterior.addEventListener("click", () => mostrar(indice - 1, true));
    siguiente.addEventListener("click", () => mostrar(indice + 1, true));

    galeria.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft") mostrar(indice - 1, true);
        if (evento.key === "ArrowRight") mostrar(indice + 1, true);
    });

    // Guardamos el punto donde comienza el gesto para reconocer un deslizamiento horizontal.
    let arrastrando = false;

    ventana.addEventListener("pointerdown", (evento) => {
        if (evento.pointerType === "mouse") return;
        inicioX = evento.clientX;
        inicioY = evento.clientY;
        arrastrando = true;
        detenerAutomatico();
    });

    // Mientras se desliza, la foto sigue un poco al dedo para que se sienta natural.
    ventana.addEventListener("pointermove", (evento) => {
        if (!arrastrando || evento.pointerType === "mouse") return;
        const desplazamientoX = evento.clientX - inicioX;
        const desplazamientoY = evento.clientY - inicioY;
        if (Math.abs(desplazamientoX) > Math.abs(desplazamientoY)) {
            fotos[indice].style.transition = "none";
            fotos[indice].style.transform = "translateX(" + desplazamientoX * 0.35 + "px)";
        }
    });

    function soltarFoto() {
        arrastrando = false;
        fotos[indice].style.transition = "";
        fotos[indice].style.transform = "";
    }

    ventana.addEventListener("pointerup", (evento) => {
        if (evento.pointerType === "mouse") return;
        soltarFoto();

        const desplazamientoX = evento.clientX - inicioX;
        const desplazamientoY = evento.clientY - inicioY;
        const esDeslizamiento = Math.abs(desplazamientoX) > 45 && Math.abs(desplazamientoX) > Math.abs(desplazamientoY);

        if (esDeslizamiento) {
            // Hacia la izquierda avanza; hacia la derecha regresa.
            mostrar(desplazamientoX < 0 ? indice + 1 : indice - 1, true);
        } else {
            iniciarAutomatico();
        }
    });

    ventana.addEventListener("pointercancel", () => {
        soltarFoto();
        iniciarAutomatico();
    });

    // En computador se pausa al colocar el cursor o el foco sobre la galería.
    galeria.addEventListener("mouseenter", detenerAutomatico);
    galeria.addEventListener("mouseleave", iniciarAutomatico);
    galeria.addEventListener("focusin", detenerAutomatico);
    galeria.addEventListener("focusout", () => {
        window.setTimeout(() => {
            if (!galeria.contains(document.activeElement)) iniciarAutomatico();
        }, 0);
    });

    // No dejamos funcionando el temporizador cuando la pestaña está oculta.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) detenerAutomatico();
        else iniciarAutomatico();
    });

    movimientoReducido.addEventListener("change", iniciarAutomatico);

    // Estado inicial y comienzo del carrusel automático.
    mostrar(0);
    iniciarAutomatico();
});

// =========================================
// VISOR DE FOTOS A PANTALLA COMPLETA
// =========================================
/*
    Al tocar una foto de las galerías (o una foto destacada), se abre en
    grande. Dentro del visor se puede pasar de foto con las flechas, con el
    teclado o deslizando el dedo, y se cierra con Esc, con la X o tocando fuera.
*/
(function () {
    if (typeof HTMLDialogElement !== "function") return;

    // Construimos el visor una sola vez.
    const visor = document.createElement("dialog");
    visor.className = "visor";
    visor.setAttribute("aria-label", "Visor de fotografías");
    visor.innerHTML =
        '<figure class="visor-figura">' +
            '<img alt="">' +
            '<figcaption><strong></strong><span></span></figcaption>' +
        '</figure>' +
        '<button type="button" class="visor-boton visor-cerrar" aria-label="Cerrar">&times;</button>' +
        '<button type="button" class="visor-boton visor-anterior" aria-label="Foto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6L8.5 12L14.5 18"></path></svg></button>' +
        '<button type="button" class="visor-boton visor-siguiente" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6L15.5 12L9.5 18"></path></svg></button>' +
        '<p class="visor-contador"></p>';
    document.body.appendChild(visor);

    const imagen = visor.querySelector("img");
    const titulo = visor.querySelector("figcaption strong");
    const texto = visor.querySelector("figcaption span");
    const contador = visor.querySelector(".visor-contador");
    const botonAnterior = visor.querySelector(".visor-anterior");
    const botonSiguiente = visor.querySelector(".visor-siguiente");

    let grupoActual = [];
    let indiceActual = 0;

    // Convierte una figura del HTML en los datos que necesita el visor.
    function datosDeFigura(figura) {
        const img = figura.querySelector("img");
        const pie = figura.querySelector("figcaption");
        const fuerte = pie ? pie.querySelector("strong") : null;
        const detalle = pie ? pie.querySelector("span") : null;

        return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") || "",
            titulo: fuerte ? fuerte.textContent : "",
            texto: detalle ? detalle.textContent : (pie && !fuerte ? pie.textContent : "")
        };
    }

    function mostrar(indice) {
        indiceActual = (indice + grupoActual.length) % grupoActual.length;
        const foto = grupoActual[indiceActual];

        imagen.src = foto.src;
        imagen.alt = foto.alt;
        titulo.textContent = foto.titulo;
        texto.textContent = foto.texto;

        const variasFotos = grupoActual.length > 1;
        contador.textContent = variasFotos ? (indiceActual + 1) + " / " + grupoActual.length : "";
        botonAnterior.hidden = !variasFotos;
        botonSiguiente.hidden = !variasFotos;
    }

    function abrir(grupo, indice) {
        grupoActual = grupo;
        mostrar(indice);
        document.documentElement.classList.add("visor-abierto");
        visor.showModal();
    }

    // Hace que una imagen se pueda abrir con clic, toque o teclado (Enter / espacio).
    function prepararImagen(img, grupo, indice) {
        img.classList.add("ampliable");
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", "Ver en grande: " + (img.getAttribute("alt") || "fotografía"));

        img.addEventListener("click", () => abrir(grupo, indice));
        img.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                abrir(grupo, indice);
            }
        });
    }

    // Galerías: cada una es un grupo con todas sus fotos.
    document.querySelectorAll("[data-galeria]").forEach((galeria) => {
        const figuras = Array.from(galeria.querySelectorAll(".galeria-foto"));
        const grupo = figuras.map(datosDeFigura);

        figuras.forEach((figura, indice) => {
            prepararImagen(figura.querySelector("img"), grupo, indice);
        });

        // Pequeña ayuda debajo del título de la galería.
        const encabezado = galeria.querySelector(".galeria-encabezado > div");
        if (encabezado) {
            const ayuda = document.createElement("p");
            ayuda.className = "galeria-ayuda";
            ayuda.textContent = "Toca una foto para verla en grande";
            encabezado.appendChild(ayuda);
        }
    });

    // Fotos destacadas sueltas.
    document.querySelectorAll(".historia-placa, .recorrido-destacada, .emergencia-destacada").forEach((figura) => {
        const img = figura.querySelector("img");
        if (img) prepararImagen(img, [datosDeFigura(figura)], 0);
    });

    // Controles del visor.
    botonAnterior.addEventListener("click", () => mostrar(indiceActual - 1));
    botonSiguiente.addEventListener("click", () => mostrar(indiceActual + 1));
    visor.querySelector(".visor-cerrar").addEventListener("click", () => visor.close());

    visor.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft") mostrar(indiceActual - 1);
        if (evento.key === "ArrowRight") mostrar(indiceActual + 1);
    });

    // Tocar el fondo oscuro (fuera de la foto) cierra el visor.
    visor.addEventListener("click", (evento) => {
        if (evento.target === visor) visor.close();
    });

    visor.addEventListener("close", () => {
        document.documentElement.classList.remove("visor-abierto");
    });

    // Deslizar con el dedo para cambiar de foto.
    let inicioX = 0;
    visor.addEventListener("pointerdown", (evento) => { inicioX = evento.clientX; });
    visor.addEventListener("pointerup", (evento) => {
        const desplazamiento = evento.clientX - inicioX;
        if (evento.pointerType !== "mouse" && Math.abs(desplazamiento) > 50 && grupoActual.length > 1) {
            mostrar(desplazamiento < 0 ? indiceActual + 1 : indiceActual - 1);
        }
    });
})();
