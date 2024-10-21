import React, { useEffect, useState } from 'react';

function App() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/weatherforecast')
      .then(response => response.json())
      .then(data => setWeather(data));
  }, []);

  return (
    <div className="App">
      <h1>Weather App</h1>
      {weather ? (
        <div>
          <p>Temperature: {weather.temperature}°F</p>
          <p>Condition: {weather.condition}</p>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}

export default App;
