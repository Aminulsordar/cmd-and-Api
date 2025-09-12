const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "banner3",
    version: "2.0",
    author: "Aminulsordar",
    countDown: 5,
    role: 2,
    shortDescription: "Stylish Banner Generator",
    longDescription: "Generate a custom stylish banner without API",
    category: "edit",
    guide: {
      en: "{p}{n} Aminulsordar | Pro Coder | https://www.facebook.com/profile.php?id=100071880593545 | insta.com/Aminulsordar | +8801704407109 | Dhaka, Bangladesh"
    }
  },

  onStart: async function ({ message, args, event }) {
    try {
      // Avatar detection
      let avatarUrl;
      if (
        event.type === "message_reply" &&
        event.messageReply.attachments.length > 0 &&
        (event.messageReply.attachments[0].type === "photo" ||
          event.messageReply.attachments[0].type === "animated_image")
      ) {
        avatarUrl = event.messageReply.attachments[0].url;
      } else {
        avatarUrl = `https://graph.facebook.com/${event.senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      }

      const info = args.join(" ");
      if (!info) return message.reply("❌ কিছুই লেখোনি!");

      const msg = info.split("|");
      const name = msg[0] || "";
      const description = msg[1] || "";
      const facebook = msg[2] || "";
      const instagram = msg[3] || "";
      const phone = msg[4] || "";
      const location = msg[5] || "";

      // Canvas setup
      const width = 1000;
      const height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f172a"); // navy
      gradient.addColorStop(1, "#1e3a8a"); // blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decoration shapes
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.arc(850, 100, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(150, 400, 80, 0, Math.PI * 2);
      ctx.fill();

      // Avatar
      const avatar = await jimp.read(avatarUrl);
      avatar.circle();
      const avatarBuffer = await avatar.getBufferAsync(jimp.MIME_PNG);
      const avatarImg = await loadImage(avatarBuffer);

      // Avatar shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 20;
      ctx.drawImage(avatarImg, 60, 120, 200, 200);
      ctx.restore();

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 50px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 10;
      ctx.fillText(name, 300, 150);

      // Description
      ctx.font = "italic 28px Arial";
      ctx.shadowBlur = 5;
      ctx.fillText(description, 300, 200);

      // Divider line
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(300, 220, 650, 2);

      // Info text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "24px Arial";
      ctx.shadowBlur = 0;
      ctx.fillText(`📘 Facebook: ${facebook}`, 300, 270);
      ctx.fillText(`📷 Instagram: ${instagram}`, 300, 310);
      ctx.fillText(`📞 Phone: ${phone}`, 300, 350);
      ctx.fillText(`📍 Location: ${location}`, 300, 390);

      // Save & send
      const outPath = __dirname + "/banner3.png";
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        message.reply({
          body: "✨ Stylish Banner Ready!",
          attachment: fs.createReadStream(outPath)
        });
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ Banner generate করতে গিয়ে error হয়েছে!");
    }
  }
};
