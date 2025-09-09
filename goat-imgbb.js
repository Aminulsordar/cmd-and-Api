//========================================//
//         🌐 IMGBB UPLOAD COMMAND        //
//----------------------------------------//
//  Author: Aminulsordar 🐐               //
//  Version: 1.0                          //
//  Description: Upload image to ImgBB     //
//========================================//

const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["i"],
    version: "1.0",
    author: "Aminulsordar",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Upload image to ImgBB"
    },
    longDescription: {
      en: "Easily upload an image to ImgBB by replying with a photo."
    },
    category: "🛠 Tools",
    guide: {
      en: "{pn} (reply to an image)"
    }
  },

  onStart: async function ({ api, event }) {
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25"; 
    const imageUrl = event.messageReply?.attachments[0]?.url;

    //⚠️ No Image Check
    if (!imageUrl) {
      return api.sendMessage(
        "❌ Please reply to an image to upload it to ImgBB.",
        event.threadID,
        event.messageID
      );
    }

    try {
      //📥 Download Image
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

      //📤 Prepare FormData
      const formData = new FormData();
      formData.append("image", Buffer.from(response.data, "binary"), { filename: "upload.png" });

      //🌐 Upload to ImgBB
      const res = await axios.post("https://api.imgbb.com/1/upload", formData, {
        headers: formData.getHeaders(),
        params: { key: imgbbApiKey }
      });

      const uploadedLink = res.data.data.url;

      //✅ Success Message
      return api.sendMessage(
        `✅ Image uploaded successfully!\n🔗 Link: ${uploadedLink}`,
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error("❌ ImgBB Upload Error:", error.message);

      return api.sendMessage(
        "⚠️ Failed to upload image to ImgBB.\nPlease try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
