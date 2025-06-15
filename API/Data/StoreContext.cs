using System;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class StoreContext(DbContextOptions options) : IdentityDbContext<User>(options)

{
    public required DbSet<Product> Products { get; set; }
    public required DbSet<Basket> Baskets { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<IdentityRole>()
        .HasData(
         new IdentityRole { Id = "826b3231-7b42-450b-a62e-8d2461640849", Name = "Member", NormalizedName = "MEMBER" },
         new IdentityRole { Id = "5556ec93-e711-40bf-9767-1f864e1ff77c", Name = "Admin", NormalizedName = "ADMIN" }
        );
    }
}
