// Import express module and save the router method to a variable (function allows new router objects to be created)
const router = require('express').Router();

// Global variable to store the point total available to the user
let pointTotal = 0;
// Global variable to store the running balances of points broken down by payer 
let payerBalances = {};
// Global variable that stores a list of objects that represents those sent to the 'add' route
let transactionHistory = [];

// Route below was used during development to view above global variables
router.route('/').get((req, res) => {
    res.send({points: pointTotal, balances: payerBalances, transactions: transactionHistory});
});

// Route that accepts GET requests to view the points available per payer
router.route('/balance').get((req, res) => {
    res.send(payerBalances);
});

// Route that accepts POST requests to add transactions to the user account
router.route('/add').post((req, res) => {
    const payer = req.body.payer; // Store the 'payer' from the request as a variable
    const points = req.body.points; // Store the 'points' from the request as a variable

    // Check that transaction points is not zero
    if (points === 0) {
        return res.status(422).json({ error: "Points cannot be equal to zero." });
    } 

    // Resolve changes to 'payerBalances'
    //// Check that transaction points will not cause a payer's balance to become negative
    if (((payerBalances[payer] + points) < 0) || (!payerBalances[payer] && points < 0)) {
        return res.status(422).json({ error: "Payer balance cannot dip below zero." });
    } else if (!payerBalances[payer]) { // Otherwise if no payer exists in 'payerBalances' create one
        payerBalances[payer] = points;
    } else { // Or add points to an existing payer
        payerBalances[payer] += points;
    }
    
    // Resolve changes to 'pointTotal'
    pointTotal += points; // Add or subtract transaction from the total point total

    // Resolve changes to 'transactionHistory'
    //// If transaction points is greater than zero, add the transaction to 'transactionHistory' and sort based on timestamp
    if (points > 0) { 
        transactionHistory.push(req.body);
        sortTransactions(transactionHistory);

    // If transaction points is less than zero, deduct the value from the most recent transaction by that given payer
    } else if (points < 0) { 
        // Set an array to keep track of the indexes of transactions that may be removed
        let deductedArray = []; 
        // Start the search on the last element of the transactionHistory array
        let index = transactionHistory.length - 1; 
        // Remainder will be the total amount left to be refunded
        let remainder = Math.abs(points);

        // Begin iterating down the transactionHistory array searching for a payers transactions that match the request
        //// Continue to deduct from transactions newest to oldest until the remainder reaches zero
        while (remainder > 0) { 
            // Store the current transaction as payer and point variables for ease of use
            let currentPayer = transactionHistory[index]['payer'];
            let currentPoints = transactionHistory[index]['points'];

            // Continue decrementing the index in transactionHistory until the payer matches that of the request body
            if (currentPayer === payer) {
                // Compare the remainder of points to be deducted to the current payer transaction
                //// When the remainder is equal to the current transaction, 
                ////// set the points to zero and add its index to the list to be removed
                if (currentPoints === remainder) { 
                    remainder = 0;
                    deductedArray.push(index);

                // When the current transaction has more points than the amount to be refunded,
                //// deduct the remainder from the current transaction and set the remainder to zero
                } else if (currentPoints > remainder) {
                    transactionHistory[index]['points'] -= remainder;
                    remainder = 0;

                // When the remainder amount exceeds the current transaction balance,
                //// Subtract the balance from the remainder then add the transaction index to the list to be removed
                } else {
                    deductedArray.push(index);
                    remainder -= currentPoints;
                };
            };
            index--;
        };

        // Iterate through the array of transactions to be removed
        //// Remove from transactionHistory based on index of transaction to be removed
        for (let i = 0; i < deductedArray.length; i++) {
            transactionHistory.splice(deductedArray[i], 1);
        };
    }
    
    // Submit a response that the transaction was successful
    res.status(200).json({ success: 'Transaction added!', transaction: req.body });
});

