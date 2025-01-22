const input = document.getElementById('input1')
const resultado = document.getElementById('result')
const seleccion = document.getElementById('divisas')
let options = document.querySelectorAll('option')
let valorElegido = 0;
let opcionElegida = 'dolar';


options.forEach((option, i)=> {
  option.id = option.value;
})

input.addEventListener('change', () => actualizarElegido())

seleccion.addEventListener('change', () => actualizarElegido())


function actualizarElegido(){
  opcionElegida = seleccion.value;
  valorElegido = Number(input.value);
  convertirMoneda(valorElegido, opcionElegida)
}

function convertirMoneda(valor, divisa){
  
  resultado.innerText = `${valor}, ${divisa}`
}




async function getMonedas() {
  const endpoint = "https://mindicador.cl/api/";
  const res = await fetch(endpoint);
  const monedas = await res.json();
  console.log(Object.values(monedas) //convertimos objeto en array
  .filter(elemento=> typeof elemento === 'object') // filtramos por tipo objeto
  .filter(elemento=>elemento.unidad_medida == 'Pesos')) // filtramos por unidad_medida
}

getMonedas()

//   function prepararConfiguracionParaLaGrafica(monedas) {
//     // Creamos las variables necesarias para el objeto de configuración
//     const tipoDeGrafica = "line";
//     const nombresDeLasMonedas = monedas;
//     const titulo = "Monedas";
//     const colorDeLinea = "red";
//     const valores = monedas;

//     // Creamos el objeto de configuracion
//     const configGrafica = {
//     type: tipoDeGrafica,
//     data: {
//     labels: nombresDeLasMonedas,
//     datasets: [
//       {
//         label: titulo,
//         data: valores,
//         backgroundColor: colorDeLinea,
//         fill: false,
//       },
//     ],
//     },
//     options: {
//     responsive: true,
//     title: {
//       display: true,
//       text: titulo,
//     },
//     },
//     };

//     return configGrafica;
//   }

//   async function renderGrafica() {
//     const monedas = await getMonedas();
//     const config = prepararConfiguracionParaLaGrafica(monedas);
//     // Aquí se debería insertar la llamada a la función que genera y muestra la gráfica
//   }

//   renderGrafica();

