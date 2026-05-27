using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OrderService.Models;

var builder = WebApplication.CreateBuilder(args);

// 🔥 чтобы Docker работал
builder.WebHost.UseUrls("http://0.0.0.0:8080");

// ======================
// SERVICES
// ======================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ======================
// DATABASE
// ======================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure()
    ));

// ======================
// AUTH (JWT)
// ======================

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

// ======================
// CORS (исправлено)
// ======================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // 👈 фронт
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ======================
// APP
// ======================

var app = builder.Build();

// 🔥 ВАЖЕН порядок middleware

app.UseRouting();

// ✅ CORS ДО auth и endpoints
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Swagger можно ниже
app.UseSwagger();
app.UseSwaggerUI();

// endpoints
app.MapControllers();

// ======================
// MIGRATIONS SAFE
// ======================

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