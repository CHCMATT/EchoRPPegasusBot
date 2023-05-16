var moment = require('moment');
var dbCmds = require('./dbCmds.js');
var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editMainEmbed = async (client) => {
	try {
		// theme color palette: https://coolors.co/2b0000-4f0000-740000-980000-b50000-d30000-eb1d1d-f50f0f-ff0000
		let flightPlanEmbed = new EmbedBuilder()
			.setTitle('File a new Flight Plan')
			.setDescription('Press the button below to file a new Flight Plan!')
			.setColor('4F0000');

		let currEmbed = await dbCmds.readMsgId("embedMsg");

		let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
		let currMsg = await channel.messages.fetch(currEmbed);

		let btnRows = addBtnRows();

		currMsg.edit({ embeds: [flightPlanEmbed], components: btnRows });
	} catch (error) {
		let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		let fileParts = __filename.split(/[\\/]/);
		let fileName = fileParts[fileParts.length - 1];

		let errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('newFlightPlan')
			.setLabel('File a Flight Plan')
			.setStyle(ButtonStyle.Primary),
	);

	let rows = [row1];
	return rows;
};