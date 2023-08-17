import React, { useEffect, useState } from 'react';
import './App.css';
import { Chart } from 'chart.js/auto';
import logo from './assets/logo_sin_fondo.png';

const idZona = new URLSearchParams(window.location.search).get('id_zona');

function App() {
  const [parsedDataPlot, setParsedDataPlot] = useState([]);
  const [Zone_data, setZone_data] = useState(null);
  const [selectedNum, setSelectedNum] = useState(1); // Cambio aquí
  const [selectedVariable, setSelectedVariable] = useState("Humedad de la Tierra"); // Cambio aquí
  const chartRef = React.createRef();

  useEffect(() => {

    // Realizar la solicitud HTTP a la API para obtener los datos del área de cultivo
    fetch(`https://cloudvitals.azurewebsites.net/api/zone?id_zona=${idZona}`)
      .then((response) => response.json())
      .then((Zone_data) => {
        setZone_data(Zone_data);
      })
      .catch((error) => {
        console.error('Error al obtener los datos del área de cultivo:', error);
      });

    console.log("\nHEEEY\t", {selectedVariable})  
    // Realizar la solicitud HTTP a la API para obtener los datos de las mediciones
    fetch(`https://cloudvitals.azurewebsites.net/api/registry?id_zona=${idZona}&num=${selectedNum}&variable=${selectedVariable}`)
      .then((response) => response.json())
      .then((medicionesData) => {
        setParsedDataPlot(medicionesData);
      })
      .catch((error) => {
        console.error('Error al obtener los datos de las mediciones:', error);
      });

      // Establecer el intervalo para recargar la página cada 10 minutos (600,000 milisegundos)
      const reloadInterval = setInterval(() => {
        window.location.reload();
      }, 600000);

      // Limpiar el intervalo al desmontar el componente para evitar fugas de memoria
      return () => {
        clearInterval(reloadInterval);
      };

  }, [selectedNum, selectedVariable]); // Cambio aquí

  useEffect(() => {
    // Verificar si ya existe un gráfico con el ID 'myChart' y destruirlo si es necesario
    const existingChart = Chart.getChart('myChart');
    if (existingChart) {
      existingChart.destroy();
    }

    // Crear el gráfico con los datos obtenidos
    if (parsedDataPlot.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...Array(parsedDataPlot.length).keys()],
          datasets: [
            {
              label: selectedVariable,
              data: parsedDataPlot,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'linear', // Registrar la escala 'linear'
              position: 'bottom',
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      return () => {
        chart.destroy();
      };
    }
  }, [parsedDataPlot, chartRef, selectedVariable]);

  return (
    <div className="LiveView">
    <img src={logo} alt="Logo" className="logo" />
    <h2>Bienvenido Al Reporte En Vivo</h2>
    {Zone_data && (
      <div>
        <div className="data-container">
          <h3>Datos:</h3>
          <p><span>Tipo de Cultivo:</span> {Zone_data.tipoCultivo}</p>
          <p><span>Tipo de Planta:</span> {Zone_data.tipoPlanta}</p>
          <p><span>Tipo de Fruto:</span> {Zone_data.tipoFruto}</p>
          <p><span>Extensión Territorial:</span> {Zone_data.extensionTerritorial} metros cuadrados</p>
          <p><span>Zona de Cultivo:</span> {Zone_data.zonaCultivo}</p>
        </div>

        <div className="water-container">
          <h4>Cantidad de agua para el día de hoy:</h4>
          <p>{Zone_data.cantidadAgua} Litros</p>
        </div>
      </div>
    )}
      
      <div className="dropdown-container">
        <label htmlFor="num-select">Selecciona la cantidad de periodos:  </label>
        <select
          id="num-select"
          value={selectedNum} // Cambio aquí
          onChange={(e) => {
            setSelectedNum(parseInt(e.target.value));
          }}
        >
          {[...Array(10).keys()].map((num) => (
            <option key={num + 1} value={num + 1}>
              {num + 1}
            </option>
          ))}
        </select>
      </div>
    <br></br>
    <div className="dropdown-container">
      <label htmlFor="var-select">Selecciona la variable a visualizar:  </label>
      <select
        id="var-select"
        value={selectedVariable}
        onChange={(e) => {
          setSelectedVariable(e.target.value);
          console.log(selectedVariable);
        }}
      >
        <option value="Humedad de la Tierra">Humedad de la Tierra</option>
        <option value="Precipitacion de la Zona">Precipitación de la Zona</option>
        <option value="Temperatura (Celsius)">Temperatura (Celsius)</option>
      </select>
    </div>

      <div className="chart-container">
        <canvas ref={chartRef} id="myChart" width="400" height="200"></canvas>
      </div>
    </div>
  );
}

export default App;
