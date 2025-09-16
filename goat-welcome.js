const { getTime } = global.utils;
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");

// temp data holder
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Aminulsordar",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      welcomeMessage:
        "╭━─━─≪𝐖𝐄𝐋𝐂𝐎𝐌𝐄≫─━─━❯❯\n│\n├─❯【•𝐁𝐎𝐓-𝐎𝐖𝐍𝐄𝐑: 𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿】\n│\n├─❯【𝐀𝐌𝐈𝐍𝐔𝐋-𝐗-𝐁𝐎𝐓】\n│\n├─❯【•𝐁𝐎𝐓-𝐏𝐑𝐄𝐅𝐈𝐗:【#】】\n│\n├─❯ 【•𝐓𝐘𝐏𝐄:  #help 𝐔𝐒𝐄 𝐂𝐌𝐃•】\n│\n├─❯【•𝐎𝐖𝐍𝐄𝐑+𝐀𝐃𝐌𝐈𝐍】\n\n├─❯https://www.facebook.com/br4nd.abir.your.next.bf.jan\n│\n├─❯m.me/100071880593545\n│\n╰━─━─≪𝐀𝐌𝐈𝐍𝐔𝐋-𝐗-𝐁𝐎𝐓≫─━─━❯❯",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage:
        '╔════•|      💛      |•════╗\n ❤️আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ❤️\n╚════•|      💛      |•════╝\n\n━❯🅆🄴🄻🄲🄾🄼🄴➤\n\n━❯🅽🅴🆆➤\n\n━❯🇲‌🇪‌🇲‌🇧‌🇪‌🇷‌➤\n\n━❯{userName}➤\n\n༄✺আ্ঁপ্ঁনা্ঁকে্ঁ আ্ঁমা্ঁদে্ঁর্ঁ✺࿐\n\n{boxName}\n\n 🌺🌿🌸—এ্ঁর্ঁ প্ঁক্ষ্ঁ🍀থে্ঁকে্ঁ🍀—🌸🌿\n\n 🌿_ভা্ঁলো্ঁবা্ঁসা্ঁ_অ্ঁভি্ঁরা্ঁম্ঁ_🌿\n\n༄✺আঁপঁনিঁ এঁইঁ গ্রুঁপেঁর {position} মে্ঁম্বা্ঁরঁ ࿐\n\nTotal members: {membersCount}.\n\nTotal admins: {adminsCount}\n\nআমাদের সাথে সময় দেওয়া ও পাশে থাকার অনুরোধ রইলো !!-🍂🌺🥀\n\n🦋║ლ💞 💞 ლ║🦋\n\n💐☘️-ধন্যবাদ প্রিয়-☘️💐\n❤️𝐁𝐎𝐓-𝐎𝐖𝐍𝐄𝐑: 𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿❤️\n\nCurrent date and time: {dateTime}'
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // If bot itself added
    if (dataAddedParticipants.some((item) => item.userFbId === api.getCurrentUserID())) {
      if (nickNameBot) {
        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      }
      return message.send(getLang("welcomeMessage", prefix));
    }

    // Init temp data
    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = {
        joinTimeout: null,
        dataAddedParticipants: []
      };
    }

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      const threadData = await threadsData.get(threadID);
      if (threadData?.settings?.sendWelcomeMessage === false) return;

      const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
      const dataBanned = threadData.data?.banned_ban || [];
      const threadName = threadData.threadName || "this group";
      const threadInfo = await api.getThreadInfo(threadID);

      const validParticipants = dataAddedParticipants.filter(
        (user) => !dataBanned.some((ban) => ban.id === user.userFbId)
      );
      if (validParticipants.length === 0) return;

      // Ensure cache folder
      const cacheFolder = path.resolve(__dirname, "cache");
      if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);

      const background = "https://cdn.popcat.xyz/welcome-bg.png";

      // Session name
      const getSessionName = () => {
        const hours = getTime("HH");
        return hours <= 10
          ? getLang("session1")
          : hours <= 12
          ? getLang("session2")
          : hours <= 18
          ? getLang("session3")
          : getLang("session4");
      };

      // Ordinal suffix
      const getOrdinalSuffix = (i) => {
        const j = i % 10,
          k = i % 100;
        if (j == 1 && k != 11) return i + "st";
        if (j == 2 && k != 12) return i + "nd";
        if (j == 3 && k != 13) return i + "rd";
        return i + "th";
      };

      // Main sender
      const sendWelcomeMessage = async (user, position) => {
        const userName = user.fullName;
        const userId = user.userFbId;
        const dateTime = moment().tz("Asia/Dhaka").format("MMMM Do YYYY, h:mm:ss a");
        const membersCount = threadInfo.participantIDs.length;
        const adminsCount = threadInfo.adminIDs.length;

        let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");
        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName)
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{multiple\}/g, getLang("multiple1"))
          .replace(/\{session\}/g, getSessionName())
          .replace(/\{dateTime\}/g, dateTime)
          .replace(/\{membersCount\}/g, membersCount)
          .replace(/\{adminsCount\}/g, adminsCount)
          .replace(/\{position\}/g, getOrdinalSuffix(position));

        const form = { body: welcomeMessage, mentions: [{ tag: userName, id: userId }] };

        try {
          const avt = await usersData.getAvatarUrl(userId);
          const url = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(
            background
          )}&text1=${encodeURIComponent(userName)}&text2=Welcome%20To%20${encodeURIComponent(
            threadName
          )}&text3=Member%20${encodeURIComponent(position)}&avatar=${encodeURIComponent(avt)}`;

          const filePath = path.resolve(cacheFolder, `${userId}.jpg`);
          const response = await axios.get(url, { responseType: "stream" });
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          writer.on("finish", () => {
            form.attachment = [fs.createReadStream(filePath)];
            message.send(form);
            console.log(
              chalk.greenBright("✅ WELCOME:"),
              chalk.yellow(userName),
              chalk.cyan(`joined ${threadName} as #${position}`)
            );
          });
        } catch (err) {
          console.error(chalk.red("❌ Error generating welcome card:"), err.message);
          message.send(form);
        }
      };

      // Loop send
      for (const [index, user] of validParticipants.entries()) {
        await sendWelcomeMessage(
          user,
          threadInfo.participantIDs.length - validParticipants.length + index + 1
        );
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
