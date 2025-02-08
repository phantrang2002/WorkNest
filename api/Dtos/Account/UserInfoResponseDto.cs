using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Account
{
    public class UserInfoResponse
    {
        public string Name { get; set; }
        public string EmployerName { get; set; }

        
    }
}