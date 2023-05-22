let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		let buttonID = interaction.customId;
		switch (buttonID) {
			case 'newFlightPlan':
				let newFlightPlanModal = new ModalBuilder()
					.setCustomId('newFlightPlanModal')
					.setTitle('Log a new Flight Plan');
				let departureLoc = new TextInputBuilder()
					.setCustomId('departureLocInput')
					.setLabel("What is your departure location?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Los Santos International Airport')
					.setRequired(true);
				let destinationLoc = new TextInputBuilder()
					.setCustomId('destinationLocInput')
					.setLabel("What is your destination location?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Sandy Shores Airfield')
					.setRequired(true);
				let flightPurpose = new TextInputBuilder()
					.setCustomId('flightPurposeInput')
					.setLabel("What is the purpose of this flight?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Recreational')
					.setRequired(true);
				let aircraftType = new TextInputBuilder()
					.setCustomId('aircraftTypeInput')
					.setLabel("What type of aircraft are you flying?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Maverick')
					.setRequired(true);
				let soulsCount = new TextInputBuilder()
					.setCustomId('soulsCountInput')
					.setLabel("How many souls do you have on board?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3')
					.setRequired(true);

				let departureLocRow = new ActionRowBuilder().addComponents(departureLoc);
				let destinationLocRow = new ActionRowBuilder().addComponents(destinationLoc);
				let flightPurposeRow = new ActionRowBuilder().addComponents(flightPurpose);
				let aircraftTypeRow = new ActionRowBuilder().addComponents(aircraftType);
				let soulsCountRow = new ActionRowBuilder().addComponents(soulsCount);

				newFlightPlanModal.addComponents(departureLocRow, destinationLocRow, flightPurposeRow, aircraftTypeRow, soulsCountRow);

				await interaction.showModal(newFlightPlanModal);

				console.log(`Registered button push for ${interaction.member.nickname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);

				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
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