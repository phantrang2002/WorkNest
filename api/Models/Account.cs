using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace api.Models
{
    [Table("Account")]
    public class Account : IdentityUser
    {
        [Key]
        public string UserID { get; set; }
        [Required]
        public int AccountRole { get; set; }
        [Required]
        public bool Status { get; set; }
        public virtual Candidate Candidate { get; set; }
        public virtual Employer Employer { get; set; }
    }
}
