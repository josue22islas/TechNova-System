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
               DETECTAR MOBILE
               ============================================= */

            const isMobile =
                window.matchMedia(
                    '(max-width: 640px)'
                )
                .matches;


            /* =============================================
               VIDEO CORRESPONDIENTE
               ============================================= */

            const relativeVideoSource =

                isMobile

                    ? './videos/technova-intro-mobile.mp4'

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
/* =========================================
   LIQUID GLASS REACTIVO AL CURSOR
   ========================================= */

const glassElements = document.querySelectorAll(

    '.card,' +
    '.card-2,' +
    '.grafica,' +
    '.card-3,' +
    '.card-4,' +
    '.switch-container-3,' +
    '.row-3'

);


glassElements.forEach(function(element) {

    element.classList.add(
        'glass-reactive'
    );


    element.addEventListener(

        'mousemove',

        function(event) {

            const rect =
                element.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            element.style.setProperty(

                '--mouse-x',

                x + 'px'

            );


            element.style.setProperty(

                '--mouse-y',

                y + 'px'

            );

        }

    );


});

/* =========================================
   CONTADORES ANIMADOS CON GSAP
   ========================================= */

const counterElements = document.querySelectorAll(
    '.frame-2 .paragraph-container .text-wrapper-10:last-child'
);


/*
    Analiza el texto actual.

    Ejemplos:

    "$899,000"
    ↓
    value  = 899000
    prefix = "$"
    suffix = ""

    "1,345h"
    ↓
    value  = 1345
    prefix = ""
    suffix = "h"
*/

function parseCounterValue(text) {

    const original = text.trim();


    const prefix =
        original.startsWith('$')
            ? '$'
            : '';


    const suffix =
        original.toLowerCase().endsWith('h')
            ? 'h'
            : '';


    const cleanNumber = original
        .replace(/\$/g, '')
        .replace(/h/gi, '')
        .replace(/,/g, '')
        .trim();


    const value = Number(cleanNumber);


    return {

        value:
            Number.isFinite(value)
                ? value
                : 0,

        prefix: prefix,

        suffix: suffix

    };

}

/*
=========================================
FORMATO DEL NÚMERO
=========================================
*/

function formatCounterValue(
    value,
    prefix = '',
    suffix = ''
) {

    const formattedValue = Math.round(value)
        .toLocaleString('es-MX');


    return (
        prefix +
        formattedValue +
        suffix
    );

}

/*
=========================================
ANIMAR CONTADOR
=========================================
*/

function animateCounter(
    element,
    newValue,
    options = {}
) {

    if (!element) return;


    /*
        Valor anterior.

        Si nunca se ha animado,
        empieza desde 0.
    */

    const previousValue =
        Number(
            element.dataset.currentValue
            ?? 0
        );


    const prefix =
        options.prefix
        ?? element.dataset.prefix
        ?? '';


    const suffix =
        options.suffix
        ?? element.dataset.suffix
        ?? '';


    /*
        Objeto que GSAP animará.
    */

    const counter = {

        value: previousValue

    };


   gsap.to(counter, {

    value:Number(newValue),

    duration:2.4,

    ease:"expo.out",


        onUpdate: function () {

            element.textContent =
                formatCounterValue(

                    counter.value,

                    prefix,

                    suffix

                );

        },


        onComplete: function () {

            /*
                Guardamos el nuevo valor.

                Esto será importante
                cuando llegue el backend.
            */

            element.dataset.currentValue =
                String(newValue);


            element.textContent =
                formatCounterValue(

                    newValue,

                    prefix,

                    suffix

                );

        }

    });

}

/*
=========================================
INICIALIZAR CONTADORES
SINCRONIZADOS CON LA ENTRADA
=========================================
*/

let technovaCountersStarted =
    false;


counterElements.forEach(

    function(element) {

        const data =
            parseCounterValue(
                element.textContent
            );


        element.dataset.prefix =
            data.prefix;


        element.dataset.suffix =
            data.suffix;


        element.dataset.targetValue =
            String(
                data.value
            );


        element.dataset.currentValue =
            '0';


        element.classList.add(
            'animated-counter'
        );


        element.textContent =
            formatCounterValue(

                0,

                data.prefix,

                data.suffix

            );

    }

);


/* =========================================
   ARRANCAR CUANDO LLEGUEN LAS KPI
   ========================================= */

function startTechNovaCounters() {

    if (
        technovaCountersStarted
    ) {

        return;

    }


    technovaCountersStarted =
        true;


    counterElements.forEach(

        function(
            element,
            index
        ) {

            const targetValue =
                Number(
                    element.dataset.targetValue
                    ||
                    0
                );


            gsap.delayedCall(

                index *
                .075,

                function() {

                    animateCounter(

                        element,

                        targetValue,

                        {

                            prefix:
                                element.dataset.prefix,

                            suffix:
                                element.dataset.suffix

                        }

                    );

                }

            );

        }

    );

}


document.addEventListener(

    'technova:kpi-reveal',

    startTechNovaCounters,

    {
        once:
            true
    }

);


/*
   FALLBACK:

   Si por alguna razón la animación
   principal no dispara el evento,
   los contadores no se quedan en cero.
*/

setTimeout(

    function() {

        if (
            !technovaCountersStarted
        ) {

            startTechNovaCounters();

        }

    },

    4200

);


/*=========================================
    NOTIFICACIONES
=========================================*/



/* =========================================================
   SELECTOR DE PERIODO FINANCIERO
   ========================================================= */

const financialPeriodWrapper =
    document.querySelector(
        '.financial-period-wrapper'
    );


const financialPeriodButton =
    document.getElementById(
        'financialPeriodButton'
    );


const financialPeriodText =
    document.getElementById(
        'financialPeriodText'
    );


const financialPeriodOptions =
    document.querySelectorAll(
        '.financial-period-option'
    );


/* =========================================================
   ABRIR MENÚ
   ========================================================= */

function openFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    financialPeriodWrapper
        .classList.add(
            'is-open'
        );


    financialPeriodButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );

}


/* =========================================================
   CERRAR MENÚ
   ========================================================= */

function closeFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    financialPeriodWrapper
        .classList.remove(
            'is-open'
        );


    financialPeriodButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}


/* =========================================================
   TOGGLE
   ========================================================= */

function toggleFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    const isOpen =
        financialPeriodWrapper
            .classList
            .contains(
                'is-open'
            );


    if (isOpen) {

        closeFinancialPeriod();

    } else {

        openFinancialPeriod();

    }

}


/* =========================================================
   CLICK EN BOTÓN "ESTE AÑO"
   ========================================================= */

financialPeriodButton
    ?.addEventListener(
        'click',
        function(event) {

            /*
               Evita que el click llegue
               inmediatamente al document
               y cierre el menú.
            */

            event.stopPropagation();


            toggleFinancialPeriod();

        }
    );


/* =========================================================
   SELECCIONAR OPCIÓN
   ========================================================= */

financialPeriodOptions.forEach(
    function(option) {

        option.addEventListener(
            'click',
            function(event) {

                event.stopPropagation();


                const period =
                    option.dataset.period;


                const label =
                    option.textContent.trim();


                /*
                   Quitar activo anterior.
                */

                financialPeriodOptions.forEach(
                    function(item) {

                        item.classList.remove(
                            'active'
                        );

                    }
                );


                /*
                   Activar nueva opción.
                */

                option.classList.add(
                    'active'
                );


                /*
                   Cambiar texto del botón.
                */

                if (financialPeriodText) {

                    financialPeriodText.textContent =
                        label;

                }


                /*
                   Cerrar menú.
                */

                closeFinancialPeriod();


                /*
                   Preparar fechas.
                */

                dispatchFinancialPeriod(
                    period,
                    label
                );

            }
        );

    }
);


/* =========================================================
   CERRAR SI SE HACE CLICK AFUERA
   ========================================================= */

document.addEventListener(
    'click',
    function(event) {

        if (
            financialPeriodWrapper &&
            !financialPeriodWrapper.contains(
                event.target
            )
        ) {

            closeFinancialPeriod();

        }

    }
);


/* =========================================================
   PREPARAR PERIODO PARA BACKEND
   ========================================================= */

function dispatchFinancialPeriod(
    period,
    label
) {

    const now =
        new Date();


    let startDate = null;

    let endDate = null;



    /* =====================================================
       ESTE AÑO
       ===================================================== */

    if (period === 'year') {

        const year =
            now.getFullYear();


        startDate =
            `${year}-01-01`;


        endDate =
            `${year}-12-31`;

    }



    /* =====================================================
       ESTE MES
       ===================================================== */

    else if (period === 'month') {

        const year =
            now.getFullYear();


        const month =
            now.getMonth();


        const lastDay =
            new Date(
                year,
                month + 1,
                0
            )
            .getDate();


        startDate =
            `${year}-${String(month + 1)
                .padStart(2, '0')}-01`;


        endDate =
            `${year}-${String(month + 1)
                .padStart(2, '0')}-${String(lastDay)
                .padStart(2, '0')}`;

    }



    /* =====================================================
       ÚLTIMOS 3 MESES
       ===================================================== */

    else if (period === '3months') {

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 2,
                1
            );


        const year =
            start.getFullYear();


        const month =
            start.getMonth() + 1;


        startDate =
            `${year}-${String(month)
                .padStart(2, '0')}-01`;


        endDate =
            formatDateForBackend(now);

    }



    /* =====================================================
       ÚLTIMOS 6 MESES
       ===================================================== */

    else if (period === '6months') {

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 5,
                1
            );


        const year =
            start.getFullYear();


        const month =
            start.getMonth() + 1;


        startDate =
            `${year}-${String(month)
                .padStart(2, '0')}-01`;


        endDate =
            formatDateForBackend(now);

    }



    /* =====================================================
       AÑO ESPECÍFICO
       2026 / 2025 / 2024...
       ===================================================== */

    else if (
        /^\d{4}$/.test(period)
    ) {

        startDate =
            `${period}-01-01`;


        endDate =
            `${period}-12-31`;

    }



    /* =====================================================
       DISPARAR EVENTO
       ===================================================== */

    document.dispatchEvent(

        new CustomEvent(
            'financialPeriodChange',

            {

                detail: {

                    period:
                        period,

                    label:
                        label,

                    startDate:
                        startDate,

                    endDate:
                        endDate

                }

            }

        )

    );

}


/* =========================================================
   FORMATO YYYY-MM-DD
   ========================================================= */

function formatDateForBackend(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            '0'
        );


    return (
        `${year}-${month}-${day}`
    );

}

/* =========================================================
   SELECTOR DE PERIODO MENSUAL
   ========================================================= */

const reportWrapper =
    document.querySelector(
        '.report-period-wrapper'
    );


const reportButton =
    document.getElementById(
        'reportPeriodButton'
    );


const reportText =
    document.getElementById(
        'reportPeriodText'
    );


const reportCurrentMonth =
    document.getElementById(
        'reportCurrentMonth'
    );


const monthList =
    document.getElementById(
        'reportMonthList'
    );


const previousMonthButton =
    document.getElementById(
        'previousMonth'
    );


const nextMonthButton =
    document.getElementById(
        'nextMonth'
    );



/* =========================================================
   MESES
   ========================================================= */

const reportMonthNames = [

    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'

];



/* =========================================================
   FECHA ACTUAL DEL SISTEMA
   ========================================================= */

const currentReportDate =
    new Date();


/*
   Creamos la fecha usando:

   - año actual
   - mes actual
   - día 1

   Ejemplo:
   agosto 2026 → 2026 / 7 / 1

   Recuerda que JavaScript cuenta:
   enero = 0
   agosto = 7
*/

let selectedReportDate =
    new Date(

        currentReportDate.getFullYear(),

        currentReportDate.getMonth(),

        1

    );



/* =========================================================
   ÚLTIMO DÍA DEL MES
   ========================================================= */

function getReportLastDayOfMonth(
    year,
    month
) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}



/* =========================================================
   FORMATEAR PERIODO
   ========================================================= */

