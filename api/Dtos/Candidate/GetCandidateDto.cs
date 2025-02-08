namespace api.Dtos.Candidate
{
    public class GetCandidateDto
    {
        public string CandidateID { get; set; }

        public string Name { get; set; }

        public string Avatar { get; set; }

        public string PhoneNumber { get; set; }

        public string Location { get; set; }

        public int Experience { get; set; }

        public string Industry { get; set; }

        public string Description { get; set; }
    }
}
