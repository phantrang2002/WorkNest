namespace api.Dtos.JobPosting
{
    public class ApplyFormDto
    {
        public string JobPostingID { get; set; } 
        public IFormFile CVFile { get; set; }
    }
}
