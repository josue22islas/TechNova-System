/**
 * PRESENTACIÓN INICIAL TECHNOVA
 * ----------------------------
 * Presenta Horizonte en un iframe aislado y ejecuta la
 * timeline GSAP que presenta navbar, encabezado, KPI y paneles.
 *
 * La coordinación con otros módulos se realiza mediante eventos, no llamando
 * sus funciones internas: technova:start-counters, financial-chart-reveal y
 * cost-chart-reveal. reduced motion muestra el estado final sin animación larga.
 * Este archivo es sensible al orden de carga: GSAP debe existir previamente.
 */

/* =========================================================
   TECHNOVA
   EXPERIENCIA PREMIUM DE ENTRADA
   HORIZONTE SVG RESPONSIVE + ENTRADA DEL DASHBOARD
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        if (
            typeof gsap ===
            'undefined'
        ) {

            return;

        }


        /* =====================================================
           ELEMENTOS
           ===================================================== */

        const navbar =
            document.getElementById(
                'dashboard-navbar'
            );


        const menuToggle =
            document.querySelector(
                '.menu-toggle'
            );


        const logo =
            document.querySelector(
                '.dashboard .navbar .logo'
            );


        const navItems =
            gsap.utils.toArray(
                '.dashboard .navbar .div > .div-2'
            );


        const navbarProfile =
            document.querySelector(
                '.dashboard .navbar .column-2 .row'
            );


        const logoutButton =
            document.querySelector(
                '.dashboard .navbar .column-2 .row-2'
            );


        const header =
            document.querySelector(
                '.dashboard .row-3'
            );


        const headerTitle =
            document.querySelector(
                '.dashboard .column-4'
            );


        const headerControls =
            gsap.utils.toArray(
                '.dashboard .row-4 > *'
            );


        const kpiCards =
            gsap.utils.toArray(
                '.dashboard .frame-2 .card, ' +
                '.dashboard .frame-2 .card-2'
            );


        const financialPanel =
            document.querySelector(
                '.dashboard .grafica'
            );


        const financialHeader =
            document.querySelector(
                '.dashboard .grafica .row-8'
            );


        const financialChartContainer =
            document.querySelector(
                '.dashboard .financial-chart-container'
            );


        const investmentSection =
            document.querySelector(
                '.dashboard .investment-section'
            );


        const investmentHeader =
            document.querySelector(
                '.dashboard .investment-header'
            );


        const investmentWallet =
            document.querySelector(
                '.dashboard .investment-wallet'
            );


        const investmentAdd =
            document.querySelector(
                '.dashboard .investment-add-button'
            );


        const toolsCard =
            document.querySelector(
                '.dashboard .card-4'
            );


        const recurringHeader =
            document.querySelector(
                '.dashboard .text-input-container-6'
            );


        const recurringItems =
            gsap.utils.toArray(
                '.dashboard .recurring-expense-item'
            );


        const costDistribution =
            document.querySelector(
                '.dashboard .switch-container-3'
            );


        const costChart =
            document.querySelector(
                '.dashboard .switch-container-5'
            );


        const costLegend =
            gsap.utils.toArray(
                '.dashboard .chart-legend-item'
            );


        /* =====================================================
           CONFIGURACIÓN
           ===================================================== */

        const reducedMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            )
            .matches;


        let entranceTimeline =
            null;


        /* =====================================================
           CREAR INTRO
           ===================================================== */

        function createTechNovaIntro() {
            const intro = document.createElement('div');
            intro.className = 'technova-horizon-overlay';
            intro.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#030611;';
            const frame = document.createElement('iframe');
            frame.title = 'Presentación TechNova Solutions';
            frame.style.cssText = 'display:block;width:100%;height:100%;border:0;';
            intro.appendChild(frame);
            document.body.appendChild(intro);
            return intro;
        }

        function playTechNovaIntro(intro, onFinish) {
            const frame = intro.querySelector('iframe');
            const dashboard = document.querySelector('.dashboard');
            const wasInert = dashboard?.inert;
            if (dashboard) dashboard.inert = true;
            const previousFocus = document.activeElement;
            let completed = false;
            let loadingTimeout;
            const finish = () => {
                if (completed) return;
                completed = true;
                clearTimeout(loadingTimeout);
                window.removeEventListener('message', receive);
                if (dashboard) dashboard.inert = wasInert;
                intro.remove();
                onFinish?.();
                if (previousFocus && previousFocus !== document.body) previousFocus.focus();
            };
            const receive = (event) => {
                if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
                if (event.data?.type === 'technova:intro-ready') clearTimeout(loadingTimeout);
                if (event.data?.type === 'technova:intro-complete') finish();
            };
            window.addEventListener('message', receive);
            frame.addEventListener('error', finish, { once: true });
            // Solo limita la carga: una pausa elegida por el usuario no se interrumpe.
            loadingTimeout = setTimeout(finish, 15000);
            frame.src = new URL('intros/intro-technova/index.html?embedded=1', document.baseURI).href;
        }

        function createNavbarEntryShine() {

            navItems.forEach(

                function(item) {

                    item
                        .querySelector(
                            '.technova-entry-shine'
                        )
                        ?.remove();


                    const shine =
                        document.createElement(
                            'span'
                        );


                    shine.className =
                        'technova-entry-shine';


                    item.appendChild(
                        shine
                    );

                }

            );


            const shines =
                gsap.utils.toArray(
                    '.technova-entry-shine'
                );


            gsap.fromTo(

                shines,

                {

                    xPercent:
                        -220,

                    opacity:
                        0

                },

                {

                    xPercent:
                        520,

                    opacity:
                        .95,

                    duration:
                        1.15,

                    stagger:
                        .025,

                    ease:
                        'power2.inOut',

                    onComplete:
                        function() {

                            shines.forEach(

                                function(shine) {

                                    shine.remove();

                                }

                            );

                        }

                }

            );

        }


        /* =====================================================
           EVENTOS
           ===================================================== */

        function startKpiCounters() {

            document.dispatchEvent(

                new CustomEvent(
                    'technova:kpi-reveal'
                )

            );

        }


        function startFinancialReveal() {

            document.dispatchEvent(

                new CustomEvent(
                    'technova:financial-reveal'
                )

            );

        }


        function startCostChartReveal() {

            document.dispatchEvent(

                new CustomEvent(
                    'technova:cost-chart-reveal'
                )

            );

        }


        /* =====================================================
           ENTRADA DEL DASHBOARD
           ===================================================== */

        function playTechNovaEntrance() {

            if (
                entranceTimeline
            ) {

                entranceTimeline.kill();


                entranceTimeline =
                    null;

            }


            const intro =
                createTechNovaIntro();


            const desktopNavbar =
                window.innerWidth >
                1024;


            /* =================================================
               REDUCED MOTION
               ================================================= */

            if (
                reducedMotion
            ) {

                intro.remove();


                startKpiCounters();

                startFinancialReveal();


                return;

            }


            document.body
                .classList
                .add(
                    'technova-entry-running'
                );


            /* =================================================
               ESTADOS INICIALES
               ================================================= */


            /* NAVBAR DESKTOP */

            if (
                desktopNavbar
            ) {

                gsap.set(

                    navbar,

                    {

                        opacity:
                            0,

                        y:
                            -18,

                        scale:
                            .985,

                        filter:
                            'blur(14px)'

                    }

                );


                gsap.set(

                    logo,

                    {

                        opacity:
                            0,

                        y:
                            -8,

                        scale:
                            .94,

                        filter:
                            'blur(7px)'

                    }

                );


                gsap.set(

                    navItems,

                    {

                        opacity:
                            0,

                        x:
                            -16,

                        filter:
                            'blur(6px)'

                    }

                );


                gsap.set(

                    [
                        navbarProfile,
                        logoutButton
                    ],

                    {

                        opacity:
                            0,

                        y:
                            10

                    }

                );

            }


            /* NAVBAR MOBILE / TABLET */

            else {

                gsap.set(

                    menuToggle,

                    {

                        opacity:
                            0,

                        y:
                            -12,

                        scale:
                            .90,

                        filter:
                            'blur(7px)'

                    }

                );

            }


            /* HEADER */

            gsap.set(

                header,

                {

                    opacity:
                        0,

                    y:
                        16,

                    scale:
                        .992,

                    filter:
                        'blur(10px)'

                }

            );


            gsap.set(

                headerTitle,

                {

                    opacity:
                        0,

                    y:
                        10

                }

            );


            gsap.set(

                headerControls,

                {

                    opacity:
                        0,

                    y:
                        10,

                    scale:
                        .97

                }

            );


            /* KPI */

            gsap.set(

                kpiCards,

                {

                    opacity:
                        0,

                    y:
                        24,

                    scale:
                        .965,

                    filter:
                        'blur(6px)'

                }

            );


            /* GRÁFICA */

            gsap.set(

                financialPanel,

                {

                    opacity:
                        0,

                    y:
                        22,

                    scale:
                        .988,

                    filter:
                        'blur(8px)'

                }

            );


            gsap.set(

                financialHeader,

                {

                    opacity:
                        0,

                    y:
                        8

                }

            );


            gsap.set(

                financialChartContainer,

                {

                    opacity:
                        0,

                    y:
                        10

                }

            );


            /* FONDOS */

            gsap.set(

                investmentSection,

                {

                    opacity:
                        0,

                    y:
                        22,

                    scale:
                        .985,

                    filter:
                        'blur(8px)'

                }

            );


            gsap.set(

                [
                    investmentHeader,
                    investmentWallet,
                    investmentAdd
                ],

                {

                    opacity:
                        0,

                    y:
                        10

                }

            );


            /* HERRAMIENTAS */

            gsap.set(

                toolsCard,

                {

                    opacity:
                        0,

                    y:
                        22,

                    scale:
                        .985,

                    filter:
                        'blur(8px)'

                }

            );


            gsap.set(

                recurringHeader,

                {

                    opacity:
                        0,

                    y:
                        8

                }

            );


            gsap.set(

                recurringItems,

                {

                    opacity:
                        0,

                    x:
                        -8

                }

            );


            gsap.set(

                costDistribution,

                {

                    opacity:
                        0,

                    y:
                        12,

                    scale:
                        .96

                }

            );


            gsap.set(

                costChart,

                {

                    opacity:
                        0,

                    scale:
                        .86,

                    rotation:
                        -5

                }

            );


            gsap.set(

                costLegend,

                {

                    opacity:
                        0,

                    x:
                        10

                }

            );


            /* =================================================
               TIMELINE

               MUY IMPORTANTE:
               paused:true

               El dashboard NO comienza hasta que
               termine Horizonte o se active la salida de respaldo.
               ================================================= */

            entranceTimeline =
                gsap.timeline({

                    paused:
                        true,


                    defaults: {

                        ease:
                            'power3.out'

                    },


                    onComplete:
                        function() {

                            document.body
                                .classList
                                .remove(
                                    'technova-entry-running'
                                );


                            document.dispatchEvent(

                                new CustomEvent(
                                    'technova:entry-complete'
                                )

                            );


                            entranceTimeline =
                                null;

                        }

                });


            /* =================================================
               NAVBAR
               ================================================= */

            if (
                desktopNavbar
            ) {

                entranceTimeline

                    .to(

                        navbar,

                        {

                            opacity:
                                1,

                            y:
                                0,

                            scale:
                                1,

                            filter:
                                'blur(0px)',

                            duration:
                                .65,

                            clearProps:
                                'opacity,transform,filter'

                        },

                        .72

                    )


                    .to(

                        logo,

                        {

                            opacity:
                                1,

                            y:
                                0,

                            scale:
                                1,

                            filter:
                                'blur(0px)',

                            duration:
                                .48,

                            clearProps:
                                'opacity,transform,filter'

                        },

                        .88

                    )


                    .to(

                        navItems,

                        {

                            opacity:
                                1,

                            x:
                                0,

                            filter:
                                'blur(0px)',

                            duration:
                                .42,

                            stagger:
                                .055,

                            clearProps:
                                'opacity,transform,filter'

                        },

                        .97

                    )


                    .to(

                        [
                            navbarProfile,
                            logoutButton
                        ],

                        {

                            opacity:
                                1,

                            y:
                                0,

                            duration:
                                .45,

                            stagger:
                                .08,

                            clearProps:
                                'opacity,transform'

                        },

                        1.32

                    )


                    .call(

                        createNavbarEntryShine,

                        null,

                        1.56

                    );

            }

            else {

                entranceTimeline.to(

                    menuToggle,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .50,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    .78

                );

            }


            /* =================================================
               HEADER
               ================================================= */

            entranceTimeline

                .to(

                    header,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .58,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    1.16

                )


                .to(

                    headerTitle,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .42,

                        clearProps:
                            'opacity,transform'

                    },

                    1.32

                )


                .to(

                    headerControls,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        duration:
                            .40,

                        stagger:
                            .07,

                        clearProps:
                            'opacity,transform'

                    },

                    1.43

                );


            /* =================================================
               KPI
               ================================================= */

            entranceTimeline

                .call(

                    startKpiCounters,

                    null,

                    1.72

                )


                .to(

                    kpiCards,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .55,

                        stagger:
                            .075,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    1.70

                );


            /* =================================================
               GRÁFICA FINANCIERA
               ================================================= */

            entranceTimeline

                .to(

                    financialPanel,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .65,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    2.02

                )


                .to(

                    financialHeader,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .38,

                        clearProps:
                            'opacity,transform'

                    },

                    2.17

                )


                .to(

                    financialChartContainer,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .45,

                        clearProps:
                            'opacity,transform'

                    },

                    2.23

                )


                .call(

                    startFinancialReveal,

                    null,

                    2.29

                );


            /* =================================================
               FONDOS
               ================================================= */

            entranceTimeline

                .to(

                    investmentSection,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .62,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    2.31

                )


                .to(

                    investmentHeader,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .35,

                        clearProps:
                            'opacity,transform'

                    },

                    2.43

                )


                .to(

                    investmentWallet,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .50,

                        clearProps:
                            'opacity,transform'

                    },

                    2.48

                )


                .to(

                    investmentAdd,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .32,

                        clearProps:
                            'opacity,transform'

                    },

                    2.60

                );


            /* =================================================
               HERRAMIENTAS / GASTOS
               ================================================= */

            entranceTimeline

                .to(

                    toolsCard,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        filter:
                            'blur(0px)',

                        duration:
                            .62,

                        clearProps:
                            'opacity,transform,filter'

                    },

                    2.48

                )


                .to(

                    recurringHeader,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        duration:
                            .35,

                        clearProps:
                            'opacity,transform'

                    },

                    2.61

                )


                .to(

                    recurringItems,

                    {

                        opacity:
                            1,

                        x:
                            0,

                        duration:
                            .32,

                        stagger:
                            .055,

                        clearProps:
                            'opacity,transform'

                    },

                    2.66

                );


            /* =================================================
               DISTRIBUCIÓN DE COSTOS
               ================================================= */

            entranceTimeline

                .call(

                    startCostChartReveal,

                    null,

                    2.82

                )

                .to(

                    costDistribution,

                    {

                        opacity:
                            1,

                        y:
                            0,

                        scale:
                            1,

                        duration:
                            .52,

                        clearProps:
                            'opacity,transform'

                    },

                    2.73

                )


                .to(

                    costChart,

                    {

                        opacity:
                            1,

                        scale:
                            1,

                        rotation:
                            0,

                        duration:
                            .62,

                        ease:
                            'back.out(1.25)',

                        clearProps:
                            'opacity,transform'

                    },

                    2.82

                )


                .to(

                    costLegend,

                    {

                        opacity:
                            1,

                        x:
                            0,

                        duration:
                            .35,

                        stagger:
                            .07,

                        clearProps:
                            'opacity,transform'

                    },

                    2.90

                );


            /* =================================================
               VIDEO PRIMERO
               DASHBOARD DESPUÉS
               ================================================= */

            playTechNovaIntro(

                intro,

                function() {

                    if (
                        !entranceTimeline
                    ) {

                        return;

                    }


                    /*
                       Como ya no existe la intro antigua
                       dentro de esta timeline, iniciamos
                       directamente donde comenzaba navbar.

                       NO hay espera adicional.
                    */

                    entranceTimeline.play(
                        .72
                    );

                }

            );

        }


        /* =====================================================
           INICIAR
           ===================================================== */

        playTechNovaEntrance();


        /* =====================================================
           REPRODUCIR NUEVAMENTE DESDE CONSOLA

           replayTechNovaEntrance()
           ===================================================== */

        window.replayTechNovaEntrance =
            playTechNovaEntrance;


        /* =====================================================
           MOBILE
           ANIMACIÓN AL ABRIR MENÚ
           ===================================================== */

        if (
            menuToggle
        ) {

            menuToggle.addEventListener(

                'click',

                function() {

                    if (
                        window.innerWidth >
                        1024
                    ) {

                        return;

                    }


                    requestAnimationFrame(

                        function() {

                            if (
                                !navbar
                                    ?.classList
                                    .contains(
                                        'menu-open'
                                    )
                            ) {

                                return;

                            }


                            gsap.fromTo(

                                navItems,

                                {

                                    opacity:
                                        0,

                                    x:
                                        -12

                                },

                                {

                                    opacity:
                                        1,

                                    x:
                                        0,

                                    duration:
                                        .32,

                                    stagger:
                                        .04,

                                    ease:
                                        'power3.out',

                                    clearProps:
                                        'opacity,transform'

                                }

                            );


                            gsap.fromTo(

                                [
                                    navbarProfile,
                                    logoutButton
                                ],

                                {

                                    opacity:
                                        0,

                                    y:
                                        8

                                },

                                {

                                    opacity:
                                        1,

                                    y:
                                        0,

                                    duration:
                                        .35,

                                    stagger:
                                        .06,

                                    delay:
                                        .15,

                                    clearProps:
                                        'opacity,transform'

                                }

                            );

                        }

                    );

                }

            );

        }

    }
);
