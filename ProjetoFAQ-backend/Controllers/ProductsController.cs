using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoFAQ.Data;
using ProjetoFAQ.DTO;
using ProjetoFAQ.Models;

namespace ProjetoFAQ.Controllers;

[ApiController]
[Route("api/[controller]")]

[Authorize(Roles = "Admin")]
public class ProductsController : ControllerBase
{
    private readonly FAQDbContext _dbContext;

    public ProductsController(FAQDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<List<ProductDTO>> GetProducts()
    {
        var products = _dbContext.Products.AsNoTracking().ToList();
        if (_dbContext.Products is null) 
            return NotFound();
        
        return Ok(products);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public ActionResult<ProductDTO> GetProduct(string id)
    {
        var product = _dbContext.Products.FirstOrDefault(p => p.Id == id);
        
        if (product is null)
            return NotFound();
        
        return Ok(product);
    }

    [HttpPost]
    public ActionResult<ProductDTO> CreateProduct(ProductDTO newProductDTO)
    {
        var newProduct = new Product(newProductDTO.Name, newProductDTO.Description, newProductDTO.Price);
        
        _dbContext.Products.Add(newProduct);
        _dbContext.SaveChanges();
        
        return CreatedAtAction(nameof(CreateProduct), newProduct);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateProduct(string id, ProductDTO productDTO)
    {
        var product = _dbContext.Products.FirstOrDefault(p => p.Id == id);
        
        if (product is null)
            return NotFound();
        
        product.Name = productDTO.Name;
        product.Description = productDTO.Description;
        product.Price = productDTO.Price;
        _dbContext.SaveChanges();
        
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteProduct(string id)
    {
        var product = _dbContext.Products.FirstOrDefault(p => p.Id == id);
        
        if (product is null)
            return NotFound();
        
        _dbContext.Products.Remove(product);
        _dbContext.SaveChanges();
        
        return NoContent();
    }
}