function formatReportPeriod(
    date
) {

    const year =
        date.getFullYear();


    const month =
        date.getMonth();


    const monthName =
        reportMonthNames[month];


    const lastDay =
        getReportLastDayOfMonth(
            year,
            month
        );


    return (
        '01 ' +
        monthName +
        ' ' +
        year +
        ' - ' +
        lastDay +
        ' ' +
        monthName +
        ' ' +
        year
    );

}



/* =========================================================
   ABRIR MENÚ
   ========================================================= */

function openReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    reportWrapper.classList.add(
        'is-open'
    );


    reportButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );

}



/* =========================================================
   CERRAR MENÚ
   ========================================================= */

function closeReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    reportWrapper.classList.remove(
        'is-open'
    );


    reportButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}



/* =========================================================
   ABRIR / CERRAR
   ========================================================= */

function toggleReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    const isOpen =
        reportWrapper.classList.contains(
            'is-open'
        );


    if (isOpen) {

        closeReportPeriod();

    } else {

        openReportPeriod();

    }

}



/* =========================================================
   LISTA DE MESES
   ========================================================= */

function renderReportMonthList() {

    if (!monthList) {

        return;

    }


    monthList.innerHTML = '';


    const selectedMonth =
        selectedReportDate.getMonth();


    const year =
        selectedReportDate.getFullYear();


    reportMonthNames.forEach(
        function(monthName, index) {

            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                'report-month-option';


            button.textContent =
                monthName.substring(
                    0,
                    3
                );


            /*
               Marcar mes seleccionado.
            */

            if (
                index === selectedMonth
            ) {

                button.classList.add(
                    'active'
                );

            }


            /*
               Seleccionar mes.
            */

            button.addEventListener(
                'click',
                function(event) {

                    event.stopPropagation();


                    selectedReportDate =
                        new Date(
                            year,
                            index,
                            1
                        );


                    updateReportPeriodUI();


                    closeReportPeriod();

                }
            );


            monthList.appendChild(
                button
            );

        }
    );

}



/* =========================================================
   ACTUALIZAR INTERFAZ
   ========================================================= */

function updateReportPeriodUI() {

    if (!reportText) {

        return;

    }


    const month =
        selectedReportDate.getMonth();


    const year =
        selectedReportDate.getFullYear();


    /*
       Texto principal:
       01 julio 2026 - 31 julio 2026
    */

    reportText.textContent =
        formatReportPeriod(
            selectedReportDate
        );


    /*
       Encabezado del menú:
       Julio 2026
    */

    if (reportCurrentMonth) {

        const monthName =
            reportMonthNames[month];


        reportCurrentMonth.textContent =
            monthName
                .charAt(0)
                .toUpperCase()

            +

            monthName.slice(1)

            +

            ' '

            +

            year;

    }


    /*
       Actualizar meses.
    */

    renderReportMonthList();


    /*
       Preparar datos para backend.
    */

    dispatchReportPeriodChange();

}



/* =========================================================
   MES ANTERIOR
   ========================================================= */

previousMonthButton
    ?.addEventListener(
        'click',
        function(event) {

            event.stopPropagation();


            selectedReportDate =
                new Date(

                    selectedReportDate
                        .getFullYear(),

                    selectedReportDate
                        .getMonth() - 1,

                    1

                );


            updateReportPeriodUI();

        }
    );



/* =========================================================
   MES SIGUIENTE
   ========================================================= */

nextMonthButton
    ?.addEventListener(
        'click',
        function(event) {

            event.stopPropagation();


            selectedReportDate =
                new Date(

                    selectedReportDate
                        .getFullYear(),

                    selectedReportDate
                        .getMonth() + 1,

                    1

                );


            updateReportPeriodUI();

        }
    );



/* =========================================================
   CLICK EN BOTÓN DE FECHA
   ========================================================= */

reportButton
    ?.addEventListener(
        'click',
        function(event) {

            /*
               Evita que el listener global
               cierre el menú inmediatamente.
            */

            event.stopPropagation();


            /*
               Si está abierto el selector
               financiero, lo cerramos.
            */

            if (
                typeof closeFinancialPeriod
                === 'function'
            ) {

                closeFinancialPeriod();

            }


            toggleReportPeriod();

        }
    );



/* =========================================================
   CERRAR AL HACER CLICK AFUERA
   ========================================================= */

document.addEventListener(
    'click',
    function(event) {

        if (
            reportWrapper &&
            !reportWrapper.contains(
                event.target
            )
        ) {

            closeReportPeriod();

        }

    }
);



/* =========================================================
   PREPARAR PERIODO PARA BACKEND
   ========================================================= */

function dispatchReportPeriodChange() {

    const year =
        selectedReportDate
            .getFullYear();


    const month =
        selectedReportDate
            .getMonth();


    const lastDay =
        getReportLastDayOfMonth(
            year,
            month
        );


    const startDate =
        year +

        '-' +

        String(
            month + 1
        ).padStart(
            2,
            '0'
        )

        +

        '-01';


    const endDate =
        year +

        '-' +

        String(
            month + 1
        ).padStart(
            2,
            '0'
        )

        +

        '-' +

        String(
            lastDay
        ).padStart(
            2,
            '0'
        );


    document.dispatchEvent(

        new CustomEvent(
            'reportPeriodChange',

            {

                detail: {

                    year:
                        year,

                    month:
                        month + 1,

                    startDate:
                        startDate,

                    endDate:
                        endDate

                }

            }

        )

    );

}



/* =========================================================
   INICIALIZAR SELECTOR
   ========================================================= */

if (
    reportWrapper &&
    reportButton &&
    reportText
) {

    updateReportPeriodUI();

}



/* =========================================================
   GASTOS RECURRENTES
   VER TODO / VER MENOS
   ========================================================= */

const recurringExpensesToggle =
    document.getElementById(
        'recurringExpensesToggle'
    );


const recurringExpensesToggleText =
    document.getElementById(
        'recurringExpensesToggleText'
    );


const recurringExpensesList =
    document.getElementById(
        'recurringExpensesList'
    );


/* =========================================================
   ESTADO
   ========================================================= */

let recurringExpensesExpanded =
    false;


/* =========================================================
   ACTUALIZAR INTERFAZ
   ========================================================= */

