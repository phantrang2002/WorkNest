using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Employer")]
    public class Employer
    {
        [Key]
        [ForeignKey("Account")] // Foreign Key to Account.UserID
        public string EmployerID { get; set; } // Primary Key as int

        [Required]
        [MaxLength(200)]
        public string EmployerName { get; set; } = string.Empty; // Employer Name
        
        public string Avatar { get; set; } = string.Empty; // Avatar image URL

        [MaxLength(100)]
        public string Industry { get; set; } = string.Empty; // Industry sector

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty; // Employer Location

        [MaxLength(50)]
        public string Size { get; set; } = string.Empty; // Size of the company

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty; // Short description

        // Navigation property to Account
        public virtual Account Account { get; set; }

         // Navigation property for JobPostings
        public virtual ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
    
    }
}
