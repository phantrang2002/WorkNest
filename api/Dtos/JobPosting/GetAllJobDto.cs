namespace api.Dtos.JobPosting
{
    public class GetAllJobDto
    {
        public string JobPostingID { get; set; } 
        public string CompanyLogo { get; set; } // URL for the company logo

        public string CompanyName { get; set; } // URL for the company logo
        public string Title { get; set; } // Job title
        public string Position { get; set; } // Job position
        public string Location { get; set; } // Job location

        public string JobIndustry { get; set; }
          public string TimeRemaining { get; set; }
          public bool Status { get; set; }

          public int LockFlg { get; set; }
          public DateTime? CreatedOn { get; set;}
    }
}
