const fs = require('fs-extra');
const PDFDocument = require('pdfkit');
const path = require('path');
const { Parser } = require('json2csv'); // For CSV output

class FileManager {
    static async generateInvoice(payment) {
        const doc = new PDFDocument();
        const invoicePath = path.join(__dirname, 'data', 'invoices', `Invoice_${payment.userId}_${Date.now()}.pdf`);

        doc.pipe(fs.createWriteStream(invoicePath));
        doc.text(`User ID: ${payment.userId}`);
        doc.text(`Amount: ${payment.amount}`);
        doc.text(`Utility Type: ${payment.utilityType}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.end();
    }

    static async logDailyTransactionsAndOverdues(transactions, overduePayments, format = 'json') {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const logDir = path.join(__dirname, 'data', 'auditLogs');
        await fs.ensureDir(logDir);

        const filePath = path.join(logDir, `transactions_${date}.${format}`);
        let dataToSave;

        if (format === 'json') {
            dataToSave = { date, transactions, overduePayments };
            await fs.writeJSON(filePath, dataToSave, { spaces: 2 });
        } else if (format === 'csv') {
            const json2csvParser = new Parser();
            const transactionsCsv = json2csvParser.parse(transactions);
            const overdueCsv = json2csvParser.parse(overduePayments);
            dataToSave = `Transactions:\n${transactionsCsv}\n\nOverdue Payments:\n${overdueCsv}`;
            await fs.writeFile(filePath, dataToSave);
        }

        console.log(`Daily transactions and overdue payments logged to ${filePath}`);
    }
}

module.exports = FileManager;
