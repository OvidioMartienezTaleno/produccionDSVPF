import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Componente principal para manejar proveedores
function Proveedor() {
  // Estado para almacenar la lista de proveedores
  const [proveedores, setProveedores] = useState([]);
  // Estado para almacenar el proveedor seleccionado
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const navigation = useNavigation();

  // useEffect para obtener la lista de proveedores desde la API cuando el componente se monta
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axios.get(
          "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/proveedor"
        );
        setProveedores(response.data); // Actualizar el estado con los datos obtenidos
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };

    fetchProveedores();
  }, []);

  // Función para manejar la selección de un proveedor
  const handleSelectProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
  };

  // Función para navegar a la pantalla de mensajes con el proveedor seleccionado
  const handleSendMessage = () => {
    if (selectedProveedor) {
      navigation.navigate("Mensaje", { chatId: selectedProveedor.correo });
    }
  };

  // Función para manejar el contrato con el proveedor seleccionado
  const handleContract = async () => {
    if (selectedProveedor) {
      try {
        // Guardar el correo del proveedor en AsyncStorage
        await AsyncStorage.setItem("idProveedor", selectedProveedor.correo);
        // Navegar a la vista de Eventos para seleccionar uno
        navigation.navigate("Eventos", { isSelectingEvent: true });
      } catch (error) {
        console.error("Error al guardar idProveedor en AsyncStorage:", error);
      }
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
    >
      {selectedProveedor ? (
        <View style={styles.profileContainer}>
          <Text style={styles.profileTitle}>Perfil del Proveedor</Text>
          <Text>Nombre: {selectedProveedor.nombre}</Text>
          <Text>Teléfono: {selectedProveedor.telefono}</Text>
          <Text>Correo: {selectedProveedor.correo}</Text>
          <Text>Ubicación: {selectedProveedor.ubicacion}</Text>
          <Text>Servicios:</Text>
          {/* Mapear los servicios del proveedor seleccionado */}
          {selectedProveedor.servicios.map((servicio, index) => (
            <Text key={index} style={styles.servicioItem}>
              - {servicio}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedProveedor(null)}
          >
            <Text style={styles.backButtonText}>Volver a la lista</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.buttonText}>Mensaje</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contractButton}
            onPress={handleContract}
          >
            <Text style={styles.buttonText}>Contratar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Lista de Proveedores</Text>
          {/* Mapear la lista de proveedores para mostrar cada uno en una tarjeta */}
          {proveedores.map((proveedor, index) => (
            <TouchableOpacity
              key={index}
              style={styles.userCard}
              onPress={() => handleSelectProveedor(proveedor)}
            >
              <Text>Nombre: {proveedor.nombre}</Text>
              <Text>Teléfono: {proveedor.telefono}</Text>
              <Text>Correo: {proveedor.correo}</Text>
              <Text>Ubicación: {proveedor.ubicacion}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// Componente para renderizar la pantalla principal de proveedores
export default function ProveedorScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.container}>
        <Proveedor />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  servicioItem: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  messageButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
  },
  contractButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ffc107",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
