using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Data;
using api.Dtos.Employer;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/employer")]
    [ApiController]
    public class EmployerController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly UserManager<Account> _userManager;

        public EmployerController(ApplicationDBContext context, UserManager<Account> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/employer/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<GetEmployerDto>> GetEmployerById(string id)
        {
            var employer = await _context.Employers
                .Include(e => e.JobPostings)
                .FirstOrDefaultAsync(e => e.EmployerID == id);

            if (employer == null)
            {
                return NotFound(new { error = "Employer not found" });
            }

            var employerDto = new GetEmployerDto
            {
                EmployerID = employer.EmployerID,
                EmployerName = employer.EmployerName,
                Avatar = employer.Avatar,
                Industry = employer.Industry,
                Location = employer.Location,
                Size = employer.Size,
                Description = employer.Description,
                JobPostings = employer.JobPostings
                .Where(jp => jp.Time > DateTime.Now && jp.Status == true && jp.LockFlg == 0)
                .OrderBy(jp => jp.Time)
                .Select(jp => new JobSummaryDto
                {
                    JobPostingID = jp.JobPostingID,
                    CompanyLogo = jp.Employer.Avatar,
                    Title = jp.Title,
                    Position = jp.Position,
                    Location = jp.Location,
                    TimeRemaining = FormatTimeRemaining(jp.Time)
                }).ToList()
            };

            return Ok(employerDto);
        }

        [HttpGet("profile")]
        public async Task<ActionResult<GetEmployerDto>> GetProfile()
        {
            var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var employer = await _context.Employers
                .Include(e => e.JobPostings)
                .FirstOrDefaultAsync(e => e.EmployerID == employerId);

            if (employer == null)
            {
                return NotFound(new { error = "Employer profile not found" });
            }

            var employerDto = new GetEmployerDto
            {
                EmployerID = employer.EmployerID,
                EmployerName = employer.EmployerName,
                Avatar = employer.Avatar,
                Industry = employer.Industry,
                Location = employer.Location,
                Size = employer.Size,
                Description = employer.Description,
                JobPostings = employer.JobPostings
                  .Where(j => j.Time > DateTime.Now) // Include only unexpired job postings
                  .Where(j => j.Status == true)
                  .Where(j => j.LockFlg == 0)

                .OrderBy(jp => jp.Time)
                .Select(jp => new JobSummaryDto
                {
                    JobPostingID = jp.JobPostingID,
                    CompanyLogo = jp.Employer.Avatar,
                    Title = jp.Title,
                    Position = jp.Position,
                    Location = jp.Location,
                    TimeRemaining = FormatTimeRemaining(jp.Time)
                }).ToList()
            };

            return Ok(employerDto);
        }

        [HttpGet("profile/complete-info")]
        public async Task<ActionResult<bool>> IsProfileComplete()
        {
            // Lấy EmployerID từ JWT token (Claim)
            var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Tìm employer theo ID
            var employer = await _context.Employers
                .FirstOrDefaultAsync(e => e.EmployerID == employerId);

            // Nếu không tìm thấy employer, trả về lỗi 404
            if (employer == null)
            {
                return NotFound(new { error = "Employer profile not found" });
            }

            // Kiểm tra các trường thông tin cần thiết
            bool isComplete = !string.IsNullOrEmpty(employer.Industry) &&
                            !string.IsNullOrEmpty(employer.Location) &&
                            !string.IsNullOrEmpty(employer.Size) &&
                            !string.IsNullOrEmpty(employer.Description);

            // Trả về kết quả true/false
            return Ok(isComplete);
        }

        // PUT: api/employer/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateEmployerDto updateDto)
        {
            var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var employer = await _context.Employers
                .FirstOrDefaultAsync(e => e.EmployerID == employerId);

            if (employer == null)
            {
                return NotFound(new { error = "Employer profile not found" });
            }

            employer.EmployerName = updateDto.EmployerName ?? employer.EmployerName;
            employer.Industry = updateDto.Industry ?? employer.Industry;
            employer.Location = updateDto.Location ?? employer.Location;
            employer.Size = updateDto.Size ?? employer.Size;
            employer.Description = updateDto.Description ?? employer.Description;


            _context.Entry(employer).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employer profile updated successfully" });
        }

        private string FormatTimeRemaining(DateTime expiryDate)
        {
            var remainingTime = expiryDate - DateTime.Now;

            if (remainingTime.TotalSeconds <= 0)
            {
                return "Expired";
            }

            var days = (int)remainingTime.TotalDays;
            var hours = remainingTime.Hours;

            return hours == 0 ? $"{days} days" : $"{days} days {hours} hours";
        }

        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/images/{fileName}";

            var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var employer = await _context.Employers.FindAsync(employerId);
            if (employer == null)
            {
                return NotFound(new { error = "Employer not found" });
            }

            employer.Avatar = imageUrl;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Image uploaded successfully!", imageUrl });
        }

        [HttpGet("job")]
