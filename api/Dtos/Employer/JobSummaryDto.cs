using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Employer
{
     public class JobSummaryDto
    {
      
        public string JobPostingID { get; set; }
        public string CompanyLogo { get; set; }        
        
        public string Title { get; set; }
        public string Position { get; set; }
        public string Location { get; set; }
        public string TimeRemaining { get; set; } 
    
    }
}