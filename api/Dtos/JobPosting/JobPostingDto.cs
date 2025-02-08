using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.JobPosting
{
    public class JobPostingDto
    {
        [Required]
        public string Title { get; set; } = string.Empty; // Job Title

        [Required]
        public string Position { get; set; } = string.Empty; // Job Position

        [Required]
        public string Description { get; set; } = string.Empty; // Job Description

        [Required]
        public string Location { get; set; } = string.Empty; // Job Location

        [Required]
        public DateTime Time { get; set; } // Expiry Date for the Job Posting
        public int MinSalary { get; set; }
        public int MaxSalary { get; set; }

        [Required]
        public int ExperienceExpect { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string JobIndustry { get; set; }
    }
}