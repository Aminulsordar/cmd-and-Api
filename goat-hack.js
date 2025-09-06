//=========================//
//      🐐 Hack Command    //
//      Author: GoatStor  //
//      Version: 1.0.3    //
//=========================//

const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "hack",
    author: "aryan(add by AMINUL-SORDAR)",
    countDown: 5,
    role: 2,
    category: "fun",
    shortDescription: {
      en: "Generates a stylish 'hacking' image with the user's profile picture."
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);

      const words = text.split(" ");
      const lines = [];
      let line = "";

      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
          line += `${words.shift()} `;
        } else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }

      resolve(lines);
    });
  },

  onStart: async function ({ api, event }) {
    try {
      // ---------------------------
      // Ensure cache folder exists
      // ---------------------------
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const pathImg = cacheDir + "/background.png";
      const pathAvt = cacheDir + "/Avtmot.png";

      // ---------------------------
      // Get target ID & info
      // ---------------------------
      const id = Object.keys(event.mentions)[0] || event.senderID;
      const userInfo = await api.getUserInfo(id);
      const name = userInfo[id].name;

      // ---------------------------
      // Random hacking background
      // ---------------------------
      const backgrounds = [
        "https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ"
      ];
      const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // ---------------------------
      // Fetch user's avatar
      // ---------------------------
      const avatarBuffer = (await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt, Buffer.from(avatarBuffer, "utf-8"));

      // ---------------------------
      // Fetch background image
      // ---------------------------
      const bgBuffer = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bgBuffer, "utf-8"));

      // ---------------------------
      // Load images & draw canvas
      // ---------------------------
      const baseImage = await loadImage(pathImg);
      const baseAvt = await loadImage(pathAvt);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Draw username text
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#00FFAA"; // Neon green
      ctx.textAlign = "start";
      const lines = await this.wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 200, 497);

      // Draw avatar
      ctx.beginPath();
      ctx.drawImage(baseAvt, 83, 437, 100, 101);

      // Save final image
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(pathAvt);

      // ---------------------------
      // Send message
      // ---------------------------
      return api.sendMessage(
        {
          body: "💻 Hack complete! Check out this result:",
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );

    } catch (error) {
      console.error("❌ Hack command error:", error);
      return api.sendMessage("❌ Failed to generate hack image.", event.threadID, event.messageID);
    }
  }
};