// Route that accepts POST requests to spend points from the user's total point balance
router.route('/spend').post((req, res) => {
    const points = req.body.points; // Store the points from the request body in a variable

    // Handle error for when request is zero or a negative integer
    if(points <= 0) {
        return res.status(422).json({ error: "The spend request must be greater than zero." });
    }

    // Handle error for when the user requests more points than they have available to spend
    if(points > pointTotal) {
        return res.status(422).json({ error: "Insufficent point balance." });
    }

    // Deduct the requested points from the point total
    pointTotal -= points;
    
    // Set an array to total points used per payer
    let payerSpending = [];
    // Set an array to keep track of the indexes of transactions that may be removed
    let deductedArray = [];
    // Start the search on the last element of the transactionHistory array
    //// This will be the oldest transaction based on timestamp
    let index = 0;
    // Remainder will be the total amount left to be refunded
    let remainder = points;

    // Begin iterating up the transactionHistory array 
    //// Continue to deduct from transactions oldest to newest until the remainder reaches zero
    ///// We are not concerned about the payer of the transactions, so long as the balances are deducted in order by timestamp
    while (remainder > 0) {
        // Store the current transaction as payer and point variables for ease of use
        let currentPayer = transactionHistory[index]['payer'];
        let currentPoints = transactionHistory[index]['points'];

        // Compare the remainder of points to be deducted to the current payer transaction
        //// When the remainder is equal to the current transaction, do the following
        if (currentPoints == remainder) {
            // Determine if the list of payerSpending has already accounted for the current payer
            //// If so, add the additional amount of points spent to the appropriate value in payerSpending
            ///// If not, create a new payer entry in payerSpending and add the remainder amount
            payerSpending.includes(currentPayer) ? payerSpending[currentPayer] += remainder : payerSpending[currentPayer] = remainder;
            
            // Deduct the remainder amount from the global payerBalance object
            payerBalances[currentPayer] -= remainder;
            
            // Set the remainder to zero and add its index to the list to be removed from transactionHistory
            //// This will cause the while loop to end
            remainder = 0;
            deductedArray.push(index);

        // When the current transaction has more points than the amount to be deducted, do the following
        } else if (currentPoints > remainder) {
            // Determine if the list of payerSpending has already accounted for the current payer
            //// If so, add the additional amount of points spent to the appropriate value in payerSpending
            ///// If not, create a new payer entry in payerSpending and add the remainder amount
            payerSpending.includes(currentPayer) ? payerSpending[currentPayer] += remainder : payerSpending[currentPayer] = remainder;
            
            // Deduct the remainder amount from the global payerBalance object
            payerBalances[currentPayer] -= remainder;

            // Deduct the remainder from the current transaction and set the remainder to zero
            transactionHistory[index]['points'] -= remainder;
            remainder = 0;

        // When the remainder amount exceeds the current transaction balance, do the following
        } else {
            // Determine if the list of payerSpending has already accounted for the current payer
            //// If so, add the additional amount of points spent to the appropriate value in payerSpending
            ///// If not, create a new payer entry in payerSpending and the amount deducted
            payerSpending.includes(currentPayer) ? payerSpending[currentPayer] += currentPoints : payerSpending[currentPayer] = currentPoints;
            
            // Deduct the currentPoint amount from the global payerBalance object
            payerBalances[currentPayer] -= currentPoints;

            // Subtract the balance from the remainder then add the transaction index to the list to be removed
            remainder -= currentPoints;
            deductedArray.push(index);
        }
        index++;
    }

    // Create a new array to be return with the response
    let responseData = [];
    // Format the responseData as an array of objects making points deducted negative to represent the withdrawal
    for (const payer in payerSpending) {
        responseData.push({ "payer": payer, "points": -1 * payerSpending[payer] });
    }

    // Iterate through the array of transactions to be removed
    //// Remove from transactionHistory based on index of transaction to be removed
    for (let i = deductedArray.length - 1; i >= 0; i--) {
        transactionHistory.splice(deductedArray[i],1);
    };

    // Submit a response that the expenditure was successful
    res.status(200).send(responseData);
});

// Helper function used to sort transactions according to timestamp
const sortTransactions = (arr) => {
    return (
        arr.sort((x, y) => {
            return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
        })
    ).reverse();
}

module.exports = router;