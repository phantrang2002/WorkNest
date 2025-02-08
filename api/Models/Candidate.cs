using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Candidate")]
    public class Candidate
    {
        [Key]
        [ForeignKey("Account")]
        public string CandidateID { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string Avatar { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        public int Experience { get; set; }
        
        [MaxLength(100)]
        public string Industry { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public virtual Account Account { get; set; }
        public List<ApplyForm> ApplyForms { get; set; } = new List<ApplyForm>();
    }
}
