using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Candidate")]
    public class Candidate
    {
        // CandidateID là PK và cũng là FK đến Account.UserID
        [Key]
        [ForeignKey("Account")] // Foreign Key to Account.UserID
        public string CandidateID { get; set; } // Primary Key, FK từ Account.UserID
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty; // Candidate Name
        
        public string Avatar { get; set; } = string.Empty; // Avatar image URL
        
        [Required]
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty; // Candidate Phone
        
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty; // Candidate Location

        public int Experience { get; set; } // Years of experience
        
        [MaxLength(100)]
        public string Industry { get; set; } = string.Empty; // Industry sector

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty; // Short description

        // Navigation property to Account
        public virtual Account Account { get; set; }

          // Navigation property for ApplyForms
        public List<ApplyForm> ApplyForms { get; set; } = new List<ApplyForm>(); // Candidate can have multiple ApplyForms
    }
}
