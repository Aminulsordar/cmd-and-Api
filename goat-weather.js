const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "weather",
    version: "5.0",
    author: "Aminulsordar",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get live weather info"
    },
    longDescription: {
      en: "Check current weather info with decorated text + dynamic weather card image"
    },
    category: "utility",
    guide: {
      en: "{pn} <city name>"
    }
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) {
      return message.reply("🌤️ Please provide a city name!\n👉 Example: weather Rajshahi");
    }

    const city = args.join(" ");
    const apiUrl = `https://my-api-show.vercel.app/api/weather?city=${encodeURIComponent(city)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.success || !data.weather) {
        return message.reply(`❌ Could not fetch weather for "${city}".`);
      }

      const w = data.weather;

      // 📝 Decorated text message
      const textMsg =
`━━━━━━━━━━━━━━━━━━━
🌎 WEATHER REPORT
━━━━━━━━━━━━━━━━━━━

🏙️ City: ${w.city}
🌡️ Temperature: ${w.temperature_C}°C | ${w.temperature_F}°F
🤔 Feels Like: ${w.feels_like_C}°C | ${w.feels_like_F}°F
☁️ Condition: ${w.weather_desc}
💧 Humidity: ${w.humidity}%
💨 Wind: ${w.wind_speed_kmph} km/h (${w.wind_dir})

━━━━━━━━━━━━━━━━━━━
⏰ Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━`;

      // 🖼️ Create Canvas for image
      const width = 800;
      const height = 500;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // 🌄 Dynamic Background based on weather_desc
      let bgColorTop = "#4facfe";
      let bgColorBottom = "#00f2fe";
      let weatherIcon = "☁️";

      const desc = w.weather_desc.toLowerCase();
      if (desc.includes("clear")) {
        bgColorTop = "#56CCF2";
        bgColorBottom = "#2F80ED";
        weatherIcon = "☀️";
      } else if (desc.includes("rain") || desc.includes("shower")) {
        bgColorTop = "#485563";
        bgColorBottom = "#29323c";
        weatherIcon = "🌧️";
      } else if (desc.includes("cloud")) {
        bgColorTop = "#bdc3c7";
        bgColorBottom = "#2c3e50";
        weatherIcon = "☁️";
      } else if (desc.includes("night") || desc.includes("dark")) {
        bgColorTop = "#2c3e50";
        bgColorBottom = "#000000";
        weatherIcon = "🌙";
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, bgColorTop);
      gradient.addColorStop(1, bgColorBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 🏙️ City name
      ctx.font = "bold 40px Sans";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`${weatherIcon} Weather in ${w.city}`, width / 2, 70);

      // 🌡️ Temperature
      ctx.font = "bold 80px Sans";
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText(`${w.temperature_C}°C`, width / 2, 180);

      // Condition
      ctx.font = "bold 30px Sans";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${weatherIcon} ${w.weather_desc}`, width / 2, 230);

      // Feels Like
      ctx.font = "28px Sans";
      ctx.fillStyle = "#f1f1f1";
      ctx.fillText(`🤔 Feels Like: ${w.feels_like_C}°C`, width / 2, 280);

      // Humidity
      ctx.font = "28px Sans";
      ctx.fillText(`💧 Humidity: ${w.humidity}%`, width / 2, 330);

      // Wind
      ctx.font = "28px Sans";
      ctx.fillText(`💨 Wind: ${w.wind_speed_kmph} km/h (${w.wind_dir})`, width / 2, 380);

      // Time
      ctx.font = "22px Sans";
      ctx.fillStyle = "#ddd";
      ctx.fillText(`⏰ Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}`, width / 2, 440);

      // Save image to temporary file
      const fileName = `weather_${Date.now()}.png`;
      const filePath = path.join(__dirname, fileName);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      // 📤 Send both text + image
      message.reply({
        body: textMsg,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (e) {
      message.reply("⚠️ Error fetching weather data. Please try again later.");
      console.error(e);
    }
  }
};
