import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native"; // Importación de componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importación de AsyncStorage para almacenamiento local
import axios from "axios"; // Importación de axios para hacer peticiones HTTP
import { useRoute, useNavigation } from "@react-navigation/native"; // Importación de hooks para la navegación

export default function EventosScreen() {
  // Estado para almacenar detalles del evento
  const [eventoDetalles, setEventoDetalles] = useState({
    estado: "",
    fecha: "",
    hora: "",
    precio: "",
    tipoEvento: "",
    ubicacion: "",
  });
  // Estados para almacenar ID de organizador, usuario y proveedor
  const [idOrganizador, setIdOrganizador] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [idProveedor, setIdProveedor] = useState("");
  const [eventos, setEventos] = useState([]); // Estado para almacenar la lista de eventos
  const [perfil, setPerfil] = useState(null); // Estado para almacenar el perfil del usuario

  const route = useRoute(); // Hook para obtener la ruta actual
  const navigation = useNavigation(); // Hook para la navegación

  // Verificar si es un nuevo evento o si se está seleccionando un evento
  const isNewEvent = route.params?.isNewEvent;
  const isSelectingEvent = route.params?.isSelectingEvent;

  // Efecto para cargar el perfil del usuario desde AsyncStorage
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfilGuardado = await AsyncStorage.getItem("perfil");
        if (perfilGuardado !== null) {
          const perfil = JSON.parse(perfilGuardado);
          setPerfil(perfil); // Establecer el perfil en el estado
        }
      } catch (error) {
        console.error("Error al cargar el perfil desde AsyncStorage:", error);
      }
    };

    cargarPerfil();
  }, []);

  // Efecto para cargar los correos desde AsyncStorage
  useEffect(() => {
    const cargarCorreos = async () => {
      try {
        const idOrganizador = await AsyncStorage.getItem("idOrganizador");
        const idUsuario = await AsyncStorage.getItem("idUsuario");
        const idProveedor = await AsyncStorage.getItem("idProveedor");

        setIdOrganizador(idOrganizador); // Establecer el ID del organizador en el estado
        setIdUsuario(idUsuario); // Establecer el ID del usuario en el estado
        setIdProveedor(idProveedor); // Establecer el ID del proveedor en el estado
      } catch (error) {
        console.error("Error al cargar correos desde AsyncStorage:", error);
      }
    };

    cargarCorreos();
  }, []);

  // Función para cargar los eventos desde la API
  const cargarEventos = async () => {
    try {
      const response = await axios.get(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/evento"
      ); // Petición GET para obtener eventos
      const eventos = response.data;

      // Filtrar los eventos por el correo registrado en el perfil
      if (perfil) {
        const eventosFiltrados = eventos.filter(
          (evento) =>
            evento.idOrganizador === perfil.correo ||
            evento.idProveedor === perfil.correo ||
            evento.idUsuario === perfil.correo
        );

        setEventos(eventosFiltrados); // Establecer los eventos filtrados en el estado
      }
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
    }
  };

  // Efecto para cargar los eventos cada vez que el perfil cambie
  useEffect(() => {
    cargarEventos();
  }, [perfil]);

  // Función para guardar un nuevo evento
  const handleSaveEvento = async () => {
    try {
      const nuevoEvento = { ...eventoDetalles, idOrganizador, idUsuario };
      await axios.post(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/evento",
        nuevoEvento
      ); // Petición POST para guardar un nuevo evento

      alert("Detalles del evento guardados correctamente");
      cargarEventos(); // Actualizar la lista de eventos después de agregar uno nuevo
      navigation.navigate("Eventos"); // Navegar a la vista de eventos guardados
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Error al guardar el evento");
    }
  };

  // Función para seleccionar un evento y agregar un proveedor
  const handleSelectEvent = async (idEvento) => {
    try {
      // Actualizar el evento con el idProveedor
      await axios.put(
        `https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/evento/${idEvento}`,
        {
          idProveedor,
        }
      );
      alert("Proveedor agregado al evento correctamente");
      cargarEventos(); // Actualizar la lista de eventos después de agregar un proveedor
      navigation.navigate("Eventos"); // Navegar a la vista de eventos guardados
    } catch (error) {
      console.error("Error al agregar proveedor al evento:", error);
      alert("Error al agregar proveedor al evento");
    }
  };

  // Función para eliminar un evento
  const handleDeleteEvento = async (idEvento) => {
    try {
      await axios.delete(
        `https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/evento/${idEvento}`
      ); // Petición DELETE para eliminar un evento
      setEventos(eventos.filter((evento) => evento.id !== idEvento)); // Filtrar el evento eliminado de la lista de eventos
      alert("Evento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Error al eliminar el evento");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isNewEvent && (
        <>
          <Text style={styles.title}>Detalles del Evento</Text>
          <TextInput
            style={styles.input}
            placeholder="Estado"
            value={eventoDetalles.estado}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, estado: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha"
            value={eventoDetalles.fecha}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, fecha: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Hora"
            value={eventoDetalles.hora}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, hora: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={eventoDetalles.precio}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, precio: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Tipo de Evento"
            value={eventoDetalles.tipoEvento}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, tipoEvento: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            value={eventoDetalles.ubicacion}
            onChangeText={(text) =>
              setEventoDetalles({ ...eventoDetalles, ubicacion: text })
            }
          />
          <Button title="Guardar Evento" onPress={handleSaveEvento} />
        </>
      )}
      {isSelectingEvent && (
        <>
          <Text style={styles.title}>
            Seleccionar Evento para Agregar Proveedor
          </Text>
          {eventos.length > 0 ? (
            eventos.map((evento, index) => (
              <View key={index} style={styles.eventCard}>
                <Text>Estado: {evento.estado}</Text>
                <Text>Fecha: {evento.fecha}</Text>
                <Text>Hora: {evento.hora}</Text>
                <Text>ID Organizador: {evento.idOrganizador}</Text>
                <Text>ID Proveedor: {evento.idProveedor}</Text>
                <Text>ID Usuario: {evento.idUsuario}</Text>
                <Text>Precio: {evento.precio}</Text>
                <Text>Tipo de Evento: {evento.tipoEvento}</Text>
                <Text>Ubicación: {evento.ubicacion}</Text>
                <Button
                  title="Seleccionar"
                  onPress={() => handleSelectEvent(evento.id)}
                />
              </View>
            ))
          ) : (
            <Text>No hay eventos disponibles</Text>
          )}
        </>
      )}

      {!isNewEvent && !isSelectingEvent && (
        <>
          <Text style={styles.title}>Eventos Guardados</Text>
          {eventos.length > 0 ? (
            eventos.map((evento, index) => (
              <View key={index} style={styles.eventCard}>
                <Text>Estado: {evento.estado}</Text>
                <Text>Fecha: {evento.fecha}</Text>
                <Text>Hora: {evento.hora}</Text>
                <Text>ID Organizador: {evento.idOrganizador}</Text>
                <Text>ID Proveedor: {evento.idProveedor}</Text>
                <Text>ID Usuario: {evento.idUsuario}</Text>
                <Text>Precio: {evento.precio}</Text>
                <Text>Tipo de Evento: {evento.tipoEvento}</Text>
                <Text>Ubicación: {evento.ubicacion}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEvento(evento.id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>No hay eventos disponibles</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
