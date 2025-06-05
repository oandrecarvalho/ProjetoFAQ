using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjetoFAQ.Models;

namespace ProjetoFAQ.Data;

public class FAQDbContext : IdentityDbContext<ApplicationUser>
{
    public FAQDbContext(DbContextOptions<FAQDbContext> options)
        : base(options)
    {
    }
    public DbSet<Product> Products { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    
} 