namespace ProductService.Models;

public class ProductSearchModel
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string CategorySlug { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
}