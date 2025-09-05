const axios = require("axios");

module.exports.config = {
  name: "jan",
  version: "1.4.1",
  author: "Aminulsordar",
  countDown: 0,
  role: 0,
  aliases: ["jaan", "janu", "bby"],
  category: "jan",
  shortDescription: {
    en: "Jan AI chatbot",
    bn: "Jan AI চ্যাটবট",
    vi: "Jan AI chatbot",
    ar: "روبوت Jan AI"
  },
  longDescription: {
    en: "Jan AI that can learn and answer questions",
    bn: "Jan AI বট যেটা শেখানো যেতে পারে এবং প্রশ্নের উত্তর দিতে পারে।",
    vi: "Jan AI có thể học và trả lời câu hỏi",
    ar: "روبوت Jan AI يمكنه التعلم والإجابة على الأسئلة"
  },
  guide: {
    en: "{pn} <message>\n{pn} teach <question> - <answer>\n{pn} count",
    bn: "{pn} <বার্তা>\n{pn} teach <প্রশ্ন> - <উত্তর>\n{pn} count",
    vi: "{pn} <tin nhắn>\n{pn} teach <câu hỏi> - <câu trả lời>\n{pn} count",
    ar: "{pn} <رسالة>\n{pn} teach <سؤال> - <إجابة>\n{pn} count"
  }
};

// ===== Helper functions =====
async function fetchCount() {
  try {
    const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/count`);
    return res.data;
  } catch (e) {
    console.error("fetchCount error:", e.message);
    return { questions: 0, answers: 0 };
  }
}

async function getAnswer(question) {
  try {
    const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/answer/${encodeURIComponent(question)}`);
    return res.data.answer || "❌ আমি এখনো এটা শিখিনি, দয়া করে আমাকে শেখান! 👀";
  } catch (e) {
    console.error("getAnswer error:", e.message);
    return "❌ সার্ভার থেকে উত্তর পাওয়া যায়নি, পরে আবার চেষ্টা করুন!";
  }
}

async function teachMultiple(qaText) {
  try {
    const res = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, { text: qaText });
    return res.data.message;
  } catch (e) {
    console.error("teachMultiple error:", e.message);
    return "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।";
  }
}

// ===== Mirai event handlers =====
module.exports.handleReply = async function ({ api, event, handleReply }) {
  const reply = event.body.trim();
  const responseMessage = await getAnswer(reply);

  return api.sendMessage(responseMessage, event.threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }
  }, event.messageID);
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const body = event.body ? event.body.toLowerCase().trim() : "";
    const prefixes = ["baby", "bby", "bot", "jan", "babu", "janu"];
    const startsWithPrefix = prefixes.find(prefix => body.startsWith(prefix));

    if (startsWithPrefix) {
      const question = body.replace(/^\S+\s*/, "").trim();

      if (question.length > 0) {
        const response = await getAnswer(body);
        return api.sendMessage(response, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }
        }, event.messageID);
      }

      const randomReplies = [
        "হ্যাঁ 😀, আমি এখানে আছি",
        "কেমন আছো?",
        "বলো জান কি করতে পারি তোমার জন্য",
        `তুমি বলেছো: "${body}"? কিউট!`,
        "I love you 💝",
        "ভালোবাসি তোমাকে 🤖",
        "Hi, I'm messenger Bot, I can help you.?🤖",
        "Use callad to contact admin!",
        "Hi, Don't disturb 🤖 🚘 Now I'm going to Feni, Bangladesh..bye",
        "Hi, 🤖 I can help you~~~~",
        "আমি এখন আমিনুল বসের সাথে বিজি আছি",
        "আমাকে আমাকে না ডেকে আমার বসকে ডাকো এই নেও LINK :- https://www.facebook.com/100071880593545",
        "Hmmm sona 🖤 meye hoile kule aso ar sele hoile kule new 🫂😘",
        "Yah This Bot creator : PRINCE RID((A.R))     link => https://www.facebook.com/100071880593545",
        "হা বলো, শুনছি আমি 🤸‍♂️🫂",
        "Ato daktasen kn bujhlam na 😡",
        "jan bal falaba,🙂",
        "ask amr mon vlo nei dakben na🙂",
        "Hmm jan ummah😘😘",
        "jang hanga korba 🙂🖤",
        "iss ato dako keno lojja lage to 🫦🙈",
        "suna tomare amar valo lage,🙈😽"
      ];

      const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      return api.sendMessage(reply, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }
      }, event.messageID);
    }
  } catch (e) {
    console.error("handleEvent error:", e.message);
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (args.length < 1) {
    return api.sendMessage("❌ দয়া করে একটি প্রশ্ন করুন!", event.threadID, event.messageID);
  }

  const command = args[0].toLowerCase();

  // Count
  if (command === "count") {
    const count = await fetchCount();
    return api.sendMessage(
      `📊 জ্ঞানভাণ্ডার:\n\n` +
      `📌 মোট প্রশ্ন: ${count.questions}\n` +
      `📌 মোট উত্তর: ${count.answers}\n\n` +
      `💡 আমাকে আরও শেখানোর মাধ্যমে আমাকে আরও স্মার্ট বানান!\n` +
      `🔍 কিছু প্রশ্ন করুন, আমি চেষ্টা করব উত্তর দেওয়ার!`,
      event.threadID, event.messageID
    );
  }

  // Teach
  if (command === "teach") {
    const input = args.slice(1).join(" ").trim();
    if (!input.includes(" - ")) {
      return api.sendMessage(
        "❌ সঠিক ফরম্যাট ব্যবহার করুন:\n/teach প্রশ্ন - উত্তর\n\nএকাধিক প্রশ্ন দিতে চাইলে '|' দিয়ে আলাদা করুন।",
        event.threadID, event.messageID
      );
    }

    const message = await teachMultiple(input);
    return api.sendMessage(message, event.threadID, event.messageID);
  }

  // Ask
  const input = args.join(" ").trim();
  const responseMessage = await getAnswer(input);

  return api.sendMessage(responseMessage, event.threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }
  }, event.messageID);
};
