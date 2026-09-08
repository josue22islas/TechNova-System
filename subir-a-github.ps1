$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
try {
    $gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
    $gitExecutable = if ($gitCommand) { $gitCommand.Source } else { $null }
    if (-not $gitExecutable) {
        $candidates = @(
            "$env:ProgramFiles\Git\cmd\git.exe",
            "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
            "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe",
            "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\bin\git.exe"
        )
        $gitExecutable = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }
    if (-not $gitExecutable) { throw 'No se encontro Git. Instala Git para Windows y vuelve a intentarlo.' }
    # Excepcion de propietario limitada a esta carpeta y a cada comando.
    $gitOptions = @('-c', "safe.directory=$($PSScriptRoot.Replace('\', '/'))")
    function Invoke-ProjectGit {
        & $gitExecutable @gitOptions @args
        if ($LASTEXITCODE -ne 0) { throw "Git no pudo completar: $($args -join ' ')" }
    }
    $remote = Invoke-ProjectGit remote get-url origin
    if ($remote -ne 'https://github.com/josue22islas/TechNova-System.git') { throw 'El remoto origin no corresponde a TechNova-System.' }
    $branch = Invoke-ProjectGit branch --show-current
    if ($branch -ne 'main') { throw 'Este script requiere la rama main. No se cambio de rama automaticamente.' }
    foreach ($state in @('MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply')) {
        $statePath = Invoke-ProjectGit rev-parse --git-path $state
        if (Test-Path -LiteralPath $statePath) { throw 'Hay una operacion Git pendiente. Terminala antes de volver a subir.' }
    }
    Write-Host 'Comprobando GitHub...' -ForegroundColor Cyan
    Invoke-ProjectGit fetch origin main
    & $gitExecutable @gitOptions merge-base --is-ancestor origin/main HEAD
    if ($LASTEXITCODE -ne 0) { throw 'GitHub contiene cambios que faltan aqui. Integra esos cambios antes de subir. Tus archivos locales se conservan.' }
    Write-Host 'Preparando archivos nuevos, modificaciones y eliminaciones...'
    Invoke-ProjectGit add --all
    & $gitExecutable @gitOptions diff --cached --quiet
    $diffStatus = $LASTEXITCODE
    if ($diffStatus -eq 1) {
        $message = 'Actualizar TechNova System - ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        Invoke-ProjectGit -c 'user.name=TechNova Soluctions' -c 'user.email=josue22isla@hotmail.com' commit -m $message
    } elseif ($diffStatus -ne 0) {
        throw 'No se pudieron comprobar los cambios preparados.'
    } else {
        Write-Host 'No hay cambios nuevos. Comprobando commits pendientes de subir...'
    }
    # Sin force: Git rechaza la subida si el remoto cambio durante la ejecucion.
    Invoke-ProjectGit push -u origin main
    $localCommit = Invoke-ProjectGit rev-parse HEAD
    $remoteRef = Invoke-ProjectGit ls-remote origin refs/heads/main
    if (-not $remoteRef -or ($remoteRef -split '\s+')[0] -ne $localCommit) { throw 'No se pudo confirmar la sincronizacion. Vuelve a ejecutar el script.' }
    Write-Host ''
    Write-Host 'LISTO: tus cambios ya estan en GitHub.' -ForegroundColor Green
    Write-Host 'https://github.com/josue22islas/TechNova-System'
    exit 0
} catch {
    Write-Host ''
    Write-Host 'NO SE COMPLETO LA ACTUALIZACION.' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host 'Tus archivos locales se conservan. Si fallo la conexion, vuelve a intentarlo.'
    exit 1
}
