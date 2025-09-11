const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.3.0",
    author: "Aminul Sordar (Modified from NTKhang)",
    countDown: 5,
    role: 0,
    description: {
      en: "View all commands or details of a specific command"
    },
    category: "info",
    guide: {
      en: "{pn} [page number]\n{pn} <command name>\n{pn} <command name> -i|-u|-a|-r"
    }
  },

  onStart: async function ({ api, message, event, args, role }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);

    // Check if a specific command is requested
    const commandName = (args[0] || "").toLowerCase();
    let command = commands.get(commandName) || commands.get(aliases.get(commandName));

    // -------------------------------
    // 1) Show command list (help or help <page>)
    // -------------------------------
    if (!command && (!args[0] || !isNaN(args[0]))) {
      const arrayInfo = [];
      for (let [name] of commands) {
        if (commands.get(name).config.role > role) continue;
        arrayInfo.push(name);
      }

      const numberOfOnePage = 20;
      const page = parseInt(args[0]) || 1;
      const totalPage = Math.ceil(arrayInfo.length / numberOfOnePage);
      const startSlice = numberOfOnePage * (page - 1);
      let i = startSlice;
      const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

      if (page < 1 || page > totalPage) {
        return api.sendMessage(`⚠️ Page ${page} not found.`, threadID, messageID);
      }

      // Decorated list
      let msg = `✨━━━━━━━━━━━━━━━✨\n      📖 HELP MENU 📖\n✨━━━━━━━━━━━━━━━✨\n\n`;

      for (let item of returnArray) {
        msg += `🔹 ${++i}. ╰•⊱✾ ${item} ❄️\n`;
      }

      msg += `\n────────────────\n`;
      msg += `📄 Page: ${page}/${totalPage}\n`;
      msg += `📌 Total Commands: ${arrayInfo.length}\n`;
      msg += `ℹ️ Use "${prefix}help <command>" for details.`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // -------------------------------
    // 2) Command not found
    // -------------------------------
    if (!command && args[0]) {
      return api.sendMessage(`❌ Command "${args[0]}" not found!`, threadID, messageID);
    }

    // -------------------------------
    // 3) Show details of a specific command
    // -------------------------------
    const c = command.config;
    const usage =
      c.guide?.en?.replace(/\{pn\}/g, prefix + c.name).replace(/\{p\}/g, prefix) ||
      "No usage info available";

    const aliasesString = c.aliases ? c.aliases.join(", ") : "None";

    const roleText =
      c.role === 0
        ? "0 (All Users)"
        : c.role === 1
        ? "1 (Group Admins)"
        : "2 (Bot Admins)";

    let msgInfo = "";

    // Custom options
    if (args[1]?.match(/^-i|info$/)) {
      msgInfo = `📌 COMMAND INFO\n\n🔹 Name: ${c.name}\n🔹 Description: ${
        c.description?.en || "No description"
      }\n🔹 Aliases: ${aliasesString}\n🔹 Version: ${c.version}\n🔹 Role: ${roleText}\n🔹 Cooldown: ${
        c.countDown || 1
      }s\n🔹 Author: ${c.author}`;
    } else if (args[1]?.match(/^-u|usage|-g|guide$/)) {
      msgInfo = `📘 USAGE\n${usage}`;
    } else if (args[1]?.match(/^-a|alias$/)) {
      msgInfo = `📙 ALIASES\n${aliasesString}`;
    } else if (args[1]?.match(/^-r|role$/)) {
      msgInfo = `🔑 ROLE\n${roleText}`;
    } else {
      // Full details
      msgInfo = `📌 COMMAND INFO\n\n🔹 Name: ${c.name}\n🔹 Description: ${
        c.description?.en || "No description"
      }\n🔹 Aliases: ${aliasesString}\n🔹 Version: ${c.version}\n🔹 Role: ${roleText}\n🔹 Cooldown: ${
        c.countDown || 1
      }s\n🔹 Author: ${c.author}\n\n📘 USAGE\n${usage}`;
    }

    return api.sendMessage(msgInfo, threadID, messageID);
  }
};