function updateRecurringExpensesUI() {

    if (
        !recurringExpensesToggle ||
        !recurringExpensesList
    ) {

        return;

    }


    /*
       MODO EXPANDIDO
    */

    if (
        recurringExpensesExpanded
    ) {

        recurringExpensesList
            .classList
            .add(
                'is-expanded'
            );


        recurringExpensesToggle
            .classList
            .add(
                'is-expanded'
            );


        recurringExpensesToggle
            .setAttribute(
                'aria-expanded',
                'true'
            );


        if (
            recurringExpensesToggleText
        ) {

            recurringExpensesToggleText
                .textContent =
                'Ver menos';

        }

    }


    /*
       MODO COMPACTO
    */

    else {

        recurringExpensesList
            .classList
            .remove(
                'is-expanded'
            );


        recurringExpensesToggle
            .classList
            .remove(
                'is-expanded'
            );


        recurringExpensesToggle
            .setAttribute(
                'aria-expanded',
                'false'
            );


        if (
            recurringExpensesToggleText
        ) {

            recurringExpensesToggleText
                .textContent =
                'Ver todo';

        }


        /*
           Regresar scroll arriba
           cuando cerramos.
        */

        recurringExpensesList
            .scrollTo({

                top:
                    0,

                behavior:
                    'smooth'

            });

    }

}


/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

function toggleRecurringExpenses() {

    recurringExpensesExpanded =
        !recurringExpensesExpanded;


    updateRecurringExpensesUI();

}


/* =========================================================
   CLICK
   ========================================================= */

recurringExpensesToggle
    ?.addEventListener(

        'click',

        function(event) {

            event.preventDefault();


            toggleRecurringExpenses();

        }

    );


/* =========================================================
   TECLADO
   ========================================================= */

recurringExpensesToggle
    ?.addEventListener(

        'keydown',

        function(event) {

            if (
                event.key ===
                'Enter'

                ||

                event.key ===
                ' '
            ) {

                event.preventDefault();


                toggleRecurringExpenses();

            }

        }

    );


/* =========================================================
   INICIALIZAR
   ========================================================= */

updateRecurringExpensesUI();




/* =========================================================
   PANEL DE NOTIFICACIONES
   AGRUPACIÓN + LEÍDAS + ELIMINACIÓN
   LISTO PARA BACKEND
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const notificationWrapper =
    document.querySelector(
        '.notification-wrapper'
    );


const notificationButton =
    document.getElementById(
        'notificationButton'
    );


const notificationPanel =
    document.getElementById(
        'notificationPanel'
    );


const notificationBadge =
    document.getElementById(
        'notificationBadge'
    );


const notificationCount =
    document.getElementById(
        'notificationCount'
    );


const notificationList =
    document.getElementById(
        'notificationList'
    );


const notificationMarkAll =
    document.getElementById(
        'notificationMarkAll'
    );


const notificationDeleteAll =
    document.getElementById(
        'notificationDeleteAll'
    );


/* =========================================================
   CONTADOR
   ========================================================= */

function updateNotificationCount() {

    const unreadNotifications =
        notificationList
            ?.querySelectorAll(
                '.notification-item.unread'
            )
        ?? [];


    const allNotifications =
        notificationList
            ?.querySelectorAll(
                '.notification-item'
            )
        ?? [];


    const unread =
        unreadNotifications.length;


    const total =
        allNotifications.length;


    /* =============================================
       BADGE ROJO
       ============================================= */

    if (
        notificationCount
    ) {

        notificationCount.textContent =
            unread;

    }


    /* =============================================
       TOTAL DEL PANEL
       ============================================= */

    const notificationTotal =
        document.getElementById(
            'notificationTotal'
        );


    if (
        notificationTotal
    ) {

        notificationTotal.textContent =
            `(${total})`;

    }


    /* =============================================
       BADGE
       ============================================= */

    if (
        notificationBadge
    ) {

        if (
            unread > 0
        ) {

            notificationBadge.style.display =
                'inline-flex';


            notificationBadge
                .classList
                .add(
                    'has-notification'
                );

        }


        else {

            notificationBadge.style.display =
                'none';


            notificationBadge
                .classList
                .remove(
                    'has-notification'
                );

        }

    }


    /* =============================================
       BOTONES HEADER
       ============================================= */

    if (
        notificationMarkAll
    ) {

        notificationMarkAll.disabled =
            unread === 0;


        notificationMarkAll.style.opacity =
            unread === 0
                ? '.4'
                : '1';

    }


    if (
        notificationDeleteAll
    ) {

        notificationDeleteAll.disabled =
            total === 0;


        notificationDeleteAll.style.opacity =
            total === 0
                ? '.4'
                : '1';

    }

}


/* =========================================================
   UTILIDADES DE FECHA
   ========================================================= */

function startOfNotificationDay(
    date
) {

    return new Date(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    );

}


/* =========================================================
   OBTENER GRUPO SEGÚN FECHA
   ========================================================= */

function getNotificationDateGroup(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    /*
       Si backend devuelve fecha inválida,
       la mandamos a anteriores.
    */

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 'older';

    }


    const now =
        new Date();


    const today =
        startOfNotificationDay(
            now
        );


    const notificationDay =
        startOfNotificationDay(
            date
        );


    const difference =
        Math.floor(

            (
                today -
                notificationDay
            )

            /

            86400000

        );


    /* HOY */

    if (
        difference === 0
    ) {

        return 'today';

    }


    /* AYER */

    if (
        difference === 1
    ) {

        return 'yesterday';

    }


    /* ESTA SEMANA */

    if (
        difference >= 2
        &&
        difference <= 7
    ) {

        return 'week';

    }


    /* ANTERIORES */

    return 'older';

}


/* =========================================================
   NOMBRE DE GRUPO
   ========================================================= */

function getNotificationGroupLabel(
    group
) {

    const labels = {

        today:
            'Hoy',

        yesterday:
            'Ayer',

        week:
            'Esta semana',

        older:
            'Anteriores'

    };


    return (
        labels[group]
        ||
        'Anteriores'
    );

}


/* =========================================================
   CREAR HEADER DE GRUPO
   ========================================================= */

