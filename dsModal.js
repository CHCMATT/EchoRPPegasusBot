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
		let modalID = interaction.customId;
		switch (modalID) {
			case 'newFlightPlanModal':
				console.log(`Started processing flight plan for ${interaction.member.nickname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
				let pilotName;
				let pilotCallsign;
				if (interaction.member.nickname && interaction.member.nickname.includes(`[T-`) || interaction.member.nickname.includes(`[D-`) && interaction.member.nickname.includes(`]`)) {
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

					if (departureLoc == "Lsia" || departureLoc == "Ssa" || departureLoc == "Ss" || departureLoc == "Gs" || departureLoc == "Gsa" || departureLoc == "Cp" || departureLoc == "Cpa" || departureLoc == "Saf") {
						departureLoc = departureLoc.toUpperCase();
					}
					if (destinationLoc == "Lsia" || destinationLoc == "Ssa" || destinationLoc == "Ss" || destinationLoc == "Gsa" || destinationLoc == "Gs" || destinationLoc == "Cp" || destinationLoc == "Cpa" || destinationLoc == "Saf") {
						destinationLoc = destinationLoc.toUpperCase();
					}

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Flight Plans!A:H", valueInputOption: "RAW", resource: { values: [[pilotCallsign, pilotName, flightDate, departureLoc, destinationLoc, flightPurpose, aircraftType, soulsCount]] }
					});

					if (isNaN(soulsCount)) { // validate quantity of souls on board
						await interaction.reply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('soulsCountInput')}\` is not a valid number, please be sure to only enter numbers.`,
							ephemeral: true
						});
						return;
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

					console.log(`Sent flightPlanEmbed for flight plan for ${interaction.member.nickname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);

					let usableCommand = `/311 [ATC] Pegasus Airlines | Aircraft: ${aircraftType} | Departure: ${departureLoc} | Arrival: ${destinationLoc} | Radio 919.1 | Callsign: ${pilotCallsign}`

					console.log(`Set usableCommand for flight plan for ${interaction.member.nickname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);

					await interaction.reply({
						content: `Successfully registered your flight!\n\nYour relevant 311 call details are below:\n${quote(usableCommand)}`,
						ephemeral: true
					});

					console.log(`Sent ephemeral reply for flight plan for ${interaction.member.nickname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
				} else {
					await interaction.reply({
						content: `:exclamation: Unable to determine your callsign and name from your current Discord nickname. Please tag the ${roleMention(`1106468091266863114`)} role, ${userMention(`198291969741422592`)}, or ${userMention(`572556642982559764`)} to assist.`,
						ephemeral: true
					});
				}
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
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
};