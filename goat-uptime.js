module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "4.0",
    author: "Aminulsordar Fancy",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Check fancy bot uptime."
    },
    longDescription: {
      en: "Displays uptime with a stylish fancy decorated message."
    },
    category: "Utility",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const uptimeMs = process.uptime() * 1000;
    const uptime = formatDuration(uptimeMs);

    const msg = 
`✨━━━━━━━━━━━━━━━━━━✨
   🛰 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘  
✨━━━━━━━━━━━━━━━━━━✨

🤖 Status   : Online ✅
⏱ Uptime   : ${uptime}
📡 Started  : ${getStartTime(uptimeMs)}

✨━━━━━━━━━━━━━━━━━━✨`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

// Format duration
function formatDuration(ms) {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const day = Math.floor(ms / (1000 * 60 * 60 * 24));

  let out = [];
  if (day) out.push(`${day}d`);
  if (hr) out.push(`${hr}h`);
  if (min) out.push(`${min}m`);
  if (sec) out.push(`${sec}s`);
  return out.join(" ") || "0s";
}

// Get start time
function getStartTime(ms) {
  const startDate = new Date(Date.now() - ms);
  return startDate.toLocaleString();
  }
