function ConvertTo-BasicAuthHeader {
    param([string]$authtoken)

    $ba = (':{0}' -f $authtoken)
    $ba = [System.Text.Encoding]::UTF8.GetBytes($ba)
    $ba = [System.Convert]::ToBase64String($ba)
    $header = @{Authorization = ('Basic{0}' -f $ba); ContentType = 'application/json'}
    return $header
}

$branchRef = $env:BUILD_SOURCEBRANCH
$authHeader = ConvertTo-BasicAuthHeader $env:SYSTEM_ACCESSTOKEN

$projectId = $env:SYSTEM_TEAMPROJECTID

# Sample links
# https://vstmr.codedev.ms/foo/0e804a94-5253-4fb8-a183-7c79420142ff/_apis/testresults/CodeCoverage/?buildId=1234&api-version=5.0-preview.1
# https://tcm1.dev.azure.com/foo/0e804a94-5253-4fb8-a183-7c79420142ff/_apis/testresults/CodeCoverage/?buildId=1234&api-version=5.0-preview.1

$uri = $env:TCMADDRESS + '/' + $projectId + '/_apis/testresults/CodeCoverage/?buildId=' + $env:BUILD_BUILDID + '&api-version=5.0-preview.1'

Write-Host 'Calling get via ' $uri

$getRequest = ''

# Expected Status Values
# 'pending' The coverage merge/evaluation is queued and hasnt started yet
# 'inProgress' The coverage merge/evaluation is in progress
# 'completed' The coverage merge/evaluation for the request client made is completed
$startTime = Get-Date
do
{
    Start-Sleep -s 1
    $getRequest = Invoke-RestMethod -Uri $uri -Headers $authHeader -Method Get -ContentType 'application/json' -UseBasicParsing
} while (($getRequest.status -eq 'pending' -or  $getRequest.status -eq 'inProgress') -and ((Get-Date) -lt $startTime.AddMinutes(3)))

if($getRequest.status -ne 'completed') {
    Write-Host 'status is not completed, ' + $getRequest.status
    exit 1;
}

Write-Host $getRequest.status
Write-Host $getRequest.coverageData.coverageStats