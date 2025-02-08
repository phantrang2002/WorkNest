using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/policy")]
    [ApiController]
    public class PolicyController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public PolicyController(ApplicationDBContext context)
        {
            _context = context;
        }

        // Helper method to check if the user is admin
        private bool IsAdmin()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            return userRole == "3";  
        }

        // 1. Create a new policy
        [HttpPost]
        public async Task<IActionResult> CreatePolicy([FromBody] PolicyDto policyDto)
        {
            if (!IsAdmin()) return Forbid();

            if (policyDto == null)
            {
                return BadRequest("Policy data is required.");
            }

            try
            { 
                var policy = new Policy
                {
                    PolicyID = Guid.NewGuid().ToString(),  
                    Title = policyDto.Title,
                    Description = policyDto.Description,
                    CreatedOn = DateTime.Now
                };
 
                _context.Policies.Add(policy);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPolicyById), new { id = policy.PolicyID }, policy);
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }
 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolicyById(string id)
        {
            var policy = await _context.Policies.FindAsync(id);

            if (policy == null)
            {
                return NotFound("Policy not found.");
            }

            return Ok(policy);
        }

        // GET: api/policies
        [HttpGet]
        public async Task<IActionResult> GetAllPolicies(int pageNumber = 1, int pageSize = 10)
        { 
            if (pageNumber < 1 || pageSize < 1)
            {
                return BadRequest("Page number and page size must be greater than 0.");
            }
 
            var mostRecentlyUpdated = await _context.Policies
                .OrderByDescending(p => p.CreatedOn)
                .FirstOrDefaultAsync();
 
            var totalPolicies = await _context.Policies.CountAsync();
 
            var policies = await _context.Policies
                .Skip((pageNumber - 1) * pageSize)  
                .Take(pageSize)  
                .ToListAsync();

            if (policies == null || !policies.Any())
            {
                return NotFound("No policies found.");
            }
 
            var totalPages = (int)Math.Ceiling(totalPolicies / (double)pageSize);
 
            return Ok(new
            {
                MostRecentlyUpdatedPolicy = mostRecentlyUpdated,
                Policies = policies,
                TotalCount = totalPolicies,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        // GET: api/policies
[HttpGet("all")]
public async Task<IActionResult> GetAllPoliciesWithoutPage()
{ 
var mostRecentlyUpdated = await _context.Policies
    .OrderByDescending(p => p.CreatedOn)
    .Select(p => p.CreatedOn)  
    .FirstOrDefaultAsync();
 
var mostRecentlyUpdatedDate = mostRecentlyUpdated != null 
    ? mostRecentlyUpdated.ToString("yyyy-MM-dd") 
    : null;
 
    var policies = await _context.Policies
        .OrderByDescending(p => p.CreatedOn) 
        .ToListAsync();

    if (policies == null || !policies.Any())
    {
        return NotFound("No policies found.");
    }
 
    return Ok(new
    {
        MostRecentlyUpdatedPolicy = mostRecentlyUpdatedDate,
        Policies = policies
    });
}



        // 4. Update an existing policy
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePolicy(string id, [FromBody] PolicyDto updatedPolicyDto)
        {
            if (!IsAdmin()) return Forbid();  

            if (updatedPolicyDto == null)
            {
                return BadRequest("Policy data is required.");
            }

            var policy = await _context.Policies.FindAsync(id);
            if (policy == null)
            {
                return NotFound("Policy not found.");
            }

            try
            {
                // Map PolicyDto to Policy model
                policy.Title = updatedPolicyDto.Title;
                policy.Description = updatedPolicyDto.Description;
                policy.CreatedOn = DateTime.Now;

                _context.Policies.Update(policy);
                await _context.SaveChangesAsync();

                return Ok("Policy updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }

        // 5. Delete a policy by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePolicy(string id)
        {
            if (!IsAdmin()) return Forbid(); // Only admin can delete

            var policy = await _context.Policies.FindAsync(id);
            if (policy == null)
            {
                return NotFound("Policy not found.");
            }

            try
            {
                // Delete the policy from the database
                _context.Policies.Remove(policy);
                await _context.SaveChangesAsync();

                return Ok("Policy deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }
    }
}
