import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- CAPA DE SERVICIO (API) ---
import { BaseDeDatosLocal } from '../memoria';

const API_REGISTRO_URL = 'https://agendapp-backend-djml.onrender.com/api/auth/register/';

const apiRegistrarCliente = async (datosUsuario) => {
  try {
    const respuesta = await fetch(API_REGISTRO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enviamos el objeto con nombre, apellido, correo, password y rol
      body: JSON.stringify(datosUsuario) 
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      return { status: 'success' };
    } else {
      // Si Django rechaza la petición (ej. el correo ya existe), lanzamos el error
      throw new Error(data.detail || data.correo?.[0] || 'Error al registrar usuario en el servidor.');
    }
  } catch (error) {
    return Promise.reject(error.message || 'Error de conexión con el servidor.');
  }
};
// --- FIN DE LA CAPA DE SERVICIO ---

export default function RegistroScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleRegistro = async () => {
    // 1. Validar que no haya campos vacíos
    if (!nombre || !apellido || !correo || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    // 2. NUEVO: Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido (ejemplo@correo.com).');
      return;
    }

    // 3. Validar seguridad de la contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Seguridad', 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un número.');
      return;
    }

    // 4. Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      nombre: nombre,
      apellido: apellido,
      correo: correo.toLowerCase(),
      password: password,
      rol: 'CLIENTE'
    };

    try {
      const respuesta = await apiRegistrarCliente(payload);
      setIsSubmitting(false);

      if (respuesta.status === 'success') {
        Alert.alert(
          '¡Cuenta Creada!', 
          'Tu registro se ha completado. Ahora puedes iniciar sesión.',
          [{ text: 'Ir al Login', onPress: () => router.replace('/') }]
        );
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', error); // Aquí mostramos si el correo ya existe
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a AgendApp para reservar tus servicios.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} placeholder="Ej. Juan" value={nombre} onChangeText={setNombre} />

          <Text style={styles.label}>Apellido</Text>
          <TextInput style={styles.input} placeholder="Ej. Pérez" value={apellido} onChangeText={setApellido} />

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />

          
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" secureTextEntry value={password} onChangeText={setPassword} />
          
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: -10, marginBottom: 16 }}>
            Debe contener al menos 8 caracteres, 1 mayúscula y 1 número.
          </Text>

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput style={styles.input} placeholder="Repite tu contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

          <TouchableOpacity 
            style={[styles.btnRegistrar, isSubmitting && styles.btnDisabled]} 
            onPress={handleRegistro}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnRegistrarText}>Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.replace('/')} disabled={isSubmitting}>
            <Text style={styles.linkText}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f6f8', padding: 20, justifyContent: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  form: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#f8fafc', fontSize: 15 },
  btnRegistrar: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnDisabled: { backgroundColor: '#94a3b8' },
  btnRegistrarText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748b', fontSize: 15 },
  linkText: { color: '#0066cc', fontSize: 15, fontWeight: 'bold' }
});