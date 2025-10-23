using AuditSystem.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace AuditSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result == null)
            return NotFound();

        if (result.Success && result.Data != null)
            return Ok(result.Data);

        if (result.Success && result.Data == null)
            return NotFound();

        return BadRequest(new { message = result.Message, errors = result.Errors });
    }

    protected IActionResult HandleResult(Result result)
    {
        if (result.Success)
            return Ok();

        return BadRequest(new { message = result.Message, errors = result.Errors });
    }
}