// Author: Daniel Liedke
// Copyright (c) 2026 Daniel Liedke. All rights reserved.
// Proprietary software. Unauthorized use, copying, or distribution is prohibited.

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "dist"
});

var app = builder.Build();

// ES modules must be served with a JavaScript MIME type for browsers to load them.
var contentTypes = new FileExtensionContentTypeProvider();
contentTypes.Mappings[".mjs"] = "text/javascript";

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = contentTypes
});

app.Run();
