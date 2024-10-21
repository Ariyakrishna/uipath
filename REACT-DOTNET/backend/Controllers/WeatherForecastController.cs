using Microsoft.AspNetCore.Mvc;

namespace MyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherForecastController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetWeather()
        {
            var weather = new 
            {
                temperature = 72,
                condition = "Sunny"
            };

            return Ok(weather);
        }
    }
}
