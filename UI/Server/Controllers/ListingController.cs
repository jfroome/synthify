using Microsoft.AspNetCore.Mvc;
using SynthSearcherUI.Shared;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace SynthSearcherUI.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ListingController : ControllerBase
    {

        private readonly ILogger<ListingController> _logger;

        public ListingController(ILogger<ListingController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<IEnumerable<Listing>> Get()
        {
            var response = new List<Listing>();
            var http = new HttpClient();
            http.BaseAddress = new Uri("http://localhost:3000/api/");
            var result = await http.GetFromJsonAsync<Listing[]>("get");

            var text = JsonSerializer.Serialize(result);
            Debug.WriteLine("result: " + text);
            if(result != null && result.Count() > 0)
            {
                response.AddRange(result);
            }
            return response;                 
        }
    }
}
