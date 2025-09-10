const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "profile",
    aliases: [
      "pfp", "pp", "dp", "ava", "avatar", "pf"
    ], 
    version: "1.3",
    author: "Aminul Sordar",
    countDown: 5,
    role: 0,
    shortDescription: "Get Profile Picture",
    longDescription: "Fetch and send profile image of yourself, mentioned user, or replied user.",
    category: "image",
    guide: {
      en: "   {pn} @tag\n   {pn} (reply to a user)\n   {pn} (self profile pic)"
    }
  },

  langs: {
    vi: {
      noTag: "❌ Bạn phải tag hoặc reply người bạn muốn lấy ảnh đại diện."
    },
    en: {
      noTag: "❌ You must tag, reply, or it will send your own profile picture."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      let avatarUrl;
      const uidSelf = event.senderID;                   // The person who used command
      const uidTagged = Object.keys(event.mentions)[0]; // Tagged user (if any)

      // 📌 Priority: Reply > Tag > Self
      if (event.type === "message_reply") {
        avatarUrl = await usersData.getAvatarUrl(event.messageReply.senderID);
      } else if (uidTagged) {
        avatarUrl = await usersData.getAvatarUrl(uidTagged);
      } else {
        avatarUrl = await usersData.getAvatarUrl(uidSelf);
      }

      // 🖼 Send the profile picture
      return message.reply({
        body: "✨ Here’s the profile picture:",
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (err) {
      console.error("⚠️ [PROFILE ERROR]:", err);
      return message.reply("❌ Failed to fetch profile picture. Please try again!");
    }
  }
};
