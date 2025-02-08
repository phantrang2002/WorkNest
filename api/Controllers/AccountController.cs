using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using api.Data;
using api.Dtos.Account;
using api.Interfaces;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<Account> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<Account> _signInManager;
        private readonly ApplicationDBContext _context;

        private readonly IConfiguration _configuration;

        public AccountController(
            UserManager<Account> userManager,
            ITokenService tokenService,
            SignInManager<Account> signInManager,
            ApplicationDBContext context, IConfiguration configuration)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (registerDto.Role != "Candidate" && registerDto.Role != "Employer")
                {
                    return BadRequest(new { error = "Invalid role selected. Role must be either 'Candidate' or 'Employer'." });
                }

                var existingUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == registerDto.Email);

                if (existingUser != null)
                {
                    return BadRequest(new { error = "Email is already in use." });
                }

                var appUser = new Account
                {

                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    AccountRole = registerDto.Role == "Candidate" ? 1 : 2,
                    Status = true
                };

                var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);
                if (createdUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(appUser, registerDto.Role);

                    if (roleResult.Succeeded)
                    {
                        appUser.UserID = appUser.Id;
                        await _userManager.UpdateAsync(appUser);

                        if (registerDto.Role == "Candidate")
                        {
                            var candidate = new Candidate
                            {
                                CandidateID = appUser.Id,
                                Name = registerDto.FullName,
                            };
                            _context.Candidates.Add(candidate);
                        }
                        else if (registerDto.Role == "Employer")
                        {
                            var employer = new Employer
                            {
                                EmployerID = appUser.Id,
                                EmployerName = registerDto.FullName
                            };
                            _context.Employers.Add(employer);
                        }

                        await _context.SaveChangesAsync();

                        return Ok(
                            new NewUserDto
                            {
                                UserName = appUser.UserName,
                                Email = appUser.Email,
                                Token = _tokenService.CreateToken(appUser)
                            }
                        );
                    }
                    else
                    {
                        return StatusCode(500, roleResult.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createdUser.Errors);
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == loginDto.Email.ToLower());

            if (user == null)
            {
                return Unauthorized(new { error = "Invalid Email!" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized(new { error = "Email not found and/or password incorrect!" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            string userRole = roles.FirstOrDefault();

            return Ok(new NewUserDto
            {
                UserName = user.UserName,
                Email = user.Email,
                Role = userRole,
                Token = _tokenService.CreateToken(user),
                Status = user.Status
            });
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.Users
                .Include(u => u.Candidate)
                .Include(u => u.Employer)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized(new { error = "User not found!" });
            }

            var accountRole = user.AccountRole;
            string fullName;
            string email = user.Email;
            string phoneNumber;
            bool status = user.Status;

            if (user.Candidate != null)
            {
                fullName = user.Candidate.Name;
                phoneNumber = user.Candidate.PhoneNumber;
            }
            else if (user.Employer != null)
            {
                fullName = user.Employer.EmployerName;
                phoneNumber = user.PhoneNumber;
            }
            else if (accountRole == 3)
            {
                fullName = "Admin";
                phoneNumber = "";
            }
            else
            {
                fullName = "Unknown";
                phoneNumber = "";
            }

            return Ok(new
            {
                UserId = userId,
                Email = email,
                PhoneNumber = phoneNumber,
                FullName = fullName,
                AccountRole = accountRole,
                Status = status
            });
        }

        [HttpGet("counts")]
        public async Task<ActionResult> GetCounts()
        {
            try
            {
                var jobPostingCount = await _context.JobPostings
                    .Where(j => j.Time > DateTime.Now && j.Status == true)
                    .Where(j => j.LockFlg == 0)
                    .CountAsync();

                var candidateCount = await _context.Candidates.CountAsync();

                var employerCount = await _context.Employers.CountAsync();

                return Ok(new
                {
                    JobPostings = jobPostingCount,
                    Candidates = candidateCount,
                    Employers = employerCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("report")]
        public async Task<ActionResult> GetReport()
        {
            try
            {
                var jobPostingCount = await _context.JobPostings.CountAsync();

                var applicationCount = await _context.ApplyForms.CountAsync();
                var templateCount = await _context.SampleCVs.CountAsync();

                var totalCandidates = await _context.Candidates.CountAsync();
                var availableCandidates = await _context.Candidates
                    .Where(c => c.Account.Status == true)
                    .CountAsync();
                var lockedCandidates = await _context.Candidates
                    .Where(c => c.Account.Status == false)
                    .CountAsync();

                var totalEmployers = await _context.Employers.CountAsync();
                var availableEmployers = await _context.Employers
                    .Where(e => e.Account.Status == true)
                    .CountAsync();
                var lockedEmployers = await _context.Employers
                    .Where(e => e.Account.Status == false)
                    .CountAsync();

                var feedbackCount = await _context.Contacts.CountAsync();

                var unresolvedFeedbackCount = await _context.Contacts
                    .Where(c => c.Status == false)
                    .CountAsync();

                var resolvedFeedbackCount = await _context.Contacts
                    .Where(c => c.Status == true)
                    .CountAsync();

                var availableJobCount = await _context.JobPostings
                    .Where(j => j.Time > DateTime.Now && j.Status == true && j.LockFlg == 0)
                    .CountAsync();

                var lockedJobCount = await _context.JobPostings
                    .Where(j => j.LockFlg == 1)
                    .CountAsync();

                var closedJobCount = await _context.JobPostings
                    .Where(j => j.LockFlg == 2)
                    .CountAsync();

                var pendingJobCount = await _context.JobPostings
                    .Where(j => j.Time > DateTime.Now && j.Status == false && j.LockFlg == 0)
                    .CountAsync();

                var expiredJobCount = await _context.JobPostings
                    .Where(j => j.Time < DateTime.Now && j.Status == true)
                    .CountAsync();

                return Ok(new
                {
                    JobPostings = new
                    {
                        Total = jobPostingCount,
                        Available = availableJobCount,
                        Locked = lockedJobCount,
                        Closed = closedJobCount,
                        Pending = pendingJobCount,
                        Expired = expiredJobCount
                    },
                    Candidates = new
                    {
                        Total = totalCandidates,
                        Available = availableCandidates,
                        Locked = lockedCandidates
                    },
                    Employers = new
                    {
                        Total = totalEmployers,
                        Available = availableEmployers,
                        Locked = lockedEmployers
                    },
                    Applications = applicationCount,
                    Templates = templateCount,
                    Contacts = new
                    {
                        Total = feedbackCount,
                        UnresolvedFeedback = unresolvedFeedbackCount,
                        ResolvedFeedback = resolvedFeedbackCount
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);

            if (user == null)
                return BadRequest(new { error = "We couldn’t find an account associated with this email. Please verify and try again." });

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"http://localhost:3000/reset-password?email={user.Email}";
            var subject = "WorkNest - Reset Password Request";
            var body = $@"
                        <p>Hello,</p>
                        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                        <p><a href='{resetLink}' style='color: #007bff; text-decoration: none;'>Reset Password Link</a></p>
                        <p>If you did not request this, please ignore this email or contact our support team.</p>
                        <hr>
                        <p>Best regards,</p>
                        <p><strong>WorkNest</strong></p>
                    ";
            var emailSent = await SendEmailAsync(user.Email, subject, body);

            if (!emailSent)
                return StatusCode(500, new { error = "Email can't be sent" });

            return Ok(new { status = 200, resetToken });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

            if (user == null)
                return BadRequest(new { error = "We couldn’t find an account associated with this email. Please verify and try again." });

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(new { errors });
            }

            return Ok(new { status = 200, message = "Your password has been reset successfully." });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                var userEmail = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { error = "Email not found in token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    return Unauthorized(new { error = "User not found" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, changePasswordDto.OldPassword, false);
                if (!result.Succeeded)
                {
                    return BadRequest(new { error = "Incorrect old password" });
                }

                var passwordChangeResult = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
                if (passwordChangeResult.Succeeded)
                {
                    return Ok(new { status = 200, message = "Password changed successfully" });
                }
                else
                {
                    return StatusCode(500, new { error = "Password change failed", details = passwordChangeResult.Errors });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred", details = ex.Message });
            }
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
    }
}
