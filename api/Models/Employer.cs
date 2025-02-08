using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Employer")]
    public class Employer
    {
        [Key]
        [ForeignKey("Account")]
        public string EmployerID { get; set; }

        [Required]
        [MaxLength(200)]
        public string EmployerName { get; set; } = string.Empty;

        public string Avatar { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Industry { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Size { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public virtual Account Account { get; set; }
        public virtual ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
    }
}
