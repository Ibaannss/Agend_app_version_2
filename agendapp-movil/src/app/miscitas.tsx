import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseDeDatosLocal } from '../memoria';

const API_URL = 'https://agendapp-backend-djml.onrender.com/api';

export default function MisCitasScreen() {
    const [citas, setCitas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const usuarioActual = BaseDeDatosLocal.usuarioActivo;
    const clienteId = usuarioActual?.id_usuario || usuarioActual?.id;

    const cargarMisCitas = async () => {
        if (!clienteId) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/citas/?cliente=${clienteId}`);
            const data = await response.json();
            if (response.ok) {
                setCitas(data);
            }
        } catch (error) {
            console.error("Error al cargar citas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarMisCitas();
        }, [])
    );

    const cancelarCita = (idCita) => {
        Alert.alert('Cancelar Cita', '¿Deseas anular esta reserva de forma permanente?', [
            { text: 'Mantener', style: 'cancel' },
            { 
                text: 'Sí, cancelar', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await fetch(`${API_URL}/citas/${idCita}/cancelar/?cliente=${clienteId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        if (response.ok) {
                            Alert.alert('Éxito', 'Tu cita ha sido anulada.');
                            cargarMisCitas(); // Recargar lista
                        } else {
                            Alert.alert('Error', 'No se pudo cancelar la cita.');
                        }
                    } catch (error) {
                        Alert.alert('Error', 'Error de conexión con el servidor.');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => {
        let colorEstado = item.estado === 'CONFIRMADA' ? '#22c55e' : item.estado === 'CANCELADA' ? '#ef4444' : '#64748b';

        // Formatear fecha y hora desde el datetime de Django
        const fechaObj = new Date(item.fecha_hora_inicio);
        const fechaFormateada = !isNaN(fechaObj) ? fechaObj.toLocaleDateString() : 'Fecha por definir';
        const horaFormateada = !isNaN(fechaObj) ? fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                        {item.nombre_servicio || item.servicio?.nombre || item.servicio_nombre || `Servicio #${item.id_servicio}`}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: colorEstado }]}>
                        <Text style={styles.badgeText}>{item.estado}</Text>
                    </View>
                </View>
                <View style={styles.detalleContainer}>
                    <Text style={styles.textoDetalle}>📅 Fecha: <Text style={styles.textoFuerte}>{fechaFormateada}</Text></Text>
                    <Text style={styles.textoDetalle}>⏰ Hora: <Text style={styles.textoFuerte}>{horaFormateada}</Text></Text>
                </View>
                {item.estado === 'CONFIRMADA' && (
                    <TouchableOpacity style={styles.btnCancelar} onPress={() => cancelarCita(item.id_cita)}>
                        <Text style={styles.btnCancelarText}>Cancelar Reserva</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Cargando tus citas...</Text>
                </View>
            ) : citas.length === 0 ? (
                <Text style={styles.emptyText}>No tienes citas registradas.</Text>
            ) : (
                <FlatList data={citas} keyExtractor={(item) => item.id_cita.toString()} renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    listContainer: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#64748b' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b', fontSize: 16 },
    card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
    detalleContainer: { marginBottom: 10 },
    textoDetalle: { fontSize: 14, color: '#64748b', marginBottom: 4 },
    textoFuerte: { color: '#334155', fontWeight: 'bold' },
    btnCancelar: { marginTop: 12, borderWidth: 1, borderColor: '#ef4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    btnCancelarText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 }
});