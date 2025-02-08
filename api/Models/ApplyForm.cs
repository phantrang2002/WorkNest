using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("ApplyForm")]
    public class ApplyForm
    {
        [Key, Column(Order = 0)]
        [ForeignKey("JobPosting")]
        public string JobPostingID { get; set; }

        [Key, Column(Order = 1)]
        [ForeignKey("Candidate")]
        public string CandidateID { get; set; }

        [Required]
        public string FileCV { get; set; } = string.Empty;
        [Required]
        public int Status { get; set; }
        public DateTime ApplyDate { get; set; }
        public virtual JobPosting JobPosting { get; set; }
        public virtual Candidate Candidate { get; set; }
    }
}
