//Ejemplo de creación de elemento
let parrafo = document.createElement("p");
parrafo.innerHTML = "<h2>Listado de Productos</h2>";

let titulo = document.getElementById("titulo");
titulo.append(parrafo);

//consulto json guardado en un un hosting
async function inicializar_productos(){
    let response = await fetch("http://json.zaraivemultiespacio.com/productos.json");
    //Array de productos que luego se recorreran y mostrará en el index.
    let exito = await response.ok
    if(!exito){
        swal("¡No se ha podido obtener los datos de los productos!", {
            icon: "error",
          });
        return;
    }

    productos = await response.json()
    //guardo el elemento con id #contenido para luego agregarle la info de los productos.
    let contenido = document.getElementById("contenido");
    //recorro el array de objetos para luego mostrarlos en el index.
    for (const elemento of productos) {
        //agrego cada producto al elemento contenido para dibujarlos en pantalla.
        contenido.innerHTML += `<div class="col-lg-4 col-sm-12 mt-3">
                                    <div class="card shadow-sm text-center">
                                    <img src=${elemento.imagen} alt="">
                                    <div class="card-body">
                                      <p class="card-text"><small>${elemento.id}</small>-${elemento.nombre}</p>
                                      <hr>
                                      <p class="card-text">$${elemento.precio}</p>
                                      <div class="text-right">
                                        <button type="button" data-producto='${JSON.stringify(elemento)}' class="btn btn-sm btn-primary botonAgregarCarrito">Solicitar</button>
                                      </div>
                                    </div>
                                    </div>
                                    </div>`;
    };
    const botonesSolicitar = document.querySelectorAll('.botonAgregarCarrito');
    for(const value of botonesSolicitar){
        value.addEventListener('click', solicitar);
    }
}

//inicializo array carrito de compras vacio
let carrito = [];

//compruebo si hay informacion en el local storage, en caso de ser así lo mostraré (ej al actualizar la pantalla)
document.addEventListener('DOMContentLoaded', e => {
    inicializar_productos();
    contarPedidos();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        //Asigno a todos los botones de la misma clase, el addEventListener y por cada unos de ellos la funcion solicitar.
        const botonesSolicitar = document.querySelectorAll('.botonAgregarCarrito');
        for(const value of botonesSolicitar){
            value.addEventListener('click', solicitar);
        }
    }
    imprimirCarrito();
});


