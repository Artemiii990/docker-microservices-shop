using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductService.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =====================================
// DOCKER
// =====================================

builder.WebHost.UseUrls("http://0.0.0.0:8080");

// =====================================
// SERVICES
// =====================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// =====================================
// DATABASE
// =====================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    ));

// =====================================
// JWT AUTH
// =====================================

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!
                        ))
            };
    });

builder.Services.AddAuthorization();

// =====================================
// CORS
// =====================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("all", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// =====================================
// PIPELINE
// =====================================

app.UseSwagger();

app.UseSwaggerUI();

// CORS
app.UseCors("all");

// AUTH
app.UseAuthentication();

app.UseAuthorization();

// CONTROLLERS
app.MapControllers();

// =====================================
// MIGRATIONS
// =====================================

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db =
            scope.ServiceProvider
                .GetRequiredService<AppDbContext>();

        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "Migration error: " + ex.Message
        );
    }
}

app.Run();