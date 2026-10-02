import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="registro" options={{ title: 'Registro de Usuario' }} />
      <Stack.Screen name="catalogo" options={{ title: 'Catálogo de Servicios' }} />
      <Stack.Screen name="reserva" options={{ title: 'Agendar Hora' }} />
      <Stack.Screen name="miscitas" options={{ title: 'Historial de Citas' }}/>
      <Stack.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
    </Stack>
  );
}