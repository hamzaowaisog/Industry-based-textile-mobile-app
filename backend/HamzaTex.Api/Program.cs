using System.Security.Claims;
using System.Text;
using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    var defaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.Authorization.AuthorizeFilter(defaultPolicy));
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 21)) 
    ));

builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IClientTypeService, ClientTypeService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISignupService, SignupService>();
builder.Services.AddScoped<ILoginService, LoginService>();

JwtHelper.Configure(builder.Configuration);

var jwtKey = builder.Configuration["Jwt:Key"] ;
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ;
var jwtAudience = builder.Configuration["Jwt:Audience"] ;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero, 
        RoleClaimType = ClaimTypes.Role, 
        NameClaimType = ClaimTypes.NameIdentifier 
    };
    
    options.MapInboundClaims = true;
});

builder.Services.AddAuthorization(options =>
{
    static int? GetRoleId(AuthorizationHandlerContext context)
    {
        var roleIdClaim = context.User.FindFirst("RoleId");
        if (roleIdClaim != null && int.TryParse(roleIdClaim.Value, out var roleId))
        {
            return roleId;
        }
        
        var roleClaim = context.User.FindFirst(ClaimTypes.Role) 
                     ?? context.User.FindFirst("role")
                     ?? context.User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        
        if (roleClaim != null && int.TryParse(roleClaim.Value, out var roleIdFromRole))
        {
            return roleIdFromRole;
        }
        
        return null;
    }
    
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireAssertion(context =>
        {
            if (!context.User.Identity?.IsAuthenticated ?? false)
                return false;
            
            var roleId = GetRoleId(context);
            return roleId == 1; 
        });
    });
    
    options.AddPolicy("StaffOnly", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireAssertion(context =>
        {
            if (!context.User.Identity?.IsAuthenticated ?? false)
                return false;
            
            var roleId = GetRoleId(context);
            return roleId == 2; 
        });
    });
    
    options.AddPolicy("AdminOrStaff", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireAssertion(context =>
        {
            if (!context.User.Identity?.IsAuthenticated ?? false)
                return false;
            
            var roleId = GetRoleId(context);
            return roleId == 1 || roleId == 2; 
        });
    });
    
    options.AddPolicy("Authenticated", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Hamza Tex API", 
        Version = "v1",
        Description = "A full-stack application API for Hamza Tex"
    });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    await SeedData.EnsureSeedDataAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hamza Tex API v1");
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
