using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace ProjetoFAQ.Models;

public class Question
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Author { get; set; }

    [Required]
    [StringLength(500)]
    public string Text { get; set; }

    public DateTime Date { get; set; } = DateTime.Now;

    public Question(string author, string text, DateTime date, Product? product)
    {
        this.Author = author;
        this.Text = text;
        this.Date = date;
        Product = product;
    }

    private Question() { }

    public Product? Product { get; set; }

    [JsonIgnore]
    public List<Answer> Answers { get; set; } = new();
}