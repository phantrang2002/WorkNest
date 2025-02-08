using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Account
{
    public class ChangePasswordDto
    { 
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}