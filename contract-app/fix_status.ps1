$f = "js/data.js"
$content = Get-Content $f -Raw
$content = $content -replace "'sealing'", "'signing'"
$content = $content -replace "'archiving'", "'sealed'"
$content = $content -replace "'archived'", "'sealed'"
Set-Content $f $content