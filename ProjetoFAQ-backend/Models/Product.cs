using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoFAQ.Models;

public class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [StringLength(500)]
    public string Description { get; set; }

    [Required]
    [Range(00.00, double.MaxValue)]
    public decimal Price { get; set; }


    public Product(string name, string description, decimal price)
    {
        Name = name;
        Description = description;
        Price = price;
    }
    
    private Product() {}
    
    public ICollection<Question> questions { get; set; }
}