using AuthECApi.Models;

namespace AuthECApi.services;

public interface IAuthService
{
        Task<AuthModel> RegisterAsync(UserRegistirationModel model);
        Task<AuthModel> GetTokenAsync(UserLoginModel model);
        Task<string> AddRoleAsync(AddRoleModel model);

        Task<AuthModel> RefreshTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);

}
