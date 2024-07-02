document.addEventListener('DOMContentLoaded', function () {
    const entradaIntento = document.getElementById('entradaIntento');
    const botonIntento = document.getElementById('botonIntento');
    const botonReiniciar = document.getElementById('botonReiniciar');
    const botonMostrarOcultarHistorial = document.getElementById('botonMostrarOcultarHistorial');
    const botonBorrarHistorial = document.getElementById('botonBorrarHistorial');
    const areaMensajes = document.getElementById('areaMensajes');
    const intentosPrevios = document.getElementById('intentosPrevios');
    const intentosRestantes = document.getElementById('intentosRestantes');
    const temporizador = document.getElementById('temporizador');
    const modalInicio = new bootstrap.Modal(document.getElementById('modalInicio')); // Inicialización del modal

    let numeroAleatorio;
    let contadorIntentos;
    let tiempoRestante;
    let intervalID;
    let nombreUsuario = '';

    // Evento para abrir el modal al cargar la página
    window.onload = function () {
        modalInicio.show();
    };

    // Evento para comenzar el juego desde el modal
    document.getElementById('botonComenzar').addEventListener('click', function () {
        nombreUsuario = document.getElementById('nombreUsuarioModal').value.trim();
        if (nombreUsuario === '') {
            alert('Por favor, ingresa tu nombre para comenzar.');
            return;
        }
        modalInicio.hide();
        iniciarJuego();
    });

    function iniciarJuego() {
        numeroAleatorio = generarNumeroAleatorio(1, 100);
        contadorIntentos = 10;
        tiempoRestante = 60;
        areaMensajes.textContent = '';
        intentosPrevios.textContent = '';
        intentosRestantes.textContent = `Intentos restantes: ${contadorIntentos}`;
        temporizador.textContent = `Tiempo restante: ${tiempoRestante} segundos`;
        entradaIntento.value = '';
        clearInterval(intervalID);
        intervalID = setInterval(actualizarTemporizador, 1000);
        console.log(`Número aleatorio generado: ${numeroAleatorio}`);
    }

    function generarNumeroAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function actualizarTemporizador() {
        tiempoRestante--;
        temporizador.textContent = `Tiempo restante: ${tiempoRestante} segundos`;
        if (tiempoRestante <= 0) {
            clearInterval(intervalID);
            mostrarMensaje(`¡Tiempo agotado! El número era ${numeroAleatorio}`);
            bloquearJuego();
        }
    }

    function mostrarMensaje(mensaje) {
        areaMensajes.textContent = mensaje;
    }

    function actualizarHistorial(numero) {
        intentosPrevios.innerHTML += `${numero} `;
    }

    async function obtenerRespuestaAI(intent) {
        const prompt = `Intento de usuario: ${intent}`;
        const apiKey = 'process.env.API_KEY';
        try {
            const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens: 50
                })
            });

            if (!response.ok) {
                throw new Error('Error al obtener la respuesta');
            }

            const data = await response.json();
            return data.choices[0].text.trim();
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            return 'Lo siento, no puedo responder en este momento.';
        }
    }

    function validarIntento() {
        const intentoUsuario = Number(entradaIntento.value);
        if (isNaN(intentoUsuario) || intentoUsuario < 1 || intentoUsuario > 100) {
            mostrarMensaje('Por favor, introduce un número válido entre 1 y 100.');
            return;
        }
        contadorIntentos--;
        intentosRestantes.textContent = `Intentos restantes: ${contadorIntentos}`;
        actualizarHistorial(intentoUsuario);

        // Obtener respuesta de OpenAI
        obtenerRespuestaAI(intentoUsuario)
            .then(respuestaAI => {
                mostrarMensaje(respuestaAI);

                if (intentoUsuario === numeroAleatorio) {
                    mostrarMensaje(`¡Felicidades, ${nombreUsuario}! Has adivinado el número.`);
                    clearInterval(intervalID);
                    bloquearJuego();
                } else if (contadorIntentos === 0) {
                    mostrarMensaje(`¡Lo siento, ${nombreUsuario}! Has agotado tus intentos. El número era ${numeroAleatorio}`);
                    clearInterval(intervalID);
                    bloquearJuego();
                } else if (intentoUsuario < numeroAleatorio) {
                    mostrarMensaje('El número es mayor.');
                } else {
                    mostrarMensaje('El número es menor.');
                }
            })
            .catch(error => {
                console.error('Error al obtener respuesta de OpenAI:', error);
                mostrarMensaje('Error al obtener respuesta de OpenAI. Intenta de nuevo.');
            });
    }

    function bloquearJuego() {
        entradaIntento.disabled = true;
        botonIntento.disabled = true;
    }

    function desbloquearJuego() {
        entradaIntento.disabled = false;
        botonIntento.disabled = false;
    }

    botonIntento.addEventListener('click', function () {
        validarIntento();
        entradaIntento.value = '';
    });

    botonReiniciar.addEventListener('click', function () {
        iniciarJuego();
        desbloquearJuego();
    });

    botonMostrarOcultarHistorial.addEventListener('click', function () {
        const historial = document.getElementById('intentosPrevios');
        historial.classList.toggle('d-none');
    });

    botonBorrarHistorial.addEventListener('click', function () {
        intentosPrevios.textContent = '';
    });

    iniciarJuego();
});
