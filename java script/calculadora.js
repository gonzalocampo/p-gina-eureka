// ===== Datos curiosos: juntamos todas las listas en un objeto =====
// Así podemos buscar el dato de un número directamente: datosPorNumero[42]
// (typeof ... evita errores si algún archivo de datos no está cargado)
const LISTAS = [
	typeof DATOS_CURIOSOS !== "undefined" ? DATOS_CURIOSOS : [],
	typeof DATOS_CURIOSOS_2 !== "undefined" ? DATOS_CURIOSOS_2 : [],
	typeof DATOS_CURIOSOS_3 !== "undefined" ? DATOS_CURIOSOS_3 : [],
	typeof DATOS_CURIOSOS_4 !== "undefined" ? DATOS_CURIOSOS_4 : [],
	typeof DATOS_CURIOSOS_5 !== "undefined" ? DATOS_CURIOSOS_5 : [],
	typeof DATOS_CURIOSOS_6 !== "undefined" ? DATOS_CURIOSOS_6 : [],
	typeof DATOS_CURIOSOS_7 !== "undefined" ? DATOS_CURIOSOS_7 : [],
	typeof DATOS_CURIOSOS_8 !== "undefined" ? DATOS_CURIOSOS_8 : [],
	typeof DATOS_CURIOSOS_9 !== "undefined" ? DATOS_CURIOSOS_9 : [],
	typeof DATOS_CURIOSOS_10 !== "undefined" ? DATOS_CURIOSOS_10 : [],
];

const datosPorNumero = {};
let MAXIMO = 0; // el número más alto que tiene dato (se calcula solo)
for (const lista of LISTAS) {
	for (const d of lista) {
		datosPorNumero[d.numero] = d;
		if (d.numero > MAXIMO) MAXIMO = d.numero;
	}
}
if (MAXIMO === 0) MAXIMO = 5000; // si no se cargó ningún archivo de datos

// ===== Elementos de la página =====
const pantalla = document.getElementById("pantalla");
const lineaOperacion = document.getElementById("operacion");
const cajaDato = document.getElementById("caja-dato");
const datoEtiqueta = document.getElementById("dato-etiqueta");
const datoTexto = document.getElementById("dato-texto");

// ===== Estado de la calculadora =====
let actual = "0"; // número que se está escribiendo
let anterior = null; // primer número de la operación
let operador = null; // +, −, ×, ÷
let nuevoNumero = true; // true = la próxima cifra empieza un número nuevo

// Muestra un número con coma decimal (estilo español)
function formatear(numero) {
	return String(numero).replace(".", ",");
}

function actualizarPantalla() {
	pantalla.textContent = formatear(actual);
	lineaOperacion.textContent = operador !== null ? formatear(anterior) + " " + operador : "";
}

function operar(a, b, op) {
	if (op === "+") return a + b;
	if (op === "−") return a - b;
	if (op === "×") return a * b;
	if (op === "÷") return b === 0 ? NaN : a / b; // dividir entre 0 da error
}

// Si la parte entera del resultado está entre 1 y MAXIMO, buscamos su dato curioso
function mostrarDato(resultado) {
	cajaDato.classList.remove("nuevo");
	void cajaDato.offsetWidth; // reinicia la animación
	cajaDato.classList.add("nuevo");

	// Parte entera: 7.35 -> 7 | 7 -> 7
	const entero = Math.trunc(resultado);

	if (!Number.isFinite(resultado) || entero < 1 || entero > MAXIMO) {
		datoEtiqueta.textContent = "";
		datoTexto.textContent = "Haz una operación cuyo resultado esté entre 1 y " + MAXIMO + ".";
		return;
	}

	// Si el resultado tiene decimales, avisamos de qué número se ha usado
	const nota = Number.isInteger(resultado) ? "" : " (parte entera de " + formatear(resultado) + ")";

	const dato = datosPorNumero[entero];
	if (dato) {
		datoEtiqueta.textContent = "#" + dato.numero + " · " + dato.categoria + nota;
		datoTexto.textContent = dato.dato;
	} else {
		datoEtiqueta.textContent = "#" + entero + nota;
		datoTexto.textContent = "Todavía no tenemos el dato curioso número " + entero + ". ¡Prueba con otro!";
	}
}

