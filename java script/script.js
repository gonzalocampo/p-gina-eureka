document.documentElement.classList.add("js");
const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== 0. Raíz del proyecto (se calcula sola, así las rutas valen en cualquier página) =====
// Este archivo está en "java script/", así que la raíz es la carpeta de arriba.
let RAIZ = location.origin + "/";
try {
	RAIZ = new URL("../", document.currentScript.src).href;
} catch (error) {
	// si algo falla, se usa la raíz del servidor
}

// ===== 1. Menú =======
const MENU = [
	{ texto: "Inicio", ruta: "index.html" },
	{ texto: "Programas", ruta: "/pages/programas.html" },
	{ texto: "Calculadora", ruta: "/pages/calculadora.html" },
	{ texto: "Contacto", ruta: "/pages/contacto.html" },
];

const menu = document.getElementById("menu");
// Si la URL termina en "/", estamos en el index
const paginaActual = location.pathname.endsWith("/") ? location.pathname + "index.html" : location.pathname;

for (const item of MENU) {
	const li = document.createElement("li");
	const a = document.createElement("a");
	a.textContent = item.texto;
	a.href = new URL(item.ruta, RAIZ).href;
	if (new URL(a.href).pathname === paginaActual) {
		a.classList.add("activo"); // marca la página donde estamos
		a.setAttribute("aria-current", "page");
	}
	li.appendChild(a);
	menu.appendChild(li);
}

// ===== 2. Modo claro / oscuro (se recuerda; si no hay elección, usa el del sistema) =====
const botonModo = document.getElementById("btn-modo");

function actualizarTextoBoton() {
	botonModo.textContent = document.body.classList.contains("oscuro") ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

const guardado = localStorage.getItem("modo");
if (guardado === "oscuro" || (guardado === null && matchMedia("(prefers-color-scheme: dark)").matches)) {
	document.body.classList.add("oscuro");
}
actualizarTextoBoton();

botonModo.addEventListener("click", function () {
	document.body.classList.toggle("oscuro");
	localStorage.setItem("modo", document.body.classList.contains("oscuro") ? "oscuro" : "claro");
	actualizarTextoBoton();
});

// ===== Efectos: barra de progreso, cabecera y menú móvil =====
const cabecera = document.querySelector(".cabecera");
const barra = document.createElement("div");
barra.className = "progreso";
document.body.prepend(barra);

function alHacerScroll() {
	const total = document.documentElement.scrollHeight - innerHeight;
	barra.style.transform = "scaleX(" + (total > 0 ? scrollY / total : 0) + ")";
	cabecera.classList.toggle("elevada", scrollY > 10);
}
addEventListener("scroll", alHacerScroll, { passive: true });
alHacerScroll();

const toggle = document.createElement("button");
toggle.className = "menu-toggle";
toggle.type = "button";
toggle.textContent = "☰";
toggle.setAttribute("aria-label", "Abrir menú");
toggle.setAttribute("aria-expanded", "false");
cabecera.insertBefore(toggle, cabecera.querySelector("nav"));
toggle.addEventListener("click", function () {
	const abierto = cabecera.classList.toggle("abierto");
	toggle.setAttribute("aria-expanded", abierto);
});

// ===== Efectos: aparición al hacer scroll y contadores =====
const aparecer = new IntersectionObserver(
	function (entradas) {
		for (const e of entradas) {
			if (e.isIntersecting) {
				e.target.classList.add("visible");
				aparecer.unobserve(e.target);
			}
		}
	},
	{ threshold: 0.15 },
);
document.querySelectorAll(".revelar").forEach(function (el) {
	aparecer.observe(el);
});

const contar = new IntersectionObserver(
	function (entradas) {
		for (const e of entradas) {
			if (!e.isIntersecting) continue;
			contar.unobserve(e.target);
			const el = e.target,
				meta = Number(el.dataset.meta),
				ini = performance.now();
			function paso(t) {
				const p = reducir ? 1 : Math.min((t - ini) / 1400, 1);
				el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3))).toLocaleString("es-ES");
				if (p < 1) requestAnimationFrame(paso);
			}
			requestAnimationFrame(paso);
		}
	},
	{ threshold: 0.6 },
);
document.querySelectorAll("[data-meta]").forEach(function (el) {
	contar.observe(el);
});

// ===== Efectos con el ratón: foco de luz, inclinación e imán =====
if (!reducir) {
	const portada = document.querySelector(".portada");
	if (portada) {
		portada.addEventListener("pointermove", function (e) {
			const r = portada.getBoundingClientRect();
			portada.style.setProperty("--mx", e.clientX - r.left + "px");
			portada.style.setProperty("--my", e.clientY - r.top + "px");
		});
	}
	document.querySelectorAll(".tilt").forEach(function (c) {
		c.addEventListener("pointermove", function (e) {
			const r = c.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5,
				y = (e.clientY - r.top) / r.height - 0.5;
			c.style.transform = "perspective(700px) rotateX(" + -y * 8 + "deg) rotateY(" + x * 8 + "deg) translateY(-4px)";
		});
		c.addEventListener("pointerleave", function () {
			c.style.transform = "";
		});
	});
	document.querySelectorAll(".boton").forEach(function (b) {
		b.addEventListener("pointermove", function (e) {
			const r = b.getBoundingClientRect();
			b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.2 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
		});
		b.addEventListener("pointerleave", function () {
			b.style.transform = "";
		});
	});
}

