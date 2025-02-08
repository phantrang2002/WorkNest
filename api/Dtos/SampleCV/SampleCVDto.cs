namespace api.Dtos.SampleCV
{
    public class SampleCVDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile FileCV { get; set; }

    }
}
