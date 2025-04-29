export class DashBoard {
  instance1Dashboard = Cypress.env("INSTANCE1_DASHBOARD");
  instance2Dashboard = Cypress.env("INSTANCE2_DASHBOARD");
  tableRowSelector = 'tr[role="row"]';
  itemNameSelector = "td a";
  shareButtonSelector = 'span[aria-label="share"]';
  importButtonSelector = 'button > span[aria-label="import"]';
  selectFileInputSelector = "#modelFile";
  importDialogImportButtonSelector = 'button[type="submit"][data-title="Import"]';

  importbutton = "//span[normalize-space()='Import']";

  visitInstance1Dashboard() {
    cy.visit(this.instance1Dashboard);
  }

  visitInstance2Dashboard() {
    cy.visit(this.instance2Dashboard);
  }

  findRowByItemName(itemName: string) {
    cy.log(`Searching for item name: "${itemName}"`);
    return cy.contains(this.itemNameSelector, itemName, { timeout: 20000 })
      .should("exist")
      .and("be.visible")
      .then(($element) => {
        cy.log(`Found item name: "${itemName}" in the DOM`);
        return cy.wrap($element).closest(this.tableRowSelector);
      });
  }

  clickItemName(itemName: string) {
    cy.log(`Clicking on item name: "${itemName}"`);
    cy.contains(this.itemNameSelector, itemName, { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .click({ force: true });
    cy.log(`Successfully clicked on item name: "${itemName}"`);
  }

  clickShareButtonForRow(itemName: string) {
    this.findRowByItemName(itemName)
      .should("exist")
      .within(() => {
        cy.get(this.shareButtonSelector)
          .should("exist")
          .click()
          .then(() => {
            cy.log("Share button clicked. Waiting for file download...");
          });
      });
  }

  getDashboardCharts(itemName: string) {
    const scrapedCharts: any[] = [];

    return cy.get('.chart-slice[data-test-chart-id]').then($charts => {
      const chartCount = $charts.length;
      cy.log(`Total number of charts detected: ${chartCount}`);

      $charts.each((index: number, chartEl: HTMLElement) => {
        const $chart = Cypress.$(chartEl);

        const chartId = $chart.attr('data-test-chart-id');
        const chartName = $chart.attr('data-test-chart-name');

        const extractTitle = () => {
          return $chart.find('.header-title .editable-title a').text().trim();
        };

        let title = extractTitle();

        if (!title) {
          cy.wait(500); // Retry wait
          title = extractTitle();
        }

        if (!title) {
          cy.log(`Warning: Chart ${index + 1} (ID: ${chartId}) does not have a valid title.`);
        } else {
          cy.log(`Chart ${index + 1}: Title - ${title}`);
        }

        cy.log(`Chart ${index + 1}: ID - ${chartId}`);
        cy.log(`Chart ${index + 1}: Name - ${chartName}`);

        const alignment = $chart.closest('.dragdroppable-column').length
          ? `Column ${$chart.closest('.dragdroppable-column').index() + 1}`
          : 'Unknown Alignment';
        cy.log(`Chart ${index + 1}: Alignment - ${alignment}`);

        scrapedCharts.push({
          index: index + 1,
          id: chartId,
          name: chartName,
          title: title,
          alignment: alignment,
        });
      });

      cy.log(`Scraping complete: Found ${chartCount} charts for dashboard "${itemName}"`);
      return cy.wrap(scrapedCharts);
    });
  }

  uploadSpecificFile(targetUrl: string, filePath: string) {
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

    cy.xpath(this.importbutton, { timeout: 500000 })
      .should("be.visible")
      .click({ timeout: 500000 });
  }
}