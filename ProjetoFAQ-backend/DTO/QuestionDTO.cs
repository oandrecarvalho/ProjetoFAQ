// ReSharper disable all
using ProjetoFAQ.Models;

namespace ProjetoFAQ.DTO;

public class QuestionDTO
{
    public string Id { get; set; }
    public string Author { get; set; }
    public string Text { get; set; }
    public string? ProductId { get; set; }

    public List<AnswerDTO> Answers { get; set; }
}