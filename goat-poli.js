const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "poli",
    aliases: ["pinterest"],
    version: "1.0.0",
    author: "Aminulsordar",
    countDown: 5,
    role: 0,
    shortDescription: "Generate an image from text using Pollinations AI",
    longDescription: "Generate an AI image from a text prompt using Pollinations AI (via custom API).",
    category: "image",
    guide: {
      en: "{p}poli <prompt>\n\nExample:\n{p}poli beautiful galaxy"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "❌ Please provide a prompt to generate an image.\n\n📌 Example:\n`poli beautiful galaxy`",
        threadID,
        messageID
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `poli_${Date.now()}.png`);

    try {
      fs.ensureDirSync(cacheDir);

      // Download image from your custom API
      const response = await axios.get(
        `https://my-api-show.vercel.app/api/poli?prompt=${encodeURIComponent(query)}`,
        { responseType: "arraybuffer" }
      );

      fs.writeFileSync(filePath, Buffer.from(response.data));

      // Send image
      api.sendMessage(
        {
          body: `🌸 𝗣𝗼𝗹𝗹𝗶𝗻𝗮𝘁𝗶𝗼𝗻 𝗔𝗜 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 🌸\n\n📝 Prompt: ${query}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    } catch (error) {
      console.error("❌ Error generating image:", error.message);
      api.sendMessage(
        "⚠️ Could not generate the image. Please try again later.",
        threadID,
        messageID
      );
    }
  }
};
