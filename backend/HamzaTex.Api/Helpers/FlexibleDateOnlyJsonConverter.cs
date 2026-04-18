using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HamzaTex.Api.Helpers;

/// <summary>
/// Accepts <c>yyyy-MM-dd</c> and ISO-8601 date-time strings (e.g. <c>2026-04-18T00:00:00.000Z</c>) for <see cref="DateOnly"/> API fields.
/// </summary>
public sealed class FlexibleDateOnlyJsonConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var s = reader.GetString();
            if (string.IsNullOrWhiteSpace(s))
                throw new JsonException("Date string is empty.");
            if (DateOnlyJsonParsing.TryParse(s, out var d))
                return d;
        }
        if (reader.TokenType == JsonTokenType.Null)
            throw new JsonException("Cannot read null as DateOnly.");

        throw new JsonException("The JSON value could not be converted to System.DateOnly.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
}

/// <summary>Same parsing as <see cref="FlexibleDateOnlyJsonConverter"/>, with null, omitted, and empty string treated as null for optional request bodies.</summary>
public sealed class FlexibleNullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;
        if (reader.TokenType == JsonTokenType.String)
        {
            var s = reader.GetString();
            if (string.IsNullOrWhiteSpace(s))
                return null;
            if (DateOnlyJsonParsing.TryParse(s, out var d))
                return d;
        }

        throw new JsonException("The JSON value could not be converted to System.DateOnly.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        if (value is null)
            writer.WriteNullValue();
        else
            writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
    }
}

internal static class DateOnlyJsonParsing
{
    internal static bool TryParse(string s, out DateOnly d)
    {
        if (DateOnly.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
            return true;
        if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dt))
        {
            d = DateOnly.FromDateTime(dt);
            return true;
        }
        if (DateTimeOffset.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dto))
        {
            d = DateOnly.FromDateTime(dto.Date);
            return true;
        }
        d = default;
        return false;
    }
}
