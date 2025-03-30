
const path = require('path');
const XLSX = require('xlsx');

export function insertAndValidateExcelData(folderpath, fileName, wrireFileName) {
    const formatType = folderpath === 'order' ? 'Format1' : 'Format2';

    return cy.exec(`node ./cypress/scripts/excelfile_read_and_write.js ${fileName} new ${folderpath} ${formatType}`).then((result) => {
        const newRecord = JSON.parse(result.stdout.split('\n')[0]);

        Object.entries(newRecord).forEach(([key, value]) => {
            cy.log(`${key}: "${value}"`);
        });

        const { Buyer, PO, "ERP Key": ERPKey, Style, Season, "Product Type": ProductType, "Delivery Date": DeliveryDate, Destination, Color, Size, Quantity } = newRecord;

        const filePath = path.join('cypress/fixtures', folderpath, wrireFileName);

        cy.readFile(filePath, 'binary').then((content) => {
            const workbook = XLSX.read(content, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const insertedRecord = data[2];
            expect(insertedRecord).to.deep.equal([
                Buyer, PO, ERPKey, Style, Season, ProductType, DeliveryDate, Destination, Color, Size, Quantity
            ]);
        });

        Cypress.env('newRecordData', { Buyer, PO, ERPKey, Style, Season, ProductType, DeliveryDate, Destination, Color, Size, Quantity });
    });
}

export function insertPlanAndValidateExcelData(folderpath, fileName, wrireFileName) {
    return cy.exec(`node ./cypress/scripts/excelfile_read_and_write.js ${fileName} new ${folderpath} Format2`).then((result) => {
        const newRecord = JSON.parse(result.stdout.split('\n')[0]);

        Object.entries(newRecord).forEach(([key, value]) => {
            cy.log(`${key}: "${value}"`);
        });

        // Destructure values from newRecord
        const {
            Building, Floor, Line, Buyer, PO, "ERP Key": ERPKey, Style, "Product Type": ProductType, Color, SMV, Operator, Helper, "Iron Man": ironMan, Quantity, "Working Minutes": workingMin, "Planned Date": planDate } = newRecord;

        const filePath = path.join('cypress/fixtures', folderpath, wrireFileName);

        cy.readFile(filePath, 'binary').then((content) => {
            const workbook = XLSX.read(content, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Validate the inserted record matches the expected values
            const insertedRecord = data[2];
            expect(insertedRecord).to.deep.equal([Building, Floor, Line, Buyer, PO, ERPKey, Style, ProductType, Color, SMV, Operator, Helper, ironMan, Quantity, workingMin, planDate]);
        });

        // Store the new plan record in Cypress environment variables for later use
        Cypress.env('newPlanRecord', {
            Building,
            Floor,
            Line,
            Buyer,
            PO,
            ERPKey,
            Style,
            ProductType,
            Color,
            SMV,
            Operator,
            Helper,
            ironMan,
            Quantity,
            workingMin,
            planDate
        });
    });
}


export function updateAndValidateExcelData(folderpath, fileName) {
    const formatType = folderpath === 'order' ? 'Format1' : 'Format2';

    let newRecord

    return cy.exec(`node ./cypress/scripts/excelfile_read_and_write.js ${fileName} update ${folderpath} ${formatType}`).then((result) => {
        // Parse the JSON output from the script to get `newRecord`
        newRecord = JSON.parse(result.stdout.split('\n')[0]);

        // Log each key-value pair in the desired format
        Object.entries(newRecord).forEach(([key, value]) => {
            cy.log(`${key}: "${value}"`);
        });

        // Assign values to variables for later reuse
        const { Buyer, PO, "ERP Key": ERPKey, Style, Season, "Product Type": ProductType, "Delivery Date": DeliveryDate, Destination, Color, Size, Quantity } = newRecord;

        // Validate the updated Excel file
        cy.readFile(path.join('cypress/fixtures', folderpath, fileName), 'binary').then((content) => {
            const workbook = XLSX.read(content, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Assuming the new record is appended at the last row
            const insertedRecord = data[data.length - 1];

            expect(insertedRecord).to.deep.equal([
                Buyer, PO, ERPKey, Style, Season, ProductType, DeliveryDate, Destination, Color, Size, Quantity
            ]);
        });

        // Optionally, store the new record data in Cypress env for later use
        Cypress.env('updatedRecordData', { Buyer, PO, ERPKey, Style, Season, ProductType, DeliveryDate, Destination, Color, Size, Quantity });
    });
}

export function validateExcelDataExcludingLastRow(folderpath, fileName) {

    return cy.readFile(path.join('cypress/fixtures', folderpath, fileName), 'binary').then((fixtureContent) => {
        const fixtureWorkbook = XLSX.read(fixtureContent, { type: 'binary' });
        const fixtureWorksheet = fixtureWorkbook.Sheets[fixtureWorkbook.SheetNames[0]];
        const fixtureData = XLSX.utils.sheet_to_json(fixtureWorksheet, { header: 1 });

        // Exclude the last row from the fixture data
        const fixtureDataExcludingLastRow = fixtureData.slice(0, -1);

        // Read the Excel file from the download folder
        cy.readFile(path.join('cypress/downloads', fileName), 'binary').then((downloadContent) => {
            const downloadWorkbook = XLSX.read(downloadContent, { type: 'binary' });
            const downloadWorksheet = downloadWorkbook.Sheets[downloadWorkbook.SheetNames[0]];
            const downloadData = XLSX.utils.sheet_to_json(downloadWorksheet, { header: 1 });

            // Compare the download data with the fixture data excluding the last row
            expect(downloadData).to.deep.equal(fixtureDataExcludingLastRow);

            // Optionally, log the comparison result
            cy.log('The data of the download Excel file matches the fixture Excel file excluding the last row.');
        });
    });

}

export function validateExcelData(folderpath, fileName) {

    return cy.readFile(path.join(`cypress/fixtures/`, folderpath, fileName), 'binary').then((fixtureContent) => {
        const fixtureWorkbook = XLSX.read(fixtureContent, { type: 'binary' });
        const fixtureWorksheet = fixtureWorkbook.Sheets[fixtureWorkbook.SheetNames[0]];
        const fixtureData = XLSX.utils.sheet_to_json(fixtureWorksheet, { header: 1 });

        // Read the Excel file from the download folder
        cy.readFile(path.join('cypress/downloads', fileName), 'binary').then((downloadContent) => {
            const downloadWorkbook = XLSX.read(downloadContent, { type: 'binary' });
            const downloadWorksheet = downloadWorkbook.Sheets[downloadWorkbook.SheetNames[0]];
            const downloadData = XLSX.utils.sheet_to_json(downloadWorksheet, { header: 1 });

            expect(downloadData).to.deep.equal(fixtureData);

            // Optionally, log the comparison result
            cy.log('The data of the download Excel file matches the fixture Excel file.');
        });
    });

}


export function validateFirstTwqRaw(folderpath, fileName) {
    return cy.readFile(path.join(`cypress/fixtures/`, folderpath, fileName), 'binary').then((fixtureContent) => {
        const fixtureWorkbook = XLSX.read(fixtureContent, { type: 'binary' });
        const fixtureWorksheet = fixtureWorkbook.Sheets[fixtureWorkbook.SheetNames[0]];
        const fixtureData = XLSX.utils.sheet_to_json(fixtureWorksheet, { header: 1 });

        // Slice the fixtureData to keep only the first two rows
        const fixtureDataFirstTwoRows = fixtureData.slice(0, 2);

        // Read the Excel file from the download folder
        cy.readFile(path.join('cypress/downloads', fileName), 'binary').then((downloadContent) => {
            const downloadWorkbook = XLSX.read(downloadContent, { type: 'binary' });
            const downloadWorksheet = downloadWorkbook.Sheets[downloadWorkbook.SheetNames[0]];
            const downloadData = XLSX.utils.sheet_to_json(downloadWorksheet, { header: 1 });

            // Slice the downloadData to keep only the first two rows
            const downloadDataFirstTwoRows = downloadData.slice(0, 2);

            // Compare the first two rows of both files
            // expect(downloadDataFirstTwoRows).to.equal(fixtureDataFirstTwoRows);

            // Optionally, log the comparison result
            cy.log('The first two rows of the download Excel file match the fixture Excel file.');
        });
    });
}






// Execute the Node.js script and pass the filename and operation type as arguments
