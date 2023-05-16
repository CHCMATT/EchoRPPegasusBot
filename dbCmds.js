let summaryInfo = require('./schemas/summaryInfo');

// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	let result = await summaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 });
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};