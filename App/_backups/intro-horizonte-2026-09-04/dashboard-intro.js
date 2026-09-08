/**
 * PRESENTACIÓN INICIAL TECHNOVA
 * ----------------------------
 * Selecciona video según breakpoint, administra sonido/fallback y ejecuta la
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
   VIDEO DESKTOP / MOBILE + FALLBACK
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

            /*
               Eliminar intro anterior
               si se repite manualmente.
            */

            document
                .querySelector(
                    '.technova-intro'
                )
                ?.remove();


            /* =============================================
               DETECTAR TIPO DE DISPOSITIVO
               ============================================= */

            const isMobile =
                window.matchMedia(
                    '(max-width: 640px)'
                )
                .matches;

            const isTablet =
                window.matchMedia(
                    '(min-width: 641px) and (max-width: 1024px)'
                )
                .matches;


            /* =============================================
               VIDEO CORRESPONDIENTE
               ============================================= */

            const relativeVideoSource =

                isMobile

                    ? './videos/technova-intro-mobile.mp4'

                    : isTablet

                        ? './videos/technova-intro-tablet.mp4'

                        : './videos/technova-intro-desktop.mp4';


            /*
               Construimos una URL absoluta partiendo
               de la ubicación real del index.

               Esto funciona mejor cuando después
               utilizamos PHP / XAMPP.
            */

            const videoSource =
                new URL(

                    relativeVideoSource,

                    document.baseURI

                ).href;


            console.log(
                '[TechNova Intro] Video solicitado:',
                videoSource
            );


            /* =============================================
               CONTENEDOR
               ============================================= */

            const intro =
                document.createElement(
                    'div'
                );


            intro.className =
                'technova-intro';


            intro.innerHTML = `

                <!-- ======================================
                     VIDEO PRINCIPAL
                     ====================================== -->

                <!-- ==========================================
     VIDEO PRINCIPAL
     ========================================== -->

<video
    class="technova-intro-video"
    playsinline
    preload="auto"
    aria-hidden="true"
>

    <source
        src="${videoSource}"
        type="video/mp4"
    >

</video>


<!-- ==========================================
     ACTIVAR SONIDO
     Solo aparece si el navegador bloquea
     el autoplay con audio.
     ========================================== -->

<button
    type="button"
    class="technova-intro-sound"
    aria-label="Activar sonido de presentación"
>

    <span class="technova-intro-sound-icon">
        🔊
    </span>

    <span>
        Activar sonido
    </span>

</button>
                <!-- ======================================
                     FALLBACK ORIGINAL
                     ====================================== -->

                <div
                    class="technova-intro-fallback"
                    aria-hidden="true"
                >

                    <div class="technova-intro-content">

                        <div class="technova-intro-brand">
                            TECHNOVA
                        </div>

                        <div class="technova-intro-subtitle">
                            Management System
                        </div>

                        <div class="technova-intro-line">

                            <span></span>

                        </div>

                    </div>

                </div>

            `;


            document.body.appendChild(
                intro
            );


            return intro;

        }


        /* =====================================================
           REPRODUCIR INTRO

           IMPORTANTE:

           Una vez que el video comienza NO existe
           ningún temporizador que lo corte.

           Si dura 3 segundos → dura 3 segundos.
           Si dura 7 segundos → dura 7 segundos.
           Si dura 15 segundos → dura 15 segundos.

           Solo pasamos al dashboard cuando recibimos:
           "ended"
           ===================================================== */

        function playTechNovaIntro(
            intro,
            onFinish
        ) {

            if (
                !intro
            ) {

                onFinish?.();

                return;

            }


            const video =
                intro.querySelector(
                    '.technova-intro-video'
                );


            const fallback =
                intro.querySelector(
                    '.technova-intro-fallback'
                );


            const fallbackBrand =
                intro.querySelector(
                    '.technova-intro-brand'
                );


            const fallbackSubtitle =
                intro.querySelector(
                    '.technova-intro-subtitle'
                );


            const fallbackLine =
                intro.querySelector(
                    '.technova-intro-line span'
                );

                /* =====================================================
   BOTÓN DE SONIDO
   ===================================================== */

const soundButton =
    intro.querySelector(
        '.technova-intro-sound'
    );

            /* =================================================
               CONFIGURACIÓN
               ================================================= */

            /*
               ÚNICAMENTE tiempo máximo para que
               el video COMIENCE.

               Una vez iniciado se cancela este timeout.
            */

            const VIDEO_START_TIMEOUT_MS =
                3000;

let completed =
    false;


let fallbackRunning =
    false;


let videoStarted =
    false;


/*
   Evita ejecutar play() varias veces
   mientras todavía está resolviendo.
*/

let playRequested =
    false;


let loadingTimeout =
    null;


            /* =================================================
               FINALIZAR
               ================================================= */

            function completeIntro() {

                if (
                    completed
                ) {

                    return;

                }


                completed =
                    true;


                clearTimeout(
                    loadingTimeout
                );


                /*
                   Detener cualquier animación
                   pendiente sobre la intro.
                */

                gsap.killTweensOf(
                    intro
                );


                intro.remove();


                console.log(
                    '[TechNova Intro] Intro finalizada.'
                );


                onFinish?.();

            }


            /* =================================================
               VIDEO TERMINÓ

               Entramos inmediatamente al dashboard.
               No agregamos segundos extra.
               ================================================= */

            function finishVideoIntro() {

                if (
                    completed ||
                    fallbackRunning
                ) {

                    return;

                }


                console.log(
                    '[TechNova Intro] Video terminado.'
                );


                completeIntro();

            }


            /* =================================================
               FALLBACK ORIGINAL TECHNOVA

               Conservamos aproximadamente la misma duración
               de la presentación anterior: ~0.96 segundos.
               ================================================= */

            function runFallback(
                reason = 'unknown'
            ) {

                if (
                    completed ||
                    fallbackRunning
                ) {

                    return;

                }


                fallbackRunning =
                    true;


                clearTimeout(
                    loadingTimeout
                );

                soundButton
    ?.classList
    .remove(
        'is-visible'
    );


                console.warn(
                    '[TechNova Intro] Usando fallback. Motivo:',
                    reason
                );


                /* =========================================
                   DETENER VIDEO
                   ========================================= */

                if (
                    video
                ) {

                    try {

                        video.pause();

                    }

                    catch(error) {

                        /* Ignorar */

                    }


                    video.style.display =
                        'none';

                }


                /* =========================================
                   MOSTRAR FALLBACK
                   ========================================= */

                fallback
                    ?.classList
                    .add(
                        'is-visible'
                    );


                /* =========================================
                   ESTADO INICIAL
                   ========================================= */

                gsap.set(

                    fallbackBrand,

                    {

                        opacity:
                            0,

                        y:
                            10,

                        scale:
                            .94,

                        filter:
                            'blur(8px)'

                    }

                );


                gsap.set(

                    fallbackSubtitle,

                    {

                        opacity:
                            0,

                        y:
                            6

                    }

                );


                gsap.set(

                    fallbackLine,

                    {

                        scaleX:
                            0,

                        transformOrigin:
                            'left center'

                    }

                );


                /* =========================================
                   MISMO TIEMPO DE LA INTRO ANTERIOR
                   ========================================= */

                const fallbackTimeline =
                    gsap.timeline();


                fallbackTimeline

                    .to(

                        fallbackBrand,

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
                                .46,

                            ease:
                                'power3.out'

                        },

                        0

                    )


                    .to(

                        fallbackSubtitle,

                        {

                            opacity:
                                .72,

                            y:
                                0,

                            duration:
                                .32,

                            ease:
                                'power3.out'

                        },

                        .16

                    )


                    .to(

                        fallbackLine,

                        {

                            scaleX:
                                1,

                            duration:
                                .55,

                            ease:
                                'power2.inOut'

                        },

                        .18

                    )


                    .to(

                        intro,

                        {

                            opacity:
                                0,

                            duration:
                                .32,

                            ease:
                                'power2.inOut'

                        },

                        .63

                    )


                    .call(

                        completeIntro,

                        null,

                        .96

                    );

            }


            /* =================================================
               SI POR ALGÚN MOTIVO NO EXISTE VIDEO
               ================================================= */

            if (
                !video
            ) {

                runFallback(
                    'video-element-missing'
                );

                return;

            }


            /* =================================================
               PROPIEDADES AUTOPLAY
               ================================================= */

            video.muted =
                true;


            video.defaultMuted =
                true;


            video.playsInline =
                true;


            video.autoplay =
                true;


            /* =================================================
               INTENTAR REPRODUCIR
               ================================================= */
