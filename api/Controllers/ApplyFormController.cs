using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Data;
using api.Dtos.JobPosting;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            // Extract CandidateID from token
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized("Candidate ID not found in token.");
            }

            // Get Job Posting from database
            var jobPosting = await _context.JobPostings
                                           .Include(jp => jp.Employer) // Include Employer to get EmployerID
                                           .FirstOrDefaultAsync(jp => jp.JobPostingID == applyFormDto.JobPostingID);
            if (jobPosting == null)
            {
                return NotFound("Job posting not found.");
            }

            // Handle file upload
            if (applyFormDto.CVFile == null || applyFormDto.CVFile.Length == 0)
            {
                return BadRequest("CV file is required.");
            }

            // Ensure the directory exists
            Directory.CreateDirectory(_cvStoragePath);

            // Create a unique file name
            var uniqueFileName = $"{Guid.NewGuid()}_{applyFormDto.CVFile.FileName}";
            var cvFilePath = Path.Combine(_cvStoragePath, uniqueFileName);

            using (var fileStream = new FileStream(cvFilePath, FileMode.Create))
            {
                await applyFormDto.CVFile.CopyToAsync(fileStream);
            }

            // Store only the relative path to the file in the database
            var relativeFilePath = Path.Combine("cv", "applyform", uniqueFileName).Replace("\\", "/");

            // Create ApplyForm record
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

            // Get Candidate and Employer details
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.CandidateID == candidateId);
            var employerAccount = await _userManager.Users.FirstOrDefaultAsync(acc => acc.UserID == jobPosting.EmployerID);

            if (candidate == null || employerAccount == null)
            {
                return BadRequest("Candidate or Employer details not found.");
            }

            // Send Email to Employer
            string employerEmail = employerAccount.Email;
            string candidateName = candidate.Name;
            string jobTitle = jobPosting.Title;
            DateTime applyDate = applyForm.ApplyDate;

            string subject = $@"[WORKNEST] New Job Application Received for {jobTitle} of {jobPosting.Employer.EmployerName}";
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
                // Email address and display name for the sender
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
                        IsBodyHtml = true // Set to true to enable HTML content
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
            // Extract CandidateID from the token
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized("Candidate ID not found in token.");
            }

            // Convert jobPostingId to string for comparison
            var jobPostingIdStr = jobPostingId.ToString();

            // Check if the user has already applied for the job
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
                // Extract CandidateID from the token
                var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized("Candidate ID not found in token.");
                }

                // Calculate the number of jobs to skip based on the current page
                var skip = (pageNumber - 1) * pageSize;

                // Fetch applied jobs for this candidate with pagination
                var appliedJobs = await _context.ApplyForms
                    .Where(af => af.CandidateID == candidateId)
                    .Include(af => af.JobPosting)  // Including the JobPosting details
                    .ThenInclude(jp => jp.Employer)
                    .OrderByDescending(af => af.ApplyDate)  // Optionally, order by application date
                    .Skip(skip)  // Skip the appropriate number of jobs for pagination
                    .Take(pageSize)  // Take only the number of jobs for the current page
                    .ToListAsync();

                if (appliedJobs.Count == 0)
                {
                    return Ok(new { message = "You have not applied for any jobs." });
                }

                // Count total applications to calculate total pages
                var totalApplications = await _context.ApplyForms
                    .Where(af => af.CandidateID == candidateId)
                    .CountAsync();

                // Calculate total pages
                var totalPages = (int)Math.Ceiling((double)totalApplications / pageSize);

                // Map to a DTO or anonymous object to return the relevant job details
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
                    TimeRemaining = FormatTimeRemaining(af.JobPosting.Time) ?? "N/A", // If null, return "N/A"
                }).ToList();

                // Return the job postings along with pagination information
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
                // Log the error (or use a logging library like Serilog, NLog, etc.)
                Console.WriteLine($"Error in GetAppliedJobs: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                // Return a generic error message
                return StatusCode(500, "An unexpected error occurred.");
            }
        }
        [HttpGet("applicants/{jobPostingId}")]
        [Authorize]
        public async Task<IActionResult> GetApplicantsForJob(Guid jobPostingId, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại từ Claims
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Lấy ID người dùng từ token

                // Kiểm tra công việc có tồn tại không
                var jobPosting = await _context.JobPostings
                    .FirstOrDefaultAsync(jp => jp.JobPostingID == jobPostingId.ToString()); // Chuyển jobPostingId thành string

                if (jobPosting == null)
                {
                    return NotFound("Job posting not found.");
                }

                // Kiểm tra nếu người dùng hiện tại là nhà tuyển dụng của công việc này
                if (jobPosting.EmployerID != currentUserId) // So sánh EmployerID (string) với currentUserId (string)
                {
                    return Unauthorized("You are not authorized to view applicants for this job.");
                }

                // Lấy tổng số ứng viên cho công việc này
                var totalApplicants = await _context.ApplyForms
                    .Where(af => af.JobPostingID == jobPostingId.ToString())
                    .CountAsync(); // Lấy tổng số ứng viên

                // Tính toán tổng số trang
                var totalPages = (int)Math.Ceiling(totalApplicants / (double)pageSize);

                // Lấy danh sách ứng viên đã nộp đơn cho công việc này theo phân trang
                var applicants = await _context.ApplyForms
                    .Where(af => af.JobPostingID == jobPostingId.ToString())
                    .Include(af => af.Candidate)  // Kết hợp với thông tin ứng viên
                    .ThenInclude(c => c.Account)  // Kết hợp với thông tin người dùng (email)
                    .Select(af => new
                    {
                        ApplicantId = af.Candidate.CandidateID,
                        ApplicantName = af.Candidate.Name,  // Tên ứng viên
                        ApplicantEmail = af.Candidate.Account.Email,  // Email ứng viên
                        ApplicantPhone = af.Candidate.PhoneNumber, // Số điện thoại ứng viên
                        CVFile = af.FileCV,  // Đường dẫn tới CV
                        ApplyDate = af.ApplyDate, // Ngày nộp đơn
                        Status = af.Status == 0 ? 0 : (af.Status == 1 ? 1 : 2)  // Trả về các giá trị int 
                    })
                    .Skip((pageNumber - 1) * pageSize) // Bỏ qua số lượng ứng viên của các trang trước
                    .Take(pageSize) // Lấy số lượng ứng viên theo pageSize
                    .ToListAsync();

                // Kiểm tra danh sách ứng viên
                if (applicants == null || !applicants.Any())
                {
                    return Ok(new { message = "No applicants have applied for this job." });
                }

                // Trả về thông tin phân trang và danh sách ứng viên
                return Ok(new
                {
                    TotalCount = totalApplicants,  // Tổng số ứng viên
                    TotalPages = totalPages,       // Tổng số trang
                    PageNumber = pageNumber,       // Số trang hiện tại
                    PageSize = pageSize,           // Kích thước trang
                    Applicants = applicants        // Danh sách ứng viên
                });
            }
            catch (Exception ex)
            {
                // Log lỗi nếu có
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
                // Get the current user ID from Claims
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Find the JobPosting, including Employer relationship
                var jobPosting = await _context.JobPostings
                    .Include(jp => jp.Employer) // Ensure Employer is loaded
                    .FirstOrDefaultAsync(jp => jp.JobPostingID == jobPostingId.ToString());

                if (jobPosting == null || jobPosting.Employer == null)
                {
                    return NotFound("Job posting or Employer not found.");
                }

                // Check if the current user is authorized (Employer)
                if (jobPosting.EmployerID.ToString() != currentUserId)
                {
                    return Unauthorized("You are not authorized to update the status of this application.");
                }

                // Find the ApplyForm
                var applyForm = await _context.ApplyForms
                    .FirstOrDefaultAsync(af => af.JobPostingID == jobPostingId.ToString() && af.CandidateID == candidateId.ToString());

                if (applyForm == null)
                {
                    return NotFound("Application form not found.");
                }

                // Check the status value
                if (status < 0 || status > 2)
                {
                    return BadRequest("Invalid status value. It must be 0 (Not Reviewed), 1 (Not suitable), or 2 (Suitable).");
                }

                // Update the application status
                applyForm.Status = status;
                _context.ApplyForms.Update(applyForm);
                await _context.SaveChangesAsync();

                // Find the candidate based on candidateId
                var candidate = await _context.Candidates
                    .Include(c => c.Account) // Include Account navigation
                    .FirstOrDefaultAsync(c => c.CandidateID == candidateId.ToString());

                if (candidate == null)
                {
                    return NotFound("Candidate not found.");
                }

                // Ensure that candidate.Account is not null before accessing Email
                if (candidate.Account == null)
                {
                    return NotFound("Candidate account not found.");
                }

                // Determine the status description
                string statusDescription = status switch
                {
                    0 => "Not Reviewed",
                    1 => "Not Suitable",
                    2 => "Suitable",
                    _ => "Unknown"
                };

                // Compose the email body
                string subject = $"[WORKNEST] Application Status Update for {jobPosting.Title}";
                string body = $@"
            <p>Dear {candidate.Name},</p>
            <p>We are writing to inform you that <strong>{jobPosting.Employer.EmployerName}</strong> has reviewed your application for the position of <strong>{jobPosting.Title}</strong> on <strong>{applyForm.ApplyDate:yyyy-MM-dd HH:mm}</strong>.</p>
            <p>Your application status has been updated to: <strong>{statusDescription}</strong>.</p>
            <p>------------------</p>
            <p>Best Regards,<br>Your Recruitment System</p>";

                // Send the email to the candidate
                await SendEmailAsync(candidate.Account.Email, subject, body);

                return Ok(new { message = "Application status updated and email sent successfully." });
            }
            catch (Exception ex)
            {
                // Log detailed error
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the application status.");
            }
        }






        private string FormatTimeRemaining(DateTime expiryDate)
        {
            var remainingTime = expiryDate - DateTime.Now;

            if (remainingTime.TotalSeconds <= 0)
            {
                return "Expired"; // You can return a message for expired postings
            }

            var days = (int)remainingTime.TotalDays;
            var hours = remainingTime.Hours;

            if (hours == 0)
            {
                return $"{days} days"; // Return formatted string
            }
            return $"{days} days {hours} hours"; // Return formatted string
        }
    }
}
