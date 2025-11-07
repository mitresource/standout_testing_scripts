describe('StandOut Job Listings Test', () => {
  beforeEach(() => {
    // Handle uncaught exceptions
    Cypress.on('uncaught:exception', () => false);
  });

  it('should validate job details from listing to detail page', () => {
    // Visit the listings page
    cy.visit('https://standout.infuture.ai/c/summer_internship');
    cy.url().should('include', 'summer_internship');
        //     cy.get("body > div > main > section > div > div.text-center.w-full.font-semibold > h2")
        //         .should('be.visible')
        //         .should('have.text', 'Top Summer Internship in 2026');
        //     // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
        //         // Log headers
        //     cy.get('table thead tr th').each(($header, index) => {
        //     cy.log(`Header ${index + 1}: ${$header.text().trim()}`);
        //     });

        //     cy.wait(2000);
        //     // Log body rows
        //     cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr[class="data-[state=selected]:bg-muted cursor-pointer bg-white border border-gray-200 rounded-xl h-8 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,81,6,0.2)] hover:scale-[1.001] hover:bg-white lg:overflow-x-hidden lg:hover:overflow-hidden"]').each(($row, rowIndex, $rows) => {
        //     cy.wrap($row).within(() => {
        //        cy.get('td').each(($col, colIndex, $cols) => {
        //            cy.log($col.text());
        //        });
        //     });
        //  });

         function scrapeTableData() {
  // Step 1: Get and log all table data on current page
  cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr[class="data-[state=selected]:bg-muted cursor-pointer bg-white border border-gray-200 rounded-xl h-8 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,81,6,0.2)] hover:scale-[1.001] hover:bg-white lg:overflow-x-hidden lg:hover:overflow-hidden"]').each(($row, rowIndex) => {
    cy.wrap($row).find('td').then(($cols) => {
      const rowData = [...$cols].map(col => col.innerText.trim());
      cy.log(`Row ${rowIndex + 1}: ${rowData.join(' | ')}`);
      console.log(`Row ${rowIndex + 1}:`, rowData);
    });
  });

  // Step 2: Handle pagination - click Next if available
  cy.get("div[class='w-full lg:overflow-x-hidden lg:hover:overflow-hidden dark:text-gray-800 '] button:nth-child(2)")
    .then(($nextBtn) => {
      // Check if 'Next' button is disabled
      if (!$nextBtn.is(':disabled')) {
        cy.wrap($nextBtn).click({ force: true });
        cy.wait(2000); // wait for table to load new data
        scrapeTableData(); // recursively call the same function
      } else {
        cy.log('Reached the last page ✅');
      }
    });
}

//Run the function once to start
//scrapeTableData();

cy.wait(2000);

// Stub window.open to capture the new tab URL
cy.window().then((win) => {
  cy.stub(win, 'open').as('windowOpen');
});

// Get the first job row and store its title
cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr')
  .first()
  .then(($row) => {
    // Extract company name from the first column (adjust index if needed)
    const companyName = $row.find('td').eq(0).text().trim();
    const jobTitle = $row.find('td').eq(1).text().trim();
    const jobLocation = $row.find('td').eq(2).text().trim();
    const salary = $row.find('td').eq(3).text().trim();
    const postedDate = $row.find('td').eq(4).text().trim();
    // cy.log('Company Name: ' + companyName);
    // cy.log('Job Title: ' + jobTitle);
    // cy.log('Job Location: ' + jobLocation);
    // cy.log('Salary: ' + salary);
    // cy.log('Posted Date: ' + postedDate);

    // Click the row to trigger new tab
    cy.wrap($row).click({ force: true });

    // Validate that window.open was called
    cy.wait(2000); // wait for the stub to be called
    cy.get('@windowOpen').should('be.called');

    // Extract the URL from the stub
    cy.get('@windowOpen').then((stub) => {
      const url = stub.getCall(0).args[0];
      // const fullUrl = url.startsWith('http')
      //   ? url
      //   : `${Cypress.config().baseUrl || 'https://standout.infuture.ai'}${url.startsWith('/') ? url : '/' + url}`;

      const fullUrl = url.startsWith('http')
      ? url
      : `${(Cypress.config().baseUrl || 'https://standout.infuture.ai').replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;

      // Visit the job details page
      cy.visit(fullUrl, { failOnStatusCode: false });

      //Validate that company name appears in the URL (converted to lowercase and hyphenated if needed)
      const normalizedTitle = companyName
      .toLowerCase()
      .replace(/[^\w]/g, '');
  //     cy.url().then((url) => {
  //     const cleanUrl = url.toLowerCase().replace(/[^\w]/g, '');

  //       if (cleanUrl.includes(normalizedTitle)) {
  //         cy.url().should('include', normalizedTitle);
  //       } else {
  //         cy.log(`⚠️ WARNING: URL does not contain expected company name "${normalizedTitle}"`);
  //       }
  //     });

  //  }
    
      // First verify the URL contains jobs path
      cy.url().should('include', 'jobs');
      
      // Wait for content to load with increased timeout
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const pageText = $body.text();
        const companyLower = companyName.toLowerCase();
        
        // Log details for debugging
        cy.log('Checking job details...');
        cy.log(`Company: ${companyName}`);
        cy.log(`Title: ${jobTitle}`);
        cy.log(`Location: ${jobLocation}`);
        cy.log(`Salary: ${salary}`);
        
        // Flexible company name check
        if (!pageText.toLowerCase().includes(companyLower)) {
          cy.log(`⚠️ Warning: Company name "${companyName}" not found exactly as expected`);
        }

        // Check job details with proper timeout and error handling
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
            expect(pageNumbers, `Expected to find salary ${salary}`)
              .to.include(salaryNumbers);
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


  })
  })
})    
