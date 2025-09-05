const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "poli",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Aminulsordar",
  description: {
    en: "Generate an AI image from text using Pollinations AI",
    vi: "Tạo ảnh AI từ văn bản bằng Pollinations AI"
  },
  commandCategory: "image",
  usages: {
    en: "[prompt]",
    vi: "[nội dung]"
  },
  cooldowns: 5
};

module.exports.languages = {
  en: {
    noPrompt: "❌ Please provide a prompt to generate an image.\n\n📌 Example:\npoli beautiful galaxy",
    generating: "🌸 Pollination AI Image Generated 🌸\n\n📝 Prompt: %1",
    error: "⚠️ Could not generate the image. Please try again later."
  },
  vi: {
    noPrompt: "❌ Vui lòng nhập nội dung để tạo ảnh.\n\n📌 Ví dụ:\npoli beautiful galaxy",
    generating: "🌸 Ảnh AI từ Pollination đã được tạo 🌸\n\n📝 Nội dung: %1",
    error: "⚠️ Không thể tạo ảnh. Vui lòng thử lại sau."
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(getText("noPrompt"), threadID, messageID);
  }

  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `poli_${Date.now()}.png`);

  try {
    fs.ensureDirSync(cacheDir);

    // Fetch image from your custom API
    const response = await axios.get(
      `https://my-api-show.vercel.app/api/poli?prompt=${encodeURIComponent(query)}`,
      { responseType: "arraybuffer" }
    );

    fs.writeFileSync(filePath, Buffer.from(response.data));

    // Send AI generated image
    api.sendMessage(
      {
        body: getText("generating", query),
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );
  } catch (error) {
    console.error("❌ Error generating image:", error.message);
    api.sendMessage(getText("error"), threadID, messageID);
  }
};
