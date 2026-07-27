document.querySelectorAll("[data-galeria]").forEach((galeria) => {
    const fotos = Array.from(galeria.querySelectorAll(".galeria-foto"));
    const anterior = galeria.querySelector("[data-anterior]");
    const siguiente = galeria.querySelector("[data-siguiente]");
    const indicadores = galeria.querySelector(".galeria-indicadores");
    let indice = 0;

    const puntos = fotos.map((foto, posicion) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.setAttribute("aria-label", `Ver fotografía ${posicion + 1} de ${fotos.length}`);
        punto.addEventListener("click", () => mostrar(posicion));
        indicadores.appendChild(punto);
        return punto;
    });

    function mostrar(nuevoIndice) {
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
    }

    anterior.addEventListener("click", () => mostrar(indice - 1));
    siguiente.addEventListener("click", () => mostrar(indice + 1));

    galeria.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft") mostrar(indice - 1);
        if (evento.key === "ArrowRight") mostrar(indice + 1);
    });

    mostrar(0);
});
