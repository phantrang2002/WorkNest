using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("JobPosting")]
    public class JobPosting
    {
        [Key]
        public string JobPostingID { get; set; }

        [ForeignKey("Employer")]
        public string EmployerID { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Position { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedOn { get; set; } = DateTime.Now;

        [Required]
        public DateTime Time { get; set; }

        [Required]
        public bool Status { get; set; }

        public int MinSalary { get; set; }
        public int MaxSalary { get; set; }
        public int ExperienceExpect { get; set; }
        public int Quantity { get; set; }
        public string JobIndustry { get; set; }

        public int LockFlg { get; set; }

        public virtual Employer Employer { get; set; }

        public List<ApplyForm> ApplyForms { get; set; } = new List<ApplyForm>();
    }
}
