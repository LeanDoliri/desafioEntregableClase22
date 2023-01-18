import express from "express";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

import ContenedorArchivo from "./contenedores/ContenedorArchivo.js";

import config from "./config.js";

import faker from "faker";
faker.locale = "es";
import addRandomProducts from "./faker.js";

import { normalize, schema } from "normalizr";

//--------------------------------------------
// instancio servidor, socket y api

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const productosApi = new ContenedorArchivo(
  `${config.fileSystem.path}/productos.json`
);
const mensajesApi = new ContenedorArchivo(
  `${config.fileSystem.path}/mensajes.json`
);

//--------------------------------------------
// NORMALIZACIÓN DE MENSAJES

// Definimos un esquema de autor
const authorSchema = new schema.Entity("authors", {}, { idAttribute: "mail" });

// Definimos un esquema de mensaje
const textSchema = new schema.Entity("text");

// Definimos un esquema de posts
const mensajeSchema = new schema.Entity("messages", {
  author: authorSchema,
  text: [textSchema],
});

//--------------------------------------------
// configuro el socket

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado!");

  // ---- CHAT ----
  // // carga inicial de mensajes
  // const messages = await mensajesApi.listarAll();
  // socket.emit("messages", messages);

  // // actualizacion de mensajes
  // socket.on("newMessage", async (message) => {
  //   mensajesApi.guardar(message);
  //   const messages = await mensajesApi.listarAll();
  //   io.sockets.emit("messages", messages);
  // });

  listarMensajes().then((messages) => {
    socket.emit("messages", messages);
  });

  socket.on("newMessage", async (data) => {
    console.log('Hola!');
    mensajesApi.guardar(data);
    await listarMensajes().then((res) => {
      io.sockets.emit("mensajes", res);
    });
  });

  // ---- PRODUCTOS ----
  // carga inicial de productos con faker
  // async function addProductsFaker() {
  //   for (let i = 0; i < 5; i++) {
  //     await productosApi.guardar(addRandomProducts());
  //   }
  //   const productos = await productosApi.listarAll();
  //   socket.emit("productos", productos);
  // }

  // await addProductsFaker();

  const productos = await productosApi.listarAll();
  socket.emit("productos", productos);

  // actualizacion de productos
  socket.on("newProduct", async (data) => {
    productosApi.guardar(data);
    const productos = await productosApi.listarAll();
    io.sockets.emit("productos", productos);
  });
});

async function listarMensajes() {
  const archivoMensajes = await mensajesApi.listarAll();
  const normalizados = normalizarMensajes(archivoMensajes);
  return normalizados;
}

const normalizarMensajes = (mensajesConId) =>
  normalize(mensajesConId, [mensajeSchema]);

//--------------------------------------------
// agrego middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//--------------------------------------------
// inicio el servidor

const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${connectedServer.address().port}`
  );
});
connectedServer.on("error", (error) =>
  console.log(`Error en servidor ${error}`)
);
