// ReSharper disable all
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjetoFAQ.DTO;
using ProjetoFAQ.Models;
using System.Security.Claims;

namespace ProjetoFAQ.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ClientsController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    // Somente administradores podem listar todos os clientes
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllClients()
    {
        var clients = _userManager.Users.Select(u => new ClientDTO
        {
            Id = u.Id,
            Name = u.Name,
            Birthday = u.Birthday,
            CPF = u.CPF,
            Address = u.Address,
            Email = u.Email
        }).ToList();
        
        if (clients.Count == 0)
            return NotFound();

        return Ok(clients);
    }

    // Visualizar cliente específico (somente admin)
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetClientById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        return Ok(new ClientDTO
        {
            Id = user.Id,
            Name = user.Name,
            Birthday = user.Birthday,
            CPF = user.CPF,
            Address = user.Address,
            Email = user.Email
        });
    }

    // Cliente autenticado acessa seu perfil
    [HttpGet("me")]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(new ClientDTO
        {
            Id = user.Id,
            Name = user.Name,
            Birthday = user.Birthday,
            CPF = user.CPF,
            Address = user.Address,
            Email = user.Email
        });
    }

    // Atualizar cliente (admin ou o próprio usuário)
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateClient(string id, ClientDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && userId != id)
            return Forbid();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.Name = dto.Name;
        user.Birthday = dto.Birthday;
        user.CPF = dto.CPF;
        user.Address = dto.Address;
        user.Email = dto.Email;
        user.UserName = dto.Email;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded ? NoContent() : BadRequest(result.Errors);
    }

    // Exclusão (somente admin)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteClient(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded ? NoContent() : BadRequest(result.Errors);
    }
}