using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace HamzaTex.Api.Helpers;

public class EmptyStringSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties == null)
            return;

        foreach (var property in schema.Properties)
        {
            if (property.Value.Type == "string" && property.Value.Example == null)
            {
                var propertyInfo = context.Type.GetProperty(
                    property.Key, 
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                
                if (propertyInfo != null && propertyInfo.PropertyType == typeof(string))
                {
                    property.Value.Example = new Microsoft.OpenApi.Any.OpenApiString(string.Empty);
                }
            }
        }
    }
}

