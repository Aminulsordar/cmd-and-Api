const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    version: "1.5",
    author: "Aminulsordar",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetch a random Shoti video.",
    },
    longDescription: {
      en: "Fetches a random short video from your custom API and sends it to the chat.",
    },
    category: "media",
    guide: {
      en: "Use this command to fetch and share a random short video.",
    },
  },

  onStart: async function ({ api, event }) {
    const videoDir = path.join(__dirname, "cache");
    const videoPath = path.join(videoDir, `shoti_${Date.now()}.mp4`);
    const apiUrl = "https://my-api-show.vercel.app/api/shoti";

    try {
      // Automatically create folder if it doesn't exist
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      // Send a "please wait" message with style
      const waitingMessage = `
⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...
🎬 Sending your 𝗦𝗵𝗼𝘁𝗶 𝘃𝗶𝗱𝗲𝗼 soon! ✨
`;
      const sentMsg = await api.sendMessage(waitingMessage, event.threadID, event.messageID);

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.success || !data.videoUrl) {
        return api.sendMessage(
          "❌ Failed to fetch Shoti video. The API returned an invalid response.",
          event.threadID,
          event.messageID
        );
      }

      const { videoUrl, title, username, nickname, region } = data;

      const videoRes = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const writer = fs.createWriteStream(videoPath);
      videoRes.data.pipe(writer);

      writer.on("finish", async () => {
        const caption = `
🎀 𝗦𝗵𝗼𝘁𝗶 𝗩𝗶𝗱𝗲𝗼 🎀
━━━━━━━━━━━━━━━━━
📝 𝗧𝗶𝘁𝗹𝗲: ${title || "No title"}
👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${username || "Unknown"}
💬 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${nickname || "N/A"}
🌏 𝗥𝗲𝗴𝗶𝗼𝗻: ${region || "Unknown"}
━━━━━━━━━━━━━━━━━
✨ Enjoy your short video! ✨
`;

        // Delete the waiting message first
        if (sentMsg && sentMsg.messageID) {
          api.unsendMessage(sentMsg.messageID);
        }

        // Send the video
        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(videoPath) },
          event.threadID,
          () => fs.unlinkSync(videoPath),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("❌ Error writing video file:", err);
        api.sendMessage("❌ Error saving the video file.", event.threadID, event.messageID);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      });

    } catch (err) {
      console.error("❌ Error:", err.message);
      api.sendMessage(
        "❌ An unexpected error occurred while fetching the Shoti video. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
