using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Policy")]
    public class Policy
    {
        
        [Key]
        public string PolicyID { get; set; } // Primary Key

        [Required]
        [MaxLength(50)]
        public string Title { get; set; }  = string.Empty;

        [Required] 
        public string Description { get; set; }  = string.Empty; 
  
        [Required]
        public DateTime CreatedOn { get; set; } = DateTime.Now; // Creation Date (Auto-assigned)
    }
}