using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Employer
{
     public class GetMyJobPosting
    {
      
        public string JobPostingID { get; set; }
        public string CompanyLogo { get; set; }        
        
        public string Title { get; set; }
        public string Position { get; set; }
        public string Location { get; set; }

        public string Industry { get; set; }


        
        public string TimeRemaining { get; set; }
         public DateTime CreatedOn { get; set; }

         public int LockFlg { get; set; }

         public int TotalApplications { get; set; }
        public int NotReviewedCount { get; set; }
        public int NotSuitableCount { get; set; }
        public int SuitableCount { get; set; }
    
    }
}