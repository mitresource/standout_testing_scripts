
import 'cypress-wait-until';

describe('StandOut Job Listings Test', () => {
    // ✅ Define reusable function outside `it`
  function table_Elements_Log() {
    cy.get(
      'table tbody[class="[&_tr:last-child]:border-0"] tr[class="data-[state=selected]:bg-muted cursor-pointer bg-white border border-gray-200 rounded-xl h-8 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,81,6,0.2)] hover:scale-[1.001] hover:bg-white lg:overflow-x-hidden lg:hover:overflow-hidden"]'
    ).each(($row, rowIndex) => {
      let rowData = [];
      cy.wrap($row)
        .find('td')
        .each(($col) => {
          rowData.push($col.text().trim());
          cy.log($col.text().trim());
        });
    });
  }

  function table_Headers_Log() {
    cy.get('table thead tr th').each(($header, index) => {
      cy.log(`Header ${index + 1}: ${$header.text().trim()}`);
    });
  }

  it('should validate job details from listing to detail page', () => {
    // Visit the listings page
    cy.visit('https://standout.infuture.ai');
    //cy.url().should('include', 'summer_internship');

      cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', 'Jobs').click({force: true})
        cy.get("body > div:nth-child(14) > main:nth-child(2) > div:nth-child(1) > main:nth-child(2) > section:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1) > div:nth-child(2) > h3:nth-child(1)")
        .should('have.text', 'Top 2026 Internships')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'Top 2026 Internships').click({ force: true });

        // Handle the new tab URL
        cy.get('@windowOpen').should('be.called');
        cy.get('@windowOpen').then((stub) => {
            const url = stub.getCall(0).args[0];
            // Ensure we have the full URL
            const fullUrl = url.startsWith('http') 
                ? url 
                : `/${url.startsWith('/') ? '' : '/'}${url}`;
            
            cy.wait(2000);
            cy.visit(fullUrl, { failOnStatusCode: false });
            
            // Verify we're on the internship page
            cy.url().should('include', 'summer_internship');
            cy.get("body > div > main > section > div > div.text-center.w-full.font-semibold > h2")
                .should('be.visible')
                .should('have.text', 'Top Summer Internship in 2026');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
                // Log headers
            // cy.get('table thead tr th').each(($header, index) => {
            // cy.log(`Header ${index + 1}: ${$header.text().trim()}`);
            // });
            table_Headers_Log();

        cy.wait(2000);
            // Log body rows
            // First, log all the table data
        //     table_Elements_Log() {
        //     cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr[class="data-[state=selected]:bg-muted cursor-pointer bg-white border border-gray-200 rounded-xl h-8 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,81,6,0.2)] hover:scale-[1.001] hover:bg-white lg:overflow-x-hidden lg:hover:overflow-hidden"]')
        //         .each(($row, rowIndex) => {
        //             // Store row data
        //             let rowData = [];
        //             cy.wrap($row).find('td').each(($col) => {
        //                 rowData.push($col.text().trim());
        //                 cy.log($col.text().trim());
        //             });
                    
        //         })
            

        //     };
        // })

        //     table_Elements_Log();
        table_Elements_Log();
// ✅ Stub window.open before clicking the row
cy.window().then((win) => {
  if (!win.open.restore) {
    cy.stub(win, 'open').as('windowOpen');
  }
});

// ✅ Get the first job row
cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr')
  .first()
  .then(($row) => {
    const companyName = $row.find('td').eq(0).text().trim();
    const jobTitle = $row.find('td').eq(1).text().trim();
    const jobLocation = $row.find('td').eq(2).text().trim();
    const salary = $row.find('td').eq(3).text().trim();
    const postedDate = $row.find('td').eq(4).text().trim();

    cy.log(`Company: ${companyName}`);
    cy.log(`Job Title: ${jobTitle}`);

    // ✅ Click the row
    cy.wrap($row).click({ force: true });

    // ✅ Retry logic: wait until stub is called
    cy.waitUntil(
      () =>
        cy.get('@windowOpen').then((stub) => stub.callCount > 0),
      {
        errorMsg: '❌ window.open was never called.',
        timeout: 8000,
        interval: 1000,
      }
    );

    // ✅ Once it’s called, continue with the URL validation
    cy.get('@windowOpen').then((stub) => {
      const url = stub.getCall(0).args[0];

      const fullUrl = url.startsWith('http')
        ? url
        : `${(Cypress.config().baseUrl || 'https://standout.infuture.ai')
            .replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;

      cy.log(`Visiting: ${fullUrl}`);
      cy.visit(fullUrl, { failOnStatusCode: false });

      const normalizedTitle = companyName
        .toLowerCase()
        .replace(/[^\w]/g, '');

      cy.url().should('include', 'jobs');

      cy.get('body', { timeout: 10000 }).then(($body) => {
        const pageText = $body.text().toLowerCase();

        if (!pageText.includes(normalizedTitle)) {
          cy.log(`⚠️ Warning: Company name "${companyName}" not found.`);
        }

        cy.contains(jobTitle, { timeout: 10000 })
          .should('exist')
          .then(() => cy.log('✓ Job title verified'));

        cy.contains(jobLocation, { timeout: 10000 })
          .should('exist')
          .then(() => cy.log('✓ Location verified'));

        if (salary) {
          const salaryNumbers = salary.replace(/[^\d]/g, '');
          if (salaryNumbers) {
            const pageNumbers = pageText.replace(/[^\d]/g, '');
            expect(pageNumbers, `Expected salary ${salary}`).to.include(salaryNumbers);
            cy.log('✓ Salary verified');
          }
        }

        if (postedDate) {
          cy.contains(postedDate, { timeout: 5000 })
            .should('exist')
            .then(() => cy.log('✓ Posted date verified'));
        }
      });
    });
  });
});
});
});
