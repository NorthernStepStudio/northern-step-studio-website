$p = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$c = [System.IO.File]::ReadAllText($p);

# Add English Community Block
$enTarget = "                    body: 'Violation of these guidelines may result in content removal, temporary suspension, or permanent banning of your account.',
                },
            },
        },";
$enInsert = "
        community: {
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
        },";

# Add Spanish Community Block
$esTarget = "                    body: 'La violación de estas pautas puede resultar en la eliminación de contenido, suspensión temporal o el bloqueo permanente de tu cuenta.',
                },
            },
        },";
$esInsert = "
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

# Normalize and Replace (handling newlines)
$c = $c.Replace($enTarget.Replace("`n", "`r`n"), ($enTarget + $enInsert).Replace("`n", "`r`n"));
$c = $c.Replace($esTarget.Replace("`n", "`r`n"), ($esTarget + $esInsert).Replace("`n", "`r`n"));

[System.IO.File]::WriteAllText($p, $c);
Write-Host "Translations fixed.";