function createNotificationGroupHeader(
    label
) {

    const header =
        document.createElement(
            'div'
        );


    header.className =
        'notification-group-header';


    const title =
        document.createElement(
            'div'
        );


    title.className =
        'notification-group-title';


    title.textContent =
        label;


    const line =
        document.createElement(
            'div'
        );


    line.className =
        'notification-group-line';


    header.appendChild(
        title
    );


    header.appendChild(
        line
    );


    return header;

}


/* =========================================================
   AGRUPAR NOTIFICACIONES
   ========================================================= */

function renderNotificationGroups() {

    if (
        !notificationList
    ) {

        return;

    }


    /*
       Conseguimos todas las notificaciones,
       incluso si ya estaban dentro de grupos.
    */

    const items =
        Array.from(

            notificationList
                .querySelectorAll(
                    '.notification-item'
                )

        );


    /*
       Si ya no existen registros.
    */

    if (
        items.length === 0
    ) {

        renderEmptyNotifications();

        updateNotificationCount();

        return;

    }


    /*
       Ordenamos del más nuevo al más antiguo.
    */

    items.sort(

        function(a, b) {

            const dateA =
                new Date(
                    a.dataset.createdAt
                );


            const dateB =
                new Date(
                    b.dataset.createdAt
                );


            return (
                dateB -
                dateA
            );

        }

    );


    /*
       Limpiamos el contenedor.
    */

    notificationList.innerHTML =
        '';


    const groups = {

        today: [],

        yesterday: [],

        week: [],

        older: []

    };


    /* =============================================
       CLASIFICAR
       ============================================= */

    items.forEach(

        function(item) {

            const group =
                getNotificationDateGroup(
                    item.dataset.createdAt
                );


            groups[group]
                .push(
                    item
                );

        }

    );


    /* =============================================
       ORDEN VISUAL
       ============================================= */

    const groupOrder = [

        'today',

        'yesterday',

        'week',

        'older'

    ];


    groupOrder.forEach(

        function(groupName) {

            const groupItems =
                groups[groupName];


            if (
                !groupItems.length
            ) {

                return;

            }


            const groupContainer =
                document.createElement(
                    'section'
                );


            groupContainer.className =
                'notification-group';


            groupContainer.dataset.group =
                groupName;


            groupContainer.appendChild(

                createNotificationGroupHeader(

                    getNotificationGroupLabel(
                        groupName
                    )

                )

            );


            groupItems.forEach(

                function(item) {

                    groupContainer
                        .appendChild(
                            item
                        );

                }

            );


            notificationList
                .appendChild(
                    groupContainer
                );

        }

    );


    updateNotificationCount();

}


/* =========================================================
   ESTADO VACÍO
   ========================================================= */

function renderEmptyNotifications() {

    if (
        !notificationList
    ) {

        return;

    }


    notificationList.innerHTML = `

        <div class="notification-empty">

            <div class="notification-empty-icon">
                ✓
            </div>

            <div class="notification-empty-title">
                Sin notificaciones
            </div>

            <div class="notification-empty-text">
                No tienes notificaciones pendientes.
            </div>

        </div>

    `;

}


/* =========================================================
   ABRIR PANEL
   ========================================================= */

function openNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    notificationWrapper
        .classList
        .add(
            'is-open'
        );


    notificationButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );


    /*
       Cerrar dropdown financiero.
    */

    if (
        typeof closeFinancialPeriod
        === 'function'
    ) {

        closeFinancialPeriod();

    }


    /*
       Cerrar selector mensual.
    */

    if (
        typeof closeReportPeriod
        === 'function'
    ) {

        closeReportPeriod();

    }

}


/* =========================================================
   CERRAR PANEL
   ========================================================= */

function closeNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    notificationWrapper
        .classList
        .remove(
            'is-open'
        );


    notificationButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}


/* =========================================================
   TOGGLE
   ========================================================= */

function toggleNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    const isOpen =
        notificationWrapper
            .classList
            .contains(
                'is-open'
            );


    if (
        isOpen
    ) {

        closeNotificationPanel();

    }


    else {

        openNotificationPanel();

    }

}


/* =========================================================
   CLICK CAMPANA
   ========================================================= */

notificationButton
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            toggleNotificationPanel();

        }

    );


/* =========================================================
   TECLADO CAMPANA
   ========================================================= */

notificationButton
    ?.addEventListener(

        'keydown',

        function(event) {

            if (
                event.key === 'Enter'
                ||
                event.key === ' '
            ) {

                event.preventDefault();

                event.stopPropagation();


                toggleNotificationPanel();

            }

        }

    );


/* =========================================================
   CLICK DENTRO DE LISTA
   EVENT DELEGATION

   Importante para backend:
   aunque PHP agregue nuevas notificaciones,
   seguirá funcionando.
   ========================================================= */

notificationList
    ?.addEventListener(

        'click',

        function(event) {


            /* =========================================
               ELIMINAR
               ========================================= */

            const deleteButton =
                event.target.closest(
                    '.notification-delete'
                );


            if (
                deleteButton
            ) {

                event.stopPropagation();


                const item =
                    deleteButton.closest(
                        '.notification-item'
                    );


                if (
                    item
                ) {

                    deleteSingleNotification(
                        item
                    );

                }


                return;

            }


            /* =========================================
               MARCAR COMO LEÍDA
               ========================================= */

            const item =
                event.target.closest(
                    '.notification-item'
                );


            if (
                !item
            ) {

                return;

            }


            if (
                !item.classList.contains(
                    'unread'
                )
            ) {

                return;

            }


            markNotificationAsRead(
                item
            );

        }

    );


/* =========================================================
   MARCAR NOTIFICACIÓN COMO LEÍDA
   ========================================================= */

function markNotificationAsRead(
    item
) {

    const notificationId =
        item.dataset.notificationId;


    item.classList.remove(
        'unread'
    );


    item
        .querySelector(
            '.notification-status'
        )
        ?.remove();


    updateNotificationCount();


    console.log(

        'Notificación leída:',

        notificationId

    );


    /*
    =====================================================
    FUTURO BACKEND
    =====================================================

    fetch(
        'api/notifications/read.php',
        {

            method: 'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify({

                    id:
                        notificationId

                })

        }
    );

    */

}


