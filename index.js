const readline = require('readline');
const Queue = require('./Queue');
const PriorityQueue = require('./PriorityQueue');
const Stack = require('./Stack');
const FileManager = require('./FileManager');

const paymentQueue = new Queue();
const urgentQueue = new PriorityQueue();
const transactionStack = new Stack();
const dailyTransactions = [];
const overduePayments = []; // Track overdue payments

// Set up the interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to check if a payment is overdue
function isOverdue(dueDate) {
    const today = new Date();
    return today > new Date(dueDate); // Compare due date with current date
}

// Function to add payment requests
function addPaymentRequest() {
    rl.question('Enter User ID: ', (userId) => {
        rl.question('Enter Amount: ', (amount) => {
            rl.question('Enter Utility Type (electricity, water, gas): ', (utilityType) => {
                rl.question('Enter Due Date (YYYY-MM-DD): ', (dueDate) => {
                    rl.question('Is this an urgent request? (yes/no): ', (isUrgent) => {
                        const payment = { userId, amount: parseFloat(amount), utilityType, dueDate, date: new Date() };
                        
                        if (isOverdue(dueDate)) {
                            console.log('This payment is overdue.');
                            overduePayments.push(payment); // Mark as overdue
                        }

                        if (isUrgent.toLowerCase() === 'yes' || isOverdue(dueDate)) {
                            urgentQueue.enqueue(payment, 1);
                            console.log('Urgent/Overdue payment request added.');
                        } else {
                            paymentQueue.enqueue(payment);
                            console.log('Normal payment request added.');
                        }
                        mainMenu();  // Return to main menu after adding payment
                    });
                });
            });
        });
    });
}

// Function to process the next payment in line
async function processPayment() {
    let payment;
    if (!urgentQueue.isEmpty()) {
        payment = urgentQueue.dequeue();
        console.log('Processing urgent payment request.');
    } else if (!paymentQueue.isEmpty()) {
        payment = paymentQueue.dequeue();
        console.log('Processing regular payment request.');
    } else {
        console.log('No payments to process.');
        mainMenu();
        return;
    }

    // Process payment and record it in transaction stack
    transactionStack.push(payment);
    await FileManager.generateInvoice(payment);  // Generates PDF invoice
    dailyTransactions.push(payment);             // Logs transaction for the day
    console.log('Payment processed and invoice generated.');
    mainMenu();
}

// Function to undo the last processed payment
function undoLastPayment() {
    if (!transactionStack.isEmpty()) {
        const lastTransaction = transactionStack.pop();
        console.log('Last payment transaction undone:', lastTransaction);
    } else {
        console.log('No transactions to undo.');
    }
    mainMenu();
}

// Function to log daily transactions and overdue payments
async function logDailyTransactions() {
    await FileManager.logDailyTransactionsAndOverdues(dailyTransactions, overduePayments, 'json'); // Use 'csv' for CSV format
    console.log('Daily transactions and overdue payments logged successfully.');
    mainMenu();
}

// Function to display all transactions made
function displayAllTransactions() {
    if (dailyTransactions.length === 0) {
        console.log('No transactions have been processed yet.');
    } else {
        console.log('\n--- All Transactions ---');
        dailyTransactions.forEach((transaction, index) => {
            console.log(`\nTransaction ${index + 1}:`);
            console.log(`User ID: ${transaction.userId}`);
            console.log(`Amount: ${transaction.amount}`);
            console.log(`Utility Type: ${transaction.utilityType}`);
            console.log(`Due Date: ${transaction.dueDate}`);
            console.log(`Date Processed: ${transaction.date}`);
        });
    }
    mainMenu();
}

// Main menu to display options
function mainMenu() {
    console.log('\n--- Utility Bill Payment System ---');
    console.log('1. Add a Payment Request');
    console.log('2. Process Next Payment');
    console.log('3. Undo Last Payment');
    console.log('4. Log Daily Transactions');
    console.log('5. Display All Transactions');
    console.log('6. Exit');
    
    rl.question('Choose an option: ', (option) => {
        switch (option) {
            case '1':
                addPaymentRequest();
                break;
            case '2':
                processPayment();
                break;
            case '3':
                undoLastPayment();
                break;
            case '4':
                logDailyTransactions();
                break;
            case '5':
                displayAllTransactions();
                break;
            case '6':
                console.log('Exiting the system. Goodbye!');
                rl.close();
                break;
            default:
                console.log('Invalid option. Please try again.');
                mainMenu();
                break;
        }
    });
}

// Start the application
mainMenu();
