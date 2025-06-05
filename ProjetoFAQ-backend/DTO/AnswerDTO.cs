// ReSharper disable all
namespace ProjetoFAQ.DTO;

public class AnswerDTO
{
    public string Author { get; set; }
    public string Text { get; set; }
    public DateTime Date  { get; set; }
    public string QuestionId { get; set; }
}