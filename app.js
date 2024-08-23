function convertir() {
    let precios = {};

    async function obtenerPrecios() {
        try {
            const response = await fetch('https://api.ejemplo.com/cotizaciones'); 
            precios = await response.json();
        } catch (error) {
            console.error('Error al obtener precios:', error);
        
            precios = { havanna: 6180, bbva: 3880 };
        }
    }

    async function iniciarProceso() {
        await obtenerPrecios(); 

        let todos = JSON.parse(localStorage.getItem("todos")) || [];
        let contador = todos.length + 1;

        document.getElementById("btn-add").addEventListener("click", async () => {
            const { value: dni } = await Swal.fire({
                title: 'Ingrese su DNI',
                input: 'text',
                inputPlaceholder: 'Ingrese su DNI para realizar una nueva compra/venta',
                showCancelButton: true,
                inputValidator: value => !value && '¡Debes ingresar un DNI!'
            });

            if (!dni) return;

    
            const existingUser = todos.find(todo => todo.text === dni);

            if (existingUser) {
                Swal.fire({
                    title: 'Aviso',
                    text: 'Este DNI ya ha sido registrado anteriormente, pero puedes continuar con la operación.',
                    icon: 'info'
                });
            } else {
                let todo = { id: contador, text: dni, completed: false };
                todos.push(todo);
                localStorage.setItem("todos", JSON.stringify(todos));
                contador++;
            }

            const { value: acciónSeleccionada } = await Swal.fire({
                title: 'Seleccione una acción',
                input: 'radio',
                inputOptions: {
                    havanna: 'Havanna',
                    bbva: 'BBVA'
                },
                inputValidator: value => !value && '¡Debes seleccionar una acción!'
            });

            if (!acciónSeleccionada) return;

            const { value: cantidad } = await Swal.fire({
                title: `Ingrese la cantidad de acciones (${acciónSeleccionada.toUpperCase()})`,
                input: 'number',
                inputPlaceholder: 'Cantidad de acciones',
                inputValidator: value => {
                    if (!value) return '¡Debes ingresar una cantidad!';
                    if (value <= 0) return 'La cantidad debe ser mayor a cero';
                }
            });

            if (!cantidad) return;

            const total = cantidad * precios[acciónSeleccionada];

            todos = todos.map(todo => {
                if (todo.text === dni) {
                    return { ...todo, lastAction: acciónSeleccionada, lastQuantity: cantidad };
                }
                return todo;
            });

            localStorage.setItem("todos", JSON.stringify(todos));

            Swal.fire({
                title: 'Resultado',
                text: `El total de sus acciones al precio de hoy es de $${total} pesos argentinos`,
                icon: 'success'
            });
        });
    }

    iniciarProceso();
}

convertir();
