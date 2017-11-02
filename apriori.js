var _ = require('lodash')
var fs = require('fs')
const SUPPORT = parseFloat(process.argv[2])/100
const CONFIDENCE = parseFloat(process.argv[3])/100
var Combinatorics = require('js-combinatorics')
const FILE_SELECTION_INPUT = _.isEmpty(process.argv[4]) ? './transactions1.txt' : process.argv[4];
var transactions = fs.readFileSync(FILE_SELECTION_INPUT).toString().split('\r\n')
console.log("\nTransactions being processed: \n")
_.forEach(transactions, trxRow => {
	console.log(trxRow)
})
const TOTAL_TRANSACTIONS = transactions.length
const SUPPORT_COUNT = SUPPORT * TOTAL_TRANSACTIONS
var transactionItems = _.map(transactions, trx => trx.split('\t').slice(1))
var totalTransactionItems = _.flatten(transactionItems)
const ITEMS = _.uniq(totalTransactionItems)
var uniqueItemCount = _.countBy(totalTransactionItems)

console.log("\n\nTotal number of transactions = ",TOTAL_TRANSACTIONS)
console.log("\nSupport Count is: ",SUPPORT_COUNT)

const getItemCombinationCount = (input) => {
	if (Array.isArray(input)) {
		let inputCount = 0
		_.forEach(transactionItems, trxItem => {
			if (_.difference(input, trxItem).length === 0) {
				inputCount++
			}
		})
		return inputCount
	} else {
		return uniqueItemCount[input];
	}
}

const getItemCombinationConfidence = (leftItemSet, rightItemSet) => {
	return getItemCombinationCount(_.concat(leftItemSet, rightItemSet)) / getItemCombinationCount(leftItemSet)
}

const isConfidenceEnough = (leftItemSet, rightItemSet) => {
	return getItemCombinationConfidence(leftItemSet, rightItemSet) >= CONFIDENCE
}

const printRule = (leftItemSet, rightItemSet) => {
	if (isConfidenceEnough(leftItemSet, rightItemSet)) {
		console.log("\nConfidence percentage for this rule is: ",(getItemCombinationConfidence(leftItemSet, rightItemSet) * 100).toFixed(2))
		console.log(leftItemSet.join(', '), "---->", rightItemSet.join(', '), "\n")
	}
}

//Print all association rules from frequentItemSet
const printAssociationRules = () => {
	if(frequentItemSet.length === 0) {
		console.log(`No association rules generated for Support of ${SUPPORT*100}% amd Confidence of ${CONFIDENCE*100}%`)
	}
	_.forEach(frequentItemSet, frequentItem => {
		let indexLimit = Math.floor(frequentItem.length/2) - 1
		if(frequentItem.length === 2) {
			mapTwoItemSetIntoRules(frequentItem)
		} else if(frequentItem.length > 2) {
			for(var i=0;i<=indexLimit;i++) {
				let leftSets = Combinatorics.combination(frequentItem, i+1).toArray()
				_.forEach(leftSets, leftSetItem => {
					printRule(leftSetItem, _.difference(frequentItem, leftSetItem))
					printRule(_.difference(frequentItem, leftSetItem), leftSetItem)
				})
			}
		}
	})
}

//Print Rules for item sets of  size 2
const mapTwoItemSetIntoRules = (frequentItem) => {
	printRule([frequentItem[0]], [frequentItem[1]])
	printRule([frequentItem[1]], [frequentItem[0]])
}

console.log("\n\nSupport values for single items:\n")
_.forIn(uniqueItemCount, (val, key) => {
	console.log(key, " with support of ", val)
})

//Generating an array of single frequent item list
console.log("\n\n\nFrequent Item List for single items:\n")
var singleFrequentItemList = []
_.forIn(uniqueItemCount, (val, key) => {
	if(val >= SUPPORT_COUNT) {
		console.log(key, " with support of ", val)
		singleFrequentItemList.push(key)
	}
})

var cmb2 = Combinatorics.combination(singleFrequentItemList, 2)

const INITIAL = cmb2.toArray()
var iterationList = INITIAL.slice()
var frequentItemSet = []
var setLength = 3
var rejectedList = []

//Check if the current item set is infrequent and previously rejected
const doesCombinationSubsetExistInRejectedList = (combination) => {
	let exists = false
	for(var i=0;i<rejectedList.length;i++) {
		if(_.difference(rejectedList[i], combination.sort()).length === 0) {
			exists = true
			break
		}
	}
	return exists
}

//Check if current item set already exists in frequentItemSet
const doesCombinationExistInFrequentItemSet = (combination) => {
	let exists = false;
	for(var i=0;i<frequentItemSet.length;i++) {
		if(_.isEqual(frequentItemSet[i], combination.sort())) {
			exists = true
			break
		}
	}
	return exists
}

console.log("\n\n\nSupport values for 2 item sets: \n")
_.forEach(iterationList, iterationItem => {
	console.log(iterationItem.join(', '), " with support of: ", getItemCombinationCount(iterationItem))
})


//Main Flow
while (iterationList.length > 1) {
	let iterationListWithCount = []
	if(iterationList.length > 0)
		console.log("\n\n\nFrequent item list for "+(setLength-1)+" item sets: \n")
	_.forEach(iterationList, iterationListCombination => {
		let itemCombinationCount = getItemCombinationCount(iterationListCombination)
		if (itemCombinationCount >= SUPPORT_COUNT) {
			if(!doesCombinationExistInFrequentItemSet(iterationListCombination.sort())) {
				frequentItemSet.push(iterationListCombination.sort())	
			}
			console.log(iterationListCombination.join(', '), " with support of: ", itemCombinationCount)
			iterationListWithCount.push(iterationListCombination.sort())
		} else {
			rejectedList.push(iterationListCombination.sort())
		}
	})

	iterationList = []
	let nextCombination = []
	if(iterationListWithCount.length > 0) {
		nextCombination = Combinatorics.combination(iterationListWithCount, 2).toArray()
	}
	
	_.forEach(nextCombination, nxtCmbItem => {	
		let tempCmb = _.uniq(_.concat(nxtCmbItem[0],nxtCmbItem[1]))
		let resultCmbArray = []
		if(tempCmb.length > setLength) {
			_.forEach(nxtCmbItem[1], eachItemInSecondArray => {
				resultCmbArray.push(_.concat(nxtCmbItem[0], eachItemInSecondArray))	
			})
		} else {
			resultCmbArray.push(tempCmb)
		}
		_.forEach(resultCmbArray, resultItem => {
			let sortedResultItem = resultItem.sort()
			if(doesCombinationSubsetExistInRejectedList(sortedResultItem)) {
				rejectedList.push(sortedResultItem)
			} else if(!doesCombinationExistInFrequentItemSet(sortedResultItem)) {
				frequentItemSet.push(sortedResultItem)
				iterationList.push(sortedResultItem)
			}
		})
	})
	if(iterationList.length > 0)
		console.log("\n\n\nSupport values for "+setLength+" item sets: \n")
	_.forEach(iterationList, iterationItem => {
		console.log(iterationItem.join(', '), " with support of: ", getItemCombinationCount(iterationItem))
	})
	setLength++
}


console.log("\n\nGENERATING ASSOCIATION RULES WITH CONFIDENCE VALUES\n")
printAssociationRules()