module.exports = {
  config: {
    name: "listbox",
    aliases: ["groups", "boxlist"],
    author: "kshitiz (Upgraded by Aminul)",
    version: "2.6",
    cooldowns: 5,
    role: 2, // Owner only
    shortDescription: {
      en: "List groups, add admin, or leave a group."
    },
    longDescription: {
      en: "Shows all groups (10 per page) where the bot is a member. Owner can also add admins or leave groups."
    },
    category: "owner",
    guide: {
      en: "{p}{n} [page]\n{p}{n} add <groupNumber> <userID>\n{p}{n} leave <groupNumber>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const groupList = await api.getThreadList(100, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.threadName);

      if (filteredList.length === 0) {
        return api.sendMessage("⚠️ No group chats found.", event.threadID, event.messageID);
      }

      // === Add admin mode ===
      if (args[0] === "add") {
        if (!args[1] || !args[2]) {
          return api.sendMessage(
            `⚠️ Usage: {p}${this.config.name} add <groupNumber> <userID>`,
            event.threadID,
            event.messageID
          );
        }

        const groupNumber = parseInt(args[1]);
        const userID = args[2];

        if (isNaN(groupNumber) || groupNumber < 1 || groupNumber > filteredList.length) {
          return api.sendMessage("⚠️ Invalid group number.", event.threadID, event.messageID);
        }

        const chosenGroup = filteredList[groupNumber - 1];

        try {
          await api.addUserToGroup(userID, chosenGroup.threadID);
          return api.sendMessage(
            `✅ Successfully added user (${userID}) as admin in:\n📌 ${chosenGroup.threadName} (${chosenGroup.threadID})`,
            event.threadID,
            event.messageID
          );
        } catch (err) {
          console.error("❌ Failed to add user as admin:", err);
          return api.sendMessage("❌ Failed to add user. Make sure the bot is admin in that group.", event.threadID, event.messageID);
        }
      }

      // === Leave group mode ===
      if (args[0] === "leave") {
        if (!args[1]) {
          return api.sendMessage(
            `⚠️ Usage: {p}${this.config.name} leave <groupNumber>`,
            event.threadID,
            event.messageID
          );
        }

        const groupNumber = parseInt(args[1]);

        if (isNaN(groupNumber) || groupNumber < 1 || groupNumber > filteredList.length) {
          return api.sendMessage("⚠️ Invalid group number.", event.threadID, event.messageID);
        }

        const chosenGroup = filteredList[groupNumber - 1];

        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), chosenGroup.threadID);
          return api.sendMessage(
            `👋 Left group:\n📌 ${chosenGroup.threadName} (${chosenGroup.threadID})`,
            event.threadID,
            event.messageID
          );
        } catch (err) {
          console.error("❌ Failed to leave group:", err);
          return api.sendMessage("❌ Failed to leave the group. Maybe the bot is not admin.", event.threadID, event.messageID);
        }
      }

      // === Default: show group list ===
      const perPage = 10;
      const totalPages = Math.ceil(filteredList.length / perPage);
      const page = parseInt(args[0]) || 1;

      if (page < 1 || page > totalPages) {
        return api.sendMessage(
          `⚠️ Invalid page number. Please choose between 1 - ${totalPages}.`,
          event.threadID,
          event.messageID
        );
      }

      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const pageList = filteredList.slice(startIndex, endIndex);

      const formattedList = pageList.map((group, index) =>
        `│ ${startIndex + index + 1}. ${group.threadName}\n│ 🆔 ${group.threadID}\n│ 👥 Members: ${group.participantIDs?.length || 0}`
      );

      const message = [
        "╭───────────────⭓",
        `│ 📋 𝗚𝗿𝗼𝘂𝗽 𝗖𝗵𝗮𝘁 𝗟𝗶𝘀𝘁 (Page ${page}/${totalPages})`,
        "│─────────────────",
        formattedList.join("\n"),
        "╰───────────────⭓",
        `💡 Add admin: {p}${this.config.name} add <groupNumber> <userID>\n💡 Leave group: {p}${this.config.name} leave <groupNumber>`
      ].join("\n");

      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
      console.error("❌ Error in listbox command:", error);
      return api.sendMessage("❌ An error occurred while running this command.", event.threadID, event.messageID);
    }
  }
};
