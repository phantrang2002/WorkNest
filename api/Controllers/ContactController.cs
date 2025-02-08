using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Models;
using api.Data;
using System.Linq;
using System.Net.Mail;
using System.Net;
using api.Dtos.Contact;

namespace api.Controllers
{
    [Route("api/contact")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly UserManager<Account> _userManager;

        private readonly IConfiguration _configuration;

        public ContactController(ApplicationDBContext context, UserManager<Account> userManager, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateContact([FromBody] ContactDto contactDto)
        {
            try
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

                string fullName;
                string email = user.Email;

                if (user.Candidate != null)
                {
                    fullName = user.Candidate.Name;
                }
                else if (user.Employer != null)
                {
                    fullName = user.Employer.EmployerName;
                }
                else
                {
                    fullName = "Unknown";
                }

                var contact = new Contact
                {
                    ContactID = Guid.NewGuid().ToString(),
                    Name = fullName,
                    Email = email,
                    ProblemTitle = contactDto.ProblemTitle,
                    Description = contactDto.Description,
                    Status = false
                };

                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();

                return Ok(new { status = 200, message = "Contact created successfully", ContactID = contact.ContactID });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("update/{contactId}")]
        public async Task<IActionResult> UpdateContactStatus(string contactId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "3") return Forbid();

                var contact = await _context.Contacts
                    .FirstOrDefaultAsync(c => c.ContactID == contactId);

                if (contact == null)
                {
                    return NotFound(new { error = "Contact not found!" });
                }

                contact.Status = true;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Contact status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        // GET: api/contacts/unresolved
        [HttpGet("unresolved")]
        public async Task<IActionResult> GetUnresolvedContacts(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "3") return Forbid();

                if (pageNumber < 1 || pageSize < 1)
                {
                    return BadRequest("Page number and page size must be greater than 0.");
                }

                var totalContacts = await _context.Contacts.CountAsync(c => c.Status == false);

                var unresolvedContacts = await _context.Contacts
                    .Where(c => c.Status == false)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (unresolvedContacts == null || unresolvedContacts.Count == 0)
                {
                    return NotFound(new { message = "No unresolved contacts found." });
                }

                var totalPages = (int)Math.Ceiling(totalContacts / (double)pageSize);

                return Ok(new
                {
                    Contacts = unresolvedContacts,
                    TotalCount = totalContacts,
                    TotalPages = totalPages,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET: api/contacts/resolved
        [HttpGet("resolved")]
        public async Task<IActionResult> GetResolvedContacts(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "3") return Forbid();

                if (pageNumber < 1 || pageSize < 1)
                {
                    return BadRequest("Page number and page size must be greater than 0.");
                }

                var totalContacts = await _context.Contacts.CountAsync(c => c.Status == true);

                var resolvedContacts = await _context.Contacts
                    .Where(c => c.Status == true)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (resolvedContacts == null || resolvedContacts.Count == 0)
                {
                    return NotFound(new { message = "No resolved contacts found." });
                }

                var totalPages = (int)Math.Ceiling(totalContacts / (double)pageSize);

                return Ok(new
                {
                    Contacts = resolvedContacts,
                    TotalCount = totalContacts,
                    TotalPages = totalPages,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        // POST: api/contacts/resolve
        [HttpPost("resolve")]
        public async Task<IActionResult> ResolveContact([FromBody] ResolveContactRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.ContactId))
                {
                    return BadRequest(new { message = "Contact ID is required." });
                }

                var contact = await _context.Contacts.FindAsync(request.ContactId);
                if (contact == null)
                {
                    return NotFound(new { message = "Contact not found." });
                }

                bool emailSent = await SendEmailAsync(contact.Email, "[WORKNEST] " + request.Title + ": " + contact.ProblemTitle, request.Description, contact.Name, contact.Description);

                if (!emailSent)
                {
                    return StatusCode(500, new { message = "Failed to send email." });
                }

                contact.Status = true;
                _context.Contacts.Update(contact);
                await _context.SaveChangesAsync();

                return Ok(new { status = 200, message = "Contact resolved and email sent." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        private async Task<bool> SendEmailAsync(string toEmail, string title, string description, string contactName, string contactDescription)
        {
            try
            {
                var fromAddress = new MailAddress(_configuration["EmailSettings:FromEmail"], "WorkNest");
                var toAddress = new MailAddress(toEmail);
                var subject = title;

                var body = $@"
            Dear {contactName},
            
            Thank you for reaching out to us and sharing your feedback. We truly value your input as it helps us to improve our services.

            Your feedback:
            {contactDescription}

            Our reply:
            {description}
            
            We have received your concerns and are currently reviewing them to ensure we provide you with the best experience possible. 
            If you have any additional questions or comments, feel free to reach out to us.

            Once again, thank you for taking the time to share your thoughts!

            ------- 
            Best regards,
            WorkNest
        ";

                using (var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"]))
                {
                    smtpClient.Port = int.Parse(_configuration["EmailSettings:Port"]);
                    smtpClient.Credentials = new NetworkCredential(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                    smtpClient.EnableSsl = true;

                    var mailMessage = new MailMessage(fromAddress, toAddress)
                    {
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = false
                    };

                    await smtpClient.SendMailAsync(mailMessage);
                }

                return true;
            }
            catch (SmtpException smtpEx)
            {
                Console.WriteLine($"SMTP Error: {smtpEx.Message}");
                Console.WriteLine($"SMTP StackTrace: {smtpEx.StackTrace}");
                return false;
            }
            catch (ArgumentNullException argEx)
            {
                Console.WriteLine($"Argument Error: {argEx.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General Error: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return false;
            }
        }





    }
}