/* =====================================================
   INTENTAR REPRODUCIR VIDEO

   1. Primero intentamos CON SONIDO.
   2. Si navegador lo bloquea:
      reproducimos silenciado.
   3. Mostramos botón para activar audio.
   ===================================================== */

function tryToPlayVideo() {

    if (
        !video ||
        completed ||
        fallbackRunning ||
        videoStarted ||
        playRequested
    ) {

        return;

    }


    playRequested =
        true;


    /* =================================================
       PRIMER INTENTO:
       VIDEO CON SONIDO
       ================================================= */

    video.muted =
        false;


    video.defaultMuted =
        false;


    video.volume =
        1;


    let playPromise;


    try {

        playPromise =
            video.play();

    }

    catch(error) {

        console.warn(
            '[TechNova Intro] No se pudo iniciar con sonido:',
            error
        );


        playRequested =
            false;


        startMutedVideo();

        return;

    }


    /* =================================================
       PROMISE DE PLAY
       ================================================= */

    if (
        playPromise &&
        typeof playPromise.then ===
        'function'
    ) {

        playPromise

            .then(

                function() {

                    console.info(
                        '[TechNova Intro] Video iniciado con sonido.'
                    );


                    /*
                       Si fue permitido con audio,
                       nunca necesitamos mostrar botón.
                    */

                    soundButton
                        ?.classList
                        .remove(
                            'is-visible'
                        );

                }

            )


            .catch(

                function(error) {

                    console.info(
                        '[TechNova Intro] El navegador bloqueó el autoplay con sonido. Reintentando silenciado.',
                        error
                    );


                    playRequested =
                        false;


                    startMutedVideo();

                }

            );

    }

}