/* =========================================================
   MARCAR TODAS COMO LEÍDAS
   ========================================================= */

notificationMarkAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const unreadItems =
                notificationList
                    ?.querySelectorAll(
                        '.notification-item.unread'
                    )
                ?? [];


            unreadItems.forEach(

                function(item) {

                    item.classList.remove(
                        'unread'
                    );


                    item
                        .querySelector(
                            '.notification-status'
                        )
                        ?.remove();

                }

            );


            updateNotificationCount();


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/notifications/read-all.php',
                {
                    method:
                        'POST'
                }
            );

            */

        }

    );


/* =========================================================
   ELIMINAR UNA NOTIFICACIÓN
   ========================================================= */

function deleteSingleNotification(
    item
) {

    if (
        !item
    ) {

        return;

    }


    const notificationId =
        item.dataset.notificationId;


    /*
       Animación.
    */

    item.classList.add(
        'is-removing'
    );


    /*
       Esperamos que termine la transición.
    */

    setTimeout(

        function() {

            item.remove();


            /*
               Reconstruir grupos,
               porque podría desaparecer
               por ejemplo el grupo "Ayer".
            */

            renderNotificationGroups();


            updateNotificationCount();

        },

        300

    );


    console.log(

        'Eliminar notificación:',

        notificationId

    );


    /*
    =====================================================
    FUTURO BACKEND
    =====================================================

    fetch(
        'api/notifications/delete.php',
        {

            method:
                'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify({

                    id:
                        notificationId

                })

        }
    )

    .then(
        response =>
            response.json()
    )

    .then(
        result => {

            if (
                !result.success
            ) {

                console.error(
                    'No fue posible eliminar la notificación.'
                );

            }

        }
    );

    */

}


/* =========================================================
   ELIMINAR TODAS
   ========================================================= */

notificationDeleteAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const items =
                notificationList
                    ?.querySelectorAll(
                        '.notification-item'
                    )
                ?? [];


            if (
                items.length === 0
            ) {

                return;

            }


            /*
               Pequeña animación escalonada.
            */

            items.forEach(

                function(item, index) {

                    setTimeout(

                        function() {

                            item.classList.add(
                                'is-removing'
                            );

                        },

                        index * 35

                    );

                }

            );


            /*
               Después eliminamos todos.
            */

            const totalDelay =

                320
                +
                (
                    items.length *
                    35
                );


            setTimeout(

                function() {

                    items.forEach(

                        function(item) {

                            item.remove();

                        }

                    );


                    renderEmptyNotifications();


                    updateNotificationCount();

                },

                totalDelay

            );


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/notifications/delete-all.php',
                {

                    method:
                        'POST'

                }
            );

            */

        }

    );


/* =========================================================
   CLICK FUERA
   ========================================================= */

document.addEventListener(

    'click',

    function(event) {

        if (
            notificationWrapper
            &&
            !notificationWrapper.contains(
                event.target
            )
        ) {

            closeNotificationPanel();

        }

    }

);


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(

    'keydown',

    function(event) {

        if (
            event.key ===
            'Escape'
        ) {

            closeNotificationPanel();

        }

    }

);





/* =========================================================
   INICIALIZAR
   ========================================================= */

renderNotificationGroups();


updateNotificationCount();

/* =========================================================
   FONDOS DE INVERSIÓN
   FRONTEND TEMPORAL
   LISTO PARA BACKEND
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const investmentSection =
    document.querySelector(
        '.investment-section'
    );


const investmentAddButton =
    document.getElementById(
        'investmentAddButton'
    );


const investmentModal =
    document.getElementById(
        'investmentModal'
    );


const investmentForm =
    document.getElementById(
        'investmentForm'
    );


const investmentViewAll =
    document.getElementById(
        'investmentViewAll'
    );


const investmentViewAllText =
    document.getElementById(
        'investmentViewAllText'
    );


const investmentList =
    document.getElementById(
        'investmentList'
    );


const investmentCount =
    document.getElementById(
        'investmentCount'
    );


const investmentListTotal =
    document.getElementById(
        'investmentListTotal'
    );


/* =========================================================
   CAMPOS TARJETA PRINCIPAL
   ========================================================= */

const investmentMainCard =
    document.getElementById(
        'investmentMainCard'
    );


const investmentCardAmount =
    document.getElementById(
        'investmentCardAmount'
    );


const investmentCardLastFour =
    document.getElementById(
        'investmentCardLastFour'
    );


const investmentCardTypeLabel =
    document.getElementById(
        'investmentCardTypeLabel'
    );


const investmentCardExpiry =
    document.getElementById(
        'investmentCardExpiry'
    );


const investmentCardHolder =
    document.getElementById(
        'investmentCardHolder'
    );


/* =========================================================
   CAMPOS FORMULARIO
   ========================================================= */

const investmentName =
    document.getElementById(
        'investmentName'
    );


const investmentAmount =
    document.getElementById(
        'investmentAmount'
    );


const investmentType =
    document.getElementById(
        'investmentType'
    );


const investmentLastFour =
    document.getElementById(
        'investmentLastFour'
    );


const investmentHolder =
    document.getElementById(
        'investmentHolder'
    );


const investmentExpiry =
    document.getElementById(
        'investmentExpiry'
    );


/* =========================================================
   DATOS DEMO

   Después esto desaparecerá y vendrá
   de PHP / MySQL.
   ========================================================= */

let investmentFunds = [

    {

        id: 1,

        name:
            'Fondo principal',

        amount:
            25000,

        type:
            'VISA',

        lastFour:
            '7223',

        holder:
            'Josue Islas Alvarez',

        expiry:
            '03/28',

        createdAt:
            new Date(
                '2026-08-01T10:00:00'
            )

    }

];


let activeInvestmentId =
    1;


let nextInvestmentId =
    2;


/* =========================================================
   MONEDA
   ========================================================= */

function formatInvestmentMoney(
    value
) {

    return Number(value)
        .toLocaleString(

            'es-MX',

            {

                style:
                    'currency',

                currency:
                    'MXN',

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }

        );

}


