using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }
    
    private string? GetUserIdentifier()
    {
        return User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirst("email")?.Value
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value;
    }

    // ===============================
    // Получить свои заказы
    // ===============================
    [HttpGet("myorders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var user = GetUserIdentifier();

        if (string.IsNullOrEmpty(user))
            return Unauthorized("User not found in token");

        var orders = await _context.Orders
            .Where(o => o.UserId == user)
            .Select(o => new
            {
                o.Id,
                o.ProductName,
                o.Quantity,
                o.Price,
                o.Date,
                o.Status
            })
            .ToListAsync();

        return Ok(orders);
    }

    // ===============================
    // Создать заказ
    // ===============================
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        try
        {
            if (dto == null)
                return BadRequest("DTO is null");

            var user = GetUserIdentifier();

            if (string.IsNullOrEmpty(user))
                return Unauthorized("User not found in token");

            if (string.IsNullOrEmpty(dto.ProductName))
                return BadRequest("ProductName is required");

            var order = new Order
            {
                UserId = user, // 🔥 теперь email или sub
                ProductName = dto.ProductName,
                Quantity = dto.Quantity,
                Price = dto.Price,
                Date = DateTime.UtcNow,
                Status = "Processing"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                error = ex.Message,
                stack = ex.InnerException?.Message
            });
        }
    }

    // ===============================
    // Удалить заказ (админ)
    // ===============================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
            return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Заказ удалён" });
    }

    // ===============================
    // Все заказы (админ)
    // ===============================
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Select(o => new
            {
                o.Id,
                o.UserId,
                o.ProductName,
                o.Quantity,
                o.Price,
                o.Date,
                o.Status
            })
            .ToListAsync();

        return Ok(orders);
    }
    

    // ===============================
    // Изменить статус (админ)
    // ===============================
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(
        int id,
        [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
            return NotFound();

        order.Status = dto.Status;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            order.Id,
            order.Status
        });
    }

    // ===============================
    // Отменить заказ (пользователь)
    // ===============================
    [HttpPut("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var user = GetUserIdentifier();

        if (string.IsNullOrEmpty(user))
            return Unauthorized();

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == user);

        if (order == null)
            return NotFound();

        if (order.Status != "Processing")
            return BadRequest("Нельзя отменить этот заказ");

        order.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok(order);
    }
}