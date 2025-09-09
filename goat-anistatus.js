//==============================================//
//            🐼 Anime Status Command            //
//==============================================//
//   🔹 Author        : Aminul Sordar (GoatStor) 
//   🔹 Module Name   : anistatus.js            
//   🔹 Description   : Sends random anime status
//   🔹 Category      : Media                   
//   🔹 Version       : 1.0                     
//==============================================//

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {

  //================ CONFIG ===================//
  threadStates: {},

  config: {
    name: 'anistatus',
    aliases: ['as'],
    version: '1.0',
    author: 'Aminul Sordar',
    countDown: 5,
    role: 0,
    shortDescription: '🎬 Get random anime status video',
    longDescription: 'Fetches random anime TikTok status and sends it as video.',
    category: '🌸 Media',
    guide: {
      en: '{p}{n} → Sends anime status video',
    }
  },

  //============ CAPTION LIST ============//
  captions: [
    "✨ Anime isn’t just a story… It’s an emotion 💕",
    "🌸 Lost in Anime, found in peace 💫",
    "🎥 Random Anime Status for you ⚡ Enjoy & Share",
    "💕 Life hits different when it’s in anime vibes ✨",
    "🔮 Anime + Music = Perfect Mood 🎶🌸"
  ],

  //============== START FUNCTION =============//
  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    // Initialize thread state
    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = {};
    }

    try {
      // Reaction for processing
      api.setMessageReaction("🕐", event.messageID, (err) => {}, true);  

      // Fetch anime status TikTok link
      const apiUrl = "https://ani-status.vercel.app/Kshitiz";  
      const response = await axios.get(apiUrl);

      if (response.data.url) {
        const tikTokUrl = response.data.url;
        console.log(`🔗 TikTok Video URL: ${tikTokUrl}`);

        // Convert TikTok link to downloadable video
        const videoApi = `https://tikdl-video.vercel.app/tiktok?url=${encodeURIComponent(tikTokUrl)}`;
        const videoRes = await axios.get(videoApi);

        if (videoRes.data.videoUrl) {
          const videoUrl = videoRes.data.videoUrl;
          console.log(`⬇️ Downloadable Video URL: ${videoUrl}`);

          // Ensure cache folder exists
          const cacheDir = path.join(__dirname, "cache");
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
            console.log("📂 Cache folder created automatically!");
          }

          // Cache path
          const cacheFilePath = path.join(cacheDir, `anistatus_${Date.now()}.mp4`);

          // Download video
          await this.downloadVideo(videoUrl, cacheFilePath);

          if (fs.existsSync(cacheFilePath)) {
            // Pick random caption
            const randomCaption = this.captions[Math.floor(Math.random() * this.captions.length)];

            await api.sendMessage({
              body: `${randomCaption}\n\n🎬 Powered by Aminul Sordar 🌸`,
              attachment: fs.createReadStream(cacheFilePath),
            }, threadID, event.messageID);

            // Remove cache
            fs.unlinkSync(cacheFilePath);
          } else {
            api.sendMessage("❌ | Failed to download video.", threadID);
          }
        } else {
          api.sendMessage("⚠️ | Could not fetch video URL.", threadID);
        }
      } else {
        api.sendMessage("⚠️ | API did not return a valid URL.", threadID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("🚫 | An error occurred while processing the Anime Status command.", threadID);
    }
  },

  //============ DOWNLOAD FUNCTION ============//
  downloadVideo: async function (url, cacheFilePath) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer"
      });

      fs.writeFileSync(cacheFilePath, Buffer.from(response.data, "utf-8"));
    } catch (err) {
      console.error("❌ Download error:", err);
    }
  },
};

//==============================================//
//         🌸 End of Anime Status Module 🌸       //
//==============================================//
