<#
    update.ps1 — Hexo 博客一键发布

    用法（在这个目录下）：
        .\update.ps1                    # 提交信息自动用当前日期时间
        .\update.ps1 "post: 新文章"      # 自定义提交信息
        .\update.ps1 -DryRun            # 只看会提交哪些文件，不提交也不推送

    作用：git add -A → git commit → git push origin main
    推送成功后 GitHub Actions 会自动构建并发布。
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message = '',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# 切到脚本所在目录（也就是博客根目录），这样双击运行也没问题
if ($PSScriptRoot) { Set-Location -LiteralPath $PSScriptRoot }
Write-Host "博客目录：$PWD" -ForegroundColor DarkGray

# 1. 确认这里是 git 仓库
if (-not (Test-Path -LiteralPath (Join-Path $PWD '.git'))) {
    Write-Host "× 这里不是 git 仓库，先确认路径对不对。" -ForegroundColor Red
    exit 1
}

# 2. 看看有没有要提交的改动
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "没有检测到任何改动，无需发布。" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n将要提交的改动：" -ForegroundColor Cyan
git status --short

if ($DryRun) {
    Write-Host "`n[DryRun] 以上只是预览，没有提交、也没有推送。" -ForegroundColor Yellow
    exit 0
}

# 3. 暂存并提交
git add -A

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git commit -q -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "× 提交失败，请把上面的报错发出来。" -ForegroundColor Red
    exit 1
}
Write-Host "`n√ 已提交：$Message" -ForegroundColor Green

# 4. 推送（-u 顺便绑定上游分支，第一次之后就不再需要）
Write-Host "`n正在推送到 GitHub ..." -ForegroundColor Cyan
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "× 推送失败，请把上面的报错发出来。" -ForegroundColor Red
    exit 1
}

Write-Host "`n√ 推送完成！" -ForegroundColor Green
Write-Host "GitHub Actions 正在构建，约 1–2 分钟后刷新：" -ForegroundColor DarkGray
Write-Host "    https://apotofcat-bit.github.io" -ForegroundColor DarkGray
Write-Host "构建进度看这里：" -ForegroundColor DarkGray
Write-Host "    https://github.com/apotofcat-bit/apotofcat-bit.github.io/actions" -ForegroundColor DarkGray
