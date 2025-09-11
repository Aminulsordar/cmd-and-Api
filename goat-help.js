const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.1.0",
    author: "Aminul Sordar (Modified from NTKhang)",
    countDown: 5,
    role: 0,
    description: {
      en: "View all commands or details of a command"
    },
    category: "info",
    guide: {
      en: "{pn} [page number]\n{pn} <command name>\n{pn} <command name> -i|-u|-a|-r"
    }
  },

  onStart: async function ({ api, message, event, args, threadsData, role }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);

    // Find command
    const commandName = (args[0] || "").toLowerCase();
    let command = commands.get(commandName) || commands.get(aliases.get(commandName));

    // LIST ALL COMMANDS
    if (!command && (!args[0] || !isNaN(args[0]))) {
      const arrayInfo = [];
      for (let [name] of commands) {
        if (commands.get(name).config.role > role) continue;
        arrayInfo.push(name);
      }

      const numberOfOnePage = 20;
      const page = parseInt(args[0]) || 1;
      const startSlice = numberOfOnePage * (page - 1);
      let i = startSlice;
      const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

      if (page < 1 || page > Math.ceil(arrayInfo.length / numberOfOnePage)) {
        return api.sendMessage(`⚠️ Page ${page} not found.`, threadID, messageID);
      }

      // Decorated list
      let msg = `📖 HELP MENU 📖\n\n`;

      for (let item of returnArray) {
        msg += `🔹 ${++i}. ${item}❄️\n`;
      }

      msg += `\n───────────────\n`;
      msg += `📄 Page: ${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)}\n`;
      msg += `📌 Total Commands: ${arrayInfo.length}\n`;
      msg += `ℹ️ Use "${prefix}help <command>" for details.`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // COMMAND NOT FOUND
    if (!command && args[0]) {
      return api.sendMessage(`❌ Command "${args[0]}" not found!`, threadID, messageID);
    }

    // SHOW COMMAND INFO
    const c = command.config;
    const usage = c.guide?.en
      ?.replace(/\{pn\}/g, prefix + c.name)
      .replace(/\{p\}/g, prefix)
      || "No usage info";

    const aliasesString = c.aliases ? c.aliases.join(", ") : "None";

    const roleText =
      c.role === 0
        ? "0 (All Users)"
        : c.role === 1
        ? "1 (Group Admins)"
        : "2 (Bot Admins)";

    let msgInfo = "";

    if (args[1]?.match(/^-i|info$/)) {
      msgInfo = `📌 COMMAND INFO\n
🔹 Name: ${c.name}
🔹 Description: ${c.description?.en || "No description"}
🔹 Aliases: ${aliasesString}
🔹 Version: ${c.version}
🔹 Role: ${roleText}
🔹 Cooldown: ${c.countDown || 1}s
🔹 Author: ${c.author}`;
    } else if (args[1]?.match(/^-u|usage|-g|guide$/)) {
      msgInfo = `📘 USAGE\n${usage}`;
    } else if (args[1]?.match(/^-a|alias$/)) {
      msgInfo = `📙 ALIASES\n${aliasesString}`;
    } else if (args[1]?.match(/^-r|role$/)) {
      msgInfo = `🔑 ROLE\n${roleText}`;
    } else {
      msgInfo = `📌 COMMAND INFO\n
🔹 Name: ${c.name}
🔹 Description: ${c.description?.en || "No description"}
🔹 Aliases: ${aliasesString}
🔹 Version: ${c.version}
🔹 Role: ${roleText}
🔹 Cooldown: ${c.countDown || 1}s
🔹 Author: ${c.author}

📘 USAGE
${usage}`;
    }

    return api.sendMessage(msgInfo, threadID, messageID);
  }
};
