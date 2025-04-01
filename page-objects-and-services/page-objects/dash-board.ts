// cypress/support/page-objects-and-services/dashboard-page.ts

export class DashBoard {
  // Locators
  dashboardUrl = 'http://localhost:8088/dashboard/list/';
  tableRowSelector = 'tr[role="row"]';
  itemNameSelector = 'a'; // The <a> tag containing the item name
  shareButtonSelector = 'span[aria-label="share"]'; // Selector for the "Share" button
  importButtonSelector = 'button > span[aria-label="import"]'; // Selector for the "Import" button

  // Method to visit the dashboard page
  visitDashboardPage() {
    cy.visit(this.dashboardUrl);
  }

  // Method to find a row by item name
  findRowByItemName(itemName: string) {
    return cy.contains(this.itemNameSelector, itemName).closest(this.tableRowSelector);
  }

  // Method to click the "Share" button for a specific row
  clickShareButtonForRow(itemName: string) {
    this.findRowByItemName(itemName)
      .should('exist') // Ensure the row exists
      .within(() => {
        cy.get(this.shareButtonSelector) // Locate the "Share" button within the row
          .click(); // Click the "Share" button
      });
  }

  // Method to upload a specific file to another URL
  uploadSpecificFile(targetUrl: string, filePath: string, submitButtonSelector: string) {
    // Navigate to the target URL
    cy.visit(targetUrl);

    // Debugging: Log the file path
    cy.log(`Uploading file: ${filePath}`);

    // Wait for the "Import" button to appear and be visible
    cy.get(this.importButtonSelector, { timeout: 10000 }) // Increase timeout to 10 seconds
      .should('exist') // Ensure the button exists in the DOM
      .and('be.visible') // Ensure the button is visible
      .then(($button) => {
        cy.log('Found the "Import" button:', $button);
        cy.wrap($button).click({ force: true }); // Click the "Import" button
      });

    // Simulate file selection using the hidden input field
    cy.get('#modelFile').attachFile({
      filePath: filePath, // Use the specified file path
      fileName: filePath.split('/').pop(), // Extract the file name
    });

    // Wait for the file to be attached (optional)
    cy.wait(1000); // Adjust or remove as needed

    // Submit the form
    cy.get(submitButtonSelector).click();

    // Add assertions or actions after upload
    cy.contains('File uploaded successfully').should('be.visible'); // Replace with the actual success message
  }
}

export default new DashBoard();