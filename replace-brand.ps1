# ============================================================
#  Replace brand info across the whole static site.
#  Usage (PowerShell, run inside the site folder):
#    .\replace-brand.ps1 -Company "ABC Machinery Co., Ltd" `
#        -ShortName "ABC" -Phone "+86-000-0000000" `
#        -Mobile "+86 13000000000" -Email "sales@abc.com" `
#        -Domain "abc.com"
#  A backup folder _brand_backup will be created before changes.
# ============================================================
param(
  [Parameter(Mandatory=$true)][string]$Company,
  [string]$ShortName = "",
  [string]$Phone = "",
  [string]$Mobile = "",
  [string]$Email = "",
  [string]$Domain = "",
  [string]$Address = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

if (-not $ShortName) { $ShortName = $Company }
if (-not $Domain) { $Domain = "example.com" }
$mobileDigits = ($Mobile -replace "[^0-9+]", "")

$pairs = @(
  @("Kunhong (Shandong) Vacuum Technology Co., Ltd.", $Company),
  @("Kunhong (Shandong) Vacuum Technology Co., Ltd",  $Company),
  @("Kunhong (Shandong) Vacuum Technology Co. Ltd",   $Company),
  @("Kunhong (Shandong) Vacuum Technology Co.,Ltd",   $Company),
  @("Kunhong Technology",                             $ShortName),
  @("Kunhong",                                        $ShortName),
  @("+86-538-8896788",                                $Phone),
  @("+86 15753827668",                                $Mobile),
  @("+8615753827668",                                 $mobileDigits),
  @("kunhonglu@163.com",                              $Email),
  @("kunhongvac.com",                                 $Domain),
  @("Zhuyang Town Industrial Park, Daiyue District, Tai'an City", $Address),
  @("Zhuyang Town Industrial Park",                   $Address)
)

# backup
$backup = Join-Path $root "_brand_backup"
if (-not (Test-Path $backup)) { New-Item -ItemType Directory -Path $backup | Out-Null }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Path $root -Recurse -Include *.html | Where-Object { $_.FullName -notmatch "\\assets\\" }
$changed = 0

foreach ($f in $files) {
  $rel = $f.FullName.Substring($root.Length).TrimStart("\")
  $bpath = Join-Path $backup $rel
  $bdir = Split-Path -Parent $bpath
  if (-not (Test-Path $bdir)) { New-Item -ItemType Directory -Path $bdir -Force | Out-Null }
  if (-not (Test-Path $bpath)) { Copy-Item $f.FullName $bpath -Force }

  $text = [System.IO.File]::ReadAllText($f.FullName, $utf8)
  $orig = $text
  foreach ($p in $pairs) {
    if ($p[0] -and $p[1]) { $text = $text.Replace($p[0], $p[1]) }
  }
  if ($text -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8)
    $changed++
  }
}

Write-Host ""
Write-Host "Done. Files changed: $changed / $($files.Count)"
Write-Host "Backup saved to: $backup"
Write-Host ""
Write-Host "NOTE - items you still have to replace by hand:"
Write-Host "  * logo image  -> assets\hkimg\sites\99500\99596\... (the K-HONG LU picture)"
Write-Host "  * product photos and factory photos in assets\hkimg\sites\99500\99596\"
Write-Host "  * page titles in <title> tags (checked automatically by the replace above)"
