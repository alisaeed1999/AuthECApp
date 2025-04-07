using AuthECApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AuthECApi.services;
using Microsoft.AspNetCore.Cors;

namespace MyApp.Namespace
{
    [Route("api/[controller]")]
    [EnableCors("AllowAngularApp")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService){
            _authService = authService;
        }

        [HttpPost("/api/signup")]
        public async Task<IActionResult> Register([FromBody]UserRegistirationModel register){
            if (!ModelState.IsValid) return  BadRequest(ModelState);

            var result = await _authService.RegisterAsync(register);

            if (!result.IsAuthenticated)
                return BadRequest(result.Message);

            SetRefreshTokenInCookie(result.RefreshToken , result.RefreshTokenExpiration);
            return Ok(result);            
        }

        [HttpPost("/api/signin")]
        public async Task<IActionResult> Login([FromBody] UserLoginModel login)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.GetTokenAsync(login);

            if (!result.IsAuthenticated)
                return BadRequest(result.Message);

            SetRefreshTokenInCookie(result.RefreshToken , result.RefreshTokenExpiration);

            return Ok(result);
        }

        [HttpPost("/api/addrole")]
        public async Task<IActionResult> AddRoleAsync([FromBody] AddRoleModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.AddRoleAsync(model);

            if (!string.IsNullOrEmpty(result))
                return BadRequest(result);

            return Ok(model);
        }

        [HttpGet("/api/refreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return  BadRequest("the is no refresh token");
            }

            var result = await _authService.RefreshTokenAsync(refreshToken);

            if (!result.IsAuthenticated)
                return BadRequest(result);

            SetRefreshTokenInCookie(result.RefreshToken, result.RefreshTokenExpiration);

            return Ok(result);
        }

        [HttpPost("/api/revokeToken")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeToken model)
        {
            var token = model.Token ?? Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(token))
                return BadRequest("Token is required!");

            var result = await _authService.RevokeTokenAsync(token);

            if(!result)
                return BadRequest("Token is invalid!");

            return Ok();
        }

        private void SetRefreshTokenInCookie(string refreshToken, DateTime expires)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = expires.ToLocalTime(),
                Secure = true, // Enable in all environments
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Domain = "localhost", // Restrict to your domain
                Path = "/", // Restrict path if needed
            };

            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

    }
}
