const input = document.getElementById("input1");
const boton = document.getElementById("boton");
const resultado = document.getElementById("result");
const seleccion = document.getElementById("divisas");
let options = document.querySelectorAll("option");
const mensajeCarga = document.getElementById("mensajeDeCarga");
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
      .filter((elemento) => elemento.unidad_medida == "Pesos"); // filtramos por pesos Chilenos
    return monedasFiltradasPorPesos;
  } catch (e) {
    console.error(`Error al conectar con la API: ${e.message}`);
    return []; // en caso de error no interrumpimos el flujo
  }
}

async function convertirMoneda(valor, divisa) {
  actualizarElegido();
  try {
    mensajeCarga.style.display = "block";
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
  } catch (e) {
    console.error(`Error al convertir la moneda: ${e.message}`);
  } finally {
    mensajeCarga.style.display = "none";
  }
}

boton.addEventListener("click", async () => {
  boton.disabled = true;
  mensajeCarga.style.display = "block";
  try {
  actualizarElegido();
  await convertirMoneda(valorElegido, opcionElegida);
  } catch (error) {
  console.error("Ocurrió al realizar conversión. Intente más tarde.");
  console.error(`Error en la conversión: ${error.message}`);
} finally {
  boton.disabled = false;
  mensajeCarga.style.display = "none";
}
});

seleccion.addEventListener("change", async () => {
  seleccion.disabled = true;
  mensajeCarga.style.display = "block";
  try {
    actualizarElegido();
    await renderGrafica();
  } catch (error) {
    console.error(`Error al actualizar: ${error.message}`);
  } finally {
    seleccion.disabled = false;
    mensajeCarga.style.display = "none";
  }
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
    console.error(`Error al conectar con la API: ${e.message}`);
    console.error("Error conectando con la API, porr favor, espere 2 minutos persista. El despliegue entre Github y Mindicador a veces da latencias");
  }
}

function prepararConfiguracionParaLaGrafica(monedas) {
  const tipoDeGrafica = "line";
  let nombresDeLasMonedas = monedas.map((moneda) => moneda.fecha);
  let fechas = nombresDeLasMonedas
    .map((fechas) => fechas.split("T").shift())
    .splice(0, 10);
  const titulo = `${opcionElegida}`.toUpperCase();
  const valores = monedas.map((moneda) => Number(moneda.valor));

  // Define colores para cada punto
  const coloresDeFondo = valores.map((_, i) =>
    i % 2 === 0 ? "rgb(221, 0, 217)" : "rgba(54, 162, 235, 0.5)"
  );
  const coloresDeBorde = valores.map((_, i) =>
    i % 2 === 0 ? "rgb(255, 255, 255)" : "rgb(0, 221, 255)"
  );

  const config = {
    type: tipoDeGrafica,
    data: {
      labels: fechas,
      datasets: [
        {
          label: titulo,
          data: valores,
          backgroundColor: coloresDeFondo, // Colores de los puntos
          borderColor: coloresDeBorde,    // Colores de las líneas
          borderWidth: 2,                 // Grosor de las líneas
          pointRadius: 8,                 // Tamaño de los puntos
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#fff", // Cambia el color de las etiquetas de la leyenda
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#fff", // Cambia el color de los valores en el eje X
          },
          grid: {
            color: "#00FFFF", // Cambia el color de la grilla en el eje Y
          },
        },
        y: {
          ticks: {
            color: "#fff", // Cambia el color de los valores en el eje Y
          },
          grid: {
            color: "#00FFFF", // Cambia el color de la grilla en el eje Y
          },
        },
      },
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
    console.error(`Error al renderizar la gráfica: ${e.message}`);
  }
}
renderGrafica();
actualizarElegido();