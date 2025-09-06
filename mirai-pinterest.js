const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pin",
    version: "3.1",
    credits: "Aminulsordar",
    cooldowns: 15,
    hasPermission: 0,
    usePrefix: true,
    prefix: true,
    description: "Pinterest Image Search",
    commandCategory: "📥 Downloader",
    guide: {
      en: "-pin [query] - [limit]\n\nExample:\n-pin cat - 5",
      bn: "-pin [query] - [limit]\n\nউদাহরণ:\n-pin cat - 5",
    },
  },

  run: async function ({ api, event, args }) {
    const queryAndLength = args.join(" ").split("-");
    const q = queryAndLength[0]?.trim();
    const count = queryAndLength[1] ? parseInt(queryAndLength[1].trim()) : 5; // default 5

    if (!q) {
      return api.sendMessage(
        "❌ | Wrong format!\n\n✅ Example:\n-pin cat - 5",
        event.threadID,
        event.messageID
      );
    }

    try {
      // ⏳ Sending waiting message
      const waitMsg = await api.sendMessage(
        "🔍 | Searching Pinterest...\n⏳ Please wait while I fetch your images...",
        event.threadID
      );

      // 📡 Call API
      const response = await axios.get(
        `https://my-api-show.vercel.app/api/pinterest?query=${encodeURIComponent(
          q
        )}&count=${count}`
      );

      const data = response.data.images;

      if (!data || data.length === 0) {
        return api.sendMessage(
          "⚠️ | No images found for your query!",
          event.threadID,
          event.messageID
        );
      }

      // 🗂️ Ensure folder exists (create if not)
      const assetsDir = path.join(__dirname, "dvassests");
      await fs.ensureDir(assetsDir); // create if not exists
      await fs.emptyDir(assetsDir);  // clear old files

      const attachments = [];
      const totalImagesCount = Math.min(data.length, count);

      for (let i = 0; i < totalImagesCount; i++) {
        const imgUrl = data[i];
        const imgResponse = await axios.get(imgUrl, {
          responseType: "arraybuffer",
        });
        const imgPath = path.join(assetsDir, `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      // ❌ Remove "Please wait..." message
      await api.unsendMessage(waitMsg.messageID);

      // 🎉 Send final decorated result
      return api.sendMessage(
        {
          body: `✨───『 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗙𝗶𝗻𝗱𝗲𝗿 』───✨\n\n` +
                `🔎 Query: ${q}\n📸 Total Images: ${totalImagesCount}\n\n` +
                `🌸 Powered by AMINUL-SORDAR 🌸`,
          attachment: attachments,
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        `⚠️ | Oops! Something went wrong.\n\n🔧 Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
