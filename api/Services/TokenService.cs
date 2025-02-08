using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.Interfaces;
using api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace api.Service
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
            // Initialize the key from configuration
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }

        public string CreateToken(Account user)
        {
            // Ensure the user object is valid
            if (user == null || string.IsNullOrEmpty(user.Id))
            {
                throw new ArgumentException("Invalid user data.");
            } 

            Console.WriteLine($"User ID: {user?.Id}, Email: {user?.Email}, Candidate: {user?.Candidate}, Industry: {user?.Candidate?.Industry}");


            // Create a list of claims (user information stored in token)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id), // This stores the user's unique Id
                new Claim(JwtRegisteredClaimNames.Email, user.Email), // Store email in token
                new Claim(JwtRegisteredClaimNames.GivenName, user.UserName), // Store username in token
                new Claim("role", user.AccountRole.ToString()),       
            };

            // Define the signing credentials (security algorithm)
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            // Configure the token settings like expiration time, claims, etc.
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims), // Claims assigned to the token
                Expires = DateTime.Now.AddDays(7), // Token expiration (7 days validity)
                SigningCredentials = creds, // Assigning the credentials
                Issuer = _config["JWT:Issuer"], // JWT issuer
                Audience = _config["JWT:Audience"] // JWT audience
            };

            // Create the token using JwtSecurityTokenHandler
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor); // Generate token
            return tokenHandler.WriteToken(token); // Return token as string
        }
    }
}
