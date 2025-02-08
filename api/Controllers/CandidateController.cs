using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Data;
using api.Dtos.Candidate;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/candidate")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly UserManager<Account> _userManager;

        public CandidateController(ApplicationDBContext context, UserManager<Account> userManager)
        {
            _context = context;
            _userManager = userManager;

        }

        // GET: api/candidate/profile
        [HttpGet("profile")]
        public async Task<ActionResult<GetCandidateDto>> GetProfile()
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.CandidateID == candidateId);

            if (candidate == null)
            {
                return NotFound(new { error = "Candidate profile not found" });
            }

            var candidateDto = new GetCandidateDto
            {
                CandidateID = candidate.CandidateID,
                Name = candidate.Name,
                Avatar = candidate.Avatar,
                PhoneNumber = candidate.PhoneNumber,
                Location = candidate.Location,
                Experience = candidate.Experience,
                Industry = candidate.Industry,
                Description = candidate.Description
            };

            return Ok(candidateDto);
        }

        // GET: api/candidate/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<GetCandidateDto>> GetCandidateById(string id)
        {
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(e => e.CandidateID == id);

            if (candidate == null)
            {
                return NotFound(new { error = "Candidate not found" });
            }

            var candidateDto = new GetCandidateDto
            {
                CandidateID = candidate.CandidateID,
                Name = candidate.Name,
                Avatar = candidate.Avatar,
                PhoneNumber = candidate.PhoneNumber,
                Location = candidate.Location,
                Experience = candidate.Experience,
                Industry = candidate.Industry,
                Description = candidate.Description
            };

            return Ok(candidateDto);
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

            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var candidate = await _context.Candidates.FindAsync(candidateId);
            if (candidate == null)
            {
                return NotFound(new { error = "Candidate not found" });
            }

            candidate.Avatar = imageUrl;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Image uploaded successfully!", imageUrl });
        }

        // PUT: api/candidate/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateCandidateDto updateDto)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(e => e.CandidateID == candidateId);

            if (candidate == null)
            {
                return NotFound(new { error = "Profile not found" });
            }

            candidate.Name = updateDto.Name ?? candidate.Name;
            candidate.PhoneNumber = updateDto.PhoneNumber ?? candidate.PhoneNumber;
            candidate.Location = updateDto.Location ?? candidate.Location;
            if (updateDto.Experience.HasValue)
            {
                candidate.Experience = updateDto.Experience.Value;
            }
            candidate.Industry = updateDto.Industry ?? candidate.Industry;
            candidate.Description = updateDto.Description ?? candidate.Description;


            _context.Entry(candidate).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
        // GET: api/candidate/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<CandidateSummaryDto>>> GetAvailableCandidates(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Candidates
                .Include(c => c.ApplyForms)
                .Where(c => c.Account.Status == true);

            var totalCandidates = await query.CountAsync();

            var candidates = await query
                .OrderBy(c => c.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (candidates == null || candidates.Count == 0)
            {
                return NotFound(new { error = "No candidates found" });
            }

            var candidateDtos = candidates.Select(candidate => new CandidateSummaryDto
            {
                CandidateID = candidate.CandidateID,
                Name = candidate.Name,
                Avatar = candidate.Avatar,
                PhoneNumber = candidate.PhoneNumber,
                Location = candidate.Location,
                Experience = candidate.Experience,
                Industry = candidate.Industry
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalCandidates / (double)pageSize);

            return Ok(new
            {
                Candidates = candidateDtos,
                TotalCount = totalCandidates,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        // GET: api/candidate/locked
        [HttpGet("locked")]
        public async Task<ActionResult<IEnumerable<CandidateSummaryDto>>> GetLockedCandidates(int pageNumber = 1, int pageSize = 10)
        {
            var totalCandidates = await _context.Candidates
                .Where(c => c.Account.Status == false)
                .CountAsync();

            var candidates = await _context.Candidates
                .Include(c => c.ApplyForms)
                .Where(c => c.Account.Status == false)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (candidates == null || candidates.Count == 0)
            {
                return NotFound(new { error = "No locked candidates found" });
            }

            var candidateDtos = candidates.Select(candidate => new CandidateSummaryDto
            {
                CandidateID = candidate.CandidateID,
                Name = candidate.Name,
                Avatar = candidate.Avatar,
                PhoneNumber = candidate.PhoneNumber,
                Location = candidate.Location,
                Experience = candidate.Experience,
                Industry = candidate.Industry
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalCandidates / (double)pageSize);

            return Ok(new
            {
                Candidates = candidateDtos,
                TotalCount = totalCandidates,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        // PUT: api/candidate/lock/{id}
        [Authorize]
        [HttpPut("lock/{id}")]
        public async Task<IActionResult> LockACandidate(string id)
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
                return NotFound(new { error = "Account not found for this candidate." });
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

            return Ok(new { message = "Candidate locked successfully.", accountId = account.UserID });
        }

        // PUT: api/candidate/unlock/{id}
        [Authorize]
        [HttpPut("unlock/{id}")]
        public async Task<IActionResult> UnlockACandidate(string id)
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
                return NotFound(new { error = "Account not found for this candidate." });
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

            return Ok(new { message = "Candidate unlocked successfully.", accountId = account.UserID });
        }
    }
}
