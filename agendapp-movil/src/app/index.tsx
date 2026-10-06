import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BaseDeDatosLocal } from '../memoria';

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [darkMode, setDarkMode] = useState(false); // Estado para el modo oscuro opcional

  const API_LOGIN_URL = 'https://agendapp-backend-djml.onrender.com/api/auth/login/';

  const ejecutarLogin = async () => {
    if (!correo || !clave) {
      Alert.alert('Atención', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      const respuesta = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo.toLowerCase(),
          password: clave
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // Imprime la respuesta completa para ver exactamente cómo Django nombra al token
        console.log("RESPUESTA COMPLETA DE DJANGO:", data);

        // Atrapa el token usando los nombres más comunes de DRF/SimpleJWT/Knox
        const tokenReal = data.access || data.token || data.access_token;
        
        BaseDeDatosLocal.usuarioActivo = data.usuario || { correo: correo, rol: 'CLIENTE', nombre: 'Usuario' };
        BaseDeDatosLocal.token = tokenReal;
        
        console.log("TOKEN GUARDADO EN MEMORIA:", tokenReal);
        
        router.replace('/catalogo');
      } else {
        Alert.alert('Acceso Denegado', 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo contactar al servidor. Verifica tu conexión.');
    }
  };

  // Dinámica de colores según el modo oscuro
  const themeStyles = darkMode ? darkStyles : lightStyles;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, themeStyles.container]}>
      
      {/* Botón flotante superior para alternar el Modo Oscuro */}
      <TouchableOpacity 
        style={styles.toggleThemeBtn} 
        onPress={() => setDarkMode(!darkMode)}
      >
        <Text style={styles.toggleThemeText}>{darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</Text>
      </TouchableOpacity>

      <View style={[styles.loginBox, themeStyles.loginBox]}>
        <Text style={styles.title}>AgendApp</Text>
        <Text style={[styles.subtitle, themeStyles.subtitle]}>Inicia sesión para continuar</Text>

        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Correo electrónico"
          placeholderTextColor={darkMode ? '#94a3b8' : '#64748b'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />
        
        {/* Campo de contraseña con color de texto contrastado y visible */}
        <TextInput
          style={[styles.input, themeStyles.input, { color: darkMode ? '#ffffff' : '#0f172a' }]}
          placeholder="Contraseña"
          placeholderTextColor={darkMode ? '#94a3b8' : '#64748b'}
          secureTextEntry
          value={clave}
          onChangeText={setClave}
        />

        <TouchableOpacity style={styles.button} onPress={ejecutarLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={[styles.footerText, themeStyles.footerText]}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={{ color: '#0066cc', fontSize: 15, fontWeight: 'bold' }}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  loginBox: { padding: 30, borderRadius: 16, elevation: 4 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0066cc', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#0066cc', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  toggleThemeBtn: { position: 'absolute', top: 50, right: 20, padding: 8, backgroundColor: '#e2e8f0', borderRadius: 8 },
  toggleThemeText: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  footerText: { fontSize: 15 }
});

// Estilos específicos para el Modo Claro
const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f8fafc' },
  loginBox: { backgroundColor: '#ffffff' },
  subtitle: { color: '#64748b' },
  input: { borderColor: '#cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a' },
  footerText: { color: '#64748b' }
});

// Estilos específicos para el Modo Oscuro
const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#0f172a' },
  loginBox: { backgroundColor: '#1e293b' },
  subtitle: { color: '#94a3b8' },
  input: { borderColor: '#334155', backgroundColor: '#0f172a', color: '#ffffff' },
  footerText: { color: '#94a3b8' }
});