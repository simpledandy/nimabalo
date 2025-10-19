param(
  [Parameter(Mandatory=$true)]
  [string]$BotToken,
  [Parameter(Mandatory=$true)]
  [string]$WebhookUrl,
  [Parameter(Mandatory=$true)]
  [string]$Secret
)

$uri = "https://api.telegram.org/bot$BotToken/setWebhook"
$body = @{ url = $WebhookUrl; secret_token = $Secret }

Write-Host "Setting webhook to $WebhookUrl with secret"
Invoke-RestMethod -Uri $uri -Method Post -ContentType 'multipart/form-data' -Body $body
Write-Host "Done."