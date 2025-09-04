module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "aminulsordar",
    countDown: 10,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Bot will go to your inbox and add your group"
    },
    longDescription: {
      en: ""
    },
    guide: {
      en: ""
    }
  },

  languages: {
    en: {
      success: "✅ SUCCESSFULLY SEND MESSAGE\n\n🔰 PLEASE CHECK YOUR INBOX, PLEASE SEE IT 😘",
      inboxMessage: "✅ HELLO, BROTHER AND SISTER\n🔰 NOW I AM IN YOUR INBOX, ADD YOUR GROUP ❤️‍🩹"
    },
    id: {
      success: "✅ PESAN BERHASIL DIKIRIM\n\n🔰 PERIKSA INBOX ANDA 😘",
      inboxMessage: "✅ HALO, SAUDARA DAN SAUDARI\n🔰 SEKARANG SAYA ADA DI INBOX ANDA, TAMBAHKAN KE GRUP ANDA ❤️‍🩹"
    }
  },

  run: async function({ api, event, args, message, getLang }) {
    try {
      const query = encodeURIComponent(args.join(" "));
      message.reply(getLang("success"), event.threadID);
      api.sendMessage(getLang("inboxMessage"), event.senderID);
    } catch (error) {
      console.error("Error: " + error);
    }
  }
};
