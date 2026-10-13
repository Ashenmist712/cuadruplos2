document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('expresion');
    const btnGenerar = document.getElementById('btnGenerar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const tablaCuadruplos = document.getElementById('cuerpoTabla');
    const tablaTriplos = document.getElementById('cuerpoTablaTriplos');

    function limpiarFila(contenedor, texto) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-muted">${texto}</td></tr>`;
    }

    function mostrarAlerta(icon, title, text) {
        Swal.fire({ icon, title, text });
    }

    function validarExpresion(expresion) {
        const sinEspacios = expresion.replace(/\s+/g, '');
        if (!sinEspacios || !sinEspacios.includes('=')) return false;

        const partes = sinEspacios.split('=');
        if (partes.length !== 2) return false;

        const variable = partes[0];
        const derecha = partes[1];

        if (!/^[A-Za-z][A-Za-z0-9]*$/.test(variable)) return false;
        if (!/^[A-Za-z0-9+\-*/()]+$/.test(derecha)) return false;

        const tokens = derecha.split(/([+\-*/()])/).filter(t => t !== '');
        if (tokens.length === 0) return false;

        return tokens.every(t => /^(?:[A-Za-z][A-Za-z0-9]*|[0-9]+|[+\-*/()])$/.test(t));
    }

    function esOperador(token) {
        return ['+', '-', '*', '/'].includes(token);
    }

    function prioridad(token) {3
        if (token === '*' || token === '/') return 2;
        if (token === '+' || token === '-') return 1;
        return 0;
    }

    function infijaAPostfija(expresion) {
        const tokens = expresion.match(/[a-zA-Z0-9]+|[\+\-\*\/\(\)]/g);
        const salida = [];
        const pila = [];

        if (!tokens) return salida;

        for (const token of tokens) {
            if (token === '(') {
                pila.push(token);
            } else if (token === ')') {
                while (pila.length && pila[pila.length - 1] !== '(') {
                    salida.push(pila.pop());
                }
                pila.pop();
            } else if (esOperador(token)) {
                while (pila.length && prioridad(pila[pila.length - 1]) >= prioridad(token)) {
                    salida.push(pila.pop());
                }
                pila.push(token);
            } else {
                salida.push(token);
            }
        }

        while (pila.length) {
            salida.push(pila.pop());
        }

        return salida;
    }

    function generarCuadruplos(expresion) {
        const sinEspacios = expresion.replace(/\s+/g, '');
        const [variable, derecha] = sinEspacios.split('=');
        const postfija = infijaAPostfija(derecha);
        const cuadruplos = [];
        const pila = [];
        let temporal = 1;

        for (const token of postfija) {
            if (esOperador(token)) {
                const b = pila.pop();
                const a = pila.pop();
                const t = 't' + temporal;
                cuadruplos.push({ operador: token, argumento1: a, argumento2: b, resultado: t });
                pila.push(t);
                temporal++;
            } else {
                pila.push(token);
            }
        }

        const resultado = pila.pop();
        cuadruplos.push({ operador: '=', argumento1: resultado, argumento2: '', resultado: variable });
        return cuadruplos;
    }

    function generarTriplos(cuadruplos) {
        return cuadruplos.map((cuadruplo, index) => ({
            numero: index + 1,
            operador: cuadruplo.operador,
            argumento1: cuadruplo.argumento1,
            argumento2: cuadruplo.argumento2,
            resultado: cuadruplo.resultado
        }));
    }

    function dibujarTabla(datos, contenedor) {
        contenedor.innerHTML = '';

        datos.forEach((fila, index) => {
            const filaHtml = document.createElement('tr');
            filaHtml.innerHTML = `
                <td>${index + 1}</td>
                <td>${fila.operador}</td>
                <td>${fila.argumento1}</td>
                <td>${fila.argumento2}</td>
                <td>${fila.resultado}</td>
            `;
            contenedor.appendChild(filaHtml);
        });
    }

    btnLimpiar.addEventListener('click', () => {
        input.value = '';
        input.focus();
        limpiarFila(tablaCuadruplos, 'Cuadruplos');
        limpiarFila(tablaTriplos, 'Triplo');
        mostrarAlerta('info', 'Campo limpio', 'La expresión ha sido borrada.');
    });

    btnGenerar.addEventListener('click', () => {
        const valor = input.value.trim();

        if (!valor) {
            mostrarAlerta('error', 'Campo vacío', 'Escribe una expresión antes de generar resultados.');
            return;
        }

        if (!validarExpresion(valor)) {
            mostrarAlerta('error', 'Expresión inválida', 'Usa letras, números, operadores y paréntesis con una asignación válida.');
            return;
        }

        const cuadruplos = generarCuadruplos(valor);
        const triplos = generarTriplos(cuadruplos);

        dibujarTabla(cuadruplos, tablaCuadruplos);
        dibujarTabla(triplos, tablaTriplos);
        mostrarAlerta('success', 'Generado', 'Cuádruplos y triplos generados correctamente.');
    });
});