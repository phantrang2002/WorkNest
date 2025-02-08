using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Employer
{
    public class GetEmployerDto
    {
                 public string EmployerID { get; set; }
        public string EmployerName { get; set; }
        public string Avatar { get; set; }
        public string Industry { get; set; }
        public string Location { get; set; }
        public string Size { get; set; }
        public string Description { get; set; }
        public List<JobSummaryDto> JobPostings { get; set; }
   
    }
}