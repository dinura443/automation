export class DashBoard {
  dashboardUrl = 'https://analytics.qbitum.net/dashboard/list';
  hosteddashboardUrl = 'https://analytics.qbitum.net/dashboard/list/';
  tableRowSelector = 'tr[role="row"]';
  itemNameSelector = 'td a'; 
  shareButtonSelector = 'span[aria-label="share"]';
  importButtonSelector = 'button > span[aria-label="import"]';
  selectFileInputSelector = '#modelFile';
  importDialogImportButtonSelector = 'button[type="submit"][data-title="Import"]';
  importbutton = "//span[normalize-space()='Import']";

  visitDashboardPage() {
    cy.visit(this.dashboardUrl);
  }
  visitHostedDashboardPage() {
    cy.visit(this.hosteddashboardUrl);
  }

  findRowByItemName(itemName: string) {
    cy.log(`Searching for item name: "${itemName}"`);
    return cy.contains(this.itemNameSelector, itemName, { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .then(($element) => {
        cy.log(`Found item name: "${itemName}" in the DOM`);
        return cy.wrap($element).closest(this.tableRowSelector);
      });
  }

  clickShareButtonForRow(itemName: string) {
    this.findRowByItemName(itemName)
      .should('exist')
      .within(() => {
        cy.get(this.shareButtonSelector)
          .should('exist')
          .click();
      });
  }

  uploadSpecificFile(targetUrl: string, filePath: string, submitButtonSelector: string) {
    cy.visit(targetUrl);
    cy.get(this.importButtonSelector, { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .then(($button) => {
        cy.log('Found the "Import" button:', $button);
        cy.wrap($button).click({ force: true });
      });

    cy.get(this.selectFileInputSelector).attachFile({
      filePath: filePath,
      fileName: filePath.split('/').pop(),
    });

    cy.xpath(this.importbutton,{ timeout: 100000 })
      .should("be.visible")
      .click();
  }

  clickItemName(itemName: string) {
    cy.log(`Clicking on item name: "${itemName}"`);
    cy.contains(this.itemNameSelector, itemName, { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .click({ force: true }); 
    cy.log(`Successfully clicked on item name: "${itemName}"`);
  }
}

