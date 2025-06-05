// ReSharper disable all
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoFAQ.Data;
using ProjetoFAQ.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjetoFAQ.DTO;

namespace ProjetoFAQ.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class AnswersController : ControllerBase
    {
        private readonly FAQDbContext _dbContext;

        public AnswersController(FAQDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public ActionResult<IEnumerable<AnswerDTO>> GetAnswers()
        {
            var answers = _dbContext.Answers.AsNoTracking().ToList();

            if (answers == null)
            {
                return NotFound();
            }

            return Ok(answers);
        }

        [HttpGet("{id}")]
        public ActionResult<AnswerDTO> GetAnswer(string id)
        {
            var answer = _dbContext.Answers.AsNoTracking().FirstOrDefault(a => a.Id == id);

            if (answer == null)
            {
                return NotFound();
            }

            return Ok(answer);
        }

        [HttpPost]
        public ActionResult<AnswerDTO> CreateAnswer(AnswerDTO newAnswerDTO)
        {
            Question? question = _dbContext.Questions.FirstOrDefault(q => q.Id == newAnswerDTO.QuestionId);

            if (question == null)
            {
                return BadRequest("Pergunta não encontrada");
            }

            Answer newAnswer = new Answer(newAnswerDTO.Author, newAnswerDTO.Text, DateTime.Now, question);

            _dbContext.Answers.Add(newAnswer);
            _dbContext.SaveChanges();

            return CreatedAtAction(nameof(GetAnswer), new { id = question.Id }, newAnswer);
        }

        [HttpPut("{id}")]
        public ActionResult<AnswerDTO> UpdateAnswer(string id, AnswerDTO answerDTO)
        {
            var answer = _dbContext.Answers.AsNoTracking().FirstOrDefault(a => a.Id == id);

            if (answer == null)
            {
                return NotFound();
            }

            answer.Text = answerDTO.Text;
            answer.Author = answerDTO.Author;

            _dbContext.SaveChanges();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult<AnswerDTO> DeleteAnswer(string id)
        {
            var answer = _dbContext.Answers.AsNoTracking().FirstOrDefault(a => a.Id == id);

            if (answer == null)
            {
                return NotFound();
            }

            _dbContext.Answers.Remove(answer);
            _dbContext.SaveChanges();

            return NoContent();
        }
    }
}