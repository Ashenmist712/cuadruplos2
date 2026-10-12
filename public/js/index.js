document.addEventListener('DOMContentLoaded', () => {
    // Referencia al botón para generar los cuádruplos
    const botonGenerarCuadruplos = document.getElementById('btnGenerar');
    // Campo de texto donde el usuario escribe la expresión
    const campoTextoExpresion = document.getElementById('expresion');
    // Cuerpo de la tabla donde se muestran los resultados
    const contenedorFilasTabla = document.getElementById('cuerpoTabla');

    botonGenerarCuadruplos.addEventListener('click', () => {
        const textoExpresion = campoTextoExpresion.value;

        // Validamos que la expresión tenga asignación para poder procesarla
        if (!textoExpresion.includes('=')) {
            alert('Por favor, ingresa una expresión válida con una asignación (ej. r = a + b * c)');
            return;
        }

        const listaCuadruplos = procesarYGenerarCuadruplos(textoExpresion);
        dibujarTablaEnPantalla(listaCuadruplos);
    });

    function procesarYGenerarCuadruplos(expresionCompleta) {
        // 1. Quita espacios recorriendo la cadena manualmente
        let expresionSinEspacios = '';
        for (let i = 0; i < expresionCompleta.length; i++) {
            if (expresionCompleta[i] !== ' ') {
                expresionSinEspacios += expresionCompleta[i];
            }
        }

        // Separa la variable de destino de la expresión
        const partesExpresion = expresionSinEspacios.split('=');
        const variableAsignacion = partesExpresion[0];
        const expresionAProcesar = partesExpresion[1];

        // Convierte la expresión infija a notación postfija
        const expresionNotacionPostfija = convertirDeInfijaAPostfija(expresionAProcesar);

        // Genera los cuádruplos a partir de la expresión postfija
        const listaResultanteCuadruplos = [];
        const pilaDeOperandos = [];
        let numeroDeVariableTemporal = 1;

        // Recorre cada elemento de la expresión en notación postfija
        for (let indice = 0; indice < expresionNotacionPostfija.length; indice++) {
            const elementoActual = expresionNotacionPostfija[indice];

            if (esUnOperadorMatematico(elementoActual)) {
                // Obtiene los dos operandos más recientes y crea un temporal
                const segundoOperando = pilaDeOperandos.pop();
                const primerOperando = pilaDeOperandos.pop();
                const nuevaVariableTemporal = 't' + numeroDeVariableTemporal;

                // Guarda el cuádruplo con operador, operandos y resultado
                listaResultanteCuadruplos.push({
                    operador: elementoActual,
                    argumento1: primerOperando,
                    argumento2: segundoOperando,
                    resultado: nuevaVariableTemporal
                });

                // Empuja el temporal para continuar con la siguiente operación
                pilaDeOperandos.push(nuevaVariableTemporal);
                numeroDeVariableTemporal++;
            } else {
                // Si no es operador, es un operando y se apila
                pilaDeOperandos.push(elementoActual);
            }
        }

        // Agrega la asignación final de la expresión al resultado
        const resultadoFinalExpresion = pilaDeOperandos.pop();
        listaResultanteCuadruplos.push({
            operador: '=',
            argumento1: resultadoFinalExpresion,
            argumento2: '',
            resultado: variableAsignacion
        });

        return listaResultanteCuadruplos;
    }

    // Funciones auxiliares para convertir la expresión y ordenar operadores

    function convertirDeInfijaAPostfija(ecuacionMatematica) {
        let listaElementosPostfijos = [];
        let pilaDeOperadores = [];

        // Separa números, letras y operadores, incluyendo paréntesis
        const elementosDeExpresion = ecuacionMatematica.match(/[a-zA-Z0-9]+|[\+\-\*\/\(\)]/g);

        if (!elementosDeExpresion) return listaElementosPostfijos;

        for (let elementoActual of elementosDeExpresion) {
            if (elementoActual === '(') {
                pilaDeOperadores.push(elementoActual);
            } else if (elementoActual === ')') {
                while (pilaDeOperadores.length > 0 && pilaDeOperadores[pilaDeOperadores.length - 1] !== '(') {
                    listaElementosPostfijos.push(pilaDeOperadores.pop());
                }
                pilaDeOperadores.pop();
            } else if (esUnOperadorMatematico(elementoActual)) {
                while (
                    pilaDeOperadores.length > 0 &&
                    obtenerJerarquiaDeOperador(pilaDeOperadores[pilaDeOperadores.length - 1]) >= obtenerJerarquiaDeOperador(elementoActual)
                ) {
                    listaElementosPostfijos.push(pilaDeOperadores.pop());
                }
                pilaDeOperadores.push(elementoActual);
            } else {
                listaElementosPostfijos.push(elementoActual);
            }
        }

        // Vacía los operadores restantes en la pila
        while (pilaDeOperadores.length > 0) {
            listaElementosPostfijos.push(pilaDeOperadores.pop());
        }

        return listaElementosPostfijos;
    }

    function esUnOperadorMatematico(caracterEvaluado) {
        return ['+', '-', '*', '/'].includes(caracterEvaluado);
    }

    function obtenerJerarquiaDeOperador(operadorEvaluado) {
        if (operadorEvaluado === '*' || operadorEvaluado === '/') return 2;
        if (operadorEvaluado === '+' || operadorEvaluado === '-') return 1;
        return 0;
    }

    // Dibuja en la tabla los cuádruplos generados
    function dibujarTablaEnPantalla(listaCuadruplosARenderizar) {
        contenedorFilasTabla.innerHTML = '';

        listaCuadruplosARenderizar.forEach((cuadruploActual, indiceFila) => {
            const nuevaFilaTabla = document.createElement('tr');

            // Inserta cada celda con los valores del cuádruplo
            nuevaFilaTabla.innerHTML = `
                <td>${indiceFila + 1}</td>
                <td>${cuadruploActual.operador}</td>
                <td>${cuadruploActual.argumento1}</td>
                <td>${cuadruploActual.argumento2}</td>
                <td>${cuadruploActual.resultado}</td>
            `;

            contenedorFilasTabla.appendChild(nuevaFilaTabla);
        });
    }
});