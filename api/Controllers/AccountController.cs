using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
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
        private readonly ApplicationDBContext _context; // Inject the database context

        private readonly IConfiguration _configuration;

        public AccountController(
            UserManager<Account> userManager,
            ITokenService tokenService,
            SignInManager<Account> signInManager,
            ApplicationDBContext context, IConfiguration configuration) // Add the context parameter
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _context = context; // Assign context
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

            // Lấy vai trò của người dùng
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
                // Count job postings
                var jobPostingCount = await _context.JobPostings
                    .Where(j => j.Time > DateTime.Now && j.Status == true)
                    .Where(j => j.LockFlg == 0)
                    .CountAsync();

                // Count candidates
                var candidateCount = await _context.Candidates.CountAsync();

                // Count employers
                var employerCount = await _context.Employers.CountAsync();

                // Return the counts as a response
                return Ok(new
                {
                    JobPostings = jobPostingCount,
                    Candidates = candidateCount,
                    Employers = employerCount
                });
            }
            catch (Exception ex)
            {
                // Log error if needed and return 500 status
                return StatusCode(500, new { error = ex.Message });
            }
        }
 
[HttpGet("report")]
public async Task<ActionResult> GetReport()
{
    try
    {
        // Count total job postings
        var jobPostingCount = await _context.JobPostings.CountAsync();

        // Count applications
        var applicationCount = await _context.ApplyForms.CountAsync();
        var templateCount = await _context.SampleCVs.CountAsync();

        

        // Count candidates by statuses
        var totalCandidates = await _context.Candidates.CountAsync();
        var availableCandidates = await _context.Candidates
            .Where(c => c.Account.Status == true)
            .CountAsync();
        var lockedCandidates = await _context.Candidates
            .Where(c => c.Account.Status == false)
            .CountAsync();

        // Count employers by statuses
        var totalEmployers = await _context.Employers.CountAsync();
        var availableEmployers = await _context.Employers
            .Where(e => e.Account.Status == true)
            .CountAsync();
        var lockedEmployers = await _context.Employers
            .Where(e => e.Account.Status == false)
            .CountAsync();

        // Count contacts
        var feedbackCount = await _context.Contacts.CountAsync(); 

        var unresolvedFeedbackCount = await _context.Contacts
            .Where(c => c.Status == false)
            .CountAsync();

        var resolvedFeedbackCount = await _context.Contacts
            .Where(c => c.Status == true)
            .CountAsync();

        // Count job postings by statuses
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

        // Return the counts as a response
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
        // Log error if needed and return 500 status
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
        return BadRequest(new { error = "Email không tồn tại trong hệ thống." });

    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);



   var resetLink = $"http://localhost:3000/reset-password?email={user.Email}";


    var subject = "Reset Password Request";
    var body = $@"
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <a href='{resetLink}'>Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>";

    var emailSent = await SendEmailAsync(user.Email, subject, body);

    if (!emailSent)
        return StatusCode(500, new { error = "Không thể gửi email." });

    return Ok(new { status = 200, resetToken });
}

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

    if (user == null)
        return BadRequest(new { error = "Email không tồn tại trong hệ thống." });

    var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

    if (!result.Succeeded)
    {
        var errors = result.Errors.Select(e => e.Description).ToList();
        return BadRequest(new { errors });
    }

    return Ok(new { status = 200, message = "Mật khẩu đã được đặt lại thành công." });
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

        // Find the user by email
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            return Unauthorized(new { error = "User not found" });
        }

        // Check if the old password is correct
        var result = await _signInManager.CheckPasswordSignInAsync(user, changePasswordDto.OldPassword, false);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = "Incorrect old password" });
        }

        // Change the user's password to the new one
        var passwordChangeResult = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
        if (passwordChangeResult.Succeeded)
        {
            return Ok(new {status = 200, message = "Password changed successfully" });
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


    }
}
