var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Enable CORS for all origins, headers, and methods
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline (optional middleware)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();  // Helpful for debugging
}

// Use HTTPS redirection (optional)
app.UseHttpsRedirection();

// Enable CORS for the React frontend
app.UseCors("AllowReactApp");

// Authorization middleware
app.UseAuthorization();

// Map controllers to endpoints
app.MapControllers();

// Run the application
app.Run();
