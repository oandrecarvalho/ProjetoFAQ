// ReSharper disable all
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProjetoFAQ.Models
{
    public class Answer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        [Required]
        [StringLength(50)]
        public string Author { get; set; }
        [Required]
        [StringLength(500)]
        public string Text { get; set; }
        
        public DateTime Date { get; set; }

        public Question Question { get; set; }

        public Answer(string author, string text, DateTime date, Question question)
        {
            this.Author = author;
            this.Text = text;
            this.Date = date;
            this.Question = question;
        }
        
        private Answer() {}
    }
} 