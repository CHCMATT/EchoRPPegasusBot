let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (let i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function strCleanup(str) {
	let cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		let modalID = interaction.customId;
		switch (modalID) {
			case 'addRegularCarSaleModal':
				let salesmanName;
				if (interaction.member.nickname) {
					salesmanName = interaction.member.nickname;
				} else {
					salesmanName = interaction.member.user.username;
				}

				let now = Math.floor(new Date().getTime() / 1000.0);
				let saleDate = `<t:${now}:d>`;

				let soldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('soldToInput')));
				let vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleNameInput')));
				let vehiclePlate = strCleanup(interaction.fields.getTextInputValue('vehiclePlateInput')).toUpperCase();
				let price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				let notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Regular`, `${salesmanName} (<@${interaction.user.id}>)`, saleDate, soldTo, vehicleName, vehiclePlate, price, notes]] }
				});

				let formattedPrice = formatter.format(price);

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let costPrice = (price * 0.90);
				let laProfit = price - costPrice;
				let commission25Percent = (laProfit * 0.25);
				let commission30Percent = (laProfit * 0.30);

				let formattedCostPrice = formatter.format(costPrice);
				let formattedLaProfit = formatter.format(laProfit);

				if (!notes || notes.toLowerCase() === "n/a") {
					let carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						)
						.setColor('03045E')];
				} else {
					let carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('03045E')];
				}

				let personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: carSoldEmbed });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "weeklyCarsSold");
				await dbCmds.addCommission(interaction.member.user.id, commission25Percent, commission30Percent);
				let commissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				if (weeklyCarsSold < 100) {
					let commissionPercent = "25%";
					let thisSaleCommission = commission25Percent
					let currentCommission = commissionArray.commission25Percent;
				} else {
					let commissionPercent = "30%";
					let thisSaleCommission = commission30Percent;
					let currentCommission = commissionArray.commission30Percent;
				}

				let overallCommission25Percent = commissionArray.commission25Percent;
				let overallCommission30Percent = commissionArray.commission30Percent;
				let formattedOverall25PercentComm = formatter.format(overallCommission25Percent);
				let formattedOverall30PercentComm = formatter.format(overallCommission30Percent);
				let formattedThisSale25PercentComm = formatter.format(commission25Percent);
				let formattedThisSale30PercentComm = formatter.format(commission30Percent);
				let formattedThisSaleCommission = formatter.format(thisSaleCommission);
				let formattedCurrentCommission = formatter.format(currentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let newCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				let reason = `Car Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				let notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added to <@${interaction.user.id}>'s commission:\n• **25%:** \`${formattedThisSale25PercentComm}\`\n• **30%:** \`${formattedThisSale30PercentComm}\`\n\nTheir new totals are:\n• **25%:** \`${formattedOverall25PercentComm}\`\n• **30%:** \`${formattedOverall30PercentComm}\`\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${newCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Luxury Autos Profit: \`${formattedLaProfit}\`\n> Your Commission: \`${formattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${commissionPercent}\`): \`${formattedCurrentCommission}\`.`, ephemeral: true });
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
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