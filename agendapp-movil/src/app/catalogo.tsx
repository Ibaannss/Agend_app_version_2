import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SERVICIOS_REALES = [
    { id_servicio: 1, nombre: 'Corte de Cabello', duracion_min: 30, precio: '$15.000', descripcion: 'Corte masculino o femenino', sucursal: 'Sucursal Centro' },
    { id_servicio: 2, nombre: 'Corte + Barba', duracion_min: 45, precio: '$22.000', descripcion: 'Corte de cabello y perfilado de barba', sucursal: 'Sucursal Centro' },
    { id_servicio: 3, nombre: 'Tinte de Cabello', duracion_min: 90, precio: '$45.000', descripcion: 'Tinte completo con productos premium', sucursal: 'Sucursal Centro' },
    { id_servicio: 4, nombre: 'Manicure', duracion_min: 30, precio: '$12.000', descripcion: 'Manicure clásico con esmaltado', sucursal: 'Sucursal Centro' },
    { id_servicio: 5, nombre: 'Pedicure', duracion_min: 45, precio: '$16.000', descripcion: 'Pedicure spa con hidratación', sucursal: 'Sucursal Providencia' },
    { id_servicio: 6, nombre: 'Lavado + Peinado', duracion_min: 30, precio: '$10.000', descripcion: 'Lavado y peinado de salón', sucursal: 'Sucursal Providencia' },
];

export default function CatalogoScreen() {
    const router = useRouter();
    
    const agendarServicio = (item) => {
        router.push({
            pathname: '/reserva',
            params: { 
                id_servicio: item.id_servicio,
                nombre: item.nombre
            }
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardPrice}>{item.precio}</Text>
            </View>
    
            <Text style={styles.cardDescription}>{item.descripcion}</Text>
    
            <View style={styles.cardFooter}>
                <Text style={styles.cardDuration}>⏱ {item.duracion_min} min</Text>
                <Text style={styles.cardLocation}>📍 {item.sucursal}</Text>
            </View>
    
            <TouchableOpacity 
                style={styles.button}
                onPress={() => agendarServicio(item)}
            >
                <Text style={styles.buttonText}>Agendar ahora</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.btnMisCitas} 
                onPress={() => router.push('/perfil')}
            >
                <Text style={styles.btnMisCitasText}>👤 Ir a mi Perfil</Text>
            </TouchableOpacity>

            <FlatList
                data={SERVICIOS_REALES}
                keyExtractor={(item) => item.id_servicio.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    listContainer: { padding: 16 },
    card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1 },
    cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#22c55e', marginLeft: 10 },
    cardDescription: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    cardDuration: { fontSize: 13, color: '#3b82f6', fontWeight: '500' },
    cardLocation: { fontSize: 13, color: '#94a3b8' },
    button: { backgroundColor: '#0066cc', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
    btnMisCitas: { backgroundColor: '#0f172a', margin: 16, marginBottom: 0, padding: 14, borderRadius: 8, alignItems: 'center' },
    btnMisCitasText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 }
});