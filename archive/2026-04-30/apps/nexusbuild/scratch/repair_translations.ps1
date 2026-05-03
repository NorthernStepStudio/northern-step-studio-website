$path = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$content = Get-Content $path -Raw;
# Find the broken part (// Spanish followed by next) and fix it
$search = "    // Spanish`r`n            next: 'Siguiente',";
if ($content -match [regex]::Escape($search)) {
    $replace = "    // Spanish`r`n    es: {`r`n        common: {`r`n            loading: 'Cargando...',`r`n            error: 'Algo salió mal',`r`n            retry: 'Reintentar',`r`n            tryAgain: 'Intentalo de nuevo',`r`n            cancel: 'Cancelar',`r`n            save: 'Guardar',`r`n            confirm: 'Confirmar',`r`n            delete: 'Eliminar',`r`n            edit: 'Editar',`r`n            back: 'Atrás',`r`n            next: 'Siguiente',";
    $content = $content -replace [regex]::Escape($search), $replace;
    Set-Content $path $content -NoNewline;
    Write-Host "Repair successful (CRLF format)";
} else {
    # Try with LF format
    $searchLF = "    // Spanish`n            next: 'Siguiente',";
    if ($content -match [regex]::Escape($searchLF)) {
        $replaceLF = "    // Spanish`n    es: {`n        common: {`n            loading: 'Cargando...',`n            error: 'Algo salió mal',`n            retry: 'Reintentar',`n            tryAgain: 'Intentalo de nuevo',`n            cancel: 'Cancelar',`n            save: 'Guardar',`n            confirm: 'Confirmar',`n            delete: 'Eliminar',`n            edit: 'Editar',`n            back: 'Atrás',`n            next: 'Siguiente',";
        $content = $content -replace [regex]::Escape($searchLF), $replaceLF;
        Set-Content $path $content -NoNewline;
        Write-Host "Repair successful (LF format)";
    } else {
        Write-Error "Search string not found";
    }
}
