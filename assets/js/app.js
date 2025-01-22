const input = document.getElementById('input1')
const boton = document.getElementById('boton')
const resultado = document.getElementById('result')
const seleccion = document.getElementById('divisas')
let options = document.querySelectorAll('option')
let valorElegido = 0;
let opcionElegida = 'dolar';

options.forEach((option, i)=> {
  option.id = option.value;
})

boton.addEventListener('click', () => actualizarElegido())

function actualizarElegido(){
  opcionElegida = seleccion.value;
  valorElegido = Number(input.value);
  convertirMoneda(valorElegido, opcionElegida)
}

async function getMonedas() {
  const endpoint = "https://mindicador.cl/api/";
  const res = await fetch(endpoint);
  const monedas = await res.json();
  const monedasFiltradasPorPesos = Object.values(monedas) //convertimos objeto en array
  .filter(elemento=> typeof elemento === 'object') // filtramos por tipo objeto
  .filter(elemento=>elemento.unidad_medida == 'Pesos'); // filtramos por unidad_medida
   return monedasFiltradasPorPesos;
}

async function convertirMoneda(valor, divisa){
  const monedasFiltradasPorPesos = await getMonedas();
  let simbol = '';
  let divisaFiltrada = monedasFiltradasPorPesos.filter(elemento=> elemento.codigo == divisa);
  let conversion = valor / divisaFiltrada[0].valor;

  if (divisa == 'dolar'){
    simbol = "US$ "
  } else if (divisa == 'euro') {
    simbol = "€ "
  } else {
    simbol = `${divisa}'s `.toUpperCase()
  }

  resultado.innerText = `${simbol}${conversion.toFixed(2)}`;
}

actualizarElegido()


async function getDolar() {
  const endpoint = "https://mindicador.cl/api/dolar";
  const res = await fetch(endpoint);
  const dolar = await res.json();
  return dolar.serie;
}

function prepararConfiguracionParaLaGrafica(monedas) {
  // Creamos las variables necesarias para el objeto de configuración
  const tipoDeGrafica = "line";
  let nombresDeLasMonedas = monedas.map((moneda) => moneda.fecha);
  let fechas = nombresDeLasMonedas.map((fechas) => fechas.split("T").shift()).splice(0,10);


  const titulo = "Monedas";
  const colorDeLinea = "red";
  const valores = monedas.map((moneda) => {
  const valor = moneda.valor;
  return Number(valor);
  });
  // Creamos el objeto de configuración usando las variables anteriores
  const config = {
  type: tipoDeGrafica,
  data: {
  labels: fechas,
  datasets: [{
    label: titulo,
    backgroundColor: colorDeLinea,
    data: valores
    }
    ]
    }
    };
    return config;
    }

    async function renderGrafica() {
      const monedas = await getDolar();
      const config = prepararConfiguracionParaLaGrafica(monedas);
      const chartDOM = document.getElementById("myChart");
      new Chart(chartDOM, config);
      }
      renderGrafica();
          