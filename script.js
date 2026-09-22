// ===============================
// GET HTML ELEMENTS
// ===============================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.querySelector(".theme-toggle");
let cityTimeZone = "";
// ===============================
// SEARCH BUTTON
// ===============================

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (city === "") {
    alert("Please enter a city name");
    return;
  }

  getWeather(city);
});

// ===============================
// PRESS ENTER TO SEARCH
// ===============================

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();

    if (city === "") {
      alert("Please enter a city name");
      return;
    }

    getWeather(city);
  }
});

// ===============================
// GET WEATHER
// ===============================

async function getWeather(city) {
  try {
    // -------------------------------
    // STEP 1: GET CITY COORDINATES
    // -------------------------------

    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
    );

    if (!locationResponse.ok) {
      throw new Error("Unable to find city");
    }

    const locationData = await locationResponse.json();

    // Check if city exists

    if (!locationData.results) {
      alert("City not found");

      return;
    }

    const location = locationData.results[0];

    const latitude = location.latitude;
    const longitude = location.longitude;

    // -------------------------------
    // STEP 2: GET WEATHER DATA
    // -------------------------------

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,visibility,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto`,
    );

    if (!weatherResponse.ok) {
      throw new Error("Unable to get weather data");
    }

    const weatherData = await weatherResponse.json();

    // -------------------------------
    // STEP 3: DISPLAY DATA
    // -------------------------------

    displayWeather(location, weatherData);

    displayForecast(weatherData);
  } catch (error) {
    console.log(error);

    alert("Something went wrong. Please try again.");
  }
}

// ===============================
// DISPLAY CURRENT WEATHER
// ===============================

function displayWeather(location, data) {
  const current = data.current;
  cityTimeZone = data.timezone;
  // -------------------------------
  // CITY
  // -------------------------------

  document.getElementById("city").textContent =
    location.name + ", " + location.country_code;

  // -------------------------------
  // TEMPERATURE
  // -------------------------------

  document.getElementById("temperature").textContent = Math.round(
    current.temperature_2m,
  ) + "°C";

  // -------------------------------
  // FEELS LIKE
  // -------------------------------

  document.getElementById("feelsLike").textContent = Math.round(
    current.apparent_temperature,
  );

  // -------------------------------
  // HUMIDITY
  // -------------------------------

  document.getElementById("humidity").textContent =
    current.relative_humidity_2m + "%";

  // -------------------------------
  // WIND SPEED
  // -------------------------------

  document.getElementById("wind").textContent =
    Math.round(current.wind_speed_10m) + " km/h";

  // -------------------------------
  // PRESSURE
  // -------------------------------

  document.getElementById("pressure").textContent =
    Math.round(current.pressure_msl) + " hPa";

  // -------------------------------
  // VISIBILITY
  // -------------------------------

  document.getElementById("visibility").textContent =
    Math.round(current.visibility / 1000) + " km";

  // -------------------------------
  // MINIMUM TEMPERATURE
  // -------------------------------

  document.getElementById("minTemp").textContent =
    Math.round(data.daily.temperature_2m_min[0]) + "°C";

  // -------------------------------
  // MAXIMUM TEMPERATURE
  // -------------------------------

  document.getElementById("maxTemp").textContent =
    Math.round(data.daily.temperature_2m_max[0]) + "°C";

  // -------------------------------
  // WEATHER CONDITION
  // -------------------------------

  const condition = getWeatherCondition(current.weather_code);

  document.getElementById("description").textContent = condition.text;

  document.getElementById("weatherIcon").textContent = condition.icon;

  updateClock();
}

function updateClock() {
  const now = new Date();
  const dateText = now.toLocaleString("en-US", {
    timeZone: cityTimeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  document.getElementById("date").textContent = dateText;
}
setInterval(updateClock, 1000);

// ===============================
// WEATHER CODE FUNCTION
// ===============================

function getWeatherCondition(code) {
  // Clear sky

  if (code === 0) {
    return {
      text: "Clear Sky",
      icon: "☀️",
    };
  }

  // Mainly clear / partly cloudy

  if (code === 1 || code === 2) {
    return {
      text: "Partly Cloudy",
      icon: "🌤️",
    };
  }

  // Cloudy

  if (code === 3) {
    return {
      text: "Cloudy",
      icon: "☁️",
    };
  }

  // Fog

  if (code === 45 || code === 48) {
    return {
      text: "Foggy",
      icon: "🌫️",
    };
  }

  // Drizzle

  if (code >= 51 && code <= 57) {
    return {
      text: "Drizzle",
      icon: "🌦️",
    };
  }

  // Rain

  if (code >= 61 && code <= 67) {
    return {
      text: "Rain",
      icon: "🌧️",
    };
  }

  // Snow

  if (code >= 71 && code <= 77) {
    return {
      text: "Snow",
      icon: "❄️",
    };
  }

  // Rain showers

  if (code >= 80 && code <= 82) {
    return {
      text: "Rain Showers",
      icon: "🌦️",
    };
  }

  // Snow showers

  if (code === 85 || code === 86) {
    return {
      text: "Snow Showers",
      icon: "🌨️",
    };
  }

  // Thunderstorm

  if (code >= 95) {
    return {
      text: "Thunderstorm",
      icon: "⛈️",
    };
  }

  // Default

  return {
    text: "Unknown",
    icon: "🌤️",
  };
}

// ===============================
// DISPLAY 5 DAY FORECAST
// ===============================

function displayForecast(data) {
  const cards = document.querySelectorAll(".forecast-card");

  for (let i = 0; i < 5; i++) {
    const card = cards[i];

    // -------------------------------
    // DATE
    // -------------------------------

    const date = new Date(data.daily.time[i]);

    const dateText = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    card.querySelector("h3").textContent = dateText;

    // -------------------------------
    // WEATHER CONDITION
    // -------------------------------

    const condition = getWeatherCondition(data.daily.weather_code[i]);

    card.querySelector(".forecast-icon").textContent = condition.icon;

    card.querySelector("p").textContent = condition.text;

    // -------------------------------
    // MINIMUM TEMPERATURE
    // -------------------------------

    const min = Math.round(data.daily.temperature_2m_min[i]);

    // -------------------------------
    // MAXIMUM TEMPERATURE
    // -------------------------------

    const max = Math.round(data.daily.temperature_2m_max[i]);

    card.querySelector(".min").textContent = min + "°C";

    card.querySelector(".max").textContent = max + "°C";
  }
}

// ===============================
// DARK MODE
// ===============================

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  // Check whether dark mode is active

  const darkMode = document.body.classList.contains("dark");

  // Save preference

  if (darkMode) {
    localStorage.setItem("darkMode", "true");
  } else {
    localStorage.setItem("darkMode", "false");
  }
});

// ===============================
// LOAD DARK MODE PREFERENCE
// ===============================

const savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
  document.body.classList.add("dark");
}

// ===============================
// LOAD DEFAULT CITY
// ===============================

getWeather("New Delhi");
