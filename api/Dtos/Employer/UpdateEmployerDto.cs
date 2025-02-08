using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Employer
{
    public class UpdateEmployerDto
    {
        public string EmployerName { get; set; } 
        public string Industry { get; set; }
        public string Location { get; set; }
        public string Size { get; set; }
        public string Description { get; set; }
    }
}
