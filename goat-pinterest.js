const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0.2",
    author: "Aminulsordar",
    role: 0,
    countDown: 15,
    longDescription: {
      en: "Search Pinterest for images and return stylish decorated results.",
    },
    category: "media",
    guide: {
      en: "{pn} <search query> - <number of images>\nExample: {pn} cat - 5",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ");
      if (!input.includes("-")) {
        return api.sendMessage(
          `❌ | Wrong format!\n\n✨ Use like this:\n» {p}pin <search> - <count>\n\nExample:\n» {p}pin cat - 5`,
          event.threadID,
          event.messageID
        );
      }

      const query = input.split("-")[0].trim();
      let count = parseInt(input.split("-")[1].trim()) || 6;
      if (count > 20) count = 20;

      const apiUrl = `https://my-api-show.vercel.app/api/pinterest?query=${encodeURIComponent(query)}&count=${count}`;
      const res = await axios.get(apiUrl);

      const data = res.data.images || [];
      if (!Array.isArray(data) || data.length === 0) {
        return api.sendMessage(
          `😿 | No images found for → "${query}".\n🔎 Try another keyword!`,
          event.threadID,
          event.messageID
        );
      }

      // Create cache folder
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgData = [];
      for (let i = 0; i < Math.min(count, data.length); i++) {
        try {
          const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
          await fs.promises.writeFile(imgPath, imgResponse.data);
          imgData.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Failed to download image ${i + 1}:`, err.message);
        }
      }

      const bodyMessage =
        `💎 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗦𝗘𝗔𝗥𝗖𝗛 💎\n\n` +
        `🔍 Search: ${query}\n` +
        `📸 Images Sent: ${imgData.length}/${count}\n` +
        `⚡ Requested By: ${event.senderID}\n\n` +
        `✨ Enjoy your results!`;

      await api.sendMessage(
        {
          body: bodyMessage,
          attachment: imgData,
        },
        event.threadID,
        event.messageID
      );

      // Clean up cache
      if (fs.existsSync(cacheDir)) {
        await fs.promises.rm(cacheDir, { recursive: true, force: true });
      }

    } catch (error) {
      console.error("Pinterest Command Error:", error);
      return api.sendMessage(
        `⚠️ | Error Occurred!\n\n🔧 Details: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
