const socket = io.connect();

//------------------------------------------------------------------------------------

const formAgregarProducto = document.getElementById('formAgregarProducto')
formAgregarProducto.addEventListener('submit', e => {
    e.preventDefault();
    const titleValue = document.querySelector("input[name=title]").value;
    const priceValue = document.querySelector("input[name=price]").value;
    const thumbnailValue = document.querySelector("input[name=thumbnail]").value;
    const newProduct = {
        title: titleValue,
        price: priceValue,
        thumbnail: thumbnailValue,
    };
    socket.emit('newProduct', newProduct);
    formAgregarProducto.reset()
})

socket.on('productos', productos => {
    makeHtmlTable(productos).then(html => {
        document.getElementById('productos').innerHTML = html
    })
});

function makeHtmlTable(productos) {
    return fetch('plantillas/tabla-productos.hbs')
        .then(respuesta => respuesta.text())
        .then(plantilla => {
            const template = Handlebars.compile(plantilla);
            const html = template({ productos })
            return html
        })
}

//-------------------------------------------------------------------------------------

// MENSAJES

/* --------------------- DESNORMALIZACIÓN DE MENSAJES ---------------------------- */
// Definimos un esquema de autor
const authorSchema = new normalizr.schema.Entity('authors',{}, {idAttribute:"mail"});

// Definimos un esquema de mensaje
const textSchema = new normalizr.schema.Entity('text');

// Definimos un esquema de posts
const mensajeSchema = new normalizr.schema.Entity('messages', {
    author: authorSchema,
    text: [textSchema]
});

/* ----------------------------------------------------------------------------- */

const inputEmail= document.getElementById("authorId")
const inputName = document.getElementById("authorName");
const inputLastName = document.getElementById("authorLastName");
const inputAge = document.getElementById("authorAge");
const inputUsername = document.getElementById("authorUsername");
const inputAvatar = document.getElementById("authorAvatar");
const inputMensaje = document.getElementById("inputMensaje");
const btnEnviar = document.getElementById("btnEnviar");

const formPublicarMensaje = document.getElementById('formPublicarMensaje')
formPublicarMensaje.addEventListener('submit', e => {
    e.preventDefault()
    
    const emailValue = inputEmail.value;
    const nameValue = inputName.value;
    const lastNameValue = inputLastName.value;
    const ageValue = inputAge.value;
    const usernameValue = inputUsername.value;
    const avatarValue = inputAvatar.value;
    const date = new Date().toLocaleDateString('es-ES')
    const time = new Date().toLocaleTimeString();
    const textValue = inputMensaje.value;

    const newMessage = {
      author: {
        mail: emailValue,
        name: nameValue,
        lastName: lastNameValue,
        age: ageValue,
        username: usernameValue,
        avatar: avatarValue
      },
      text: textValue,
      date: date + " " + time
    };

    socket.emit("newMessage", newMessage);
    formPublicarMensaje.reset();
    // inputMensaje.focus();
})

socket.on('mensajes', mensajesN => {

    console.log(`Porcentaje de compresión ${porcentajeC}%`)
    document.getElementById('compresion-info').innerText = porcentajeC

    console.log(mensajesD.mensajes);
    const html = makeHtmlList(mensajesD.mensajes)
    document.getElementById('mensajes').innerHTML = html;
})

function makeHtmlList(mensajes) {
    return mensajes.map(mensaje => {
        return (`
        <div>
            <b style="color:blue;">${mensaje.author.email}</b>
            [<span style="color:brown;">${mensaje.fyh}</span>] :
            <i style="color:green;">${mensaje.text}</i>
            <img width="50" src="${mensaje.author.avatar}" alt=" ">
        </div>
    `)
    }).join(" ");
}

inputUsername.addEventListener('input', () => {
    const hayEmail = inputUsername.value.length
    const hayTexto = inputMensaje.value.length
    inputMensaje.disabled = !hayEmail
    btnEnviar.disabled = !hayEmail || !hayTexto
})

inputMensaje.addEventListener('input', () => {
    const hayTexto = inputMensaje.value.length
    btnEnviar.disabled = !hayTexto
})
