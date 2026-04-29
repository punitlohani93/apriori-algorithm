# Apriori Algorithm Implementation in Node.js

## Overview
This repository contains an implementation of the **Apriori algorithm** in Node.js. It reads a text file containing transaction records, determines the frequent itemsets based on a given support threshold, and generates association rules using a confidence threshold.

## What is the Apriori Algorithm?
The Apriori algorithm is a classic algorithm used in data mining for learning association rules over relational databases. It is widely used in market basket analysis to discover interesting relationships between different products that customers frequently purchase together.

### Key Concepts
* **Support**: The frequency of an item or an itemset in the dataset. It is the number of transactions that include all items in the itemset divided by the total number of transactions.
  * `Support(A) = (Transactions containing A) / (Total Transactions)`
* **Confidence**: The likelihood that an item B is also bought if item A is bought.
  * `Confidence(A -> B) = Support(A ∪ B) / Support(A)`
* **Frequent Itemset**: An itemset whose support is greater than or equal to a minimum support threshold (min_sup).
* **Association Rule**: An implication of the form `A -> B` where A and B are disjoint itemsets. A rule is considered strong if it satisfies both minimum support and minimum confidence thresholds.

## How the Algorithm Works (Visualized)
The Apriori algorithm employs an iterative approach known as a level-wise search, where k-itemsets are used to explore (k+1)-itemsets.

### Step-by-Step Example

**1. Initial Database of Transactions**
Imagine we have 4 transactions (T1 to T4) at a grocery store:

| Transaction ID | Items Bought |
|---|---|
| T1 | Apple, Banana, Cherry |
| T2 | Apple, Banana |
| T3 | Apple, Cherry |
| T4 | Banana, Cherry |

Let's assume our **Minimum Support threshold is 50% (0.5)**, which means an itemset must appear in at least 2 out of 4 transactions to be frequent.

**2. Finding 1-Itemsets (L1)**
First, the algorithm counts the occurrences of each individual item (Candidate 1-itemsets, C1).

| Itemset | Count | Support | Frequent? |
|---|---|---|---|
| {Apple} | 3 | 75% | **Yes** |
| {Banana} | 3 | 75% | **Yes** |
| {Cherry} | 3 | 75% | **Yes** |

All items meet the minimum support.

**3. Finding 2-Itemsets (L2)**
Next, the algorithm generates candidate 2-itemsets (C2) from the frequent 1-itemsets and counts their occurrences.

| Candidate Itemset (C2) | Count | Support | Frequent? |
|---|---|---|---|
| {Apple, Banana} | 2 | 50% | **Yes** |
| {Apple, Cherry} | 2 | 50% | **Yes** |
| {Banana, Cherry} | 2 | 50% | **Yes** |

**4. Generating Association Rules**
Finally, using the frequent itemsets, the algorithm generates rules and filters them by the **Minimum Confidence threshold**.
Let's assume our **Minimum Confidence is 60%**.

For the frequent itemset `{Apple, Banana}`, we have rules:
* `{Apple} -> {Banana}`: Confidence = Support({Apple, Banana}) / Support({Apple}) = 2/3 ≈ 66.7% (>= 60%, **Strong Rule**)
* `{Banana} -> {Apple}`: Confidence = Support({Apple, Banana}) / Support({Banana}) = 2/3 ≈ 66.7% (>= 60%, **Strong Rule**)

The algorithm continues generating combinations until no more frequent itemsets can be found.

## What This Program Does
This Node.js script (`apriori.js`) implements the algorithm described above. It reads transactions from a specified text file where each line is a transaction.

### Input File Format
The program expects text files (like `transactions1.txt`) formatted with a transaction ID followed by tab-separated items:
```
100	Diapers	BabySoap	BodyWash	Deodorant
101	VRHeadSet	Batteries	Moisturizer	Remote	Mobile
```

### How to Run
Ensure you have [Node.js](https://nodejs.org/) installed, and run `npm install` to install dependencies (`lodash`, `js-combinatorics`).

You can run the script via the command line using:
```bash
node apriori.js <support_percentage> <confidence_percentage> [optional_transaction_file]
```

**Arguments:**
1. `<support_percentage>`: The minimum support value (e.g., `40` for 40%).
2. `<confidence_percentage>`: The minimum confidence value (e.g., `25` for 25%).
3. `[optional_transaction_file]`: Path to the transaction file. Defaults to `./transactions1.txt` if not provided.

**Example:**
```bash
node apriori.js 40 25 transactions1.txt
```
Or use the npm scripts defined in `package.json`:
```bash
npm run apriori-default
```

### Output
The script will output:
1. The parsed transactions and total count.
2. Support values for individual frequent items.
3. Iterative output showing support values for 2-itemsets, 3-itemsets, and so on.
4. The final list of association rules that satisfy the minimum confidence, like:
   `Diapers ----> BabySoap` with its confidence percentage.