public async Task<ActionResult<GetMyJobPosting>> GetJobPostingsByEmployer(int pageNumber = 1, int pageSize = 10)
{
    var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(employerId))
    {
        return Unauthorized(new { error = "Employer ID not found in claims" });
    }

    var employer = await _context.Employers
        .Include(e => e.JobPostings)  // Include JobPostings related to the employer
        .FirstOrDefaultAsync(e => e.EmployerID == employerId);

    if (employer == null)
    {
        return NotFound(new { error = "Employer not found" });
    }

    var totalJobPostings = employer.JobPostings.Count(job => job.Status == true);

    // Get the paginated job postings
    var jobPostings = employer.JobPostings
        .Where(jp => jp.Status == true)
        .OrderByDescending(jp => jp.Time)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize);

    var jobSummaryDtos = new List<GetMyJobPosting>();

    foreach (var jobPosting in jobPostings)
    {
        // Tính toán các thống kê ứng viên
        var totalApplications = await _context.ApplyForms
            .Where(af => af.JobPostingID == jobPosting.JobPostingID)
            .CountAsync();

        var notReviewedCount = await _context.ApplyForms
            .Where(af => af.JobPostingID == jobPosting.JobPostingID && af.Status == 0)
            .CountAsync();

        var notSuitableCount = await _context.ApplyForms
            .Where(af => af.JobPostingID == jobPosting.JobPostingID && af.Status == 1)
            .CountAsync();

        var suitableCount = await _context.ApplyForms
            .Where(af => af.JobPostingID == jobPosting.JobPostingID && af.Status == 2)
            .CountAsync();

        // Thêm job posting với các thống kê vào danh sách DTO
        jobSummaryDtos.Add(new GetMyJobPosting
        {
            JobPostingID = jobPosting.JobPostingID,
            CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
            Title = jobPosting.Title ?? "N/A",
            Position = jobPosting.Position ?? "N/A",
            Location = jobPosting.Location ?? "N/A",
            Industry = jobPosting.JobIndustry ?? "N/A",
            CreatedOn = jobPosting.CreatedOn,
            LockFlg = jobPosting.LockFlg,
            TimeRemaining = FormatTimeRemaining(jobPosting.Time),
            TotalApplications = totalApplications,
            NotReviewedCount = notReviewedCount,
            NotSuitableCount = notSuitableCount,
            SuitableCount = suitableCount
        });
    }

    var totalPages = (int)Math.Ceiling(totalJobPostings / (double)pageSize);

    return Ok(new
    {
        JobPostings = jobSummaryDtos,
        TotalCount = totalJobPostings,
        TotalPages = totalPages,
        PageNumber = pageNumber,
        PageSize = pageSize
    });
}


        [HttpGet("job-pending")]
        public async Task<ActionResult<GetMyJobPosting>> GetPendingJobPostingsByEmployer(int pageNumber = 1, int pageSize = 10)
        {
            var employerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(employerId))
            {
                return Unauthorized(new { error = "Employer ID not found in claims" });
            }

            var employer = await _context.Employers
                .Include(e => e.JobPostings)
                .FirstOrDefaultAsync(e => e.EmployerID == employerId);

            if (employer == null)
            {
                return NotFound(new { error = "Employer not found" });
            }

            var totalJobPostings = employer.JobPostings.Count(job => job.Status == false);


            var jobPostings = employer.JobPostings
                .Where(jp => jp.Status == false)
                .OrderByDescending(jp => jp.Time)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var jobSummaryDtos = jobPostings.Select(jp => new GetMyJobPosting
            {
                JobPostingID = jp.JobPostingID,
                CompanyLogo = jp.Employer?.Avatar ?? "N/A",
                Title = jp.Title ?? "N/A",
                Position = jp.Position ?? "N/A",
                Location = jp.Location ?? "N/A",
                CreatedOn = jp.CreatedOn,
                LockFlg = jp.LockFlg,
                TimeRemaining = FormatTimeRemaining(jp.Time)
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalJobPostings / (double)pageSize);

            return Ok(new
            {
                JobPostings = jobSummaryDtos,
                TotalCount = totalJobPostings,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }




        // GET: api/employer/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<GetEmployerDto>>> GetAllEmployers(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Employers
                .Include(e => e.JobPostings);
            var totalEmployers = await query.CountAsync();

            var employers = await query
                .OrderBy(e => e.EmployerName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (employers == null || employers.Count == 0)
            {
                return NotFound(new { error = "No employers found" });
            }

            var employerDtos = employers.Select(employer => new EmployerSummaryDto
            {
                EmployerID = employer.EmployerID,
                EmployerName = employer.EmployerName,
                Avatar = employer.Avatar,
                Industry = employer.Industry,
                Location = employer.Location,
                Description = employer.Description
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalEmployers / (double)pageSize);

            return Ok(new
            {
                Employers = employerDtos,
                TotalCount = totalEmployers,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }



        // GET: api/employer/all
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<GetEmployerDto>>> GetAvailableEmployers(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Employers
                .Include(e => e.JobPostings)
                .Where(e => e.Account.Status == true);

            var totalEmployers = await query.CountAsync();

            var employers = await query
                .OrderBy(e => e.EmployerName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (employers == null || employers.Count == 0)
            {
                return NotFound(new { error = "No employers found" });
            }

            var employerDtos = employers.Select(employer => new EmployerSummaryDto
            {
                EmployerID = employer.EmployerID,
                EmployerName = employer.EmployerName,
                Avatar = employer.Avatar,
                Industry = employer.Industry,
                Location = employer.Location,
                Size = employer.Size,
                Description = employer.Description
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalEmployers / (double)pageSize);

            return Ok(new
            {
                Employers = employerDtos,
                TotalCount = totalEmployers,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }


        // GET: api/employer/all
        [HttpGet("locked")]
        public async Task<ActionResult<IEnumerable<GetEmployerDto>>> GetLockedEmployers(int pageNumber = 1, int pageSize = 10)
        {
            var totalEmployers = await _context.Employers
                .Where(e => e.Account.Status == false)
                .CountAsync();

            var employers = await _context.Employers
                .Include(e => e.JobPostings)
                .Where(e => e.Account.Status == false)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (employers == null || employers.Count == 0)
            {
                return NotFound(new { error = "No employers found" });
            }

            var employerDtos = employers.Select(employer => new EmployerSummaryDto
            {
                EmployerID = employer.EmployerID,
                EmployerName = employer.EmployerName,
                Avatar = employer.Avatar,
                Industry = employer.Industry,
                Location = employer.Location,
                Description = employer.Description
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalEmployers / (double)pageSize);

            return Ok(new
            {
                Employers = employerDtos,
                TotalCount = totalEmployers,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        [Authorize]
        [HttpPut("lock/{id}")]
        public async Task<IActionResult> LockAnEmployer(string id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == null || userRole != "3")
            {
                return Forbid();
            }

            var account = await _userManager.Users
                .FirstOrDefaultAsync(a => a.UserID == id);

            if (account == null)
            {
                return NotFound(new { error = "Account not found for this employer." });
            }

            if (account.UserID == null)
            {
                return StatusCode(500, new { error = "Account found, but UserID is null." });
            }

            if (account.Status == null)
            {
                return StatusCode(500, new { error = "Account found, but Status is null." });
            }

            account.Status = false;

            try
            {
                var result = await _userManager.UpdateAsync(account);

                if (!result.Succeeded)
                {
                    return StatusCode(500, new { error = "Failed to update the account", details = result.Errors });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while locking the account", details = ex.Message });
            }

            return Ok(new { message = "Employer locked successfully.", accountId = account.UserID });
        }


        [Authorize]
        [HttpPut("unlock/{id}")]
        public async Task<IActionResult> UnlockAnEmployer(string id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == null || userRole != "3")
            {
                return Forbid();
            }

            var account = await _userManager.Users
                .FirstOrDefaultAsync(a => a.UserID == id);

            if (account == null)
            {
                return NotFound(new { error = "Account not found for this employer." });
            }

            if (account.UserID == null)
            {
                return StatusCode(500, new { error = "Account found, but UserID is null." });
            }

            if (account.Status == null)
            {
                return StatusCode(500, new { error = "Account found, but Status is null." });
            }

            account.Status = true;

            try
            {
                var result = await _userManager.UpdateAsync(account);

                if (!result.Succeeded)
                {
                    return StatusCode(500, new { error = "Failed to update the account", details = result.Errors });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while unlocking the account", details = ex.Message });
            }

            return Ok(new { message = "Employer unlocked successfully.", accountId = account.UserID });
        }



    }
}
