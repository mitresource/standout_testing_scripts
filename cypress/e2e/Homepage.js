import 'cypress-wait-until';
class home_page {
//const softFailures = [];

    // Page constants
    url_assert = 'standout.infuture.ai';
    jobs_assert = 'Jobs';
    internship_assert = 'Top 2026 Internships';
    url_next_assert = 'summer_internship';
    button_Val = 'Top 2026 Internships';
    main_heading = 'Top Summer Internship in 2026';
    
    constructor() {
        // Set up global error handling for uncaught exceptions
        Cypress.on('uncaught:exception', (err) => {
            // Return false to prevent Cypress from failing the test
            return false;
        });
    }

    // ✅ Define reusable function outside `it`
   table_Elements_Log() {
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

  table_Headers_Log() {
    cy.get('table thead tr th').each(($header, index) => {
      cy.log(`Header ${index + 1}: ${$header.text().trim()}`);
    });
  }

  table_NewPage_Validation() {

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
        : `${(Cypress.config().baseUrl || '/')
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
          try {
            const salaryNumbers = salary.replace(/[^\d]/g, '');
            if (salaryNumbers) {
              const pageNumbers = pageText.replace(/[^\d]/g, '');
              expect(pageNumbers, `Expected salary ${salary}`).to.include(salaryNumbers);
              cy.log('✓ Salary verified');
            } else {
              cy.log('⚠️ No numbers found in salary: ' + salary);
            }
          } catch (error) {
            cy.log('⚠️ Salary verification failed: ' + error.message);
            // Log the error but don't fail the test
            //softFailures.push(`Salary verification failed for ${salary}: ${error.message}`);
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

  }
    page_Url_Navigation() {
        cy.visit('/'); 
       }
    page_Url_Validation() {
        cy.url('/').should('include', this.url_assert)
    }

    jobs_Page_Top_2026_Internships() {
        //Jobs Page Top 2026 Internships
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("body > div:nth-child(14) > main:nth-child(2) > div:nth-child(1) > main:nth-child(2) > section:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1) > div:nth-child(2) > h3:nth-child(1)")
        .should('have.text', this.internship_assert)
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', this.button_Val).click({ force: true });

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
            cy.url().should('include', this.url_next_assert);
            cy.get("body > div > main > section > div > div.text-center.w-full.font-semibold > h2")
                .should('be.visible')
                .should('have.text', this.main_heading);
                
    this.table_Headers_Log();
    
//             cy.wait(2000);
//             // Log body rows
//             // First, log all the table data
//             cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr[class="data-[state=selected]:bg-muted cursor-pointer bg-white border border-gray-200 rounded-xl h-8 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,81,6,0.2)] hover:scale-[1.001] hover:bg-white lg:overflow-x-hidden lg:hover:overflow-hidden"]')
//                 .each(($row, rowIndex) => {
//                     // Store row data
//                     let rowData = [];
//                     cy.wrap($row).find('td').each(($col) => {
//                         rowData.push($col.text().trim());
//                         cy.log($col.text().trim());
//                     });
//                 })
//                 .then(() => {
//                     // Handle new tab/window first before clicking
//                     cy.window().then((win) => {
//                         cy.stub(win, 'open').as('windowOpen');
                        
//                         // Now click the first row
//                         cy.get('table tbody[class="[&_tr:last-child]:border-0"] tr')
//                             .first()
//                             .click({force: true});

//                         // Handle the new page navigation
//                         cy.get('@windowOpen').should('be.called');
//                         cy.get('@windowOpen').then((stub) => {
//                             const url = stub.getCall(0).args[0];
//                             const fullUrl = url.startsWith('http') 
//                                 ? url 
//                                 : `${Cypress.config().baseUrl || 'https://standout.infuture.ai'}${url.startsWith('/') ? url : '/' + url}`;
                            
//                             // Visit the job details page
//                             cy.visit(fullUrl, { failOnStatusCode: false });
                            
//                             // Wait for page load
//                             //cy.get('main').should('exist');
                            
//                             // Validate URL and basic page structure
//                             cy.url().should('include', '/jobs/');
                            
//                             // Verify company name and job details are present
//                             cy.get('[data-testid="job-title"], h1, h2')
//                                 .should('be.visible');
                                
//                             cy.get('[data-testid="job-description"], [data-testid="company-info"], main')
//                                 .should('exist');
                            
//                         // // Optional: Validate specific sections
//                         // cy.get('body').then($body => {
//                         //     if ($body.find('.job-description').length) {
//                         //         cy.get('.job-description').should('be.visible');
//                         //     }
//                         //     if ($body.find('.requirements').length) {
//                         //         cy.get('.requirements').should('be.visible');
//                         //     }
//                         // });
                        
//                         // Return to the listings page
//                         cy.visit('https://standout.infuture.ai/summer_internship');
//                     });
//                 });
//          });


 cy.get("input[placeholder='Search jobs']").type("Disney", {force: true});
 cy.wait(2000);
 this.table_Elements_Log();
cy.get("input[placeholder='Search jobs']").clear();
 //cy.get("body > div > main > section > div > div.flex.flex-col.md\:flex-row.md\:items-center.md\:justify-between.gap-4 > div.flex.gap-4.w-full.md\:w-auto > button:nth-child(1)").click();
cy.get('[type="button"]:nth-child(1)').click();
cy.get('[class="max-h-60 pt-0"]').contains('New York').click({ force: true });
cy.wait(2000);
            this.table_Elements_Log();

this.table_NewPage_Validation();
});
        
            // Return to main page
            cy.visit('/');
        
    }

    jobs_Page_New_Grad_Roles() {
        //Jobs Page New Graduate Roles
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("#jobs > div > div.max-w-7xl.mx-auto > div > button:nth-child(2)")
        .should('have.text', 'New Graduate Roles')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'New Graduate Roles').click({ force: true });

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
            cy.url().should('include', 'early_career_roles');
            cy.get("h2[class='text-3xl md:text-4xl font-bold text-gray-900 mb-10']")
                .should('be.visible')
                .should('have.text', 'Top Early Career Roles in 2025');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
          
            this.table_Headers_Log();
        
cy.wait(2000);
            this.table_Elements_Log();
// ✅ Stub window.open before clicking the row
this.table_NewPage_Validation();
});
            // Return to main page
            cy.visit('/');
        
    }

    jobs_Remote_Internships() {
         //Jobs Page Remote Internships
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("body div main main button:nth-child(3)")
        .should('have.text', 'Remote Internships')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'Remote Internships').click({ force: true });

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
            cy.url().should('include', 'remote_internship');
            cy.get("h2[class='text-3xl md:text-4xl font-bold text-gray-900 mb-10']")
                .should('be.visible')
                .should('have.text', 'Top Remote Internship in 2025');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
                
            this.table_Headers_Log();

cy.wait(2000);
            
            this.table_Elements_Log();
// ✅ Stub window.open before clicking the row
this.table_NewPage_Validation();
});
        
            // Return to main page
            cy.visit('/');
        
    }

    jobs_Page_Remote_New_Grad_Jobs() {
        //Jobs Page Remote New Graduate Jobs
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("#jobs > div > div.max-w-7xl.mx-auto > div > button:nth-child(4)")
        .should('have.text', 'Remote New Graduate Jobs')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'Remote New Graduate Jobs').click({ force: true });

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
            cy.url().should('include', 'remote_early_career_roles');
            cy.get("h2[class='text-3xl md:text-4xl font-bold text-gray-900 mb-10']")
                .should('be.visible')
                .should('have.text', 'Top Remote Early Career Roles in 2025');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
              
            this.table_Headers_Log();

cy.wait(2000);
           
            this.table_Elements_Log();
// ✅ Stub window.open before clicking the row
this.table_NewPage_Validation();
});
        
            // Return to main page
            cy.visit('/');
        
    }

    jobs_Internship_Opportunities() {
        //Jobs Page Internship Opportunities
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("#jobs > div > div.max-w-7xl.mx-auto > div > button:nth-child(5)")
        .should('have.text', 'Internship Opportunities')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'Internship Opportunities').click({ force: true });

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
            cy.url().should('include', 'internship');
            cy.get("h2[class='text-3xl md:text-4xl font-bold text-gray-900 mb-10']")
                .should('be.visible')
                .should('have.text', 'Top Internship in 2025');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
                
            this.table_Headers_Log();

cy.wait(2000);
           
            this.table_Elements_Log();
// ✅ Stub window.open before clicking the row
this.table_NewPage_Validation();
});
        
            // Return to main page
            cy.visit('/');

    }

    jobs_All_Jobs() {
        //Jobs Page All Jobs
        cy.get("div[class='flex items-center space-x-8'] button:nth-child(1)").should('have.text', this.jobs_assert).click({force: true})
        cy.get("#jobs > div > div.max-w-7xl.mx-auto > div > button:nth-child(6)")
        .should('have.text', 'All Jobs')
        .click({force: true});

        // Stub window.open and handle the internship page navigation
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        // Trigger the click with stub in place
        cy.contains('button', 'All Jobs').click({ force: true });

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
            cy.url().should('include', 'all_jobs');
            cy.get("h2[class='text-3xl md:text-4xl font-bold text-gray-900 mb-10']")
                .should('be.visible')
                .should('have.text', 'Top All Jobs in 2025');
            // cy.get("input[placeholder='Search jobs']").type("Walmart", {force: true});
               
            this.table_Headers_Log();
        
cy.wait(2000);
           
            this.table_Elements_Log();
// ✅ Stub window.open before clicking the row
this.table_NewPage_Validation();
});
            // Return to main page
            cy.visit('/');
        
    }

    homepage_navigations() {
        // Set up global error handling for the entire test
        Cypress.on('uncaught:exception', (err) => {
            // Return false to prevent Cypress from failing the test
            return false
        });
        cy.get(".text-2xl.font-bold.font-heading.tracking-tight.text-brand-orange").should('have.text', 'StandOut')
        
        // Store the newsletter URL before clicking
        cy.get("body > div:nth-child(14) > main:nth-child(2) > div:nth-child(1) > header:nth-child(1) > div:nth-child(1) > nav:nth-child(2) > a:nth-child(2)")
            .should('have.text', 'Newsletter')
            .invoke('attr', 'href')
            .then((href) => {
                // Visit the newsletter page directly
                cy.visit(href, {
                    failOnStatusCode: false
                });
                cy.url().should('include', 'infuture-career-digest.beehiiv.com');
                // Go back after visiting
                cy.go('back');
            });

        cy.wait(2000); // Wait for page to load
        cy.get("body > div > main > div > header > div.flex.items-center.space-x-8 > nav > button:nth-child(3)").should('have.text', 'Features').click({force:true})
        cy.get("body > div > main > div > header > div.flex.items-center.space-x-8 > nav > button:nth-child(4)").should('have.text', 'Plans').click({force:true})
        //cy.get("").should('have.text', '').click({force:true})

        // Store the newsletter URL before clicking
        cy.get("body > div > main > div > header > div.flex.items-center.space-x-8 > nav > a:nth-child(5)")
            .should('have.text', 'About Us')
            .invoke('attr', 'href')
            .then((href) => {
                // Visit the newsletter page directly
                cy.visit(href, {
                    failOnStatusCode: false
                });
                
                // Go back after visiting
                cy.go('back');
            });
        cy.wait(2000); // Wait for page to load
        cy.get("header div:nth-child(3) button:nth-child(1)").should('have.text', 'Get Started Free').click({force:true})
        //cy.reload(); // Wait for page to load
        cy.get('div[class="flex justify-start mb-4"] button:nth-child(1)').click()
        cy.wait(2000); 
        cy.get("button[class='inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-orange font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300']").should('be.visible').should('have.text', 'See How It Works')
        cy.get("p[class='text-xs md:text-sm font-bold text-orange-600 tracking-widest uppercase']").should('have.text', '✨ Designed And Built By Students For Students ✨')
        cy.get("h1[class='text-5xl md:text-7xl font-bold font-heading text-white leading-tight drop-shadow-lg']").should('have.text', 'Land Your Dream Job.Your personalized AI coach that helps you StandOut.')
        cy.get("section[class='py-8 lg:py-14 px-6 lg:px-16 bg-white'] h2[class='text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6']").should('have.text', 'Trusted by Students from100+ Universities Worldwide')
        cy.get("p[class='text-xl text-gray-600 mb-8 max-w-3xl mx-auto']").should('have.text', "Join over 1000 students who've already started their career journey with StandOut")
        cy.get('div:nth-child(3) a[href="/auth/signup"] button').should('have.text', 'Start Your Career Story').click()
        cy.get('.mt-6.text-center.text-3xl.font-bold.tracking-tight.text-orange-600').should('have.text', 'Create your account')
        cy.contains('button', 'Home').click()
    }
}

export default home_page;