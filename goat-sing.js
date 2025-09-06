const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "song"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Sing to make chai",
    longDescription: "Sing janne kyun tanveer evan",
    category: "MUSIC",
    guide: "/music dj lappa lappa",
  },

  onStart: async function ({ api, event, args }) {
    // Fallback for non-TTY environments
    if (!process.stderr.clearLine) process.stderr.clearLine = () => {};
    if (!process.stderr.cursorTo) process.stderr.cursorTo = () => {};

    let songName = "";
    let type = "audio";

    if (args.length > 1 && ["audio", "video"].includes(args[args.length - 1].toLowerCase())) {
      type = args.pop().toLowerCase();
      songName = args.join(" ");
    } else {
      songName = args.join(" ");
    }

    if (!songName) {
      return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);
    }

    const processingMessage = await api.sendMessage("🎵 Please wait...", event.threadID, null, event.messageID);

    try {
      // Search YouTube
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;

      // Construct download API URL
      const apiKey = "itzaryan";
      const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Fetch direct download URL
      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch song. Status code: ${response.status}`);
      }

      // Determine file extension
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const filename = `${topResult.title.replace(/[^a-zA-Z0-9\s]/g, "")}.${fileExt}`;
      const downloadPath = path.join(__dirname, filename);

      // Save file locally
      const songBuffer = await response.buffer();
      fs.writeFileSync(downloadPath, songBuffer);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 𝗠𝗨𝗦𝗜𝗖\n━━━━━━━━━━━━━━━\n\n${topResult.title}`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(`❌ Failed to download song: ${error.message}`, event.threadID, event.messageID);
    }
  },
};
