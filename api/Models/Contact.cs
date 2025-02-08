using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Contact")]
    public class Contact
    {
        [Key]
        public string ContactID { get; set; } // Primary Key

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress] 
        public string Email { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ProblemTitle { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public bool Status { get; set; }
    }
}
