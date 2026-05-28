using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OrderService.Models;

using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// =====================================
// AWS SECRETS MANAGER
// =====================================

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

var secrets = JsonSerializer.Deserialize<
    Dictionary<string, string>
>(
    response.SecretString!
);

if (secrets != null)
{
    builder.Configuration
        .AddInMemoryCollection(secrets);
}

// =====================================
// DOCKER
// =====================================

builder.WebHost.UseUrls(
    "http://0.0.0.0:8080"
);

// =====================================
// SERVICES
// =====================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// =====================================
// DATABASE
// =====================================

builder.Services.AddDbContext<AppDbContext>(
    options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString(
                "DefaultConnection"
            ),
            sql => sql.EnableRetryOnFailure()
        )
);

// =====================================
// JWT AUTH
// =====================================

builder.Services
    .AddAuthentication("Bearer")
    .AddJwtBearer(
        "Bearer",
        options =>
        {
            options.TokenValidationParameters =
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer =
                        builder.Configuration["Jwt__Issuer"],

                    ValidAudience =
                        builder.Configuration["Jwt__Audience"],

                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                builder.Configuration[
                                    "Jwt__Key"
                                ]!
                            )
                        )
                };
        }
    );

builder.Services.AddAuthorization();

// =====================================
// CORS
// =====================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

// =====================================
// APP
// =====================================

var app = builder.Build();

// =====================================
// MIDDLEWARE
// =====================================

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.UseSwagger();

app.UseSwaggerUI();

app.MapControllers();

// =====================================
// AUTO MIGRATIONS
// =====================================

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider
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