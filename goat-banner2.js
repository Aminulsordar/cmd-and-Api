//==============================//
//   🌸 Banner2 - Business Card //
//   Author: Aminulsordar        //
//   Version: 2.2                //
//==============================//

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const jimp = require("jimp");
const path = require("path");

// 🔹 Safe Image Loader (auto-create blank if missing)
async function safeLoadImage(filePath, width = 50, height = 50) {
  try {
    if (!fs.existsSync(filePath)) {
      const tempCanvas = createCanvas(width, height);
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.fillStyle = "rgba(0,0,0,0)";
      tempCtx.fillRect(0, 0, width, height);
      const buffer = tempCanvas.toBuffer("image/png");
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);
    }
    return await loadImage(filePath);
  } catch (e) {
    console.error("❌ Image load error:", e);
    const tempCanvas = createCanvas(width, height);
    return await loadImage(tempCanvas.toBuffer("image/png"));
  }
}

module.exports = {
  config: {
    name: "banner2",
    version: "2.2",
    author: "Aminulsordar",
    role: 2,
    shortDescription: "Generate a Business Card Style Banner",
    category: "edit",
    guide: {
      en: `
📌 Usage: {p}{n} Name | Phone | Email | Location

✨ Example:
{p}{n} Aminul Sordar | 01704407109 | aminulsordar04@gmail.com | Rajshahi

➡️ Output: A Business Card Banner will be generated
- Name displayed at the top
- Left side: WhatsApp, Gmail & Location icons with details
- Right side: Profile picture inside colorful rings
      `
    }
  },

  onStart: async function ({ message, args, event }) {
    try {
      // 🔹 Detect Avatar
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

      // 🔹 Parse User Input
      const info = args.join(" ");
      if (!info) return message.reply("❌ Please provide text: Name | Phone | Email | Location");

      const msg = info.split("|");
      const name = msg[0]?.trim() || "";
      const phone = msg[1]?.trim() || "";
      const email = msg[2]?.trim() || "";
      const location = msg[3]?.trim() || "";

      // 🔹 Create Canvas
      const width = 1200, height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Red side strips
      ctx.fillStyle = "#e11d48";
      ctx.fillRect(0, 0, 80, height);
      ctx.fillRect(width - 80, 0, 80, height);

      // Decorations
      const topFlower = await safeLoadImage(
        path.join(__dirname, "../../assets/decorations/flower-top.png"), 400, 120
      );
      const bottomFlower = await safeLoadImage(
        path.join(__dirname, "../../assets/decorations/flower-bottom.png"), 400, 120
      );

      ctx.drawImage(topFlower, width / 2 - 200, -20, 400, 120);
      ctx.drawImage(bottomFlower, width / 2 - 200, height - 100, 400, 120);

      // Name Text
      ctx.fillStyle = "red";
      ctx.font = "bold 50px Arial";
      ctx.textAlign = "center";
      ctx.fillText(name, width / 2, 100);

      // Divider line
      ctx.fillRect(width / 2 - 200, 120, 400, 4);

      // Icons
      const waIcon = await safeLoadImage(
        path.join(__dirname, "../../assets/icons/whatsapp.png"), 40, 40
      );
      const gmIcon = await safeLoadImage(
        path.join(__dirname, "../../assets/icons/gmail.png"), 40, 40
      );
      const locIcon = await safeLoadImage(
        path.join(__dirname, "../../assets/icons/location.png"), 40, 40
      );

      // Info Texts
      ctx.textAlign = "left";
      ctx.fillStyle = "#111827";
      ctx.font = "28px Arial";

      ctx.drawImage(waIcon, 150, 200, 40, 40);
      ctx.fillText(phone, 210, 230);

      ctx.drawImage(gmIcon, 150, 260, 40, 40);
      ctx.fillText(email, 210, 290);

      ctx.drawImage(locIcon, 150, 320, 40, 40);
      ctx.fillText(location, 210, 350);

      // 🔹 Avatar with Rings
      const avatar = await jimp.read(avatarUrl);
      avatar.circle();
      const avatarBuffer = await avatar.getBufferAsync(jimp.MIME_PNG);
      const avatarImg = await loadImage(avatarBuffer);

      const centerX = 900, centerY = 330, radius = 180;
      const colors = ["red", "yellow", "blue"];
      const ringWidth = 20;

      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - i * ringWidth, 0, Math.PI * 2);
        ctx.lineWidth = ringWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
      });

      // Avatar inside circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, centerX - 130, centerY - 130, 260, 260);
      ctx.restore();

      // 🔹 Save & Send
      const outPath = path.join(__dirname, "bannerstyle.png");
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        message.reply({
          body: "🌸 Business Card Banner Ready!",
          attachment: fs.createReadStream(outPath)
        });
      });

    } catch (err) {
      console.error("❌ Banner Error:", err);
      message.reply("❌ Failed to generate banner. Please try again!");
    }
  }
};
