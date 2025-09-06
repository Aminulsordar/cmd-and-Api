module.exports = {
  config: {
    name: "spy",
    version: "1.1",
    author: "Aminulsordar",
    countDown: 5,
    role: 0,
    shortDescription: "Get user information and avatar",
    longDescription: "Get user information and avatar by mentioning, replying, or using UID/profile link",
    category: "image",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    let avt;
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    api.getUserInfo(uid, async (err, userInfo) => {
      if (err) return message.reply("⚠️ Failed to retrieve user information.");

      const avatarUrl = await usersData.getAvatarUrl(uid);

      // Gender mapping
      let genderText;
      switch (userInfo[uid].gender) {
        case 1: genderText = "👧 Girl"; break;
        case 2: genderText = "👦 Boy"; break;
        default: genderText = "❓ Unknown";
      }

      // User info template (decorated)
      const userInformation = 
`━━━━━━━━━━━━━━━
🔍 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼 𝗦𝗽𝘆
━━━━━━━━━━━━━━━
👤 Name: ${userInfo[uid].name}
🌐 Profile: ${userInfo[uid].profileUrl}
⚧ Gender: ${genderText}
📌 Type: ${userInfo[uid].type}
🤝 Friend: ${userInfo[uid].isFriend ? "✅ Yes" : "❌ No"}
🎂 Birthday Today: ${userInfo[uid].isBirthday ? "🎉 Yes" : "❌ No"}
━━━━━━━━━━━━━━━`;

      message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });
    });
  }
};
