$routes = @(
  "/",
  "/about",
  "/posts",
  "/categories",
  "/levels",
  "/search?q=How",
  "/imprint",
  "/privacy",
  "/terms",
  "/en",
  "/en/about",
  "/en/posts",
  "/en/categories",
  "/en/levels",
  "/en/search?q=How",
  "/en/partnerships",
  "/en/team",
  "/en/imprint",
  "/en/privacy",
  "/en/terms"
)

foreach ($route in $routes) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3000$route" -MaximumRedirection 5 -UseBasicParsing -TimeoutSec 10
    $final = $resp.BaseResponse.ResponseUri.PathAndQuery
    if ($final -eq $null) { $final = $route }
    Write-Host "$route => $($resp.StatusCode) (final: $final)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code) {
      Write-Host "$route => $code ERROR"
    } else {
      Write-Host "$route => CONNECT ERROR: $($_.Exception.Message)"
    }
  }
}
