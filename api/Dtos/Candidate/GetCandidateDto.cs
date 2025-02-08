namespace api.Dtos.Candidate
{
    public class GetCandidateDto
    {
        public string CandidateID { get; set; } // Candidate ID

        public string Name { get; set; } // Candidate Name

        public string Avatar { get; set; } // Avatar image URL

        public string PhoneNumber { get; set; } // Candidate Phone

        public string Location { get; set; } // Candidate Location

        public int Experience { get; set; } // Years of experience

        public string Industry { get; set; } // Industry sector

        public string Description { get; set; } // Short description

    }
}
