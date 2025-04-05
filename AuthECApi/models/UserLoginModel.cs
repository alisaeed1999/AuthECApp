using System.ComponentModel.DataAnnotations;

namespace AuthECApi.Models;

public class UserLoginModel
{
    
    // [Required]
    // public string Username { get; set;}
    
    [Required]
    public string? Email { get; set; }

    [Required]
    [DataType(DataType.Password)]
    public string? Password { get; set; }
}
