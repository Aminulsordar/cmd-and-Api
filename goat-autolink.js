const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

function loadAutoLinkStates() {
    try {
        const data = fs.readFileSync("autolink.json", "utf8");
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

function saveAutoLinkStates(states) {
    fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

let autoLinkStates = loadAutoLinkStates();

module.exports = {
    config: {
        name: 'autolink',
        version: '1.1',
        author: 'Aminulsordar',
        countDown: 5,
        role: 0,
        shortDescription: 'Auto-download and send videos with title',
        category: 'media',
    },

    onStart: async function ({ api, event }) {
        // Optional startup code
    },

    onChat: async function ({ api, event }) {
        const threadID = event.threadID;
        const message = event.body;

        const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
        if (!linkMatch) return;

        const url = linkMatch[0];
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // Using only your API
            const res = await axios.get(`https://my-api-show.vercel.app/api/alldl?url=${encodeURIComponent(url)}`);
            const videoData = res.data.data;

            if (!videoData || (!videoData.high && !videoData.low)) {
                return api.sendMessage("❌ ভিডিও পাওয়া যায়নি! দয়া করে আবার চেষ্টা করুন।", threadID, event.messageID);
            }

            const { title, high, low } = videoData;
            const videoUrl = high || low;

            // Decorated message
            const msg = `
╔═════════════🎬
║  📌 ভিডিও শিরোনাম:
║  ✨ ${title}
╠═════════════💫
║  🔗 সোর্স লিংক:
║  ${url}
╠═════════════🎉
║  ✅ ডাউনলোড সম্পন্ন!
╚═════════════🔥
`;

            request(videoUrl)
                .pipe(fs.createWriteStream("video.mp4"))
                .on("close", () => {
                    api.sendMessage(
                        { body: msg, attachment: fs.createReadStream("video.mp4") },
                        threadID,
                        () => fs.unlinkSync("video.mp4")
                    );
                });

        } catch (err) {
            console.error("Error fetching video:", err);
            api.sendMessage("❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", threadID, event.messageID);
        }
    }
};
