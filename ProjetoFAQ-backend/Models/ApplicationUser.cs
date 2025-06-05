using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.InteropServices.JavaScript;
using Microsoft.AspNetCore.Identity;

namespace ProjetoFAQ.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    public string Name { get; set; }
    [Required]
    public DateTime Birthday { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public string CPF { get; set; }
    [Required]
    public string Address { get; set; }

    public ApplicationUser(string name, DateTime birthday, string email, string cpf, string address)
    {
        this.Name = name;
        this.Birthday = birthday;
        this.Email = email;
        this.CPF = cpf;
        this.Address = address;
    }
    
    private ApplicationUser() {}
}