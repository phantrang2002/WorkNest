using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.SampleCV
{
    public class SampleCVDto
    { 
 
        public string Title { get; set; }  = string.Empty;
 
        public string Description { get; set; }  = string.Empty;
 
        public IFormFile FileCV { get; set; }    // CV file to be uploaded
  
    }
}
