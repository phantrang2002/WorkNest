using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Candidate
{
    public class UpdateCandidateDto
    {
        public string Name { get; set; } // Candidate Name

        public string PhoneNumber { get; set; } // Candidate Phone

        public string Location { get; set; } // Candidate Location

        public int? Experience { get; set; } // Years of experience

        public string Industry { get; set; } // Industry sector

        public string Description { get; set; } // Short description
    }
}
