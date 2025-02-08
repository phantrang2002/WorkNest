namespace api.Dtos.JobPosting
{
    public class JobPostingWithApplyStatsDto
    {
        public string JobPostingID { get; set; }
        public string CompanyLogo { get; set; }
        public string CompanyName { get; set; }
        public string Title { get; set; }
        public string TimeRemaining { get; set; }
        public int LockFlg { get; set; }
        public string Position { get; set; }
        public string Location { get; set; }
        public bool Status { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int TotalApplications { get; set; }
        public int NotReviewedCount { get; set; }
        public int NotSuitableCount { get; set; }
        public int SuitableCount { get; set; }
    }
}