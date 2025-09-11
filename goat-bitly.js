const axios = require("axios");

// ⚠️ Replace with your Bitly Token
const bitlyToken = "ee891aaa3d51db956a8e1c0bdc116cf2e7df839d";

module.exports = {
  config: {
    name: "bitly",
    version: "1.0.0",
    author: "Aminulsordar",
    longDescription: {
      en: "Shorten a link using Bitly",
    },
    shortDescription: {
      en: "Generate short links with Bitly",
    },
    commandCategory: "general",
    usages: "<link>",
    countDowns: 10,
    role: 0,
  },

  onStart: async function ({ api, event, args }) {
    // ✅ Check if user provided a link
    if (args.length < 1) {
      return api.sendMessage(
        "⚠️ | Please provide a valid link to shorten.\n\n📌 Example: bit.ly https://google.com",
        event.threadID,
        event.messageID
      );
    }

    const originalLink = args[0];

    // ⏳ Notify user about processing
    api.sendMessage(
      "⌛ | Processing your request...\n\nYour link will be shortened shortly. Please wait...",
      event.threadID,
      event.messageID
    );

    // ⏱️ Simulate a delay (10 seconds)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {
      // 🌐 Call Bitly API
      const response = await axios.post(
        "https://api-ssl.bitly.com/v4/shorten",
        { long_url: originalLink },
        {
          headers: {
            Authorization: `Bearer ${bitlyToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const shortenedLink = response.data.link;

      // 🎉 Send success message
      api.sendMessage(
        `✅ | Your link has been successfully shortened!\n\n🔗 Original: ${originalLink}\n✨ Shortened: ${shortenedLink}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("❌ Bitly API Error:", error.response?.data || error.message);

      // ❌ Error message
      api.sendMessage(
        "❌ | An error occurred while shortening the link.\n\n⚠️ Please check your Bitly token or try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
