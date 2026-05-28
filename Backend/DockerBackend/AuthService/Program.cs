using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AuthService.Models;
using WebApplication1.Models;

using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Memory;

using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ---------------- AWS SECRETS MANAGER ----------------

var secretName = "microservices-shop-secrets";
var region = "eu-north-1";

var secretsClient = new AmazonSecretsManagerClient(
    RegionEndpoint.GetBySystemName(region)
);

var request = new GetSecretValueRequest
{
    SecretId = secretName,
    VersionStage = "AWSCURRENT"
};

var response = await secretsClient.GetSecretValueAsync(request);

var secrets = JsonSerializer.Deserialize<Dictionary<string, string>>(
    response.SecretString!
);

if (secrets != null)
{
    builder.Configuration.AddInMemoryCollection(secrets);
}

// ---------------- Docker ----------------

builder.WebHost.UseUrls("http://0.0.0.0:8080");

// ---------------- SERVICES ----------------

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------- DB ----------------

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// ---------------- Identity ----------------

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ---------------- Cookies ----------------

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

// ---------------- JWT ----------------

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer("Bearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt__Issuer"],
        ValidAudience = builder.Configuration["Jwt__Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt__Key"]!
            )
        ),

        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

// ---------------- Authorization ----------------

builder.Services.AddAuthorization();

// ---------------- CORS ----------------

builder.Services.AddCors(p =>
    p.AddPolicy("all", x =>
        x.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod()));

var app = builder.Build();

// ---------------- PIPELINE ----------------

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("all");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ---------------- MIGRATIONS ----------------

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine("Migration error: " + ex.Message);
    }
}

app.Run();