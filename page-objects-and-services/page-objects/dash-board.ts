// cypress/support/page-objects-and-services/dashboard-page.ts

export class DashBoard {
  // Locators
  dashboardUrl = 'https://analytics.qbitum.net/dashboard/list/';
  tableRowSelector = 'tr[role="row"]';
  itemNameSelector = 'td a'; // Updated selector to target <a> tags inside table cells
  shareButtonSelector = 'span[aria-label="share"]'; // Selector for the "Share" button
  importButtonSelector = 'button > span[aria-label="import"]'; // Selector for the "Import" button
  selectFileInputSelector = '#modelFile'; // Selector for the hidden file input field
  importDialogImportButtonSelector = 'button[type="submit"][data-title="Import"]'; // Selector for the "Import" button in the dialog

  importbutton = "//span[normalize-space()='Import']";
  // Method to visit the dashboard page
  visitDashboardPage() {
    cy.visit(this.dashboardUrl);
  }

  // Method to find a row by item name
  findRowByItemName(itemName: string) {
    // Debugging: Log the search for the item name
    cy.log(`Searching for item name: "${itemName}"`);

    // Wait for the item name to appear in the DOM
    return cy.contains(this.itemNameSelector, itemName, { timeout: 10000 }) // Increase timeout to 10 seconds
      .should('exist') // Ensure the element exists in the DOM
      .and('be.visible') // Ensure the element is visible
      .then(($element) => {
        cy.log(`Found item name: "${itemName}" in the DOM`);
        return cy.wrap($element).closest(this.tableRowSelector); // Return the closest table row
      });
  }

  // Method to click the "Share" button for a specific row
  clickShareButtonForRow(itemName: string) {
    this.findRowByItemName(itemName)
      .should('exist') // Ensure the row exists
      .within(() => {
        cy.get(this.shareButtonSelector) // Locate the "Share" button within the row
          .should('exist') // Ensure the button exists
      //    .and('be.visible') // Ensure the button is visible
          .click(); // Click the "Share" button
      });
  }


  
  uploadSpecificFile(targetUrl: string, filePath: string, submitButtonSelector: string) {
    // Navigate to the target URL
    cy.visit(targetUrl);
  
    // Step 1: Trigger the import dialog by clicking the "Import" button
    cy.get(this.importButtonSelector, { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .then(($button) => {
        cy.log('Found the "Import" button:', $button);
        cy.wrap($button).click({ force: true });
      });
  
    // Step 2: Simulate file selection using the hidden input field
    cy.get(this.selectFileInputSelector).attachFile({
      filePath: filePath,
      fileName: filePath.split('/').pop(),
    });
  
    // Step 3: Click the "Import" button in the dialog
    cy.xpath(this.importbutton)
    .should("be.visible")
    .click();
  
    // Add assertions or actions after upload
    cy.contains('File uploaded successfully').should('be.visible');
  }

}
