using System.ComponentModel.DataAnnotations;

namespace api.Dtos.JobPosting
{
    public class JobPostingDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Position { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime Time { get; set; }
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