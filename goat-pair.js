const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    author: "Aminulsordar",
    role: 0,
    shortDescription: "Random pairing",
    longDescription: "Make a random love pairing between you and another member 💕",
    category: "love",
    guide: "{pn}",
  },

  onStart: async function ({ api, event }) {
    try {
      // 🔹 Cache paths
      const pathImg = __dirname + "/cache/background.png";
      const pathAvt1 = __dirname + "/cache/Avtmot.png";
      const pathAvt2 = __dirname + "/cache/Avthai.png";

      // 🔹 User info
      const id1 = event.senderID;
      let name1 = "You";
      const threadInfo = await api.getThreadInfo(event.threadID);
      const all = threadInfo.userInfo;

      // 🔹 Detect gender
      let gender1;
      for (let c of all) if (c.id == id1) gender1 = c.gender;

      const botID = api.getCurrentUserID();
      let candidates = [];

      if (gender1 === "FEMALE") {
        for (let u of all) if (u.gender === "MALE" && u.id !== id1 && u.id !== botID) candidates.push(u.id);
      } else if (gender1 === "MALE") {
        for (let u of all) if (u.gender === "FEMALE" && u.id !== id1 && u.id !== botID) candidates.push(u.id);
      } else {
        for (let u of all) if (u.id !== id1 && u.id !== botID) candidates.push(u.id);
      }

      // 🔹 Pick random partner
      const id2 = candidates[Math.floor(Math.random() * candidates.length)];
      const name2 = "💘 Perfect Match 💘";

      // 🔹 Random percentage
      const rd1 = Math.floor(Math.random() * 100) + 1;
      const weirdVals = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
      const djtme = Array(9).fill(rd1).concat(weirdVals[Math.floor(Math.random() * weirdVals.length)]);
      const tile = djtme[Math.floor(Math.random() * djtme.length)];

      // 🔹 Fixed background (Google Drive)
      const backgroundUrl =
        "https://drive.google.com/uc?export=download&id=1dhWl35dfSIX9Z4u6c--4Kk4R8CM_LV0l";

      // Download images
      const getAvt1 = (
        await axios.get(
          `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));

      const getAvt2 = (
        await axios.get(
          `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));

      const getBackground = (
        await axios.get(backgroundUrl, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

      // 🔹 Canvas draw
      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const baseAvt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 100, 150, 300, 300); // Left avatar
      ctx.drawImage(baseAvt2, 900, 150, 300, 300); // Right avatar

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      // Cleanup
      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      // 🔹 Send message
      return api.sendMessage(
        {
          body: `🥰 Successful pairing!\n\n✨ ${name1} 💌 ${name2}\n💕 May your love last forever!\n📊 Compatibility: ${tile}%`,
          mentions: [{ tag: `${name2}`, id: id2 }],
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Pairing failed, please try again!", event.threadID, event.messageID);
    }
  },
};
