using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using api.Data;
using api.Dtos.JobPosting;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/apply-form")]
    [ApiController]
    public class ApplyFormController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly string _cvStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "cv", "applyform");
        private readonly UserManager<Account> _userManager;


        private readonly IConfiguration _configuration;
        public ApplyFormController(ApplicationDBContext context, UserManager<Account> userManager, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> ApplyJob([FromForm] ApplyFormDto applyFormDto)
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized("Candidate ID not found in token.");
            }

            var jobPosting = await _context.JobPostings
                                           .Include(jp => jp.Employer)
                                           .FirstOrDefaultAsync(jp => jp.JobPostingID == applyFormDto.JobPostingID);
            if (jobPosting == null)
            {
                return NotFound("Job posting not found.");
            }

            if (applyFormDto.CVFile == null || applyFormDto.CVFile.Length == 0)
            {
                return BadRequest("CV file is required.");
            }

            Directory.CreateDirectory(_cvStoragePath);

            var uniqueFileName = $"{Guid.NewGuid()}_{applyFormDto.CVFile.FileName}";
            var cvFilePath = Path.Combine(_cvStoragePath, uniqueFileName);

            using (var fileStream = new FileStream(cvFilePath, FileMode.Create))
            {
                await applyFormDto.CVFile.CopyToAsync(fileStream);
            }

            var relativeFilePath = Path.Combine("cv", "applyform", uniqueFileName).Replace("\\", "/");

            var applyForm = new ApplyForm
            {
                JobPostingID = applyFormDto.JobPostingID,
                CandidateID = candidateId,
                FileCV = relativeFilePath,
                ApplyDate = DateTime.Now,
                Status = 0 // Default status: Not yet reviewed
            };

            _context.ApplyForms.Add(applyForm);
            await _context.SaveChangesAsync();

            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.CandidateID == candidateId);
            var employerAccount = await _userManager.Users.FirstOrDefaultAsync(acc => acc.UserID == jobPosting.EmployerID);

            if (candidate == null || employerAccount == null)
            {
                return BadRequest("Candidate or Employer details not found.");
            }

            string employerEmail = employerAccount.Email;
            string candidateName = candidate.Name;
            string jobTitle = jobPosting.Title;
            DateTime applyDate = applyForm.ApplyDate;

            string subject = $@"WORKNEST - New Job Application Received for {jobTitle} of {jobPosting.Employer.EmployerName}";
            string body = $@"
                <p>Dear {jobPosting.Employer.EmployerName},</p>
                <p>We are pleased to inform you that <strong>{candidateName}</strong> has applied for the position 
                <strong>{jobTitle}</strong> on <strong>{applyDate:yyyy-MM-dd HH:mm}</strong>.</p>
                <p>Please log in to WorkNest and check the <strong>'View Applicants'</strong> section for the job <strong>{jobTitle}</strong>.</p>
                <p>------------------</p>
                <p>Best Regards,<br>WorkNest</p>";


            bool emailSent = await SendEmailAsync(employerEmail, subject, body);
            if (!emailSent)
            {
                return StatusCode(500, "Application submitted, but failed to send email notification.");
            }

            return Ok("Application submitted successfully and email notification sent.");
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var fromAddress = new MailAddress(_configuration["EmailSettings:FromEmail"], "WorkNest");
                var toAddress = new MailAddress(toEmail);

                using (var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"]))
                {
                    smtpClient.Port = int.Parse(_configuration["EmailSettings:Port"]);
                    smtpClient.Credentials = new NetworkCredential(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                    smtpClient.EnableSsl = true;

                    var mailMessage = new MailMessage
                    {
                        From = fromAddress,
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(toAddress);

                    await smtpClient.SendMailAsync(mailMessage);
                }

                return true;
            }
            catch (SmtpException smtpEx)
            {
                Console.WriteLine($"SMTP Error: {smtpEx.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return false;
            }
        }


        [HttpGet("check-applied/{jobPostingId}")]
        [Authorize]
        public async Task<IActionResult> CheckIfApplied(Guid jobPostingId)
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized("Candidate ID not found in token.");
            }

            var jobPostingIdStr = jobPostingId.ToString();

            var existingApplication = await _context.ApplyForms
                .FirstOrDefaultAsync(af => af.CandidateID == candidateId && af.JobPostingID == jobPostingIdStr);

            if (existingApplication != null)
            {
                return Ok(new { applied = true, message = "You have already applied for this job." });
            }

            return Ok(new { applied = false, message = "You have not applied for this job." });
        }

        [HttpGet("applied-jobs")]
        [Authorize]
        public async Task<IActionResult> GetAppliedJobs(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized("Candidate ID not found in token.");
                }

                var skip = (pageNumber - 1) * pageSize;

                var appliedJobs = await _context.ApplyForms
                    .Where(af => af.CandidateID == candidateId)
                    .Include(af => af.JobPosting)
                    .ThenInclude(jp => jp.Employer)
                    .OrderByDescending(af => af.ApplyDate)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                if (appliedJobs.Count == 0)
                {
                    return Ok(new { message = "You have not applied for any jobs." });
                }

                var totalApplications = await _context.ApplyForms
                    .Where(af => af.CandidateID == candidateId)
                    .CountAsync();

                var totalPages = (int)Math.Ceiling((double)totalApplications / pageSize);

                var jobPostings = appliedJobs.Select(af => new
                {
                    JobPostingID = af.JobPostingID,
                    JobTitle = af.JobPosting?.Title ?? "Unknown",
                    Position = af.JobPosting?.Position ?? "Unknown",
                    EmployerName = af.JobPosting?.Employer.EmployerName ?? "Unknown",
                    EmployerAvatar = af.JobPosting?.Employer?.Avatar ?? "default-avatar.png",
                    ApplyDate = af.ApplyDate,
                    CvFile = af.FileCV ?? "No CV uploaded",
                    MinSalary = af.JobPosting?.MinSalary ?? 0,
                    MaxSalary = af.JobPosting?.MaxSalary ?? 0,
                    Status = af.Status,
                    JobStatus = af.JobPosting?.Status,
                    JobLocked = af.JobPosting?.LockFlg,
                    TimeRemaining = FormatTimeRemaining(af.JobPosting.Time) ?? "N/A",
                }).ToList();

                return Ok(new
                {
                    JobPostings = jobPostings,
                    TotalApplications = totalApplications,
                    TotalPages = totalPages,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAppliedJobs: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }
        [HttpGet("applicants/{jobPostingId}")]
        [Authorize]
        public async Task<IActionResult> GetApplicantsForJob(Guid jobPostingId, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var jobPosting = await _context.JobPostings
                    .FirstOrDefaultAsync(jp => jp.JobPostingID == jobPostingId.ToString());

                if (jobPosting == null)
                {
                    return NotFound("Job posting not found.");
                }

                if (jobPosting.EmployerID != currentUserId)
                {
                    return Unauthorized("You are not authorized to view applicants for this job.");
                }

                var totalApplicants = await _context.ApplyForms
                    .Where(af => af.JobPostingID == jobPostingId.ToString())
                    .CountAsync();

                var totalPages = (int)Math.Ceiling(totalApplicants / (double)pageSize);

                var applicants = await _context.ApplyForms
                    .Where(af => af.JobPostingID == jobPostingId.ToString())
                    .Include(af => af.Candidate)
                    .ThenInclude(c => c.Account)
                    .Select(af => new
                    {
                        ApplicantId = af.Candidate.CandidateID,
                        ApplicantName = af.Candidate.Name,
                        ApplicantEmail = af.Candidate.Account.Email,
                        ApplicantPhone = af.Candidate.PhoneNumber,
                        CVFile = af.FileCV,
                        ApplyDate = af.ApplyDate,
                        Status = af.Status == 0 ? 0 : (af.Status == 1 ? 1 : 2)
                    })
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (applicants == null || !applicants.Any())
                {
                    return Ok(new { message = "No applicants have applied for this job." });
                }

                return Ok(new
                {
                    TotalCount = totalApplicants,
                    TotalPages = totalPages,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Applicants = applicants
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetApplicantsForJob: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching applicants.");
            }
        }

        [HttpPut("update-status/{jobPostingId}/{candidateId}")]
        [Authorize]
        public async Task<IActionResult> UpdateApplyFormStatus(Guid jobPostingId, Guid candidateId, [FromBody] int status)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var jobPosting = await _context.JobPostings
                    .Include(jp => jp.Employer)
                    .FirstOrDefaultAsync(jp => jp.JobPostingID == jobPostingId.ToString());

                if (jobPosting == null || jobPosting.Employer == null)
                {
                    return NotFound("Job posting or Employer not found.");
                }

                if (jobPosting.EmployerID.ToString() != currentUserId)
                {
                    return Unauthorized("You are not authorized to update the status of this application.");
                }

                var applyForm = await _context.ApplyForms
                    .FirstOrDefaultAsync(af => af.JobPostingID == jobPostingId.ToString() && af.CandidateID == candidateId.ToString());

                if (applyForm == null)
                {
                    return NotFound("Application form not found.");
                }

                if (status < 0 || status > 2)
                {
                    return BadRequest("Invalid status value. It must be 0 (Not Reviewed), 1 (Not suitable), or 2 (Suitable).");
                }

                applyForm.Status = status;
                _context.ApplyForms.Update(applyForm);
                await _context.SaveChangesAsync();

                var candidate = await _context.Candidates
                    .Include(c => c.Account)
                    .FirstOrDefaultAsync(c => c.CandidateID == candidateId.ToString());

                if (candidate == null)
                {
                    return NotFound("Candidate not found.");
                }

                if (candidate.Account == null)
                {
                    return NotFound("Candidate account not found.");
                }

                string statusDescription = status switch
                {
                    0 => "Not Reviewed",
                    1 => "Not Suitable",
                    2 => "Suitable",
                    _ => "Unknown"
                };

                string subject = $"[WORKNEST] Application Status Update for {jobPosting.Title}";
                string body = $@"
            <p>Dear {candidate.Name},</p>
            <p>We are writing to inform you that <strong>{jobPosting.Employer.EmployerName}</strong> has reviewed your application for the position of <strong>{jobPosting.Title}</strong> on <strong>{applyForm.ApplyDate:yyyy-MM-dd HH:mm}</strong>.</p>
            <p>Your application status has been updated to: <strong>{statusDescription}</strong>.</p>
            <p>------------------</p>
            <p>Best Regards,<br>Your Recruitment System</p>";

                await SendEmailAsync(candidate.Account.Email, subject, body);

                return Ok(new { message = "Application status updated and email sent successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the application status.");
            }
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
    }
}
