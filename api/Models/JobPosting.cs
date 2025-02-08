using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("JobPosting")]
    public class JobPosting
    {
        [Key]
        public string JobPostingID { get; set; } // Primary Key
        
        [ForeignKey("Employer")] // Foreign Key to Employer table
        public string EmployerID { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty; // Job Title

        [Required]
        [MaxLength(100)]
        public string Position { get; set; } = string.Empty; // Job Position

        [Required]
        public string Description { get; set; } = string.Empty; // Job Description

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty; // Job Location

        [Required]
        public DateTime CreatedOn { get; set; } = DateTime.Now; // Creation Date (Auto-assigned)

        [Required]
        public DateTime Time { get; set; } // Expiry Date for the Job Posting

        [Required]
        public bool Status { get; set; } // Status (Active: true / Inactive: false)

        public int MinSalary { get; set; }
        public int MaxSalary { get; set; }
        public int ExperienceExpect { get; set; } 
        public int Quantity { get; set; } 
        public string JobIndustry { get; set; }

        public int LockFlg { get; set; } 

        // Navigation property
        public virtual Employer Employer { get; set; } // Reference to Employer entity
        
        // One-to-many relationship with ApplyForm
        public List<ApplyForm> ApplyForms { get; set; } = new List<ApplyForm>(); 
    }
}
