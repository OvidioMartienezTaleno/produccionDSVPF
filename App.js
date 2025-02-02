import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import { Picker } from "@react-native-picker/picker"; // Importar Picker desde @react-native-picker/picker
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage

import ViewCliente from "./Pages/viewCliente";
import ViewProveedor from "./Pages/viewProveedor"; // Importar la pantalla de proveedor
import ViewOrganizador from "./Pages/viewOrganizador"; // Importar la pantalla de organizador
import MensajeScreen from "./Pages/Mensaje"; // Asegúrate de actualizar la ruta
import OrganizadorScreen from "./Pages/Organizador"; // Asegúrate de actualizar la ruta
import EventosScreen from "./Pages/Eventos"; // Importar la pantalla de eventos

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [accountType, setAccountType] = useState("Cliente"); // Estado para el tipo de cuenta
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Función para guardar el perfil en AsyncStorage
  const saveProfile = async (profile) => {
    try {
      await AsyncStorage.setItem("perfil", JSON.stringify(profile));
      console.log("Perfil guardado en AsyncStorage");
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
    }
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    let usuarioEncontrado = null;
    let tipoUsuario = "";

    try {
      // Verificar en usuarios
      let response = await axios.get(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/usuarios"
      );
      let usuarios = response.data;
      usuarioEncontrado = usuarios.find(
        (user) => user.correo === email && user.password === password
      );
      if (usuarioEncontrado) tipoUsuario = "Cliente";

      if (!usuarioEncontrado) {
        // Verificar en organizadores
        response = await axios.get(
          "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/organizador"
        );
        let organizadores = response.data;
        usuarioEncontrado = organizadores.find(
          (user) => user.correo === email && user.password === password
        );
        if (usuarioEncontrado) tipoUsuario = "Organizador";
      }

      if (!usuarioEncontrado) {
        // Verificar en proveedores
        response = await axios.get(
          "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/proveedor"
        );
        let proveedores = response.data;
        usuarioEncontrado = proveedores.find(
          (user) => user.correo === email && user.password === password
        );
        if (usuarioEncontrado) tipoUsuario = "Proveedor";
      }

      if (usuarioEncontrado) {
        alert("Inicio de sesión exitoso");
        await saveProfile({ nombre: usuarioEncontrado.nombre, correo: email });
        switch (tipoUsuario) {
          case "Cliente":
            navigation.navigate("Cliente", { userEmail: email });
            break;
          case "Organizador":
            navigation.navigate("OrganizadorView", { userEmail: email });
            break;
          case "Proveedor":
            navigation.navigate("ProveedorView", { userEmail: email });
            break;
          default:
            alert("Tipo de cuenta desconocido: " + tipoUsuario);
        }
      } else {
        alert("Correo o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión");
    }
  };

  // Función para verificar si el correo ya existe en la base de datos
  const verificarCorreoExistente = async (correo) => {
    try {
      // Verificar en usuarios
      const usuariosResponse = await axios.get(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/usuarios"
      );
      const usuarios = usuariosResponse.data;
      if (usuarios.some((user) => user.correo === correo)) {
        return true;
      }

      // Verificar en organizadores
      const organizadoresResponse = await axios.get(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/organizador"
      );
      const organizadores = organizadoresResponse.data;
      if (organizadores.some((user) => user.correo === correo)) {
        return true;
      }

      // Verificar en proveedores
      const proveedoresResponse = await axios.get(
        "https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/proveedor"
      );
      const proveedores = proveedoresResponse.data;
      if (proveedores.some((user) => user.correo === correo)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      alert("Error al verificar el correo");
      return false;
    }
  };

  // Función para manejar la creación de una nueva cuenta
  const handleCreateAccount = async () => {
    const correoExistente = await verificarCorreoExistente(email);
    if (correoExistente) {
      alert("Este correo ya está registrado.");
      return;
    }

    const nuevoUsuario = {
      nombre: nombreCompleto,
      correo: email,
      password: password,
      ubicacion: ubicacion,
      telefono: telefono,
      tipo: accountType,
    };

    try {
      const createResponse = await axios.post(
        `https://vyh328h455.execute-api.us-east-1.amazonaws.com/v1/${accountType.toLowerCase()}`,
        nuevoUsuario
      );

      if (createResponse.status === 201) {
        alert("Cuenta creada exitosamente");
        await saveProfile({ nombre: nombreCompleto, correo: email });
        setIsCreatingAccount(false);
        switch (accountType) {
          case "Cliente":
            navigation.navigate("Cliente", { userEmail: email });
            break;
          case "Organizador":
            navigation.navigate("OrganizadorView", { userEmail: email });
            break;
          case "Proveedor":
            navigation.navigate("ProveedorView", { userEmail: email });
            break;
          default:
            alert("Tipo de cuenta desconocido");
        }
      } else {
        alert("Error al crear la cuenta");
      }
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      alert("Error al crear la cuenta");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isCreatingAccount ? "Crear Cuenta" : "Inicio de Sesión"}
      </Text>

      {isCreatingAccount && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
          />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            value={ubicacion}
            onChangeText={setUbicacion}
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <Picker
            selectedValue={accountType}
            style={styles.input}
            onValueChange={(itemValue) => setAccountType(itemValue)}
          >
            <Picker.Item label="Cliente" value="Cliente" />
            <Picker.Item label="Organizador" value="Organizador" />
            <Picker.Item label="Proveedor" value="Proveedor" />
          </Picker>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={isCreatingAccount ? handleCreateAccount : handleLogin}
      >
        <Text style={styles.buttonText}>
          {isCreatingAccount ? "Crear Cuenta" : "Iniciar Sesión"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => setIsCreatingAccount(!isCreatingAccount)}
      >
        <Text style={styles.linkText}>
          {isCreatingAccount
            ? "¿Ya tienes cuenta? Iniciar Sesión"
            : "¿No tienes cuenta? Crear Cuenta"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Inicio" }}
        />
        <Stack.Screen
          name="Cliente"
          component={ViewCliente}
          options={{ title: "Vista Cliente" }}
        />
        <Stack.Screen
          name="Organizador"
          component={OrganizadorScreen}
          options={{ title: "Organizador" }}
        />
        <Stack.Screen
          name="Mensaje"
          component={MensajeScreen}
          options={{ title: "Mensajes" }}
        />
        <Stack.Screen
          name="OrganizadorView"
          component={ViewOrganizador}
          options={{ title: "Vista Organizador" }}
        />
        <Stack.Screen
          name="ProveedorView"
          component={ViewProveedor}
          options={{ title: "Vista Proveedor" }}
        />
        <Stack.Screen
          name="Eventos"
          component={EventosScreen}
          options={{ title: "Eventos" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: "#007bff",
    fontSize: 16,
  },
});
