const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "arrest",
		aliases: ["arrest"],
		version: "1.1",
		author: "Aminulsordar",
		countDown: 5,
		role: 0,
		shortDescription: "Arrest the tagged user",
		longDescription: "Generate an arrest meme with mentioned users' avatars.",
		category: "image",
		guide: {
			en: "{pn} [@tag]",
			vi: "{pn} [@tag]"
		}
	},

	onStart: async function ({ message, args, api, event }) {
		try {
			const mention = Object.keys(event.mentions);

			// If no mention → error
			if (mention.length === 0) {
				return message.reply("⚠️ Please mention someone to arrest!");
			}

			// Take IDs
			const user1 = mention.length === 1 ? event.senderID : mention[1];
			const user2 = mention[0];

			// Generate image
			const filePath = await createArrestImage(user1, user2);

			// Send reply
			message.reply({
				body: "🚔 You are under arrest!",
				attachment: fs.createReadStream(filePath)
			});
		} catch (err) {
			console.error(err);
			message.reply("❌ Something went wrong while generating the arrest image.");
		}
	}
};

//==============================//
//       Arrest Image Maker     //
//==============================//

async function createArrestImage(user1, user2) {
	// Save file path
	const fileName = "arrest_output.png";
	const filePath = path.join(__dirname, fileName);

	// Always ensure file exists (auto create)
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, "");
	}

	// Read avatars
	const av1 = await jimp.read(`https://graph.facebook.com/${user1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
	const av2 = await jimp.read(`https://graph.facebook.com/${user2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

	// Circle crop
	av1.circle();
	av2.circle();

	// Load base template
	const base = await jimp.read("https://i.ibb.co/9kByCHJS/upload.jpg");

	// Resize + composite avatars
	base
		.resize(500, 500)
		.composite(av1.resize(100, 100), 375, 9)    // Arresting officer
		.composite(av2.resize(100, 100), 160, 92);  // Criminal

	// Save output
	await base.writeAsync(filePath);

	return filePath;
  }
