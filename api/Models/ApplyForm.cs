using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("ApplyForm")]
    public class ApplyForm
    {
        // Composite Primary Key: JobPostingID + CandidateID
        [Key, Column(Order = 0)]
        [ForeignKey("JobPosting")]
        public string JobPostingID { get; set; } // Foreign Key to JobPosting
        
        [Key, Column(Order = 1)]
        [ForeignKey("Candidate")]
        public string CandidateID { get; set; } // Foreign Key to Candidate

        [Required]
        public string FileCV { get; set; } = string.Empty; // Path to the CV file (usually a PDF)

        [Required]
        public int Status { get; set; } // Application Status (Accepted: true / Rejected: false)

        // Thêm ApplyDate
        public DateTime ApplyDate { get; set; }

        // Navigation properties
        public virtual JobPosting JobPosting { get; set; } // Reference to JobPosting entity
        public virtual Candidate Candidate { get; set; } // Reference to Candidate entity
    }
}
