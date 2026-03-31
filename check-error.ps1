try {
  $resp = Invoke-WebRequest -Uri "http://localhost:3000/en" -MaximumRedirection 0 -UseBasicParsing -TimeoutSec 30
  Write-Host "Status: $($resp.StatusCode)"
  Write-Host "Body: $($resp.Content.Substring(0, [Math]::Min(2000, $resp.Content.Length)))"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Write-Host "Status: $code"
  try {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "Body: $($body.Substring(0, [Math]::Min(3000, $body.Length)))"
  } catch {
    Write-Host "Could not read body: $($_.Exception.Message)"
  }
}
