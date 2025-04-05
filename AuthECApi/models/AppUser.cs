using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace AuthECApi.Models
{
    public class AppUser : IdentityUser 
    {
        [PersonalData]
        [Column(TypeName ="nvarchar(150)")]
        public string? FirstName { get; set;}

        [PersonalData]
        [Column(TypeName ="nvarchar(150)")]
        public string? LastName { get; set;}
        public List<RefreshToken>? RefreshTokens { get; set; }
    }

}
