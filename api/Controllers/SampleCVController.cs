using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using api.Dtos.SampleCV;
using System.Security.Claims;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using System.IO;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/sample-cv")]
    [ApiController]
    public class SampleCVController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly string _cvStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "sample-cv");

        public SampleCVController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadSampleCV([FromForm] SampleCVDto sampleCVDto)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "3") return Forbid();

                if (sampleCVDto.FileCV == null || sampleCVDto.FileCV.Length == 0)
                    return BadRequest("File CV is required.");

                Directory.CreateDirectory(_cvStoragePath);

                var uniqueFileName = $"{Guid.NewGuid()}_{sampleCVDto.FileCV.FileName}";
                var cvFilePath = Path.Combine(_cvStoragePath, uniqueFileName);

                using (var fileStream = new FileStream(cvFilePath, FileMode.Create))
                {
                    await sampleCVDto.FileCV.CopyToAsync(fileStream);
                }

                var relativeFilePath = Path.Combine("sample-cv", uniqueFileName).Replace("\\", "/");

                var sampleCV = new SampleCV
                {
                    SampleID = Guid.NewGuid().ToString(),
                    Title = sampleCVDto.Title,
                    Description = sampleCVDto.Description,
                    FileCV = relativeFilePath,
                };

                _context.SampleCVs.Add(sampleCV);
                await _context.SaveChangesAsync();

                return Ok("SampleCV submitted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }


        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSampleCV(string id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var sampleCV = await _context.SampleCVs
                .FirstOrDefaultAsync(j => j.SampleID == id);

            if (sampleCV == null)
            {
                return NotFound(new { error = "sampleCV not found." });
            }

            if (userRole != "3")
            {
                return Forbid();
            }

            _context.SampleCVs.Remove(sampleCV);
            await _context.SaveChangesAsync();

            return Ok(new { message = " sampleCV deleted successfully." });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSampleCVs(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var skip = (pageNumber - 1) * pageSize;

                var sampleCVs = await _context.SampleCVs
                    .OrderByDescending(cv => cv.Title)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                if (!sampleCVs.Any())
                {
                    return Ok(new { message = "No CV templates available." });
                }

                var totalTemplates = await _context.SampleCVs.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalTemplates / pageSize);

                var cvTemplates = sampleCVs.Select(cv => new
                {
                    SampleID = cv.SampleID,
                    Title = cv.Title,
                    Description = cv.Description,
                    FileCV = cv.FileCV
                }).ToList();

                return Ok(new
                {
                    CVTemplates = cvTemplates,
                    TotalTemplates = totalTemplates,
                    TotalPages = totalPages,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllSampleCVs: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllSampleCVsWithouPage()
        {
            try
            {
                var sampleCVs = await _context.SampleCVs
                    .OrderByDescending(cv => cv.Title)
                    .ToListAsync();

                if (!sampleCVs.Any())
                {
                    return Ok(new { message = "No CV templates available." });
                }

                var cvTemplates = sampleCVs.Select(cv => new
                {
                    SampleID = cv.SampleID,
                    Title = cv.Title,
                    Description = cv.Description,
                    FileCV = cv.FileCV
                }).ToList();

                return Ok(new
                {
                    CVTemplates = cvTemplates,
                    TotalTemplates = cvTemplates.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllSampleCVs: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        // GET api/samplecv/{fileName} 
        [HttpGet("{fileName}")]
        public IActionResult GetSampleCV(string fileName)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "sample-cv", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/pdf", fileName);
        }


        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateSampleCV(string id, [FromBody] UpdateSampleCVDto sampleCVDto)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "3") return Forbid();
                var sampleCV = await _context.SampleCVs
                    .FirstOrDefaultAsync(cv => cv.SampleID == id);

                if (sampleCV == null)
                {
                    return NotFound(new { error = "Sample CV not found." });
                }

                sampleCV.Title = sampleCVDto.Title ?? sampleCV.Title;
                sampleCV.Description = sampleCVDto.Description ?? sampleCV.Description;

                _context.SampleCVs.Update(sampleCV);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Sample CV updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }




    }
}
