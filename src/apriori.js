import fs from 'fs';
import Combinatorics from 'js-combinatorics';

const SUPPORT = parseFloat(process.argv[2]) / 100;
const CONFIDENCE = parseFloat(process.argv[3]) / 100;
const FILE_SELECTION_INPUT = (!process.argv[4] || process.argv[4].trim() === '') ? './data/transactions1.txt' : process.argv[4];

const transactions = fs.readFileSync(FILE_SELECTION_INPUT, 'utf-8').trim().split(/\r?\n/);

console.log("\nTransactions being processed: \n");
transactions.forEach(trxRow => {
	console.log(trxRow);
});

const TOTAL_TRANSACTIONS = transactions.length;
const SUPPORT_COUNT = SUPPORT * TOTAL_TRANSACTIONS;

const transactionItems = transactions.map(trx => trx.split('\t').slice(1));
const totalTransactionItems = transactionItems.flat();
const ITEMS = Array.from(new Set(totalTransactionItems));

const uniqueItemCount = totalTransactionItems.reduce((acc, item) => {
	acc[item] = (acc[item] || 0) + 1;
	return acc;
}, {});

console.log("\n\nTotal number of transactions = ", TOTAL_TRANSACTIONS);
console.log("\nSupport Count is: ", SUPPORT_COUNT);

// Utility function to get array difference (a \ b)
const getDifference = (a, b) => a.filter(item => !b.includes(item));

// Utility function to check if arrays are strictly equal
const areArraysEqual = (a, b) => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

const getItemCombinationCount = (input) => {
	if (Array.isArray(input)) {
		let inputCount = 0;
		transactionItems.forEach(trxItem => {
			if (getDifference(input, trxItem).length === 0) {
				inputCount++;
			}
		});
		return inputCount;
	} else {
		return uniqueItemCount[input];
	}
};

const getItemCombinationConfidence = (leftItemSet, rightItemSet) => {
	return getItemCombinationCount([...leftItemSet, ...rightItemSet]) / getItemCombinationCount(leftItemSet);
};

const isConfidenceEnough = (leftItemSet, rightItemSet) => {
	return getItemCombinationConfidence(leftItemSet, rightItemSet) >= CONFIDENCE;
};

const printRule = (leftItemSet, rightItemSet) => {
	if (isConfidenceEnough(leftItemSet, rightItemSet)) {
		console.log("\nConfidence percentage for this rule is: ", (getItemCombinationConfidence(leftItemSet, rightItemSet) * 100).toFixed(2));
		console.log(leftItemSet.join(', '), "---->", rightItemSet.join(', '), "\n");
	}
};

//Print all association rules from frequentItemSet
const printAssociationRules = () => {
	if (frequentItemSet.length === 0) {
		console.log(`No association rules generated for Support of ${SUPPORT * 100}% and Confidence of ${CONFIDENCE * 100}%`);
	}
	frequentItemSet.forEach(frequentItem => {
		const indexLimit = Math.floor(frequentItem.length / 2) - 1;
		if (frequentItem.length === 2) {
			mapTwoItemSetIntoRules(frequentItem);
		} else if (frequentItem.length > 2) {
			for (let i = 0; i <= indexLimit; i++) {
				const leftSets = Combinatorics.combination(frequentItem, i + 1).toArray();
				leftSets.forEach(leftSetItem => {
					printRule(leftSetItem, getDifference(frequentItem, leftSetItem));
					printRule(getDifference(frequentItem, leftSetItem), leftSetItem);
				});
			}
		}
	});
};

//Print Rules for item sets of size 2
const mapTwoItemSetIntoRules = (frequentItem) => {
	printRule([frequentItem[0]], [frequentItem[1]]);
	printRule([frequentItem[1]], [frequentItem[0]]);
};

console.log("\n\nSupport values for single items:\n");
Object.entries(uniqueItemCount).forEach(([key, val]) => {
	console.log(key, " with support of ", val);
});

//Generating an array of single frequent item list
console.log("\n\n\nFrequent Item List for single items:\n");
const singleFrequentItemList = [];
Object.entries(uniqueItemCount).forEach(([key, val]) => {
	if (val >= SUPPORT_COUNT) {
		console.log(key, " with support of ", val);
		singleFrequentItemList.push(key);
	}
});

const cmb2 = Combinatorics.combination(singleFrequentItemList, 2);

const INITIAL = cmb2.toArray();
let iterationList = INITIAL.slice();
const frequentItemSet = [];
let setLength = 3;
const rejectedList = [];

//Check if the current item set is infrequent and previously rejected
const doesCombinationSubsetExistInRejectedList = (combination) => {
	const sortedCombination = [...combination].sort();
	return rejectedList.some(rejected => getDifference(rejected, sortedCombination).length === 0);
};

//Check if current item set already exists in frequentItemSet
const doesCombinationExistInFrequentItemSet = (combination) => {
	const sortedCombination = [...combination].sort();
	return frequentItemSet.some(frequent => areArraysEqual(frequent, sortedCombination));
};

console.log("\n\n\nSupport values for 2 item sets: \n");
iterationList.forEach(iterationItem => {
	console.log(iterationItem.join(', '), " with support of: ", getItemCombinationCount(iterationItem));
});

//Main Flow
while (iterationList.length > 1) {
	const iterationListWithCount = [];
	if (iterationList.length > 0)
		console.log("\n\n\nFrequent item list for " + (setLength - 1) + " item sets: \n");

	iterationList.forEach(iterationListCombination => {
		const itemCombinationCount = getItemCombinationCount(iterationListCombination);
		const sortedCombination = [...iterationListCombination].sort();
		if (itemCombinationCount >= SUPPORT_COUNT) {
			if (!doesCombinationExistInFrequentItemSet(sortedCombination)) {
				frequentItemSet.push(sortedCombination);
			}
			console.log(iterationListCombination.join(', '), " with support of: ", itemCombinationCount);
			iterationListWithCount.push(sortedCombination);
		} else {
			rejectedList.push(sortedCombination);
		}
	});

	iterationList = [];
	let nextCombination = [];
	if (iterationListWithCount.length >= 2) {
		nextCombination = Combinatorics.combination(iterationListWithCount, 2).toArray();
	}

	nextCombination.forEach(nxtCmbItem => {
		const tempCmb = Array.from(new Set([...nxtCmbItem[0], ...nxtCmbItem[1]]));
		const resultCmbArray = [];
		if (tempCmb.length > setLength) {
			nxtCmbItem[1].forEach(eachItemInSecondArray => {
				resultCmbArray.push([...nxtCmbItem[0], eachItemInSecondArray]);
			});
		} else {
			resultCmbArray.push(tempCmb);
		}

		resultCmbArray.forEach(resultItem => {
			const sortedResultItem = [...resultItem].sort();
			if (doesCombinationSubsetExistInRejectedList(sortedResultItem)) {
				rejectedList.push(sortedResultItem);
			} else if (!doesCombinationExistInFrequentItemSet(sortedResultItem)) {
				frequentItemSet.push(sortedResultItem);
				iterationList.push(sortedResultItem);
			}
		});
	});

	if (iterationList.length > 0)
		console.log("\n\n\nSupport values for " + setLength + " item sets: \n");

	iterationList.forEach(iterationItem => {
		console.log(iterationItem.join(', '), " with support of: ", getItemCombinationCount(iterationItem));
	});
	setLength++;
}

console.log("\n\nGENERATING ASSOCIATION RULES WITH CONFIDENCE VALUES\n");
printAssociationRules();