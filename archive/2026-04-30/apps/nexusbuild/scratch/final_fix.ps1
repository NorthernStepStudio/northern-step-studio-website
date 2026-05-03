$p = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$c = [System.IO.File]::ReadAllText($p);

# English Insertion
$engSearch = "    // Spanish";
$engInsert = "        community: {
            actions: {
                open: 'Open Build',
                clone: 'Clone to Builder',
                viewDetails: 'View Details'
            },
            buildDetails: {
                title: 'Build Details',
                components: 'Build Components',
                totalPrice: 'Total Price',
                by: 'by',
                clone: 'Clone to Builder',
                share: 'Share Build'
            }
        },
    },

    // Spanish";

# Spanish Insertion
$espSearch = "            next: 'Siguiente',";
$espInsert = "            next: 'Siguiente',
        },
        community: {
            actions: {
                open: 'Abrir Build',
                clone: 'Clonar al Constructor',
                viewDetails: 'Ver Detalles'
            },
            buildDetails: {
                title: 'Detalles de la Build',
                components: 'Componentes',
                totalPrice: 'Precio Total',
                by: 'por',
                clone: 'Clonar al Constructor',
                share: 'Compartir Build'
            }
        },";

# Replace (Simple string replace for robustness)
$c = $c.Replace($engSearch, $engInsert);
$c = $c.Replace($espSearch, $espInsert);

[System.IO.File]::WriteAllText($p, $c);
Write-Host "Translations fixed.";
