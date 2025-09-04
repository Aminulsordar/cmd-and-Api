const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  aliases: ["pin"],
  version: "1.0.0",
  author: "Aminulsordar",
  role: 0,
  countDown: 15,
  shortDescription: "Search Pinterest images",
  longDescription: "Search Pinterest for images and return decorated results",
  category: "media",
  guide: "{pn} <search query> - <number of images>\nExample: {pn} cat - 5"
};

module.exports.languages = {
  en: {
    wrongFormat: "❌ | Wrong format!\nUse: {p}pin <search> - <count>\nExample: {p}pin cat - 5",
    noImages: "😿 | No images found for → \"{query}\".\n🔎 Try another keyword!",
    success: "💎 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗦𝗘𝗔𝗥𝗖𝗛 💎\n\n🔍 Search: {query}\n📸 Images Sent: {sent}/{total}\n⚡ Requested By: {user}\n\n✨ Enjoy your results!",
    error: "⚠️ | Error Occurred!\n\n🔧 Details: {error}"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  try {
    const input = args.join(" ");
    if (!input.includes("-")) return api.sendMessage(getText("wrongFormat"), event.threadID, event.messageID);

    const query = input.split("-")[0].trim();
    let count = parseInt(input.split("-")[1].trim()) || 6;
    if (count > 20) count = 20;

    const apiUrl = `https://my-api-show.vercel.app/api/pinterest?query=${encodeURIComponent(query)}&count=${count}`;
    const res = await axios.get(apiUrl);

    const data = res.data.images || [];
    if (!Array.isArray(data) || data.length === 0) return api.sendMessage(getText("noImages", { query }), event.threadID, event.messageID);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgData = [];
    for (let i = 0; i < Math.min(count, data.length); i++) {
      try {
        const imgResp = await axios.get(data[i], { responseType: "arraybuffer" });
        const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
        await fs.promises.writeFile(imgPath, imgResp.data);
        imgData.push(fs.createReadStream(imgPath));
      } catch (err) {
        console.error(`Failed to download image ${i + 1}:`, err.message);
      }
    }

    const message = getText("success", {
      query,
      sent: imgData.length,
      total: count,
      user: event.senderID
    });

    await api.sendMessage({ body: message, attachment: imgData }, event.threadID, event.messageID);

    if (fs.existsSync(cacheDir)) await fs.promises.rm(cacheDir, { recursive: true, force: true });

  } catch (error) {
    console.error("Pinterest Command Error:", error);
    return api.sendMessage(getText("error", { error: error.message }), event.threadID, event.messageID);
  }
};
