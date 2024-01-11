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
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();
			let errHandled = false;

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
				try {
					await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				}
				errHandled = true;
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.addFields(
					{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
					{ name: `Error handled?`, value: `${errHandled}`, inline: true },
				)
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