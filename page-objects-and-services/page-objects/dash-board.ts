
export class DashBoard {
    dashboardUrl = 'http://localhost:8088/dashboard/list/';
    tableRowSelector = 'tr[role="row"]';
    itemNameSelector = 'a'; 
    shareButtonSelector = 'span[aria-label="share"]'; 
  
    visitDashboardPage() {
      cy.visit(this.dashboardUrl);
    }
  
    findRowByItemName(itemName: string) {
      return cy.contains(this.itemNameSelector, itemName).closest(this.tableRowSelector);
    }
  
    extractRowContent(itemName: string) {
      const rowData: { [key: string]: string } = {}; 
      this.findRowByItemName(itemName)
        .should('exist') 
        .within(() => {
          cy.get('td').each(($cell, index) => {
            rowData[`cell${index + 1}`] = $cell.text().trim(); 
          });
        })
        .then(() => {
          cy.log('Extracted Row Data:', rowData); 
          return rowData; 
        });
    }
  
    clickShareButtonForRow(itemName: string) {
      this.findRowByItemName(itemName)
        .should('exist') 
        .within(() => {
          cy.get(this.shareButtonSelector) 
            .click(); 
        });
    }
  }
  
  export default new DashBoard();