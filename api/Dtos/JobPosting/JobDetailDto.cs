public class JobDetailDto
{
     public string JobID{ get; set; }
    public string JobTitle { get; set; }
    public string Location { get; set; }
    public string Description { get; set; }
    public DateTime PostedDate { get; set; } // Change this to your desired type if necessary

    public DateTime Time { get; set; } // Change this to your desired type if necessary
    
    public string TimeRemaining { get; set; }
    public string Position { get; set; }
    public string CompanyLogo { get; set; }
    public string CompanyName { get; set; }
    public string CompanyLocation { get; set; }
    public string Industry { get; set; }
    public string Size { get; set; }
    public string CompanyId { get; set; }

     public int MinSalary { get; set; }
        public int MaxSalary { get; set; }
        public int ExperienceExpect { get; set; }


        public int Quantity { get; set; }

        public string JobIndustry { get; set; }
        public bool Status;

        public int LockFlg;

}
