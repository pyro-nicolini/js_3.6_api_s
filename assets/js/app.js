const input = document.getElementById("input1");
const boton = document.getElementById("boton");
const resultado = document.getElementById("result");
const seleccion = document.getElementById("divisas");
let options = document.querySelectorAll("option");
let valorElegido = 0;
let opcionElegida = "dolar";

options.forEach((option, i) => {
  option.id = option.value;
});

function actualizarElegido() {
  opcionElegida = seleccion.value;
  valorElegido = Number(input.value) || 0;
  cambiarEndpoint(opcionElegida);
}

async function getMonedas() {
  try {
    const endpoint = "https://mindicador.cl/api/";
    const res = await fetch(endpoint);
    const monedas = await res.json();
    const monedasFiltradasPorPesos = Object.values(monedas) //convertimos objeto en array
      .filter((elemento) => typeof elemento === "object") // filtramos por tipo objeto
      .filter((elemento) => elemento.unidad_medida == "Pesos"); // filtramos por unidad_medida
    return monedasFiltradasPorPesos;
  } catch (e) {
    console.error(`mensaje :${e.message}`);
  }
}

async function convertirMoneda(valor, divisa) {
  actualizarElegido();
  const monedasFiltradasPorPesos = await getMonedas();
  let simbol = "";
  let divisaFiltrada = monedasFiltradasPorPesos.filter(
    (elemento) => elemento.codigo == divisa
  );
  let conversion = valor / divisaFiltrada[0].valor;
  if (divisa == "dolar") {
    simbol = "US$ ";
  } else if (divisa == "euro") {
    simbol = "€ ";
  } else {
    simbol = `${divisa}'s `.toUpperCase();
  }
  resultado.innerText = `${simbol}${conversion.toFixed(2)}`;
}

boton.addEventListener("click", () => {
  actualizarElegido();
  convertirMoneda(valorElegido, opcionElegida);
});

seleccion.addEventListener("change", () => {
  actualizarElegido();
  renderGrafica();
});

function cambiarEndpoint(divisa) {
  return `https://mindicador.cl/api/${divisa}`;
}

async function obtenerMonedas() {
  try {
    const endpoint = cambiarEndpoint(opcionElegida);
    const res = await fetch(endpoint);
    const dolar = await res.json();
    return dolar.serie;
  } catch (e) {
    console.error(`mensaje :${e.message}`);
  }
}

function prepararConfiguracionParaLaGrafica(monedas) {
  //Creamos las variables necesarias para el objeto de configuración
  const tipoDeGrafica = "line";
  let nombresDeLasMonedas = monedas.map((moneda) => moneda.fecha);
  let fechas = nombresDeLasMonedas
    .map((fechas) => fechas.split("T").shift())
    .splice(0, 10);

  const titulo = `${opcionElegida}`.toUpperCase();
  const colorDeLinea = "red";
  const valores = monedas.map((moneda) => {
    const valor = moneda.valor;
    return Number(valor);
  });
  //Creamos el objeto de configuración usando las variables anteriores
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: fechas,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          data: valores,
        },
      ],
    },
  };
  return config;
}

async function renderGrafica() {
  try {
    const monedas = await obtenerMonedas();
    const config = prepararConfiguracionParaLaGrafica(monedas);
    const chartDOM = document.getElementById("myChart");

    if (window.chartInstance) {
      window.chartInstance.destroy();
    }
    window.chartInstance = new Chart(chartDOM, config);
  } catch (e) {
    console.error(`mensaje :${e.message}`);
  }
}

renderGrafica();
actualizarElegido();
