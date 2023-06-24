let moment = require('moment');
let { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports.stringSelectMenuSubmit = async (interaction) => {
	try {
		let selectStringMenuID = interaction.customId;
		switch (selectStringMenuID) {
			case 'starter':
				let select2 = new StringSelectMenuBuilder()
					.setCustomId('starter2')
					.setPlaceholder('Make a 2nd selection!')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Label 1')
							.setDescription('Description 1')
							.setValue('Value 1'),
					);
				let row2 = new ActionRowBuilder()
					.addComponents(select2);

				await interaction.reply({
					content: 'Pick a 2nd number...',
					components: [row2],
					ephemeral: true
				});
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
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
	}
};


