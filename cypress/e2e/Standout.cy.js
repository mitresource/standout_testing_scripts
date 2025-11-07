import home_page from "./Homepage";
import 'cypress-wait-until';

const homepage1 = new home_page();


describe('template spec', () => {
  beforeEach(() => {
    homepage1.page_Url_Navigation();
  })
  it('Verify the URL and Homepage Navigations such as NewsLetter, Plans, Features, and About Us', () => {
    
      homepage1.page_Url_Validation();
      homepage1.homepage_navigations();
   
  })

  it('Verify navigation to "Jobs Page Top 2026 Internships" under Jobs page and validate job data', () => {
    
      homepage1.jobs_Page_Top_2026_Internships();
    
  })

  it('Verify navigation to "Jobs Page New Grad Roles" under Jobs page and validate job data', () => {
    
      homepage1.jobs_Page_New_Grad_Roles();
    
  })

  it('Verify navigation to "Jobs Page Remote Internships" under Jobs page and validate job data', () => {
    
      homepage1.jobs_Remote_Internships();
    
  })

  it('Verify navigation to "Jobs Page Remote New Grad Jobs" under Jobs page and validate job data', () => {
    
      homepage1.jobs_Page_Remote_New_Grad_Jobs();
    
  })

  it('Verify navigation to "Jobs Page Internship Opportunities" under Jobs page and validate job data', () => {
    
      homepage1.jobs_Internship_Opportunities();
    
  })

  it('Verify navigation to "All Jobs" under Jobs page and validate job data', () => {
    
      homepage1.jobs_All_Jobs();
   
      })
})