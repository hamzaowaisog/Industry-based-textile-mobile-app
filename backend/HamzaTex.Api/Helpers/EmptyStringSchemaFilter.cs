using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HamzaTex.Api.Helpers;

/// <summary>
/// Replaces default empty-string examples with meaningful domain-specific values
/// so Swagger UI shows realistic pre-filled request bodies.
/// </summary>
public class EmptyStringSchemaFilter : ISchemaFilter
{
    // String examples keyed by property name (case-insensitive)
    private static readonly Dictionary<string, string> StringExamples = new(StringComparer.OrdinalIgnoreCase)
    {
        // Auth / user
        { "username",          "john_doe" },
        { "email",             "john@example.com" },
        { "password",          "@Secure123" },
        { "oldpassword",       "@Secure123" },
        { "newpassword",       "@NewSecure456" },
        { "confirmpassword",   "@NewSecure456" },
        { "token",             "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        { "refreshtoken",      "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." },

        // People / clients
        { "name",              "Ahmed Textiles" },
        { "phone",             "+92-300-1234567" },
        { "phonenumber",       "+92-300-1234567" },
        { "address",           "123 Mall Road, Lahore" },

        // Product
        { "sku",               "FAB-001" },
        { "unit",              "Meters" },

        // General
        { "notes",             "Optional notes here" },
        { "billno",            "INV-2024-0456" },
        { "description",       "Brief description" },
        { "message",           "Operation completed successfully" },
        { "title",             "Sample Title" },
    };

    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties == null)
            return;

        foreach (var property in schema.Properties)
        {
            if (property.Value.Example != null)
                continue;

            if (property.Value.Type == "string")
            {
                var example = StringExamples.TryGetValue(property.Key, out var val)
                    ? val
                    : "string";
                property.Value.Example = new OpenApiString(example);
            }
            else if (property.Value.Type == "integer" || property.Value.Type == "number")
            {
                var key = property.Key.ToLowerInvariant();

                // Any field ending in "id" (e.g. ClientId, OrderId, ProductId, PartyClientId) → 1
                if (key.EndsWith("id"))
                {
                    property.Value.Example = new OpenApiInteger(1);
                }
                else if (key is "amount" or "allocatedamount" or "creditlimit" or "openingbalance"
                              or "defaultcost" or "defaultprice" or "unitcost" or "unitprice")
                {
                    property.Value.Example = new OpenApiDouble(150000);
                }
                else if (key is "qty" or "quantity")
                {
                    property.Value.Example = new OpenApiDouble(50);
                }
                else if (key is "movementsource")
                {
                    property.Value.Example = new OpenApiInteger(3);
                }
                else if (key is "movementtype")
                {
                    property.Value.Example = new OpenApiInteger(1);
                }
                else if (key is "reorderlevel")
                {
                    property.Value.Example = new OpenApiInteger(10);
                }
            }
        }
    }
}
