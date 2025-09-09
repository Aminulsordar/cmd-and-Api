 //=============================//
//       📊 Monitor CMD        //
//       Author: Aminulsordar   //
//       Fixed by: GoatStor    //
//       Version: 1.3          //
//=============================//

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "monitor",
    aliases: ["m"],
    version: "1.3",
    author: "Aminulsordar",
    role: 0,
    shortDescription: { en: "Displays the bot's uptime and ping." },
    longDescription: { en: "Check bot uptime and response ping with a random Pinterest image." },
    category: "owner",
    guide: { en: "{p}monitor" }
  },

  onStart: async function ({ api, event }) {
    try {
      const startTime = Date.now();

      // 🔹 Random keyword list
      const searchList = ["cat", "dog", "anime", "nature", "luffy", "itachi"];
      const query = searchList[Math.floor(Math.random() * searchList.length)];

      // 🔹 Pinterest API
      const apiUrl = `https://my-api-show.vercel.app/api/pinterest?query=${encodeURIComponent(query)}&count=10`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.images || res.data.images.length === 0) {
        return api.sendMessage("❌ | No image found from API.", event.threadID, event.messageID);
      }

      // Pick random image
      const images = res.data.images;
      const randomImg = images[Math.floor(Math.random() * images.length)];

      // Download image
      const imgData = await axios.get(randomImg, { responseType: "arraybuffer" });

      // Ensure cache folder exists
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);

      const imgFile = path.join(cachePath, "monitor_image.jpg");
      await fs.outputFile(imgFile, imgData.data);

      // Calculate uptime
      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / 3600) % 24);
      const days = Math.floor(uptime / 86400);

      let uptimeMsg = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (days === 0) uptimeMsg = `${hours}h ${minutes}m ${seconds}s`;
      if (hours === 0 && days === 0) uptimeMsg = `${minutes}m ${seconds}s`;
      if (minutes === 0 && hours === 0 && days === 0) uptimeMsg = `${seconds}s`;

      // Calculate ping
      const ping = Date.now() - startTime;

      // Final message
      const message =
        `✨ Greetings!\n` +
        `⏳ Uptime: ${uptimeMsg}\n` +
        `📡 Ping: ${ping}ms\n` +
        `🖼️ Query: ${query}`;

      // Send message
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imgFile)
      }, event.threadID, event.messageID);

      // Delete cache image after sending
      await fs.unlink(imgFile);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | An unexpected error occurred while running monitor.", event.threadID, event.messageID);
    }
  }
};
