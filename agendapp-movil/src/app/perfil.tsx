import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseDeDatosLocal } from '../memoria';

export default function PerfilScreen() {
  const router = useRouter();

  // Leemos el usuario activo real desde nuestra memoria global
  const usuarioActivo = BaseDeDatosLocal.usuarioActivo || {
    nombre: "Usuario", apellido: "Desconocido", correo: "sin@correo.com", rol: "GUEST"
  };

  const confirmarCierreSesion = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sí, salir', 
        style: 'destructive',
        onPress: () => {
          // Limpiamos la sesión al salir
          BaseDeDatosLocal.usuarioActivo = null;
          router.replace('/');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuarioActivo.nombre.charAt(0).toUpperCase()}{usuarioActivo.apellido.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nameText}>{usuarioActivo.nombre} {usuarioActivo.apellido}</Text>
        <Text style={styles.emailText}>{usuarioActivo.correo}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{usuarioActivo.rol}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/miscitas')}>
          <Text style={styles.menuButtonText}>📅 Ver mi historial de citas</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/catalogo')}>
          <Text style={styles.menuButtonText}>✂️ Agendar nuevo servicio</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmarCierreSesion}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', elevation: 3, marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0066cc', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, color: '#ffffff', fontWeight: 'bold' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  emailText: { fontSize: 15, color: '#64748b', marginBottom: 12 },
  badge: { backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  menuContainer: { backgroundColor: '#ffffff', borderRadius: 16, elevation: 2, overflow: 'hidden', marginBottom: 30 },
  menuButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuButtonText: { fontSize: 16, color: '#334155', fontWeight: '500' },
  arrow: { fontSize: 20, color: '#cbd5e1' },
  logoutButton: { backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f87171' },
  logoutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});