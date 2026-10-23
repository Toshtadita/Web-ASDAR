// =========================================
// CALCULADORA DE CONSUMO DE AGUA
// =========================================

/*
    Valores aproximados de consumo (litros).
    Si ASDAR tiene datos propios, se pueden cambiar aquí.
*/
const CONSUMO = {
    duchaPorMinuto: 10,       // litros por minuto de ducha
    llavePorMinuto: 6,        // litros por minuto de llave abierta
    lavadoraPorCarga: 80,     // litros por cada lavada de ropa
    sanitarioPorPersona: 30,  // 5 descargas de 6 litros al día
    cepilladoAbierta: 24,     // 2 cepilladas de 2 minutos con la llave abierta
    cepilladoCerrada: 2       // usando un vaso o cerrando la llave
};

// Nivel de litros al día con el que el tanque se ve lleno.
const LITROS_TANQUE_LLENO = 1500;

(function () {
    const calculadora = document.querySelector("[data-calculadora]");
    if (!calculadora) return;

    const formulario = calculadora.querySelector("form");
    const total = calculadora.querySelector("[data-total]");
    const porPersona = calculadora.querySelector("[data-por-persona]");
    const mes = calculadora.querySelector("[data-mes]");
    const desglose = calculadora.querySelector("[data-desglose]");
    const consejos = calculadora.querySelector("[data-consejos]");
    const tanque = calculadora.querySelector(".calc-tanque");

    let totalMostrado = 0;
    let animacion = null;

    // Formatea números con separador de miles (por ejemplo, 1.250).
    const formato = (numero) => Math.round(numero).toLocaleString("es-CO");

    function leerValores() {
        const datos = new FormData(formulario);
        return {
            personas: Number(datos.get("personas")),
            ducha: Number(datos.get("ducha")),
            loza: Number(datos.get("loza")),
            ropa: Number(datos.get("ropa")),
            cepillado: datos.get("cepillado") === "on"
        };
    }

    function calcular(v) {
        const usos = [
            { nombre: "Ducha", litros: v.personas * v.ducha * CONSUMO.duchaPorMinuto },
            { nombre: "Sanitario", litros: v.personas * CONSUMO.sanitarioPorPersona },
            { nombre: "Loza", litros: v.loza * CONSUMO.llavePorMinuto },
            { nombre: "Ropa", litros: (v.ropa * CONSUMO.lavadoraPorCarga) / 7 },
            {
                nombre: "Cepillado",
                litros: v.personas * (v.cepillado ? CONSUMO.cepilladoAbierta : CONSUMO.cepilladoCerrada)
            }
        ];

        const suma = usos.reduce((acumulado, uso) => acumulado + uso.litros, 0);
        return { usos, suma };
    }

    function crearConsejos(v) {
        const lista = [];

        if (v.ducha > 5) {
            const ahorro = v.personas * (v.ducha - 5) * CONSUMO.duchaPorMinuto;
            lista.push("Si cada persona se ducha en 5 minutos, ahorrarían unos <strong>" + formato(ahorro) + " litros al día</strong>.");
        }

        if (v.cepillado) {
            const ahorro = v.personas * (CONSUMO.cepilladoAbierta - CONSUMO.cepilladoCerrada);
            lista.push("Cerrar la llave al cepillarse ahorra cerca de <strong>" + formato(ahorro) + " litros al día</strong>. Usa un vaso con agua.");
        }

        if (v.loza > 10) {
            const ahorro = (v.loza - 10) * CONSUMO.llavePorMinuto;
            lista.push("Enjabona la loza con la llave cerrada y enjuaga todo al final: puedes ahorrar unos <strong>" + formato(ahorro) + " litros al día</strong>.");
        }

        if (v.ropa > 0) {
            lista.push("Usa la lavadora con carga completa y reutiliza el agua del enjuague para el piso o el sanitario.");
        }

        if (lista.length === 0) {
            lista.push("¡Muy bien! Tus hábitos ya cuidan el agua. Revisa de vez en cuando que no haya fugas en casa.");
        }

        return lista.slice(0, 3);
    }

    // Anima el número total desde el valor anterior hasta el nuevo.
    function animarTotal(destino) {
        cancelAnimationFrame(animacion);
        const origen = totalMostrado;
        const inicio = performance.now();
        const duracion = 350;

        function paso(ahora) {
            const progreso = Math.min((ahora - inicio) / duracion, 1);
            totalMostrado = origen + (destino - origen) * progreso;
            total.textContent = formato(totalMostrado);
            if (progreso < 1) animacion = requestAnimationFrame(paso);
        }

        animacion = requestAnimationFrame(paso);
    }

    function actualizar() {
        const v = leerValores();
        const { usos, suma } = calcular(v);

        // Textos al lado de cada control.
        calculadora.querySelector('[data-salida="personas"]').textContent = v.personas;
        calculadora.querySelector('[data-salida="ducha"]').textContent = v.ducha + " min";
        calculadora.querySelector('[data-salida="loza"]').textContent = v.loza + " min";
        calculadora.querySelector('[data-salida="ropa"]').textContent = v.ropa;

        // Colorea la parte recorrida de cada control deslizante.
        formulario.querySelectorAll('input[type="range"]').forEach(function (control) {
            const porcentaje = ((control.value - control.min) / (control.max - control.min)) * 100;
            control.style.setProperty("--relleno", porcentaje + "%");
        });

        animarTotal(suma);
        porPersona.textContent = formato(suma / v.personas);
        mes.textContent = ((suma * 30) / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 });

        // Nivel del tanque.
        tanque.style.setProperty("--nivel", Math.min(suma / LITROS_TANQUE_LLENO, 1).toFixed(3));

        // Desglose por uso, de mayor a menor.
        const mayor = Math.max(...usos.map((uso) => uso.litros), 1);
        desglose.innerHTML = usos
            .slice()
            .sort((a, b) => b.litros - a.litros)
            .map(function (uso) {
                const ancho = (uso.litros / mayor) * 100;
                return '<li><span class="calc-uso">' + uso.nombre + '</span>' +
                    '<span class="calc-barra"><span style="width:' + ancho.toFixed(1) + '%"></span></span>' +
                    '<span class="calc-litros">' + formato(uso.litros) + ' L</span></li>';
            })
            .join("");

        consejos.innerHTML = crearConsejos(v)
            .map((texto) => "<li>" + texto + "</li>")
            .join("");
    }

    formulario.addEventListener("input", actualizar);
    actualizar();
})();
