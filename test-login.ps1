$body = @{email='admin@universoempada.com.br'; senha='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:3002/api/auth/login' -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content

