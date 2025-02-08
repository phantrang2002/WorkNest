using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace api.Models
{
    [Table("Account")]
    public class Account : IdentityUser
    {
        [Key]
        public string UserID { get; set; } // Primary Key

        [Required]
        public int AccountRole { get; set; } // 1: Candidate, 2: Employer, 3: Admin
        
        [Required]
        public bool Status { get; set; } // Account status (Active/Inactive)

        // Depending on role, link to Candidate or Employer (optional for Admin)
        public virtual Candidate Candidate { get; set; }
        public virtual Employer Employer { get; set; }
 
    }
}
