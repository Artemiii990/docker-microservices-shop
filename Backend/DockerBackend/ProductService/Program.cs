using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using ProductService.Data;

using System.Text;

using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

using Elastic.Clients.Elasticsearch;

using System.Text.Json;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =====================================
// AWS SECRETS MANAGER
// =====================================

var secretName =
    "microservices-shop-secrets";

var region =
    "eu-north-1";

var secretsClient =
    new AmazonSecretsManagerClient(
        RegionEndpoint.GetBySystemName(region)
    );

var request =
    new GetSecretValueRequest
    {
        SecretId = secretName,
        VersionStage = "AWSCURRENT"
    };

var response =
    await secretsClient
        .GetSecretValueAsync(request);

var secrets =
    JsonSerializer.Deserialize<
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

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "ProductService",
            Version = "v1"
        }
    );

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
                "Enter JWT token"
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        }
    );
});

// =====================================
// DATABASE
// =====================================

builder.Services.AddDbContext<AppDbContext>(
    options =>
        options.UseSqlServer(
            builder.Configuration
                .GetConnectionString(
                    "DefaultConnection"
                ),
            sql =>
                sql.EnableRetryOnFailure()
        )
);

// =====================================
// ELASTICSEARCH
// =====================================

builder.Services.AddSingleton(
    new ElasticsearchClient(
        new ElasticsearchClientSettings(
            new Uri(
                "http://elasticsearch:9200"
            )
        )
    )
);

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

                // 🔥 FIXED JWT CONFIG
                ValidIssuer =
                    builder.Configuration[
                        "Jwt:Issuer"
                    ],

                ValidAudience =
                    builder.Configuration[
                        "Jwt:Audience"
                    ],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration[
                                "Jwt:Key"
                            ]!
                        )
                    )
            };
    });

builder.Services.AddAuthorization();

// =====================================
// CORS
// =====================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "all",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// =====================================
// APP
// =====================================

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
// AUTO MIGRATIONS
// =====================================

using (var scope =
       app.Services.CreateScope())
{
    try
    {
        var db =
            scope.ServiceProvider
                .GetRequiredService<
                    AppDbContext
                >();

        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "Migration error: "
            + ex.Message
        );
    }
}

app.Run();