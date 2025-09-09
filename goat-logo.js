const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "logo",
    aliases: ["logogen", "genlogo"],
    version: "1.3.1",
    author: "Aminulsordar",
    role: 0,
    shortDescription: { en: "Generate a logo based on a prompt." },
    longDescription: { en: "Uses AI to generate a custom logo based on a prompt provided by the user." },
    category: "fun",
    guide: { en: "{p}logo <prompt>" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = (args || []).join(" ").trim();

    const tryReact = async (emoji) => {
      try { await api.setMessageReaction(emoji, event.messageID, null, true); } catch (_) {}
    };

    if (!prompt) {
      return api.sendMessage(
        "⚠️ | Please provide a prompt for the logo generation.\n\n💡 Usage: {p}logo <prompt>",
        event.threadID,
        event.messageID
      );
    }

    await tryReact("⌛");

    try {
      // Call API
      const response = await axios.get(
        `https://my-api-show.vercel.app/api/logo?prompt=${encodeURIComponent(prompt)}`
      );

      const data = response.data;
      const logoUrl = data.logoUrl;

      if (!logoUrl) {
        await api.sendMessage(
          "❌ | No logo was generated. Please try a different prompt.",
          event.threadID,
          event.messageID
        );
        return;
      }

      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // Prepare file path
      const logoPath = path.join(cacheDir, `ai_logo_${Date.now()}.jpg`);
      await fs.ensureFile(logoPath); // 🔥 ensures file created if not exists

      // Download logo
      const logoResponse = await axios.get(logoUrl, { responseType: "arraybuffer" });
      await fs.writeFile(logoPath, logoResponse.data);
      const logoStream = fs.createReadStream(logoPath);

      // Send logo with decorated message
      await api.sendMessage(
        {
          body:
            `✨  𝗔𝗜 𝗟𝗼𝗴𝗼 𝗚𝗲𝗻𝗲𝗿𝗮𝗧𝗢𝗥\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `🎨 Prompt: 「 ${prompt} 」\n` +
            `👑 Operator: ${data.operator || "Aminulsordar"}`,
          attachment: logoStream
        },
        event.threadID,
        event.messageID
      );

      await tryReact("✅");

      // Clean up
      await fs.unlink(logoPath);
    } catch (err) {
      console.error("[logo] Error:", err?.message || err);

      await api.sendMessage(
        `❌  𝗟𝗢𝗚𝗢 𝗚𝗘𝗡 𝗙𝗔𝗜𝗟𝗘𝗗\n` +
        `━━━━━━━━━━━━━\n` +
        `📝 Prompt: ${prompt}\n` +
        `💥 Error: ${err?.message || "Unknown error"}\n` +
        `🔁 Try again later.`,
        event.threadID,
        event.messageID
      );

      await tryReact("❌");
    }
  }
};
