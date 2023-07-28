require('discord.js');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	let mainChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let mainEmbed = await dbCmds.readMsgId("embedMsg");

	try {
		await mainChannel.messages.fetch(mainEmbed);
		editEmbed.editMainEmbed(client);
		return "edited";
	} catch (error) {
		postEmbed.postMainEmbed(client);
		return "posted";
	}
};