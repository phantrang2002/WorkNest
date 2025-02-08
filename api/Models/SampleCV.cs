using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("SampleCV")]
    public class SampleCV
    {
        
        [Key]
        public string SampleID { get; set; } // Primary Key

        [Required]
        [MaxLength(50)]
        public string Title { get; set; }  = string.Empty;

        [Required] 
        public string Description { get; set; }  = string.Empty;

        [Required] 
        public string FileCV { get; set; }  = string.Empty;
  
    }
}