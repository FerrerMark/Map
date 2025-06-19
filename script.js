    const x = document.getElementById("show");
    const apiKey = "7834539a0d20cb8f1ee6faa0abbcce01"; 
    let map;

    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);

      } else {
        x.innerHTML = "❌ Geolocation is not supported by this browser.";
      }
    }

    function showPosition(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      x.innerHTML = `
        📍 <strong>Latitude:</strong> ${lat.toFixed(6)}<br>
        📍 <strong>Longitude:</strong> ${lon.toFixed(6)}
      `;

      updateMapAndWeather(lat, lon);
    }

    function showError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          x.innerHTML = "❌ User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          x.innerHTML = "⚠️ Location information is unavailable.";
          break;
        case error.TIMEOUT:
          x.innerHTML = "⏱️ The request timed out.";
          break;
        default:
          x.innerHTML = "❗ An unknown error occurred.";
      }
    }

    function updateMapAndWeather(lat, lon, cityName = "") {
      if (!map) {
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
      } else {
        map.setView([lat, lon], 13);
        map.eachLayer(layer => {
          if (layer instanceof L.Marker) map.removeLayer(layer);
        });
      }

      L.marker([lat, lon]).addTo(map)
        .bindPopup(cityName ? `📍 ${cityName}` : "📍 You are here!")
        .openPopup();

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      document.querySelector(".weather").innerHTML = "⏳ Loading weather...";

      fetch(weatherUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch weather");
          return res.json();
        })
        .then(data => {
          if (!data.main || !data.weather) {
            document.querySelector(".weather").innerHTML = "⚠️ Weather data not available.";
            return;
            
          }

          const temp = data.main.temp;
          const description = data.weather[0].description;
          const icon = data.weather[0].icon;
          const city = data.name;

          document.querySelector(".weather").innerHTML = `
            <h3>🌤️ Weather for ${city}</h3>
            <p><strong>Temperature:</strong> ${temp} °C</p>
            <p><strong>Description:</strong> ${description}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
          `;

          document.querySelector("#input").value = city;
        })
        .catch(error => {
          console.error("Weather error:", error);
          document.querySelector(".weather").innerHTML = "❌ Failed to load weather.";
        });
    }

    document.getElementById("search").addEventListener("click", () => {
      const city = document.getElementById("input").value.trim();
      if (city) {
        searchCity(city);
      }
    });

    function searchCity(city) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;

      fetch(geoUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch coordinates");
          return res.json();
        })
        .then(data => {
          if (!data.length) {
            x.innerHTML = `❌ City "${city}" not found.`;
            return;
          }

          const lat = data[0].lat;
          const lon = data[0].lon;
          x.innerHTML = `
            🔍 <strong>City:</strong> ${data[0].name}<br>
            📍 <strong>Latitude:</strong> ${lat.toFixed(6)}<br>
            📍 <strong>Longitude:</strong> ${lon.toFixed(6)}
          `;

          updateMapAndWeather(lat, lon, data[0].name);
        })
        .catch(err => {
          console.error("Search error:", err);
          x.innerHTML = "❌ Failed to search city.";
        });
    }