using System;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrdersController (StoreContext context) : BaseApiController

{
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        var orders = await context.Orders.
        ProjectToDto()
        .Where(x => x.BuyerEmail == User.GetUsername())
        .ToListAsync();

        return orders;
    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderDetails(int id)
    {
        var order = await context.Orders
            .ProjectToDto()
            .Where(x => x.BuyerEmail == User.GetUsername() && x.Id == id)
            .FirstOrDefaultAsync();

        if (order == null) return NotFound();

        return Ok(order);
       
    }
     [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

        if(basket == null || basket.Items.Count == 0 || string.IsNullOrEmpty(basket.PamymentIntentId))
        
            return BadRequest("Your basket is empty" );

            var items = CreateOrderItems(basket.Items);
            if(items == null) return BadRequest("Some items out of stock");

            var subtotal = items.Sum(x => x.Price * x.Quantity);
            var deliveryFee = CalulateDeliveryFee  (subtotal);

            var order = await context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.PaymentIntentId == basket.PamymentIntentId);
            if(order == null)
            {
                order = new Order
            {
                OrderItems = items,
                BuyerEmail = User.GetUsername(),
                ShippingAddress = orderDto.ShippingAddress,
                DeliveryFee = deliveryFee,
                Subtotal = subtotal,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = basket.PamymentIntentId
                
            };
            context.Orders.Add(order);
            }
            else
            {
                order.OrderItems = items;
                
            }

            
            
            context.Baskets.Remove(basket);
            Response.Cookies.Delete("basketId");

            var result = await context.SaveChangesAsync() > 0;
            if (!result)return BadRequest("Problem creating order");
            return CreatedAtAction(nameof(GetOrderDetails), new { id = order.Id }, order.ToDto());
    
                
        }

    private long CalulateDeliveryFee(long subtotal)
    {
        return subtotal > 10000 ? 0 : 500;
    }

    private List<OrderItem>? CreateOrderItems(List<BasketItem> items)
    {
        var orderItems = new List<OrderItem>();
        foreach( var item in items)
        {
            if(item.Product.QuantityInStock < item.Quantity)
            
                 return null;
            var orderItem = new OrderItem
            {
                ItemOrdered = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    PictureUrl = item.Product.PictureUrl,
                    Name = item.Product.Name,
                },
                Price = item.Product.Price,
                Quantity = item.Quantity
            };     
            orderItems.Add(orderItem);
            item.Product.QuantityInStock -= item.Quantity;
            
        }
        return orderItems;
    }
}

