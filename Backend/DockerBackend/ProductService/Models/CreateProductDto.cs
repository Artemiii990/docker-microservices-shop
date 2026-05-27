using Microsoft.AspNetCore.Http;

namespace ProductService.Models;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string CategorySlug { get; set; } = string.Empty;

    public IFormFile Image { get; set; } = null!;
}