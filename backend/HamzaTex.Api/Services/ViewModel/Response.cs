namespace HamzaTex.Api.Services.ViewModel;

public class Response<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static Response<T> SuccessResponse(T data, string message = "Operation completed successfully")
    {
        return new Response<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = null
        };
    }

    public static Response<T> ErrorResponse(string message, List<string>? errors = null)
    {
        return new Response<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors ?? new List<string>()
        };
    }

    public static Response<T> ErrorResponse(string message, string error)
    {
        return new Response<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = new List<string> { error }
        };
    }
}

public class Response
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }

    public static Response SuccessResponse(string message = "Operation completed successfully")
    {
        return new Response
        {
            Success = true,
            Message = message,
            Errors = null
        };
    }

    public static Response ErrorResponse(string message, List<string>? errors = null)
    {
        return new Response
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }

    public static Response ErrorResponse(string message, string error)
    {
        return new Response
        {
            Success = false,
            Message = message,
            Errors = new List<string> { error }
        };
    }
}

