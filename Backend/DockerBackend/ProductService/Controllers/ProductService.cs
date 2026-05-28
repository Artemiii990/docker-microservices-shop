using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

using Elastic.Clients.Elasticsearch;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using ProductService.Data;
using ProductService.Models;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    private readonly IConfiguration _configuration;

    private readonly ElasticsearchClient _elasticClient;

    public ProductsController(
        AppDbContext context,
        IConfiguration configuration,
        ElasticsearchClient elasticClient)
    {
        _context = context;

        _configuration = configuration;

        _elasticClient = elasticClient;
    }

    // =========================================
    // GET ALL PRODUCTS
    // =========================================

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products =
            await _context.Products.ToListAsync();

        return Ok(products);
    }

    // =========================================
    // SEARCH PRODUCTS
    // =========================================

    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts(
        [FromQuery] string query)
    {
        try
        {
            var response =
                await _elasticClient.SearchAsync<ProductSearchModel>(
                    s => s
                        .Index("products")
                        .Query(q => q
                            .MultiMatch(mm => mm
                                .Fields(new[]
                                {
                                    "name",
                                    "categorySlug"
                                })
                                .Query(query)
                            )
                        )
                );

            if (!response.IsValidResponse)
            {
                return StatusCode(500, new
                {
                    elasticError =
                        response.DebugInformation
                });
            }

            return Ok(response.Documents);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    // =========================================
    // ADD PRODUCT
    // =========================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddProduct(
        [FromForm] CreateProductDto dto)
    {
        try
        {
            // =========================================
            // AWS CONFIG
            // =========================================

            var bucketName =
                _configuration["S3:BucketName"];

            var accessKey =
                _configuration["S3:AccessKey"];

            var secretKey =
                _configuration["S3:SecretKey"];

            // =========================================
            // S3 CONFIG
            // =========================================

            var config =
                new AmazonS3Config
                {
                    RegionEndpoint =
                        RegionEndpoint.EUNorth1
                };

            // =========================================
            // S3 CLIENT
            // =========================================

            var s3Client =
                new AmazonS3Client(
                    accessKey,
                    secretKey,
                    config
                );

            // =========================================
            // FILE NAME
            // =========================================

            var fileName =
                $"{Guid.NewGuid()}_{dto.Image.FileName}";

            // =========================================
            // FILE STREAM
            // =========================================

            using var stream =
                dto.Image.OpenReadStream();

            // =========================================
            // UPLOAD REQUEST
            // =========================================

            var request =
                new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = fileName,
                    InputStream = stream,
                    ContentType =
                        dto.Image.ContentType
                };

            // =========================================
            // UPLOAD TO AWS S3
            // =========================================

            await s3Client.PutObjectAsync(request);

            // =========================================
            // IMAGE URL
            // =========================================

            var imageUrl =
                $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{fileName}";

            // =========================================
            // PRODUCT ENTITY
            // =========================================

            var product =
                new Product
                {
                    Name = dto.Name,
                    Price = dto.Price,
                    CategorySlug =
                        dto.CategorySlug,
                    ImageUrl = imageUrl
                };

            // =========================================
            // SAVE TO MSSQL
            // =========================================

            await _context.Products.AddAsync(
                product
            );

            await _context.SaveChangesAsync();

            // =========================================
            // ELASTICSEARCH MODEL
            // =========================================

            var searchProduct =
                new ProductSearchModel
                {
                    Id = product.Id,
                    Name = product.Name,
                    CategorySlug =
                        product.CategorySlug,
                    Price = product.Price,
                    ImageUrl =
                        product.ImageUrl
                };

            // =========================================
            // INDEX TO ELASTICSEARCH
            // =========================================

            var elasticResponse =
                await _elasticClient.IndexAsync(
                    searchProduct,
                    idx => idx.Index("products")
                );

            // =========================================
            // ELASTICSEARCH ERROR
            // =========================================

            if (!elasticResponse.IsValidResponse)
            {
                return StatusCode(500, new
                {
                    elasticError =
                        elasticResponse
                            .DebugInformation
                });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = ex.Message,
                inner = ex.InnerException?.Message,
                stack = ex.StackTrace
            });
        }
    }

    // =========================================
    // DELETE PRODUCT
    // =========================================

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(
        int id)
    {
        var product =
            await _context.Products.FindAsync(id);

        if (product == null)
            return NotFound();

        // =========================================
        // DELETE FROM MSSQL
        // =========================================

        _context.Products.Remove(product);

        await _context.SaveChangesAsync();

        // =========================================
        // DELETE FROM ELASTICSEARCH
        // =========================================

        await _elasticClient.DeleteAsync<
            ProductSearchModel>(
            "products",
            id
        );

        return Ok(new
        {
            message = "Продукт удалён"
        });
    }
}