/* =========================================================
   ABRIR MODAL
   ========================================================= */

function openInvestmentModal() {

    if (
        !investmentModal
    ) {

        return;

    }


    investmentModal.classList.add(
        'is-open'
    );


    investmentModal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.style.overflow =
        'hidden';


    setTimeout(

        function() {

            investmentName?.focus();

        },

        120

    );

}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function closeInvestmentModal() {

    if (
        !investmentModal
    ) {

        return;

    }


    investmentModal.classList.remove(
        'is-open'
    );


    investmentModal.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.style.overflow =
        '';


    investmentForm?.reset();

}


/* =========================================================
   BOTÓN +
   ========================================================= */

investmentAddButton
    ?.addEventListener(

        'click',

        function(event) {

            event.preventDefault();

            event.stopPropagation();


            openInvestmentModal();

        }

    );


/* =========================================================
   CERRAR MODAL
   ========================================================= */

document
    .querySelectorAll(
        '[data-investment-close]'
    )
    .forEach(

        function(button) {

            button.addEventListener(

                'click',

                closeInvestmentModal

            );

        }

    );


/* =========================================================
   SOLO 4 NÚMEROS
   ========================================================= */

investmentLastFour
    ?.addEventListener(

        'input',

        function() {

            investmentLastFour.value =

                investmentLastFour
                    .value
                    .replace(
                        /\D/g,
                        ''
                    )
                    .slice(
                        0,
                        4
                    );

        }

    );


/* =========================================================
   MOSTRAR TARJETA
   ========================================================= */

/* =========================================================
   MOSTRAR FONDO / TARJETA SELECCIONADA
   ========================================================= */

function showInvestmentFund(
    investmentId
) {

    /* =====================================================
       1. BUSCAR PRIMERO EL FONDO
       ===================================================== */

    const fund =
        investmentFunds.find(

            function(item) {

                return (
                    item.id ===
                    Number(
                        investmentId
                    )
                );

            }

        );


    /*
       Si no existe, detenemos.
    */

    if (
        !fund
    ) {

        console.warn(
            'No se encontró el fondo:',
            investmentId
        );

        return;

    }


    /* =====================================================
       2. GUARDAR COMO ACTIVO
       ===================================================== */

    activeInvestmentId =
        fund.id;


    /* =====================================================
       3. INICIAR TRANSICIÓN
       ===================================================== */

    investmentMainCard
        ?.classList
        .add(
            'is-changing'
        );


    /* =====================================================
       4. ESPERAR PEQUEÑA TRANSICIÓN
       ===================================================== */

    setTimeout(

        function() {


            /* =============================================
               APLICAR DISEÑO SEGÚN TIPO
               ============================================= */

            applyInvestmentTheme(
                fund.type
            );


            /* =============================================
               MONTO
               ============================================= */

            if (
                investmentCardAmount
            ) {

                investmentCardAmount.textContent =
                    formatInvestmentMoney(
                        fund.amount
                    );

            }


            /* =============================================
               ÚLTIMOS 4
               ============================================= */

            if (
                investmentCardLastFour
            ) {

                investmentCardLastFour.textContent =
                    fund.lastFour;

            }


            /* =============================================
               TIPO
               ============================================= */

            if (
                investmentCardTypeLabel
            ) {

                investmentCardTypeLabel.textContent =
                    fund.type;

            }


            /* =============================================
               REFERENCIA / VENCIMIENTO
               ============================================= */

            if (
                investmentCardExpiry
            ) {

                investmentCardExpiry.textContent =
                    fund.expiry ||
                    '--';

            }


            /* =============================================
               TITULAR
               ============================================= */

            if (
                investmentCardHolder
            ) {

                investmentCardHolder.textContent =
                    fund.holder;

            }


            /* =============================================
               ID ACTUAL
               ============================================= */

            investmentMainCard
                ?.setAttribute(
                    'data-investment-id',
                    fund.id
                );


            /* =============================================
               TERMINAR TRANSICIÓN
               ============================================= */

            investmentMainCard
                ?.classList
                .remove(
                    'is-changing'
                );


            /* =============================================
               ACTUALIZAR LISTA
               ============================================= */

            renderInvestmentList();


        },

        180

    );

}


/* =========================================================
   RENDER LISTA
   ========================================================= */

function renderInvestmentList() {

    if (
        !investmentList
    ) {

        return;

    }


    investmentList.innerHTML =
        '';


    /*
       Orden por registro:
       primero los más antiguos.
    */

    const orderedFunds =
        [...investmentFunds]
            .sort(

                function(a, b) {

                    return (
                        a.createdAt -
                        b.createdAt
                    );

                }

            );


    orderedFunds.forEach(

        function(fund) {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'investment-list-item';


            if (
                fund.id ===
                activeInvestmentId
            ) {

                item.classList.add(
                    'active'
                );

            }


            item.dataset.investmentId =
                fund.id;


            item.innerHTML = `

                <div>

                    <div class="investment-item-name">
                        ${escapeInvestmentHTML(fund.name)}
                    </div>

                    <div class="investment-item-meta">
                        ${escapeInvestmentHTML(fund.type)}
                        ····
                        ${escapeInvestmentHTML(fund.lastFour)}
                    </div>

                </div>

                <div class="investment-item-amount">
                    ${formatInvestmentMoney(fund.amount)}
                </div>

            `;


            item.addEventListener(

                'click',

                function() {

                    showInvestmentFund(
                        fund.id
                    );


                    closeInvestmentList();

                }

            );


            investmentList.appendChild(
                item
            );

        }

    );


    /* CONTADORES */

    const total =
        investmentFunds.length;


    if (
        investmentCount
    ) {

        investmentCount.textContent =
            `(${total})`;

    }


    if (
        investmentListTotal
    ) {

        investmentListTotal.textContent =

            total === 1

                ? '1 fondo'

                : `${total} fondos`;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeInvestmentHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


/* =========================================================
   GUARDAR
   ========================================================= */

investmentForm
    ?.addEventListener(

        'submit',

        function(event) {

            event.preventDefault();


            const lastFour =
                investmentLastFour
                    .value
                    .trim();


            if (
                !/^\d{4}$/.test(
                    lastFour
                )
            ) {

                investmentLastFour.focus();

                return;

            }


            const newFund = {

                id:
                    nextInvestmentId++,

                name:
                    investmentName
                        .value
                        .trim(),

                amount:
                    Number(
                        investmentAmount.value
                    ),

                type:
                    investmentType.value,

                lastFour:
                    lastFour,

                holder:
                    investmentHolder
                        .value
                        .trim(),

                expiry:
                    investmentExpiry
                        .value
                        .trim()
                    ||
                    '--',

                createdAt:
                    new Date()

            };


            investmentFunds.push(
                newFund
            );


            /*
               Cerramos formulario.
            */

            closeInvestmentModal();


            /*
               Nuevo fondo se convierte
               en tarjeta visible.
            */

            showInvestmentFund(
                newFund.id
            );


            /*
               Actualizar lista.
            */

            renderInvestmentList();


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/investments/create.php',
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            name:
                                newFund.name,

                            amount:
                                newFund.amount,

                            type:
                                newFund.type,

                            lastFour:
                                newFund.lastFour,

                            holder:
                                newFund.holder,

                            expiry:
                                newFund.expiry

                        })

                }
            )

            .then(
                response =>
                    response.json()
            )

            .then(
                data => {

                    console.log(
                        'Fondo guardado:',
                        data
                    );

                }
            );

            */

        }

    );


