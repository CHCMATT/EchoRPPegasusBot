let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`An error occured at ${errTime} at file ${fileName}!`);

			let errString = error.toString();

			if (errString === 'Error: The service is currently unavailable.') {
				try {
					await interaction.editReply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
				}
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
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