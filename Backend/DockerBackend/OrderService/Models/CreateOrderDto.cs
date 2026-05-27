namespace OrderService.Models;

public class CreateOrderDto
{
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}