$p = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$c = [System.IO.File]::ReadAllText($p);

# The structural break is where 'en' is closed prematurely at line 962.
# We need to remove the closing brace of 'en' before the 'community' block.

# Search pattern: closing 'conduct' block, then closing 'en' block, then 'community'
$search = "            },`r`n        },`r`n    },`r`n`r`n        community: {";
$replace = "            },`r`n        },`r`n        community: {";

if ($c.Contains($search)) { 
    $c = $c.Replace($search, $replace);
    Write-Host "Structural fix applied (CRLF).";
} else {
    $searchLF = "            },`n        },`n    },`n`n        community: {";
    $replaceLF = "            },`n        },`n        community: {";
    if ($c.Contains($searchLF)) {
        $c = $c.Replace($searchLF, $replaceLF);
        Write-Host "Structural fix applied (LF).";
    } else {
        Write-Error "Could not find the structural break pattern.";
        # Fallback: very specific line replacement
        $searchShort = "    },`r`n`r`n        community: {";
        $replaceShort = "`r`n        community: {";
        if ($c.Contains($searchShort)) {
             $c = $c.Replace($searchShort, $replaceShort);
             Write-Host "Structural fix applied (Alternative CRLF).";
        }
    }
}

[System.IO.File]::WriteAllText($p, $c);
