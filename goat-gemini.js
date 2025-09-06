const axios = require("axios");
const u = "https://my-api-show.vercel.app/api/gemini";

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "gpt"],
    version: "1.3.0",
    author: "Aminul Sordar + aryan",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with Gemini AI",
    longDescription: "💎 Talk with Gemini AI (supports both prefix and no-prefix)",
    category: "AI",
    guide: {
      en: "{pn} [your question]  OR  just type: gemini hello"
    }
  },

  // ===== PREFIX COMMAND =====
  onStart: async function ({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage(
      "❌ | Please provide a question.\n\n✨ Example:\n/gemini Who are you?",
      event.threadID,
      event.messageID
    );

    await handleGemini(api, event, p, this.config.name);
  },

  // ===== REPLY CONTINUATION =====
  onReply: async function ({ api, event }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    await handleGemini(api, event, p, this.config.name);
  },

  // ===== NO PREFIX SUPPORT =====
  noPrefix: async function ({ api, event }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    // Trigger only if starts with "gemini", "ai", or "gpt"
    if (body.startsWith("gemini") || body.startsWith("ai") || body.startsWith("gpt")) {
      const p = body.replace(/^(gemini|ai|chat)\s*/i, "");
      if (!p) return api.sendMessage(
        "❌ | Please provide a question.\n\n✨ Example:\ngemini What is the meaning of life?",
        event.threadID,
        event.messageID
      );

      await handleGemini(api, event, p, this.config.name);
    }
  }
};

// ===== COMMON HANDLER =====
async function handleGemini(api, event, prompt, commandName) {
  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const r = await axios.get(`${u}?ask=${encodeURIComponent(prompt)}`);
    const data = r.data;
    const reply = data?.answer?.trim();

    if (!reply) throw new Error("No response from Gemini API.");

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    // Format skills nicely with emojis
    const skills = data.skills?.length ? data.skills.map(s => `✨ ${s}`).join("\n") : "N/A";

    // Decorated message
    const msg = 
`╭───〔 💎 GEMINI AI 💎 〕───╮
👤 User Question:
${prompt}

🤖 Answer:
${reply}

🧑‍💻 Operator: ${data.operator || "Unknown"}
✉ Email: ${data.email || "N/A"}
📞 Contact: ${data.number || "N/A"}
🔧 Skills:
${skills}
❤️ Relationship: ${data.relationship || "N/A"}
📌 Source: ${data.source || "Unknown"}
🕒 ${new Date(data.timestamp).toLocaleString()}
╰─────────────────────❖`;

    api.sendMessage(msg, event.threadID, (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
      });
    }, event.messageID);

  } catch (e) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage(
      "⚠ | Unable to get a response from Gemini API. Please try again later.",
      event.threadID,
      event.messageID
    );
  }
  }
