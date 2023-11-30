let moment = require('moment');
let { EmbedBuilder, time, quote, userMention, roleMention } = require('discord.js');

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (let i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function toSentenceCase(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);;
}

function strCleanup(str) {
	let cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		let modalID = interaction.customId;
		switch (modalID) {
			case 'newFlightPlanModal':
				if (!Object.is(interaction.member.nickname, null)) {
					if (interaction.member.nickname.includes(`[R-`) || interaction.member.nickname.includes(`[F-`) || interaction.member.nickname.includes(`[D-`) || interaction.member.nickname.includes(`[T-`) && interaction.member.nickname.includes(`]`)) {
						let pilotName;
						let pilotCallsign;
						discordNick = interaction.member.nickname
						pilotCallsign = discordNick.substring((discordNick.indexOf(`[`) + 1), discordNick.indexOf(`]`));
						pilotName = discordNick.substring((discordNick.indexOf(`]`) + 2));

						let today = new Date();
						let flightDate = time(today, 'd');

						let departureLoc = toTitleCase(strCleanup(interaction.fields.getTextInputValue('departureLocInput')));
						let destinationLoc = toTitleCase(strCleanup(interaction.fields.getTextInputValue('destinationLocInput')));
						let flightPurpose = toSentenceCase(strCleanup(interaction.fields.getTextInputValue('flightPurposeInput')));
						let aircraftType = toTitleCase(strCleanup(interaction.fields.getTextInputValue('aircraftTypeInput')));
						let soulsCount = strCleanup(interaction.fields.getTextInputValue('soulsCountInput'));

						if (departureLoc.length <= 4 && departureLoc !== "Cayo") {
							departureLoc = departureLoc.toUpperCase();
						}
						if (destinationLoc.length <= 4 && destinationLoc !== "Cayo") {
							destinationLoc = destinationLoc.toUpperCase();
						}

						await interaction.client.googleSheets.values.append({
							auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Flight Plans!A:H", valueInputOption: "RAW", resource: { values: [[pilotCallsign, pilotName, flightDate, departureLoc, destinationLoc, flightPurpose, aircraftType, soulsCount]] }
						});

						if (isNaN(soulsCount)) { // validate quantity of souls on board
							await interaction.editReply({
								content: `:exclamation: \`${interaction.fields.getTextInputValue('soulsCountInput')}\` is not a valid number, please be sure to only enter numbers.`,
								ephemeral: true
							});
							return;
						}

						if (!pilotName) {
							if (interaction.member._roles.includes(process.env.DUAL_CHARS_ROLE_ID)) {
								await interaction.editReply({
									content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please ensure your nickname is in the follow format:\n> [callsign] Firstname Lastname\n\nIf you need help, please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
									ephemeral: true
								});
								return;
							} else {
								await interaction.editReply({
									content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
									ephemeral: true
								});
								return;
							}
						}

						let flightPlanEmbed = new EmbedBuilder()
							.setTitle('A new Flight Plan has been registered!')
							.addFields(
								{ name: `Pilot Name:`, value: `${pilotName}`, inline: true },
								{ name: `Callsign:`, value: `${pilotCallsign}`, inline: true },
								{ name: `Flight Date:`, value: `${flightDate}` },
								{ name: `Departing From:`, value: `${departureLoc}`, inline: true },
								{ name: `Destination:`, value: `${destinationLoc}`, inline: true },
								{ name: `Flight Purpose:`, value: `${flightPurpose}` },
								{ name: `Aircraft Type:`, value: `${aircraftType}`, inline: true },
								{ name: `Souls on Board:`, value: `${soulsCount}`, inline: true },
							)
							.setColor('740000');

						await interaction.client.channels.cache.get(process.env.FLIGHT_LOG_CHANNEL_ID).send({ embeds: [flightPlanEmbed] });

						let usableCommand = `/311 [ATC] Pegasus Airlines | Aircraft: ${aircraftType} | Departure: ${departureLoc} | Arrival: ${destinationLoc} | Radio 919.1 | Callsign: ${pilotCallsign}`

						await interaction.editReply({
							content: `Successfully registered your flight!\n\nYour relevant 311 call details are below:\n${quote(usableCommand)}`,
							ephemeral: true
						});

					} else {
						if (interaction.member._roles.includes(process.env.DUAL_CHARS_ROLE_ID)) {
							await interaction.editReply({
								content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please ensure your nickname is in the follow format:\n> [callsign] Firstname Lastname\n\nIf you need help, please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
								ephemeral: true
							});
							return;
						} else {
							await interaction.editReply({
								content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
								ephemeral: true
							});
							return;
						}
					}
				} else {
					await interaction.editReply({
						content: `:exclamation: You don't have a nickname in this Discord. Please tag the ${roleMention(process.env.NICKNAME_FIX_ROLE_ID)} role, or ${userMention(`572556642982559764`)} directly to assist.`,
						ephemeral: true
					});
				}
				break;
			default:
				await interaction.editReply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
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