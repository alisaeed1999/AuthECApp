using AuthECApi.Enums;
using Microsoft.AspNetCore.Identity;

namespace AuthECApi.Models;

public static class ContextSeed
{
    public static async Task SeedRolesAsync(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        await roleManager.CreateAsync(new IdentityRole(Roles.SuperAdmin.ToString()));
        await roleManager.CreateAsync(new IdentityRole(Roles.Admin.ToString()));
        await roleManager.CreateAsync(new IdentityRole(Roles.User.ToString()));
    }

    public static async Task SeedSuperAdminAsync(UserManager<AppUser> userManager)
{
    //Seed Default User
    var defaultUser = new AppUser
    {
        UserName = "superadmin",
        Email = "superadmin@gmail.com",
        FirstName = "Ali",
        LastName = "Saeed",
        EmailConfirmed = true,
        PhoneNumberConfirmed = true
    };
    if (userManager.Users.All(u => u.Id != defaultUser.Id))
    {
        var user = await userManager.FindByEmailAsync(defaultUser.Email);
        if(user==null)
        {
            await userManager.CreateAsync(defaultUser, "123Pa$$word.");
            await userManager.AddToRoleAsync(defaultUser, Roles.User.ToString());
            await userManager.AddToRoleAsync(defaultUser, Roles.Admin.ToString());
            await userManager.AddToRoleAsync(defaultUser, Roles.SuperAdmin.ToString());
        }

    }
}

}