/* =========================================================
   AUTOPLAY SILENCIADO DE RESPALDO

   Si Chrome / Safari no permiten sonido automático,
   seguimos mostrando el video normalmente.
   ========================================================= */

function startMutedVideo() {

    if (
        !video ||
        completed ||
        fallbackRunning ||
        videoStarted
    ) {

        return;

    }


    /* =====================================================
       SILENCIAR SOLO COMO RESPALDO
       ===================================================== */

    video.muted =
        true;


    video.defaultMuted =
        true;


    video.volume =
        1;


    playRequested =
        true;


    let mutedPlayPromise;


    try {

        mutedPlayPromise =
            video.play();

    }

    catch(error) {

        console.error(
            '[TechNova Intro] Tampoco se pudo iniciar el video silenciado:',
            error
        );


        playRequested =
            false;


        runFallback(
            'muted-play-exception'
        );


        return;

    }


    if (
        mutedPlayPromise &&
        typeof mutedPlayPromise.then ===
        'function'
    ) {

        mutedPlayPromise

            .then(

                function() {

                    console.info(
                        '[TechNova Intro] Video iniciado silenciado. Esperando interacción para activar sonido.'
                    );


                    /* =====================================
                       MOSTRAR CONTROL DE SONIDO
                       ===================================== */

                    soundButton
                        ?.classList
                        .add(
                            'is-visible'
                        );

                }

            )


            .catch(

                function(error) {

                    console.error(
                        '[TechNova Intro] No fue posible reproducir el video:',
                        error
                    );


                    playRequested =
                        false;


                    runFallback(
                        'muted-autoplay-error'
                    );

                }

            );

    }

}


            /* =================================================
               METADATA
               ================================================= */

            video.addEventListener(

                'loadedmetadata',

                function() {

                    console.log(
                        '[TechNova Intro] Duración detectada:',
                        Number.isFinite(
                            video.duration
                        )
                            ? video.duration + ' segundos'
                            : 'desconocida'
                    );


                    tryToPlayVideo();

                },

                {
                    once:
                        true
                }

            );


            /* =================================================
               CANPLAY
               ================================================= */

            video.addEventListener(

                'canplay',

                function() {

                    tryToPlayVideo();

                },

                {
                    once:
                        true
                }

            );


            /* =================================================
               VIDEO COMENZÓ REALMENTE
               ================================================= */
