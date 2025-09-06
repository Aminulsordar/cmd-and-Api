//=========================//
//  🐐 CmdStore Command    //
//  Author: Aminul Sordar //
//  Version: 1.0.2        //
//=========================//

const axios = require("axios");

module.exports = {
  config: {
    name: "cmdstore",
    aliases: ["cs", "market"],
    version: "1.0.2",
    role: 0,
    author: "Aminul Sordar",
    shortDescription: { en: "📌 CmdStore - GitHub Command Marketplace" },
    longDescription: { en: "📌 Browse and search commands from GitHub dynamically." },
    category: "market",
    cooldowns: 0,
  },

  onStart: async ({ event, args, message }) => {
    const apiUrl = "https://my-api-show.vercel.app/api/cmdstore";

    const sendMsg = (content) => {
      const header = "🌟✨──『 𝐂𝐦𝐝𝐒𝐭𝐨𝐫𝐞 』──✨🌟\n";
      const footer = "\n💫━━━━━━━━━━━━━━━━💫";
      return message.reply(header + content + footer);
    };

    const formatDateBD = (date) => new Date(date).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" });

    //================ Handlers ================//
    const handleShow = async (id) => {
      if (!id) return sendMsg("❌ Please provide a valid ID.");
      try {
        const { data } = await axios.get(apiUrl, { params: { id } });
        if (!data.items || !data.items.length) return sendMsg("⚠️ Command not found.");

        const cmd = data.items[0];
        sendMsg(`
💎 𝗖𝗺𝗱𝗦𝘁𝗼𝗿𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗜𝗻𝗳𝗼 💎

👑 Name       : ${cmd.itemName}
🆔 ID         : ${cmd.itemID}
⚙️ Type       : ${cmd.type || "Unknown"}
📝 Description: ${cmd.description || "No description"}
👨‍💻 Author    : ${cmd.authorName}
🔗 Code       : https://github.com/Aminulsordar/cmd-and-Api/raw/main/${cmd.rawID}
📅 Added      : ${formatDateBD(cmd.createdAt)}

💡 Tip: Use '${event.body} search <query>' to find more commands!
        `);
      } catch (err) {
        console.error(err);
        sendMsg("❌ Failed to fetch command info.");
      }
    };

    const handleSearch = async (query) => {
      if (!query) return sendMsg("❌ Please provide a search query.");
      try {
        const { data } = await axios.get(apiUrl, { params: { search: query } });
        if (!data.items || !data.items.length) return sendMsg("⚠️ No matching commands found.");

        const output = data.items
          .slice(0, 5)
          .map(
            (cmd, i) => `
💠 ${i + 1}. ${cmd.itemName}
🆔 ID         : ${cmd.itemID}
⚙️ Type       : ${cmd.type}
📝 Description: ${cmd.description || "No description"}
👨‍💻 Author    : ${cmd.authorName}
📅 Added      : ${formatDateBD(cmd.createdAt)}`
          )
          .join("\n");

        sendMsg(`
🔍 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 for: "${query}"  

${output}

💡 Tip: Use '${event.body} show <ID>' to see full details.
        `);
      } catch (err) {
        console.error(err);
        sendMsg("❌ Failed to search commands.");
      }
    };

    //================ Command Router ================//
    try {
      const cmd = (args[0] || "").toLowerCase();
      const param = args.slice(1).join(" ");
      switch (cmd) {
        case "show":
          return handleShow(param);
        case "search":
          return handleSearch(param);
        default:
          return sendMsg(`
📌 𝗖𝗺𝗱𝗦𝘁𝗼𝗿𝗲 𝗛𝗲𝗹𝗽

🔹 Show Command Info:
▶ ${event.body} show <ID>
Example: show 1

🔹 Search Commands:
▶ ${event.body} search <query>
Example: search pinterest
          `);
      }
    } catch (err) {
      console.error(err);
      sendMsg("❌ An unexpected error occurred.");
    }
  },
};
