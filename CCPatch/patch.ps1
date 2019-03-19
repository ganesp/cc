function ConvertTo-BasicAuthHeader {
  param([string]$authtoken)

  $ba = (":{0}" -f $authtoken)
  $ba = [System.Text.Encoding]::UTF8.GetBytes($ba)
  $ba = [System.Convert]::ToBase64String($ba)
  $header = @{Authorization = ("Bearer {0}" -f $ba); ContentType = "application/json"}
  return $header
}

$branchRef = $env:BUILD_SOURCEBRANCH
$authHeader = ConvertTo-BasicAuthHeader $env:SYSTEM_ACCESSTOKEN

$projectId = $env:SYSTEM_TEAMPROJECTID

$uri =  "$env:TCMADDRESS/$projectId/_apis/testresults/CodeCoverage/?buildId=$env:BUILD_BUILDID"

Write-Host "Calling patch via " $uri

$patchResult = Invoke-RestMethod -Uri $uri -Headers $authHeader -Method Patch -ContentType "application/json"
Write-Host $patchResult;
