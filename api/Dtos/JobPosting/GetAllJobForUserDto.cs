namespace api.Dtos.JobPosting
{
    public class GetAllJobForUserDto
    {
        public string JobPostingID { get; set; }
        public string CompanyLogo { get; set; }
        public string CompanyName { get; set; }
        public string Title { get; set; }
        public string Position { get; set; }
        public string Location { get; set; }
        public string JobIndustry { get; set; }
        public string TimeRemaining { get; set; }
        public bool Status { get; set; }
        public int LockFlg { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool Applied { get; set; }
    }
}