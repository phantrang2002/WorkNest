using Microsoft.AspNetCore.Http;

namespace api.Dtos.JobPosting
{
    public class ApplyFormDto
    {
        public string JobPostingID { get; set; } // Job posting ID
        public IFormFile CVFile { get; set; }    // CV file to be uploaded
    }
}