// Pantalla de error (por ejemplo, al dividir entre 0)
function mostrarError(mensaje) {
	actual = "0";
	anterior = null;
	operador = null;
	nuevoNumero = true;
	lineaOperacion.textContent = "";
	pantalla.textContent = "Error";
	datoEtiqueta.textContent = "";
	datoTexto.textContent = mensaje;
}

// ===== Acciones de las teclas =====
function pulsarNumero(tecla) {
	if (nuevoNumero) {
		actual = tecla === "." ? "0." : tecla;
		nuevoNumero = false;
	} else if (tecla === ".") {
		if (!actual.includes(".")) actual += ".";
	} else if (actual === "0") {
		actual = tecla;
	} else if (actual.length < 12) {
		actual += tecla;
	}
	actualizarPantalla();
}

function pulsarOperador(op) {
	// Si ya había una operación pendiente (ej. 2 + 3 +), la resolvemos antes
	if (operador !== null && !nuevoNumero) {
		const parcial = operar(anterior, parseFloat(actual), operador);
		if (!Number.isFinite(parcial)) {
			mostrarError("No se puede dividir entre 0.");
			return;
		}
		anterior = parcial;
		actual = String(Number(anterior.toFixed(10)));
	} else {
		anterior = parseFloat(actual);
	}
	operador = op;
	nuevoNumero = true;
	actualizarPantalla();
}

function pulsarIgual() {
	if (operador === null) {
		mostrarDato(parseFloat(actual)); // un número suelto también tiene dato
		return;
	}
	const resultado = operar(anterior, parseFloat(actual), operador);
	operador = null;
	anterior = null;
	nuevoNumero = true;

	if (!Number.isFinite(resultado)) {
		mostrarError("No se puede dividir entre 0.");
		return;
	}
	actual = String(Number(resultado.toFixed(10))); // evita 0.1 + 0.2 = 0.30000000000000004
	actualizarPantalla();
	mostrarDato(parseFloat(actual));
}

function limpiar() {
	actual = "0";
	anterior = null;
	operador = null;
	nuevoNumero = true;
	actualizarPantalla();
}

function borrar() {
	if (nuevoNumero) return;
	actual = actual.length > 1 ? actual.slice(0, -1) : "0";
	actualizarPantalla();
}

// ===== Un solo evento para todos los botones =====
const botones = document.querySelectorAll(".tecla");
for (const boton of botones) {
	boton.addEventListener("click", function () {
		const tipo = boton.dataset.tipo; // lee data-tipo del HTML
		const texto = boton.textContent;
		if (tipo === "num") pulsarNumero(texto);
		else if (tipo === "op") pulsarOperador(texto);
		else if (tipo === "igual") pulsarIgual();
		else if (tipo === "limpiar") limpiar();
		else if (tipo === "borrar") borrar();
	});
}

// ===== Teclado: también se puede usar sin ratón =====
document.addEventListener("keydown", function (e) {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	const k = e.key;
	// Si hay un botón enfocado, Enter y Espacio ya lo pulsan ellos solos
	if (e.target.tagName === "BUTTON" && (k === "Enter" || k === " ")) return;
	if (/^[0-9]$/.test(k)) pulsarNumero(k);
	else if (k === "." || k === ",") pulsarNumero(".");
	else if (k === "+") pulsarOperador("+");
	else if (k === "-") pulsarOperador("−");
	else if (k === "*" || k === "x") pulsarOperador("×");
	else if (k === "/") { e.preventDefault(); pulsarOperador("÷"); }
	else if (k === "Enter" || k === "=") { e.preventDefault(); pulsarIgual(); }
	else if (k === "Backspace") borrar();
	else if (k === "Escape" || k === "Delete") limpiar();
});
