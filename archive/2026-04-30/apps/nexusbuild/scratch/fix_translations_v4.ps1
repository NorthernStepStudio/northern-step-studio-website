$p = "d:\dev\Northern Step Studio\apps\nexusbuild\apps\mobile\src\core\i18n\translations.js";
$c = [System.IO.File]::ReadAllText($p);

# Clean replacement for the Spanish section to fix syntax and structural errors
$replacementSpanish = "    es: {
        common: {
            loading: 'Cargando...',
            error: 'Algo salió mal',
            retry: 'Reintentar',
            tryAgain: 'Intentalo de nuevo',
            cancel: 'Cancelar',
            save: 'Guardar',
            confirm: 'Confirmar',
            delete: 'Eliminar',
            edit: 'Editar',
            back: 'Atrás',
            next: 'Siguiente',
            done: 'Listo',
            search: 'Buscar',
            filter: 'Filtrar',
            sort: 'Ordenar',
            all: 'Todo',
            none: 'Ninguno',
            yes: 'Sí',
            no: 'No',
            ok: 'OK',
            close: 'Cerrar',
            send: 'Enviar',
            share: 'Compartir',
            copy: 'Copiar',
            or: 'o',
            settings: 'Configuración',
            language: 'Idioma',
            theme: 'Tema',
            dark: 'Oscuro',
            light: 'Claro',
            system: 'Sistema',
            offline: 'Sin conexión',
            errorTitle: 'Error',
            linkOpenError: 'No se pudo abrir el enlace: {url}',
            goBack: 'Volver',
            na: 'N/A',
            maintenance_message: 'Estamos en mantenimiento. Solo los administradores pueden acceder a la aplicación.',
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
        },
";

# Use Regex to replace the messy section starting from 'es: {' up to 'nav: {'
# (?s) enables single-line mode where . matches newlines
$regex = "(?s)    es: \{.*?        nav: \{"
$c = $c -replace $regex, ($replacementSpanish + "        nav: {")

[System.IO.File]::WriteAllText($p, $c);
Write-Host "Spanish section completely rebuilt.";
