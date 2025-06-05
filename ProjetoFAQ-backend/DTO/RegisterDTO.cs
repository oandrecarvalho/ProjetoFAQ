// ReSharper disable all
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Globalization;

namespace ProjetoFAQ.DTO;

public class RegisterDTO
{
    public string Name { get; set; }
    [JsonConverter(typeof(JsonDateConverter))]
    public DateTime Birthday { get; set; }
    public string Email { get; set; }
    public string CPF { get; set; }
    public string Address { get; set; }
    public string Password { get; set; }
}

public class JsonDateConverter : JsonConverter<DateTime>
{
    private readonly string[] formats = new[] { "dd/MM/yyyy", "yyyy-MM-dd", "yyyy-MM-ddTHH:mm:ss" };

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var dateStr = reader.GetString();
        if (DateTime.TryParseExact(dateStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            return date;
        }

        throw new JsonException($"Formato de data inválido: '{dateStr}'. Use 'dd/MM/yyyy' ou 'yyyy-MM-dd'.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("dd/MM/yyyy"));
    }
}