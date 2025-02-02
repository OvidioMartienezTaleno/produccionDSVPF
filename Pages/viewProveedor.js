import React, { useState, useEffect } from "react";
import {
  Button,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import OrganizadorScreen from "./Organizador";
import MensajeScreen from "./Mensaje";
import EventosScreen from "./Eventos";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar la lista de usuarios
  const [perfil, setPerfil] = useState(null); // Estado para almacenar el perfil del usuario
  const [servicio, setServicio] = useState(""); // Estado para el nuevo servicio a agregar
  const [servicios, setServicios] = useState([]); // Estado para almacenar la lista de servicios del usuario

  // Efecto para cargar el perfil desde AsyncStorage cuando el componente se monta
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfilGuardado = await AsyncStorage.getItem("perfil");
        if (perfilGuardado !== null) {
          setPerfil(JSON.parse(perfilGuardado)); // Actualizar el estado con el perfil guardado
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };

    cargarPerfil();
  }, []);

  // Efecto para obtener la lista de usuarios desde la API cuando el componente se monta
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(
          "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/proveedor"
        );
        setUsuarios(response.data); // Actualizar el estado con los datos obtenidos
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsuarios();
  }, []);

  // Efecto para filtrar y establecer los servicios del usuario en el estado
  useEffect(() => {
    if (perfil?.correo) {
      const usuarioFiltrado = usuarios.find(
        (usuario) => usuario.correo === perfil.correo
      );
      if (usuarioFiltrado) {
        setServicios(usuarioFiltrado.servicios || []); // Actualizar el estado con los servicios del usuario filtrado
      }
    }
  }, [usuarios, perfil]);

  // Función para manejar la adición de un nuevo servicio
  const handleAddService = async () => {
    if (servicio.trim() === "") {
      Alert.alert("Error", "Por favor, introduce un servicio válido.");
      return;
    }

    try {
      const response = await axios.post(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/servicios",
        {
          correo: perfil.correo,
          servicio,
        }
      );

      if (response.status === 201) {
        Alert.alert("Éxito", "Servicio agregado correctamente.");
        setServicios([...servicios, servicio]); // Actualizar la lista de servicios en el estado
        setServicio(""); // Limpiar el campo de texto
      } else {
        Alert.alert("Error", "No se pudo agregar el servicio.");
      }
    } catch (error) {
      console.error("Error al agregar el servicio:", error);
      Alert.alert("Error", "Ocurrió un error al agregar el servicio.");
    }
  };

  // Filtrar el usuario correspondiente al perfil cargado
  const usuarioFiltrado = usuarios.find(
    (usuario) => usuario.correo === perfil?.correo
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil de Usuario (Proveedor)</Text>
      {/* Mostrar los detalles del perfil del usuario */}
      {usuarioFiltrado ? (
        <View style={styles.userCard}>
          <Text>Nombre: {usuarioFiltrado.nombre}</Text>
          <Text>Teléfono: {usuarioFiltrado.telefono}</Text>
          <Text>Correo: {usuarioFiltrado.correo}</Text>
          <Text>Ubicación: {usuarioFiltrado.ubicacion}</Text>
          <Text>Servicios:</Text>
          {/* Mapear la lista de servicios del usuario */}
          {servicios.map((serv, index) => (
            <Text key={index}>- {serv}</Text>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Nuevo Servicio"
            value={servicio}
            onChangeText={setServicio}
          />
          <Button title="Agregar Servicio" onPress={handleAddService} />
        </View>
      ) : (
        <Text>Cargando perfil...</Text>
      )}
    </ScrollView>
  );
}

// Componente principal para manejar la navegación entre pantallas
export default function ViewProveedor() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "Página Principal",
          headerStyle: {
            backgroundColor: "#6200ea",
          },
          headerTintColor: "#fff",
          headerLeft: () => null,
          // Botones para navegar a diferentes pantallas
          headerRight: () => (
            <>
              <Button
                title="Eve"
                onPress={() => navigation.navigate("Eventos")}
              />
              <Button
                title="Org"
                onPress={() => navigation.navigate("Organizadores")}
              />
              <Button
                title="Men"
                onPress={() => navigation.navigate("Mensajes")}
              />
            </>
          ),
        })}
      />

      <Stack.Screen
        name="Eventos"
        component={EventosScreen}
        options={({ navigation }) => ({
          title: "Eventos",
          headerStyle: {
            backgroundColor: "#6200ea",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <>
              <Button
                title="Home"
                onPress={() => navigation.navigate("Home")}
              />
              <Button
                title="Org"
                onPress={() => navigation.navigate("Organizadores")}
              />
              <Button
                title="Men"
                onPress={() => navigation.navigate("Mensajes")}
              />
            </>
          ),
        })}
      />

      <Stack.Screen
        name="Organizadores"
        component={OrganizadorScreen}
        options={({ navigation }) => ({
          title: "Organizadores",
          headerStyle: {
            backgroundColor: "#6200ea",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <>
              <Button
                title="Home"
                onPress={() => navigation.navigate("Home")}
              />
              <Button
                title="Eve"
                onPress={() => navigation.navigate("Eventos")}
              />
              <Button
                title="Men"
                onPress={() => navigation.navigate("Mensajes")}
              />
            </>
          ),
        })}
      />
      <Stack.Screen
        name="Mensajes"
        component={MensajeScreen}
        options={({ navigation }) => ({
          title: "Mensajes",
          headerStyle: {
            backgroundColor: "#6200ea",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <>
              <Button
                title="Home"
                onPress={() => navigation.navigate("Home")}
              />
              <Button
                title="Eve"
                onPress={() => navigation.navigate("Eventos")}
              />
              <Button
                title="Org"
                onPress={() => navigation.navigate("Organizadores")}
              />
            </>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    width: "100%",
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