video.addEventListener(

    'playing',

    function() {

        videoStarted =
            true;


        playRequested =
            false;


        clearTimeout(
            loadingTimeout
        );


        intro.classList.add(
            'video-playing'
        );


        /* =================================================
           SI ESTÁ SILENCIADO

           Significa que el navegador no permitió
           autoplay con audio.
           ================================================= */

        if (
            video.muted
        ) {

            soundButton
                ?.classList
                .add(
                    'is-visible'
                );

        }


        else {

            soundButton
                ?.classList
                .remove(
                    'is-visible'
                );

        }


        console.info(

            '[TechNova Intro] Reproducción iniciada.',

            video.muted

                ? 'Sin sonido.'

                : 'Con sonido.'

        );

    },

    {
        once:
            true
    }

);

/* =========================================================
   ACTIVAR SONIDO POR INTERACCIÓN DEL USUARIO
   ========================================================= */

soundButton
    ?.addEventListener(

        'click',

        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (
                !video ||
                completed ||
                fallbackRunning
            ) {

                return;

            }


            /* =============================================
               ACTIVAR AUDIO
               ============================================= */

            video.muted =
                false;


            video.defaultMuted =
                false;


            video.volume =
                1;


            /*
               Como estamos dentro de un CLICK,
               ahora existe interacción real
               del usuario.
            */

            const soundPlayPromise =
                video.play();


            if (
                soundPlayPromise &&
                typeof soundPlayPromise.then ===
                'function'
            ) {

                soundPlayPromise

                    .then(

                        function() {

                            soundButton
                                .classList
                                .remove(
                                    'is-visible'
                                );


                            intro
                                .classList
                                .add(
                                    'sound-enabled'
                                );


                            console.info(
                                '[TechNova Intro] Sonido activado.'
                            );

                        }

                    )


                    .catch(

                        function(error) {

                            console.warn(
                                '[TechNova Intro] El navegador todavía no permitió el audio:',
                                error
                            );


                            /*
                               Volvemos a dejarlo silenciado
                               para no detener el video.
                            */

                            video.muted =
                                true;


                            soundButton
                                .classList
                                .add(
                                    'is-visible'
                                );

                        }

                    );

            }

        }

    );

            /* =================================================
               VIDEO TERMINÓ
               ================================================= */

            video.addEventListener(

                'ended',

                finishVideoIntro,

                {
                    once:
                        true
                }

            );


            /* =================================================
               ERROR REAL DEL VIDEO
               ================================================= */

            video.addEventListener(

                'error',

                function() {

                    const mediaError =
                        video.error;


                    console.error(

                        '[TechNova Intro] Error de video:',

                        mediaError

                            ? {

                                code:
                                    mediaError.code,

                                message:
                                    mediaError.message

                            }

                            : 'desconocido'

                    );


                    runFallback(
                        'media-error'
                    );

                },

                {
                    once:
                        true
                }

            );


            /* =================================================
               ABORT

               Solo usamos fallback si el video todavía
               no había comenzado.
               ================================================= */

            video.addEventListener(

                'abort',

                function() {

                    if (
                        !videoStarted &&
                        !completed
                    ) {

                        runFallback(
                            'load-aborted'
                        );

                    }

                },

                {
                    once:
                        true
                }

            );


            /* =================================================
               STALLED

               NO cancelamos el video.

               Un stalled puede ser simplemente una
               pausa temporal de buffering.
               ================================================= */

            video.addEventListener(

                'stalled',

                function() {

                    console.warn(
                        '[TechNova Intro] Carga temporalmente detenida.'
                    );

                }

            );


            /* =================================================
               WAITING

               Tampoco cancelamos si ya comenzó.
               ================================================= */

            video.addEventListener(

                'waiting',

                function() {

                    console.warn(
                        '[TechNova Intro] Esperando datos del video...'
                    );

                }

            );


            /* =================================================
               TIMEOUT SOLO PARA ARRANQUE
               ================================================= */

            loadingTimeout =
                setTimeout(

                    function() {

                        if (
                            !videoStarted &&
                            !completed &&
                            !fallbackRunning
                        ) {

                            runFallback(
                                'start-timeout'
                            );

                        }

                    },

                    VIDEO_START_TIMEOUT_MS

                );


            /* =================================================
               CARGAR
               ================================================= */

            if (
                video.readyState >=
                HTMLMediaElement.HAVE_METADATA
            ) {

                tryToPlayVideo();

            }

            else {

                video.load();

            }

        }


        /* =====================================================
           REFLEJO ÚNICO DEL NAVBAR
           ===================================================== */

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
               termine el video o fallback.
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
