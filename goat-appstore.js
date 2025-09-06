const itunes = require("searchitunes");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "appstore",
    version: "1.4",
    author: "Aminul Sordar",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tìm app trên App Store",
      en: "Search apps on the App Store"
    },
    category: "software",
    guide: {
      en: "   {pn} <keyword> [--info]\n   Example: {pn} PUBG --info",
      vi: "   {pn} <từ khóa> [--info]\n   Ví dụ: {pn} PUBG --info"
    },
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    vi: {
      missingKeyword: "❌ Bạn chưa nhập từ khóa để tìm kiếm!",
      noResult: "⚠️ Không tìm thấy kết quả nào cho từ khóa: 『%1』"
    },
    en: {
      missingKeyword: "❌ You haven't entered any keyword!",
      noResult: "⚠️ No results found for keyword: 『%1』"
    }
  },

  onStart: async function ({ message, args, commandName, envCommands, getLang }) {
    if (!args[0]) return message.reply(getLang("missingKeyword"));

    // Check for --info flag
    const showInfo = args.includes("--info");
    if (showInfo) args = args.filter(arg => arg !== "--info");

    let results = [];
    try {
      results = (await itunes({
        entity: "software",
        country: "US",
        term: args.join(" "),
        limit: envCommands[commandName].limitResult
      })).results;
    } catch (err) {
      return message.reply(getLang("noResult", args.join(" ")));
    }

    if (results.length > 0) {
      let msg = `🔎 App Store Search Results for: 『${args.join(" ")}』\n━━━━━━━━━━━━━━━\n`;
      const pendingImages = [];

      for (const [i, result] of results.entries()) {
        const stars = result.averageUserRating
          ? "⭐".repeat(Math.round(result.averageUserRating))
          : "No Rating";

        msg += `\n📱 ${i + 1}. *${result.trackCensoredName}*\n`
          + `👨‍💻 Developer: ${result.artistName}\n`
          + `💰 Price: ${result.formattedPrice}\n`
          + `⭐ Rating: ${stars} (${result.averageUserRating?.toFixed(1) || "0.0"}/5)\n`
          + `🔗 Link: ${result.trackViewUrl}`;

        if (showInfo) {
          msg += `\n🗓 Released: ${result.releaseDate ? new Date(result.releaseDate).toDateString() : "Unknown"}\n`
            + `📦 Bundle ID: ${result.bundleId || "N/A"}\n`
            + `💾 Size: ${result.fileSizeBytes ? (result.fileSizeBytes / (1024 * 1024)).toFixed(2) + " MB" : "Unknown"}\n`
            + `📱 Requires: ${result.minimumOsVersion ? "iOS " + result.minimumOsVersion + " or later" : "N/A"}`;
        }

        msg += `\n━━━━━━━━━━━━━━━`;

        pendingImages.push(await getStreamFromURL(
          result.artworkUrl512 || result.artworkUrl100 || result.artworkUrl60
        ));
      }

      message.reply({
        body: msg,
        attachment: await Promise.all(pendingImages)
      });
    } else {
      message.reply(getLang("noResult", args.join(" ")));
    }
  }
};
