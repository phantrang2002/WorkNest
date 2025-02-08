using System.Security.Claims;
using api.Data;
using api.Dtos.JobPosting;
using OfficeOpenXml;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/job-posting")]
    [ApiController]
    public class JobPostingController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public JobPostingController(ApplicationDBContext context)
        {
            _context = context;
        }

        // POST: api/JobPosting
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<JobPosting>> PostJobPosting(JobPostingDto jobPostingDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors);
                return BadRequest(errors);
            }

            var employerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            Console.WriteLine($"Employer ID: {employerId}");
            Console.WriteLine($"User Role: {userRole}");

            if (userRole != "2")
            {
                return Forbid();
            }

            var employer = await _context.Employers.FindAsync(employerId);
            if (employer == null)
            {
                return NotFound(new { error = "Employer not found!" });
            }

            var jobPosting = new JobPosting
            {
                JobPostingID = Guid.NewGuid().ToString(),
                EmployerID = employerId,
                Title = jobPostingDto.Title,
                Position = jobPostingDto.Position,
                Description = jobPostingDto.Description,
                Location = jobPostingDto.Location,
                CreatedOn = DateTime.Now,
                Time = jobPostingDto.Time,
                MinSalary = jobPostingDto.MinSalary,
                MaxSalary = jobPostingDto.MaxSalary,
                Quantity = jobPostingDto.Quantity,
                JobIndustry = jobPostingDto.JobIndustry,
                ExperienceExpect = jobPostingDto.ExperienceExpect,
                Status = false, // default status
                LockFlg = 0 //default lockflg
            };

            _context.JobPostings.Add(jobPosting);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetJobPosting", new { id = jobPosting.JobPostingID }, jobPosting);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<JobDetailDto>> GetJobPosting(string id)
        {
            var jobPosting = await _context.JobPostings
                .Include(j => j.Employer)
                .FirstOrDefaultAsync(j => j.JobPostingID == id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            var jobDetailDto = new JobDetailDto
            {
                JobID = jobPosting.JobPostingID,
                JobTitle = jobPosting.Title,
                Location = jobPosting.Location,
                Description = jobPosting.Description,
                MinSalary = jobPosting.MinSalary,
                MaxSalary = jobPosting.MaxSalary,
                Quantity = jobPosting.Quantity,
                JobIndustry = jobPosting.JobIndustry,
                ExperienceExpect = jobPosting.ExperienceExpect,
                PostedDate = jobPosting.CreatedOn,
                TimeRemaining = FormatTimeRemaining(jobPosting.Time),
                Time = jobPosting.Time,
                Position = jobPosting.Position,
                CompanyLogo = jobPosting.Employer.Avatar,
                CompanyName = jobPosting.Employer.EmployerName,
                Industry = jobPosting.Employer.Industry,
                CompanyLocation = jobPosting.Employer.Location,
                Size = jobPosting.Employer.Size,
                CompanyId = jobPosting.Employer.EmployerID,
                Status = jobPosting.Status,
                LockFlg = jobPosting.LockFlg
            };

            return Ok(jobDetailDto);
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

            if (hours == 0)
            {
                return $"{days} days";
            }
            return $"{days} days {hours} hours";
        }

        //status = true, lockflg = 0
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetAvailableJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                JobIndustry = jobPosting.JobIndustry ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }

        [HttpGet("available-for-user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<GetAllJobForUserDto>>> GetAvailableJobPostingsForUser(int pageNumber = 1, int pageSize = 10)
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized("Candidate ID not found in token.");
            }

            var totalJobCount = await _context.JobPostings
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var appliedJobPostings = await _context.ApplyForms
                .Where(af => af.CandidateID == candidateId)
                .Select(af => af.JobPostingID)
                .ToListAsync();

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobForUserDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                JobIndustry = jobPosting.JobIndustry ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn,
                Applied = appliedJobPostings.Contains(jobPosting.JobPostingID)
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }

        [HttpGet("available-for-admin")]
        public async Task<ActionResult<IEnumerable<JobPostingWithApplyStatsDto>>> GetAvailableJobPostingsForAdmin(int pageNumber = 1, int pageSize = 10)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "3")
            {
                return Forbid();
            }

            var totalJobCount = await _context.JobPostings
                .Where(j => j.Status == true && j.LockFlg != 1) // Status = true, LockFlg != 1
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Status == true && j.LockFlg != 1)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = new List<JobPostingWithApplyStatsDto>();

            foreach (var jobPosting in jobPostings)
            {
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

                jobPostingResponses.Add(new JobPostingWithApplyStatsDto
                {
                    JobPostingID = jobPosting.JobPostingID,
                    CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                    CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                    Title = jobPosting.Title ?? "N/A",
                    TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                    CreatedOn = jobPosting.CreatedOn,
                    TotalApplications = totalApplications,
                    NotReviewedCount = notReviewedCount,
                    NotSuitableCount = notSuitableCount,
                    SuitableCount = suitableCount
                });
            }

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }



        [HttpGet("expired")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetExpiredJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .Where(j => j.Time < DateTime.Now && j.Status == true)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Time < DateTime.Now && j.Status == true)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No expired job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }

        //lockflg = 1
        [HttpGet("admin-locked")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetAdminLockedJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .Where(j => j.LockFlg == 1)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.LockFlg == 1)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No locked by admin job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                LockFlg = jobPosting.LockFlg,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }

        //lockflg = 2
        [HttpGet("employer-locked")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetEmLockedJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .Where(j => j.LockFlg == 2)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.LockFlg == 2)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No locked by employer job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                LockFlg = jobPosting.LockFlg,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }


        //status = false
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetPendingJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .Where(j => j.Time > DateTime.Now && !j.Status)
                .Where(j => j.LockFlg == 0)

                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Time > DateTime.Now && !j.Status)
                .Where(j => j.LockFlg == 0)

                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn,
                LockFlg = jobPosting.LockFlg
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetAllJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var totalJobCount = await _context.JobPostings
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }
        [HttpGet("download/job-postings-report/available-for-admin")]
        public async Task<IActionResult> GetAvailableJobPostingsReportForAdmin()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "3")
            {
                return Forbid();
            }

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Status == true && j.LockFlg != 1)
                .OrderByDescending(j => j.CreatedOn)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = new List<JobPostingWithApplyStatsDto>();

            foreach (var jobPosting in jobPostings)
            {
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

                jobPostingResponses.Add(new JobPostingWithApplyStatsDto
                {
                    JobPostingID = jobPosting.JobPostingID,
                    CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                    CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                    Title = jobPosting.Title ?? "N/A",
                    Position = jobPosting.Position ?? "N/A",
                    Location = jobPosting.Location ?? "N/A",
                    TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                    Status = jobPosting.Status,
                    LockFlg = jobPosting.LockFlg,
                    CreatedOn = jobPosting.CreatedOn,
                    TotalApplications = totalApplications,
                    NotReviewedCount = notReviewedCount,
                    NotSuitableCount = notSuitableCount,
                    SuitableCount = suitableCount
                });
            }

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Available Job Postings");
                worksheet.Cells[1, 1].Value = "Job Posting ID";
                worksheet.Cells[1, 2].Value = "Company Name";
                worksheet.Cells[1, 3].Value = "Title";
                worksheet.Cells[1, 4].Value = "Position";
                worksheet.Cells[1, 5].Value = "Location";
                worksheet.Cells[1, 6].Value = "Time Remaining";
                worksheet.Cells[1, 7].Value = "Status";
                worksheet.Cells[1, 8].Value = "Locked";
                worksheet.Cells[1, 9].Value = "Created On";
                worksheet.Cells[1, 10].Value = "Total Applications";
                worksheet.Cells[1, 11].Value = "Not Reviewed";
                worksheet.Cells[1, 12].Value = "Not Suitable";
                worksheet.Cells[1, 13].Value = "Suitable";

                using (var range = worksheet.Cells[1, 1, 1, 13])
                {
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);
                    range.Style.Font.Bold = true;
                }

                for (int i = 0; i < jobPostingResponses.Count; i++)
                {
                    var job = jobPostingResponses[i];
                    worksheet.Cells[i + 2, 1].Value = job.JobPostingID;
                    worksheet.Cells[i + 2, 2].Value = job.CompanyName;
                    worksheet.Cells[i + 2, 3].Value = job.Title;
                    worksheet.Cells[i + 2, 4].Value = job.Position;
                    worksheet.Cells[i + 2, 5].Value = job.Location;
                    worksheet.Cells[i + 2, 6].Value = job.TimeRemaining;
                    worksheet.Cells[i + 2, 7].Value = job.Status ? "Available" : "Unavailable";
                    worksheet.Cells[i + 2, 8].Value = job.LockFlg switch
                    {
                        0 => "-",
                        1 => "By Admin",
                        2 => "By Employer",
                        _ => "Unknown" // Default case if the value is not 0, 1, or 2
                    };
                    worksheet.Cells[i + 2, 9].Value = job.CreatedOn?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A";
                    worksheet.Cells[i + 2, 10].Value = job.TotalApplications;
                    worksheet.Cells[i + 2, 11].Value = job.NotReviewedCount;
                    worksheet.Cells[i + 2, 12].Value = job.NotSuitableCount;
                    worksheet.Cells[i + 2, 13].Value = job.SuitableCount;
                }

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                var fileContents = package.GetAsByteArray();

                string fileName = $"Recruitment_Stats_Report_{DateTime.Now:yyyy-MM-dd}.xlsx";

                return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }



        [HttpGet("download/job-postings-report/all")]
        public async Task<IActionResult> GetAllJobPostingsReport()
        {
            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .OrderByDescending(j => j.CreatedOn)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                Status = jobPosting.Status,
                LockFlg = jobPosting.LockFlg,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Job Postings");

                worksheet.Cells[1, 1].Value = "Job Posting ID";
                worksheet.Cells[1, 2].Value = "Company Name";
                worksheet.Cells[1, 3].Value = "Title";
                worksheet.Cells[1, 4].Value = "Position";
                worksheet.Cells[1, 5].Value = "Location";
                worksheet.Cells[1, 6].Value = "Time Remaining";
                worksheet.Cells[1, 7].Value = "Status";
                worksheet.Cells[1, 8].Value = "Locked";
                worksheet.Cells[1, 9].Value = "Created On";

                using (var range = worksheet.Cells[1, 1, 1, 9])
                {
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Teal);
                    range.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    range.Style.Font.Bold = true;
                }

                for (int i = 0; i < jobPostingResponses.Count; i++)
                {
                    var job = jobPostingResponses[i];
                    worksheet.Cells[i + 2, 1].Value = job.JobPostingID;
                    worksheet.Cells[i + 2, 2].Value = job.CompanyName;
                    worksheet.Cells[i + 2, 3].Value = job.Title;
                    worksheet.Cells[i + 2, 4].Value = job.Position;
                    worksheet.Cells[i + 2, 5].Value = job.Location;
                    worksheet.Cells[i + 2, 6].Value = job.TimeRemaining;
                    worksheet.Cells[i + 2, 7].Value = job.Status ? "Available" : "Unavailable";
                    worksheet.Cells[i + 2, 8].Value = job.LockFlg switch
                    {
                        0 => "-",
                        1 => "By Admin",
                        2 => "By Employer",
                        _ => "Unknown" // Default case if the value is not 0, 1, or 2
                    };
                    worksheet.Cells[i + 2, 9].Value = job.CreatedOn?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A";
                }
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                var fileContents = package.GetAsByteArray();

                string fileName = $"JobPosting_All_{DateTime.Now:yyyy-MM-dd}.xlsx";

                return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }




        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<JobPosting>> UpdateJobPosting(string id, JobPostingDto jobPostingDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors);
                return BadRequest(errors);
            }

            var employerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var jobPosting = await _context.JobPostings.FindAsync(id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            if (jobPosting.EmployerID != employerId)
            {
                return Forbid();
            }

            jobPosting.Title = jobPostingDto.Title;
            jobPosting.Position = jobPostingDto.Position;
            jobPosting.Description = jobPostingDto.Description;
            jobPosting.Location = jobPostingDto.Location;
            jobPosting.Time = jobPostingDto.Time;
            jobPosting.MinSalary = jobPostingDto.MinSalary;
            jobPosting.MaxSalary = jobPostingDto.MaxSalary;
            jobPosting.Quantity = jobPostingDto.Quantity;
            jobPosting.JobIndustry = jobPostingDto.JobIndustry;
            jobPosting.ExperienceExpect = jobPostingDto.ExperienceExpect;
            jobPosting.CreatedOn = DateTime.Now;
            jobPosting.Status = false;
            jobPosting.LockFlg = 0;

            _context.Entry(jobPosting).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(jobPosting);
        }

        //SHOULD NOT
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobPosting(string id)
        {
            var employerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var jobPosting = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobPostingID == id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            if (userRole != "3" && jobPosting.EmployerID != employerId)
            {
                return Forbid();
            }

            _context.JobPostings.Remove(jobPosting);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job posting deleted successfully." });
        }

        //set lockflg = 1 
        [Authorize]
        [HttpPut("lock/{id}")]
        public async Task<IActionResult> LockJobPosting(string id)
        {
            var employerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var jobPosting = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobPostingID == id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            if (userRole != "3" && jobPosting.EmployerID != employerId)
            {
                return Forbid();
            }

            if (userRole == "3")
            {
                jobPosting.LockFlg = 1;  //locked
            }
            else if (jobPosting.EmployerID == employerId)
            {
                jobPosting.LockFlg = 2;  //closed
            }

            _context.JobPostings.Update(jobPosting);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job posting locked successfully." });
        }

        [Authorize]
        [HttpPut("unlock/{id}")]
        public async Task<IActionResult> UnlockJobPosting(string id)
        {
            var employerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var jobPosting = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobPostingID == id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            if (userRole != "3" && jobPosting.EmployerID != employerId)
            {
                return Forbid();
            }

            jobPosting.LockFlg = 0;
            _context.JobPostings.Update(jobPosting);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job posting unlocked successfully." });
        }

        [Authorize]
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveJobPosting(string id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var jobPosting = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobPostingID == id);

            if (jobPosting == null)
            {
                return NotFound(new { error = "Job posting not found." });
            }

            if (userRole != "3")
            {
                return Forbid();
            }

            jobPosting.Status = true;
            _context.JobPostings.Update(jobPosting);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Job posting approved successfully." });
        }

        [HttpGet("suitable")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> GetSuitableJobPostings(int pageNumber = 1, int pageSize = 10)
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized(new { error = "Invalid token or user not authenticated." });
            }

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.CandidateID == candidateId);

            if (candidate == null || string.IsNullOrEmpty(candidate.Industry))
            {
                return BadRequest(new { error = "Candidate or industry information not found." });
            }

            var totalJobCount = await _context.JobPostings
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .Where(j => j.JobIndustry == candidate.Industry)
                .Where(j => j.ExperienceExpect <= candidate.Experience)
                .CountAsync();

            var jobPostings = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.Time > DateTime.Now && j.Status == true)
                .Where(j => j.LockFlg == 0)
                .Where(j => j.JobIndustry == candidate.Industry)
                .Where(j => j.ExperienceExpect <= candidate.Experience)
                .OrderByDescending(j => j.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (jobPostings == null || jobPostings.Count == 0)
            {
                return NotFound(new { error = "No suitable job postings found." });
            }

            var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
            {
                JobPostingID = jobPosting.JobPostingID,
                CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                Title = jobPosting.Title ?? "N/A",
                Position = jobPosting.Position ?? "N/A",
                Location = jobPosting.Location ?? "N/A",
                TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                JobIndustry = jobPosting.JobIndustry ?? "N/A",
                Status = jobPosting.Status,
                CreatedOn = jobPosting.CreatedOn
            }).ToList();

            return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<GetAllJobDto>>> SearchJobs(
        string jobTitle = "",
        string location = "",
        int pageNumber = 1,
        int pageSize = 10)
        {
            try
            {
                var query = _context.JobPostings.AsQueryable();

                if (!string.IsNullOrEmpty(jobTitle))
                {
                    query = query.Where(j => j.Title.Contains(jobTitle));
                }

                if (!string.IsNullOrEmpty(location))
                {
                    query = query.Where(j => j.Location.Contains(location));
                }

                var filteredQuery = query
                    .Where(j => j.Time > DateTime.Now && j.Status == true)
                    .Where(j => j.LockFlg == 0);

                var totalJobCount = await filteredQuery.CountAsync();

                var jobPostings = await filteredQuery
                    .OrderByDescending(j => j.CreatedOn)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Include(j => j.Employer)
                    .ToListAsync();

                if (jobPostings == null || jobPostings.Count == 0)
                {
                    return NotFound(new { error = "No job postings found." });
                }

                var jobPostingResponses = jobPostings.Select(jobPosting => new GetAllJobDto
                {
                    JobPostingID = jobPosting.JobPostingID,
                    CompanyLogo = jobPosting.Employer?.Avatar ?? "N/A",
                    CompanyName = jobPosting.Employer?.EmployerName ?? "N/A",
                    Title = jobPosting.Title ?? "N/A",
                    Position = jobPosting.Position ?? "N/A",
                    Location = jobPosting.Location ?? "N/A",
                    TimeRemaining = FormatTimeRemaining(jobPosting.Time) ?? "N/A",
                    JobIndustry = jobPosting.JobIndustry ?? "N/A",
                    Status = jobPosting.Status,
                    CreatedOn = jobPosting.CreatedOn
                }).ToList();

                return Ok(new { TotalCount = totalJobCount, JobPostings = jobPostingResponses });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
