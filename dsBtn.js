let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, userMention, roleMention } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		let buttonID = interaction.customId;
		switch (buttonID) {
			case 'newFlightPlan':
				if (!Object.is(interaction.member.nickname, null)) {
					if (interaction.member.nickname.includes(`[R-`) || interaction.member.nickname.includes(`[F-`) || interaction.member.nickname.includes(`[D-`) || interaction.member.nickname.includes(`[T-`) && interaction.member.nickname.includes(`]`)) {

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

					} else {
						if (interaction.member._roles.includes(process.env.DUAL_CHARS_ROLE_ID)) {
							await interaction.reply({
								content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please ensure your name is in the follow format:\n> [callsign] Firstname Lastname\n\nIf you need help, please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
								ephemeral: true
							});
							return;
						} else {
							await interaction.reply({
								content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
								ephemeral: true
							});
							return;
						}
					}
				} else {
					await interaction.reply({
						content: `:exclamation: You don't have a nickname in this Discord. Please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
						ephemeral: true
					});
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
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