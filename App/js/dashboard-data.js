/**
 * DATOS DEL DASHBOARD
 * ------------------
 * Lee data-dashboard-api desde .dashboard y solicita un resumen JSON solo
 * cuando existe una ruta. Si el atributo está vacío, conserva los valores HTML
 * como fallback y no realiza ninguna petición.
 *
 * Flujo: endpoint -> fetch -> validación básica -> updateDashboardKpis() -> DOM.
 * Eventos: technova:dashboard-data-loaded y technova:dashboard-data-error.
 * Backend previsto: ../api/dashboard/summary.php; siempre debe responder JSON.
 */

(function() {

    'use strict';


    const dashboard =
        document.querySelector('.dashboard');


    if (!dashboard) return;


    const namespace =
        window.TechNovaDashboard =
            window.TechNovaDashboard
            ||
            {};


    const configuredEndpoint =
        String(
            dashboard.dataset.dashboardApi
            ||
            ''
        )
        .trim();


    async function loadDashboardSummary(
        endpoint = configuredEndpoint
    ) {

        const requestUrl =
            String(endpoint || '').trim();


        if (!requestUrl) {

            return null;

        }


        dashboard.dataset.dashboardLoading =
            'true';


        try {

            const response =
                await fetch(
                    requestUrl,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json'
                        },
                        credentials: 'same-origin'
                    }
                );


            if (!response.ok) {

                throw new Error(
                    'No fue posible cargar el resumen del dashboard. '
                    + 'HTTP '
                    + response.status
                );

            }


            const data =
                await response.json();


            if (
                typeof namespace.updateDashboardKpis
                !==
                'function'
            ) {

                throw new Error(
                    'El módulo visual de KPI no está disponible.'
                );

            }


            const updatedKeys =
                namespace.updateDashboardKpis(data);


            document.dispatchEvent(
                new CustomEvent(
                    'technova:dashboard-data-loaded',
                    {
                        detail: {
                            data: data,
                            updatedKeys: updatedKeys
                        }
                    }
                )
            );


            return data;

        }

        catch (error) {

            console.error(
                'TechNova dashboard:',
                error
            );


            document.dispatchEvent(
                new CustomEvent(
                    'technova:dashboard-data-error',
                    {
                        detail: {
                            error: error
                        }
                    }
                )
            );


            throw error;

        }

        finally {

            delete dashboard.dataset.dashboardLoading;

        }

    }


    namespace.loadDashboardSummary =
        loadDashboardSummary;


    namespace.dashboardSummaryEndpoint =
        configuredEndpoint
        ||
        null;


    if (configuredEndpoint) {

        loadDashboardSummary()
            .catch(function() {

                /*
                    Los valores escritos en el HTML permanecen
                    visibles como fallback cuando la API falla.
                */

            });

    }

})();
