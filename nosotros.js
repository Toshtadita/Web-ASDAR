// Busca todas las galerías de la página y configura cada una por separado.
document.querySelectorAll("[data-galeria]").forEach((galeria) => {
    // Reunimos las fotografías, los botones, la ventana visible y los indicadores.
    const fotos = Array.from(galeria.querySelectorAll(".galeria-foto"));
    const anterior = galeria.querySelector("[data-anterior]");
    const siguiente = galeria.querySelector("[data-siguiente]");
    const ventana = galeria.querySelector(".galeria-ventana");
    const indicadores = galeria.querySelector(".galeria-indicadores");

    // Si una galería está incompleta, evitamos que un error detenga el resto del JavaScript.
    if (!fotos.length || !anterior || !siguiente || !ventana || !indicadores) return;

    const DURACION_AUTOMATICA = 5000;
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
    }

    // Inicia un cambio de fotografía cada cinco segundos.
    // Se respeta la preferencia del sistema de reducir animaciones.
    function iniciarAutomatico() {
        detenerAutomatico();
        if (movimientoReducido.matches || document.hidden) return;

        temporizador = window.setInterval(() => {
            mostrar(indice + 1, false);
        }, DURACION_AUTOMATICA);
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
    ventana.addEventListener("pointerdown", (evento) => {
        if (evento.pointerType === "mouse") return;
        inicioX = evento.clientX;
        inicioY = evento.clientY;
        detenerAutomatico();
    });

    ventana.addEventListener("pointerup", (evento) => {
        if (evento.pointerType === "mouse") return;

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

    ventana.addEventListener("pointercancel", iniciarAutomatico);

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