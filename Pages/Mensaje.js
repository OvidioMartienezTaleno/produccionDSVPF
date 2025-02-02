import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

export default function MensajeScreen() {
  const [mensajes, setMensajes] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const route = useRoute();

  useEffect(() => {
    // Cargar el perfil guardado desde AsyncStorage
    const cargarPerfil = async () => {
      try {
        const perfilGuardado = await AsyncStorage.getItem("perfil");
        if (perfilGuardado !== null) {
          setPerfil(JSON.parse(perfilGuardado));
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };

    cargarPerfil();
  }, []);

  useEffect(() => {
    const cargarMensajes = async () => {
      if (perfil) {
        // Obtener mensajes y organizarlos por chats
        const fetchMensajes = async () => {
          try {
            const response = await axios.get(
              "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/mensajes"
            );
            const mensajesFiltrados = response.data.filter(
              (mensaje) =>
                mensaje.idEnviado === perfil.correo ||
                mensaje.idRecibido === perfil.correo
            );

            // Organizar mensajes por chats y ordenar por fecha ascendente
            const chatDict = {};
            mensajesFiltrados.forEach((mensaje) => {
              const chatId =
                mensaje.idEnviado === perfil.correo
                  ? mensaje.idRecibido
                  : mensaje.idEnviado;
              if (!chatDict[chatId]) {
                chatDict[chatId] = [];
              }
              chatDict[chatId].push(mensaje);
            });

            // Crear una lista de chats y ordenar los mensajes por fecha de forma ascendente
            const chatList = Object.keys(chatDict).map((chatId) => ({
              chatId,
              mensajes: chatDict[chatId].sort(
                (a, b) => new Date(a.fecha) - new Date(b.fecha)
              ),
            }));

            setChats(chatList);

            // Si hay un chatId en los parámetros de la ruta, seleccionar ese chat
            if (route.params?.chatId) {
              const selectedChat = chatList.find(
                (chat) => chat.chatId === route.params.chatId
              );
              if (selectedChat) {
                setSelectedChat(selectedChat);
              } else {
                // Crear un nuevo chat si no existe
                setSelectedChat({ chatId: route.params.chatId, mensajes: [] });
              }
            }
          } catch (error) {
            console.error("Error al obtener mensajes:", error);
          }
        };

        fetchMensajes();
      }
    };

    const intervalo = setInterval(cargarMensajes, 1000);

    return () => clearInterval(intervalo); // Limpiar el intervalo cuando el componente se desmonte
  }, [perfil, route.params?.chatId]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === "" || !selectedChat) {
      return;
    }

    const mensaje = {
      idEnviado: perfil.correo,
      idRecibido: selectedChat.chatId,
      texto: nuevoMensaje,
      fecha: new Date().toISOString(), // Agregar fecha al mensaje
    };

    try {
      const response = await axios.post(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/mensajes",
        mensaje
      );
      if (response.status === 201) {
        // Refrescar los mensajes
        const updatedMensajes = [...selectedChat.mensajes, mensaje].sort(
          (a, b) => new Date(a.fecha) - new Date(b.fecha)
        );
        const updatedChat = { ...selectedChat, mensajes: updatedMensajes };
        setSelectedChat(updatedChat);

        const updatedChats = chats.map((chat) =>
          chat.chatId === selectedChat.chatId ? updatedChat : chat
        );
        setChats(updatedChats);

        setNuevoMensaje("");
      } else {
        console.error("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  return (
    <View style={styles.container}>
      {selectedChat ? (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.chatContainer}>
            {selectedChat.mensajes.map((mensaje, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  mensaje.idEnviado === perfil.correo
                    ? styles.sentMessage
                    : styles.receivedMessage,
                ]}
              >
                <Text style={styles.messageText}>{mensaje.texto}</Text>
                <Text style={styles.messageDate}>
                  {new Date(mensaje.fecha).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChangeText={setNuevoMensaje}
            />
            <TouchableOpacity style={styles.sendButton} onPress={enviarMensaje}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {chats.map((chat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.chatContainer}
              onPress={() => setSelectedChat(chat)}
            >
              <Text style={styles.chatText}>Chat con: {chat.chatId}</Text>
              <Text style={styles.chatPreview}>
                {chat.mensajes[0].texto.length > 50
                  ? chat.mensajes[0].texto.substring(0, 50) + "..."
                  : chat.mensajes[0].texto}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  chatContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  chatText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chatPreview: {
    fontSize: 14,
    color: "#666",
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  messageDate: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#6200ea",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  backButton: {
    alignSelf: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#6200ea",
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
