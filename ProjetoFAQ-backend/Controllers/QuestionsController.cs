using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoFAQ.Data;
using ProjetoFAQ.DTO;
using ProjetoFAQ.Models;
using System.Security.Claims;

namespace ProjetoFAQ.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client,Admin")]
public class QuestionsController : ControllerBase
{
    private readonly FAQDbContext _dbContext;

    public QuestionsController(FAQDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetQuestions()
    {
        var questions = _dbContext.Questions
            .Include(q => q.Answers)
            .Select(q => new QuestionDTO
            {
                Id = q.Id,
                Author = q.Author,
                Text = q.Text,
                ProductId = q.Product.Id,
                Answers = q.Answers.Select(a => new AnswerDTO
                {
                    Text = a.Text,
                    Author = a.Author,
                    Date = a.Date
                }).ToList()
            })
            .ToList();
        
        if (questions.Count == 0)
            return NotFound();

        return Ok(questions);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public ActionResult<QuestionDTO> GetQuestion(string id)
    {
        var question = _dbContext.Questions.AsNoTracking().FirstOrDefault(q => q.Id == id);

        if (question == null)
            return NotFound();

        return Ok(question);
    }

    [HttpPost]
    public ActionResult<QuestionDTO> CreateQuestion(QuestionDTO newQuestionDTO)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Product? product = null;

        if (!string.IsNullOrEmpty(newQuestionDTO.ProductId))
        {
            product = _dbContext.Products.FirstOrDefault(p => p.Id == newQuestionDTO.ProductId);
        }

        var newQuestion = new Question(
            author: userId,
            text: newQuestionDTO.Text,
            date: DateTime.UtcNow,
            product: product
        );

        _dbContext.Questions.Add(newQuestion);
        _dbContext.SaveChanges();

        return CreatedAtAction(nameof(GetQuestion), new { id = newQuestion.Id }, newQuestion);
    }

    [HttpPut("{id}")]
    public ActionResult<QuestionDTO> UpdateQuestion(string id, QuestionDTO questionDTO)
    {
        var question = _dbContext.Questions.FirstOrDefault(q => q.Id == id);
        if (question == null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && question.Author != userId)
            return Forbid();

        question.Text = questionDTO.Text;
        _dbContext.SaveChanges();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteQuestion(string id)
    {
        var question = _dbContext.Questions.FirstOrDefault(q => q.Id == id);
        if (question == null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && question.Author != userId)
            return Forbid();

        _dbContext.Questions.Remove(question);
        _dbContext.SaveChanges();

        return NoContent();
    }
}