/* =========================================================
   VER TODO
   ========================================================= */

function openInvestmentList() {

    investmentSection
        ?.classList
        .add(
            'list-open'
        );


    investmentViewAll
        ?.setAttribute(
            'aria-expanded',
            'true'
        );


    if (
        investmentViewAllText
    ) {

        investmentViewAllText.textContent =
            'Ver menos';

    }

}


function closeInvestmentList() {

    investmentSection
        ?.classList
        .remove(
            'list-open'
        );


    investmentViewAll
        ?.setAttribute(
            'aria-expanded',
            'false'
        );


    if (
        investmentViewAllText
    ) {

        investmentViewAllText.textContent =
            'Ver todo';

    }

}


investmentViewAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const isOpen =
                investmentSection
                    ?.classList
                    .contains(
                        'list-open'
                    );


            if (
                isOpen
            ) {

                closeInvestmentList();

            }

            else {

                renderInvestmentList();

                openInvestmentList();

            }

        }

    );


/* =========================================================
   CLICK FUERA DEL PANEL
   ========================================================= */

document.addEventListener(

    'click',

    function(event) {

        if (
            investmentSection
            &&
            !investmentSection.contains(
                event.target
            )
        ) {

            closeInvestmentList();

        }

    }

);


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(

    'keydown',

    function(event) {

        if (
            event.key !==
            'Escape'
        ) {

            return;

        }


        closeInvestmentModal();

        closeInvestmentList();

    }

);





/* =========================================================
   API FRONTEND
   LISTA PARA BACKEND

   Después PHP podrá llamar:
   window.setInvestmentFunds(...)
   ========================================================= */

window.setInvestmentFunds =
function(data) {

    if (
        !Array.isArray(data)
    ) {

        return;

    }


    investmentFunds =
        data.map(

            function(item) {

                return {

                    id:
                        Number(
                            item.id
                        ),

                    name:
                        String(
                            item.name
                        ),

                    amount:
                        Number(
                            item.amount
                        ),

                    type:
                        String(
                            item.type
                        ),

                    lastFour:
                        String(
                            item.lastFour
                        ),

                    holder:
                        String(
                            item.holder
                        ),

                    expiry:
                        String(
                            item.expiry ||
                            '--'
                        ),

                    createdAt:
                        new Date(
                            item.createdAt
                        )

                };

            }

        );


    if (
        investmentFunds.length
    ) {

        activeInvestmentId =
            investmentFunds[0].id;


        showInvestmentFund(
            activeInvestmentId
        );

    }


    renderInvestmentList();

};



/* =========================================================
   CAMBIAR DISEÑO FÍSICO DE TARJETA
   ========================================================= */

function applyInvestmentTheme(type) {

    const normalizedType =
        String(type || 'VISA')
            .toUpperCase();


    const alternativeCards =
        document.querySelectorAll(
            '.investment-alt-card'
        );


    /* =====================================================
       OCULTAR TODAS LAS ALTERNATIVAS
       ===================================================== */

    alternativeCards.forEach(

        function(card) {

            card.classList.remove(
                'is-active'
            );

        }

    );


    /* =====================================================
       VISA
       MUESTRA LA TARJETA ORIGINAL
       ===================================================== */

    if (
        normalizedType ===
        'VISA'
    ) {

        investmentMainCard
            ?.classList
            .remove(
                'is-hidden'
            );


        return;

    }


    /* =====================================================
       OTROS TIPOS
       OCULTAMOS VISA
       ===================================================== */

    investmentMainCard
        ?.classList
        .add(
            'is-hidden'
        );


    /* =====================================================
       BUSCAR TARJETA CORRESPONDIENTE
       ===================================================== */

    const targetCard =
        document.querySelector(

            `.investment-alt-card[data-investment-card="${normalizedType}"]`

        );


    if (
        targetCard
    ) {

        targetCard.classList.add(
            'is-active'
        );

    }

}

/* =========================================================
   CARGAR DATOS EN TARJETAS ALTERNATIVAS
   ========================================================= */

function updateAlternativeInvestmentCards(
    fund
) {

    if (
        !fund
    ) {

        return;

    }


    /* =====================================================
       MONTO
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="amount"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    formatInvestmentMoney(
                        fund.amount
                    );

            }

        );


    /* =====================================================
       NOMBRE
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="name"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.name ||
                    'Sin nombre';

            }

        );


    /* =====================================================
       ÚLTIMOS 4
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="lastFour"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.lastFour ||
                    '0000';

            }

        );


    /* =====================================================
       TITULAR
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="holder"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.holder ||
                    'Sin responsable';

            }

        );


    /* =====================================================
       REFERENCIA
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="expiry"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.expiry ||
                    '--';

            }

        );

}

/* =========================================================
   INICIALIZAR
   ========================================================= */

renderInvestmentList();


