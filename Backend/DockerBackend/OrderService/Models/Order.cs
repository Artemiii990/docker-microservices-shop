public class Order
{
    public int Id { get; set; }

    public string UserId { get; set; } 

    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    
    public string Status { get; set; } = "Processing";

    public DateTime Date { get; set; }
}