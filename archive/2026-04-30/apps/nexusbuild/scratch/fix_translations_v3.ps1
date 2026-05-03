$p = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$c = [System.IO.File]::ReadAllText($p);

# Repairing the Spanish section structure
# Move the closing brace of 'common' to include the floating keys

# Search for the prematurely closed 'common' and 'community' block
$search = "        },`r`n        community: {";
$replace = "        community: {"; # Removing the premature closing of common

if ($c.Contains($search)) { 
    $c = $c.Replace($search, $replace);
    Write-Host "Removal of premature common end applied (CRLF).";
} else {
    $searchLF = "        },`n        community: {";
    $replaceLF = "        community: {";
    if ($c.Contains($searchLF)) {
        $c = $c.Replace($searchLF, $replaceLF);
        Write-Host "Removal of premature common end applied (LF).";
    }
}

# The keys (done, search, etc.) are now inside community or common?
# They follow 'community', so they are now keys of the 'es' object directly.
# But we need them inside 'common'. 
# Actually, the most robust fix is to move the 'common' end to after 'maintenance_message'.

$endCommonSearch = "            maintenance_message: 'Estamos en mantenimiento. Solo los administradores pueden acceder a la aplicación.',`r`n        },";
$endCommonReplace = "            maintenance_message: 'Estamos en mantenimiento. Solo los administradores pueden acceder a la aplicación.',`r`n        },`r`n    },"; # Added the brace to close 'common' or similar

# Wait, this is getting complex. I'll just rewrite the Spanish block start.

$fullRepairSearch = "    es: {`r`n        common: {`r`n            loading: 'Cargando...',`r`n            error: 'Algo salió mal',`r`n            retry: 'Reintentar',`r`n            tryAgain: 'Intentalo de nuevo',`r`n            cancel: 'Cancelar',`r`n            save: 'Guardar',`r`n            confirm: 'Confirmar',`r`n            delete: 'Eliminar',`r`n            edit: 'Editar',`r`n            back: 'Atrás',`r`n            next: 'Siguiente',`r`n        },`r`n        community: {";

$fullRepairReplace = "    es: {`r`n        common: {`r`n            loading: 'Cargando...',`r`n            error: 'Algo salió mal',`r`n            retry: 'Reintentar',`r`n            tryAgain: 'Intentalo de nuevo',`r`n            cancel: 'Cancelar',`r`n            save: 'Guardar',`r`n            confirm: 'Confirmar',`r`n            delete: 'Eliminar',`r`n            edit: 'Editar',`r`n            back: 'Atrás',`r`n            next: 'Siguiente',"; # Note: NO closing brace here, it continues into community

# Actually, I'll just use a regex to fix it.
$c = $c -replace "next: 'Siguiente',`r?`n        \},`r?`n        community: \{", "next: 'Siguiente',`r`n        community: {"
$c = $c -replace "share: 'Compartir Build'`r?`n            \}", "share: 'Compartir Build'`r`n            \},`r`n        \},"

[System.IO.File]::WriteAllText($p, $c);