// ===== Ruleta de datos curiosos (adelanto de la calculadora) =====
const HECHOS = [
	{ n: 3, t: "Los pulpos tienen tres corazones." },
	{ n: 8, t: "La luz del Sol tarda unos 8 minutos en llegar a la Tierra." },
	{ n: 100, t: "A nivel del mar, el agua hierve a 100 °C." },
	{ n: 206, t: "Un adulto tiene 206 huesos." },
	{ n: 243, t: "Venus tarda 243 días terrestres en girar sobre sí mismo, más que los 225 que tarda en dar la vuelta al Sol." },
];
// Si está cargado datos-curiosos-1.js usamos los datos reales; si no, los de arriba
const FUENTE =
	typeof DATOS_CURIOSOS !== "undefined" && DATOS_CURIOSOS.length
		? DATOS_CURIOSOS.map(function (d) {
				return { n: d.numero, t: d.dato };
			})
		: HECHOS;
const ruletaNum = document.getElementById("ruleta-num");
const ruletaDato = document.getElementById("ruleta-dato");
const ruletaBtn = document.getElementById("ruleta-btn");

if (ruletaNum) {
	let ultimo = -1;
	function girar() {
		let k;
		do {
			k = Math.floor(Math.random() * FUENTE.length);
		} while (k === ultimo);
		ultimo = k;
		const h = FUENTE[k];
		ruletaBtn.disabled = true;
		ruletaDato.classList.remove("entra");
		function fin() {
			ruletaNum.textContent = h.n;
			ruletaDato.textContent = h.t;
			void ruletaDato.offsetWidth;
			ruletaDato.classList.add("entra");
			ruletaBtn.disabled = false;
		}
		if (reducir) return fin();
		const t0 = performance.now();
		(function rodar(t) {
			if (t - t0 < 900) {
				ruletaNum.textContent = 1 + Math.floor(Math.random() * 5000);
				setTimeout(function () {
					requestAnimationFrame(rodar);
				}, 50);
			} else fin();
		})(t0);
	}
	ruletaBtn.addEventListener("click", girar);
	girar();
}

// ===== 3. Formulario de contacto (solo existe en contacto.html) =====
const formulario = document.getElementById("formulario");

if (formulario) {
	const mensaje = document.getElementById("mensaje");
	const contador = document.getElementById("contador");

	// Contador de caracteres del mensaje
	mensaje.addEventListener("input", function () {
		contador.textContent = mensaje.value.length + " / 300";
	});

	// Escribe (o borra) el error de un campo
	function poner_error(id, texto) {
		document.getElementById("error-" + id).textContent = texto;
		const campo = document.getElementById(id);
		campo.setAttribute("aria-invalid", texto !== "" ? "true" : "false");
		if (campo.type !== "checkbox") {
			campo.classList.toggle("campo-mal", texto !== "");
		}
		return texto === ""; // true si no hay error
	}

	formulario.addEventListener("submit", function (evento) {
		evento.preventDefault(); // evita que la página se recargue

		const nombre = document.getElementById("nombre").value.trim();
		const email = document.getElementById("email").value.trim();
		const telefono = document.getElementById("telefono").value.replace(/\s/g, ""); // quita espacios
		const motivo = document.getElementById("motivo").value;
		const texto = mensaje.value.trim();
		const acepto = document.getElementById("acepto").checked;

		// Expresiones regulares
		const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
		const regexTelefono = /^(\+34)?[6789]\d{8}$/; // móvil o fijo español

		// Cada validación devuelve true (bien) o false (mal)
		const resultados = [
			poner_error("nombre", nombre === "" ? "Escribe tu nombre." : ""),
			poner_error("email", regexEmail.test(email) ? "" : "Escribe un email válido."),
			poner_error("telefono", regexTelefono.test(telefono) ? "" : "Teléfono no válido (9 cifras, ej. 612345678)."),
			poner_error("motivo", motivo === "" ? "Elige un motivo." : ""),
			poner_error("mensaje", texto.length < 20 ? "El mensaje debe tener al menos 20 caracteres." : ""),
			poner_error("acepto", acepto ? "" : "Debes aceptar la política de privacidad."),
		];

		const resultado = document.getElementById("resultado");
		if (resultados.includes(false)) {
			resultado.textContent = "Revisa los campos marcados.";
			resultado.className = "resultado";
		} else {
			resultado.textContent = "✅ ¡Gracias, " + nombre + "! Hemos recibido tu mensaje.";
			resultado.className = "resultado ok";
			formulario.reset();
			contador.textContent = "0 / 300";
		}
	});
}
