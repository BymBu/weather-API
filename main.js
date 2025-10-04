

async function updateUI() {
  const location = await getUserLocation();
  const weather = await getWeather(location.latitude, location.longitude);

  console.log("📍 Местоположение:", location);
  console.log("🌤 Погода:", weather);

  time = new Date(weather.current.time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // дата
  document.querySelector(".weather__today-text").textContent = time;

  // текущая температура
  document.querySelector(".tem_number").textContent =
    Math.floor(weather.current.temperature_2m) + "°";

  // погодные условия
  const conditionsText = getWeatherText(weather.current.weather_code);
  document.querySelector(".weather__conditions").textContent = conditionsText;

  // подробности
  document.querySelector(
    ".Precipitation"
  ).textContent = `${weather.current.precipitation} mm`;
  document.querySelector(
    ".Humidity"
  ).textContent = `${weather.current.relative_humidity_2m} %`;
  document.querySelector(".Wind").textContent = `${Math.floor(
    weather.current.wind_speed_10m
  )} m/s`;

  // 4-часовой прогноз
  const forecastTimes = getNextHours(weather);
  const blocks = document.querySelectorAll(".day__item");

  const now = new Date(weather.current.time);
  const currentHourStr = now.toISOString().slice(0, 14) + "00";
  const currentIndex = weather.hourly.time.indexOf(currentHourStr);
  const nextTemps = weather.hourly.temperature_2m.slice(
    currentIndex + 1,
    currentIndex + 5
  );

  blocks.forEach((block, i) => {
    if (i < forecastTimes.length) {
      block.querySelector(".day-time").textContent = forecastTimes[i];
    }

    if (i < nextTemps.length) {
      const temp = Math.round(nextTemps[i]); 
      block.querySelector(".day-tem").textContent = `${temp}°`;
    }
  });
}

// вызов кода
window.addEventListener("load", async () => {
  await updateUI();
});

// вспомогательные функции
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация не поддерживается браузером"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m&timezone=auto`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Не удалось получить погоду:", error);
    throw error;
  }
}

function getWeatherText(weatherCode) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return conditions[weatherCode] || "Unknown";
}

function getNextHours(weather, count = 4) {
  currentDate = new Date(weather.current.time);

  let currentHour = currentDate.getHours();

  const nextHours = [];

  for (let i = 1; i <= count; i++) {
    const hour = (currentHour + i) % 24;
    nextHours.push(`${hour}:00`);
  }

  return nextHours;
}