//función aplicada a los botones solicitar, luego se enviara el producto a la funcion AgregarProducto
//se agrego toast al solicitar un producto
function solicitar(){
    Toastify({
        text: "Se agregó el producto al carrito",
        duration: 2000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        offset: {
            x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: 50 // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        style: {
          background: "linear-gradient(to right,#0b9959,#8ae6c5)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
    const producto = JSON.parse(this.dataset.producto);
    agregarProducto(producto);
}

//función para agregar producto al carrito, en caso de existir un producto en el mismo, este le aumentara 1 unidad por vez,
//caso contrario se agregará al carrito de compras.
function agregarProducto(producto){
    const productoEnCarrito = carrito.find(value=>{return value.producto.id == producto.id});
    const producto_agregar = {...producto}; //Uso del Spread
    productoEnCarrito ? productoEnCarrito.cantidad++ : carrito.push( {producto:producto_agregar , cantidad: 1} ); //Uso Operador ternario /mejoramiento del if
    imprimirCarrito()
}

//funcion para quitar un producto del carrito (reducir una unidad boton -), por cada click, se actualizara la impresión del carrito
function quitarProducto(){
    const producto = JSON.parse(this.dataset.producto);
    const productoEnCarrito = carrito.find(value=>{return value.producto.id == producto.id});
    const {cantidad, producto:{id:producto_id}} = productoEnCarrito; //Uso del Destructuring
    /* console.log(cantidad);
    console.log(producto_id); */
    if(cantidad > 1){
        productoEnCarrito.cantidad--;
    }
    else{
        indexProductoEnCarrito = carrito.findIndex(value=>{return value.producto.id == producto_id});
        carrito.splice(indexProductoEnCarrito, 1);
    }
    imprimirCarrito();
}

//funcion para quitar completamente el producto del carrito
function eliminarProducto(){
    Toastify({
        text: "Se elimino producto del carrito",
        duration: 2000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        offset: {
            x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: 50 // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        style: {
          background: "linear-gradient(to right,#1c191a,#ed345c)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
    const producto = JSON.parse(this.dataset.producto);
    indiceProductoEnCarrito = carrito.findIndex(value=>{return value.producto.id == producto.id});
    carrito.splice(indiceProductoEnCarrito,1);
    imprimirCarrito();
}

//funcion donde se muestra el contenido del carrito, toma la tabla creada en el index, y luego la completa con DOM. A su vez, se guarda en el local
//storage para generar una copia de respaldo, en caso de actualizar la página.
//Se agregaron botones + y - para aumentar, reducir cantidad. boton X para eliminar producto
//Muestra los totales por producto y total general.
function imprimirCarrito(){
    tablaCarrito = document.getElementById('carrito');
    totalCarrito = document.getElementById('totalCarrito');
    vaciarCarrito = document.getElementById('VaciarCarrito');
    enviarPedido = document.getElementById('enviarPedido');
    badgeCarrito = document.getElementById('badgeCarrito');
    badgeCarrito.innerHTML = '';
    if(carrito.length){
        badgeCarrito.innerHTML = carrito.length;
    }
    let nuevoElemento = "";
    let total = 0;
    for(const value of carrito){
        nuevoElemento += `
        <tr>
            <td>${value.producto.nombre}</td>
            <td>$${value.producto.precio}</td>
            <td>${value.cantidad}</td>
            <td>$${parseInt(value.producto.precio)*parseInt(value.cantidad)}</td>
            <td><div class="btn-group" role="group" aria-label="Basic example">
            <button data-producto='${JSON.stringify(value.producto)}' class="btn btn-accion btn-primary btn-sm botonQuitarCarrito">-</button>
            <button data-producto='${JSON.stringify(value.producto)}' class="btn btn-accion btn-success btn-sm botonAgregarCarrito">+</button>
            <button data-producto='${JSON.stringify(value.producto)}' class="btn btn-accion btn-danger btn-sm botonEliminarProducto">x</button>
            </div></td>
        </tr>`;
        total += value.producto.precio*value.cantidad
    }
    tablaCarrito.innerHTML= nuevoElemento;
    localStorage.setItem('carrito', JSON.stringify(carrito))
    
    //Asigno a todos los botones de la misma clase, el addEventListener y por cada unos de ellos la funcion solicitar.
    const botonesSolicitar = document.querySelectorAll('.botonAgregarCarrito');
    for(const value of botonesSolicitar){
        value.addEventListener('click', solicitar);
    }

    if(total > 0){
        totalCarrito.innerHTML =` $ ${total}`;
        vaciarCarrito.innerHTML ='<button class="btn btn-danger btn-sm mr-5" id="botonQuitarCarrito">Vaciar</button>'
        enviarPedido.innerHTML ='<button class="btn btn-success btn-sm mr-5" id="botonEnviarPedido">Enviar Pedido</button>'

    }else{
        totalCarrito.innerHTML =``;
        vaciarCarrito.innerHTML ='';
        enviarPedido.innerHTML ='';
    }
    //Asigno a todos los botones de la misma clase, el addEventListener y por cada unos de ellos la funcion Quitar.
    const botonesQuitar = document.querySelectorAll('.botonQuitarCarrito');
    for(const value of botonesQuitar){
        value.addEventListener('click', quitarProducto);
    }

    //Asigno a todos los botones de la misma clase, el addEventListener y por cada unos de ellos la funcion EliminarProducto.
    const botonesEliminarProducto = document.querySelectorAll('.botonEliminarProducto');
    for (const item of botonesEliminarProducto) {
        item.addEventListener('click',eliminarProducto);
    }

    //sweatAlert
    if(boton_quitar = document.getElementById('botonQuitarCarrito')){
        boton_quitar.addEventListener('click', () => {
            swal({
                title: "¿Esta seguro de vaciar el carrito?",
                text: "Los datos del carrito serán eliminados",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              })
              .then((value) => {
                if (value) {
                  swal("¡El contenido del carrito se ha eliminado exitosamente!", {
                    icon: "success",
                  });
                  limpiarCarrito();
                }
              });
        });
    }
    
    //sweatAlert
    if(boton_enviar = document.getElementById('botonEnviarPedido')){
        boton_enviar.addEventListener("click", () => {
            swal({
                title: "¡Buen Trabajo!",
                text: "¡Su pedido ha sido enviado con exito!",
                icon: "success",
                button: "Aceptar",
              })
              .then((value) => {
                
                if(pedidos_almacenados = localStorage.getItem('pedidos')){
                    let {pedidos} = JSON.parse(pedidos_almacenados);
                    pedidos.push({fecha: new Date, productos: carrito});
                    localStorage.setItem('pedidos', JSON.stringify({pedidos}));
                }
                else{
                    let pedidos = [];
                    pedidos.push({fecha: new Date, productos: carrito});
                    localStorage.setItem('pedidos', JSON.stringify({pedidos}));
                }
                limpiarCarrito();
                contarPedidos();
              });
        })   
    }
}
//función para vaciar carrito, llamada desde el botón con la clase .botonQuitarCarrito.
function limpiarCarrito(){
    carrito = [];
    imprimirCarrito();
}

//uso de badge bootstrap para indicar la cantidad de pedidos enviados.
function contarPedidos(){
    let badgePedidos = document.getElementById('badgePedidos');
    badgePedidos.innerHTML = '';
    cantidad_pedidos = (JSON.parse(localStorage.getItem('pedidos') ?? '{"pedidos":[]}').pedidos).length
    if(cantidad_pedidos){
        badgePedidos.innerHTML = cantidad_pedidos
    }
}

//Info modal pedidos enviados.
let modalPedidos = document.getElementById('Modalpedidos')
modalPedidos.addEventListener('show.bs.modal', function(){
    let nuevoElemento = '';
    let accordion = document.getElementById('accordionMisPedidos');
    for( const [index, pedido] of JSON.parse(localStorage.getItem('pedidos')).pedidos.entries() ){
        let {fecha} = pedido;
        fecha = new Date(fecha)
        //formato fecha
        fecha = `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}/ ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`
        nuevoElemento+=`
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseheading${index}" aria-expanded="false" aria-controls="collapseheading${index}">
                    Pedido ${fecha}
                </button>
                </h2>
                <div id="collapseheading${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordionMisPedidos">
                    <div class="accordion-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                    <th>Producto</th>
                                    <th>Precio</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
        `;
        let {productos} = pedido
        let total = 0;
        for( value of productos ){
            nuevoElemento+=`
                                    <tr>
                                        <td>${value.producto.nombre}</td>
                                        <td>$${value.producto.precio}</td>
                                        <td>${value.cantidad}</td>
                                        <td>$${parseInt(value.producto.precio)*parseInt(value.cantidad)}</td>
                                    </tr>
            `;
            total += value.producto.precio*value.cantidad
        }
        nuevoElemento+=`
                                </tbody>
                                <tfoot>
                                    <tr><td colspan="3"></td><td>$${total}</td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    accordion.innerHTML = nuevoElemento;
});

//Info modal de carrito
let modalCarrito = document.getElementById('ModalCarrito');
modalCarrito.addEventListener('show.bs.modal', imprimirCarrito);