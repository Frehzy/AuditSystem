using Serilog;
using System.Diagnostics;
using System.Text;

namespace AuditSystem.Server.Middleware;

public class RequestLoggingMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var originalBodyStream = context.Response.Body;

        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            var request = await FormatRequest(context.Request);
            Log.Information("HTTP {Method} {Path} started | Headers: {Headers}",
                context.Request.Method, context.Request.Path, GetHeaders(context.Request.Headers));

            await next(context);

            stopwatch.Stop();

            var response = await FormatResponse(context.Response);
            Log.Information("HTTP {Method} {Path} completed with {StatusCode} in {Elapsed}ms | Response: {Response}",
                context.Request.Method, context.Request.Path, context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds, response);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            Log.Error(ex, "HTTP {Method} {Path} failed with error in {Elapsed}ms",
                context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds);

            throw;
        }
        finally
        {
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
            context.Response.Body = originalBodyStream;
        }
    }

    private async Task<string> FormatResponse(HttpResponse response)
    {
        response.Body.Seek(0, SeekOrigin.Begin);
        var text = await new StreamReader(response.Body).ReadToEndAsync();
        response.Body.Seek(0, SeekOrigin.Begin);

        return text.Length > 1000 ? string.Concat(text.AsSpan(0, 1000), "...") : text;
    }

    private static async Task<string> FormatRequest(HttpRequest request)
    {
        request.EnableBuffering();

        var buffer = new byte[Convert.ToInt32(request.ContentLength ?? 0)];
        await request.Body.ReadExactlyAsync(buffer);
        var bodyAsText = Encoding.UTF8.GetString(buffer);
        request.Body.Seek(0, SeekOrigin.Begin);

        return $"Headers: {GetHeaders(request.Headers)}, Body: {bodyAsText}";
    }

    private static string GetHeaders(IHeaderDictionary headers)
    {
        var headerList = headers
            .Where(h => !h.Key.StartsWith("Authorization"))
            .Select(h => $"{h.Key}: {string.Join(",", h.Value)}");

        return string.Join("; ", headerList);
    }
}