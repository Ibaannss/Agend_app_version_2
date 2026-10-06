import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CatalogoScreen() {
    const router = useRouter();
    const [todosLosServicios, setTodosLosServicios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

    // Nuevos estados para el Modal y Buscador
    const [modalVisible, setModalVisible] = useState(false);
    const [textoBusqueda, setTextoBusqueda] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Cargar Sucursales
                const resSucursales = await fetch('https://agendapp-backend-djml.onrender.com/api/catalogos/sucursales/');
                if (resSucursales.ok) {
                    const dataSucursales = await resSucursales.json();
                    const listaSucursales = Array.isArray(dataSucursales) ? dataSucursales : (dataSucursales.results || []);
                    setSucursales(listaSucursales);
                    
                    if (listaSucursales.length > 0) {
                        setSucursalSeleccionada(listaSucursales[0]);
                    }
                }

                // 2. Cargar Todos los Servicios
                const resServicios = await fetch('https://agendapp-backend-djml.onrender.com/api/catalogos/servicios/');
                if (resServicios.ok) {
                    const dataServicios = await resServicios.json();
                    setTodosLosServicios(Array.isArray(dataServicios) ? dataServicios : (dataServicios.results || []));
                }
            } catch (error) {
                console.error("Error al cargar datos del catálogo:", error);
            }
        };
        cargarDatos();
    }, []);

    // 3. Filtrado Inteligente de Sucursales (Buscador del Modal)
    const sucursalesFiltradas = sucursales.filter(suc => {
        if (!textoBusqueda) return true;
        
        const query = textoBusqueda.toLowerCase();
        const nombre = (suc.nombre || suc.nombre_comercial || '').toLowerCase();
        const direccion = (suc.direccion || '').toLowerCase();
        
        // Cruzar búsqueda con los servicios que ofrece la sucursal
        const idSuc = suc.id_sucursal ?? suc.id;
        const serviciosDeSucursal = todosLosServicios.filter(s => {
            const sIdSucursal = s.id_sucursal?.id_sucursal ?? s.id_sucursal ?? s.id_sucursal_id;
            return sIdSucursal === idSuc;
        });
        
        const coincideServicio = serviciosDeSucursal.some(s => 
            (s.nombre || '').toLowerCase().includes(query) || 
            (s.descripcion || '').toLowerCase().includes(query)
        );

        // Si coincide nombre, dirección o algún servicio, se muestra
        return nombre.includes(query) || direccion.includes(query) || coincideServicio;
    });

    // 4. Filtrar servicios para la vista principal según la sucursal seleccionada
    const serviciosFiltrados = todosLosServicios.filter(item => {
        if (!sucursalSeleccionada) return true;
        const idSucursalServicio = item.id_sucursal?.id_sucursal ?? item.id_sucursal ?? item.id_sucursal_id;
        return idSucursalServicio === (sucursalSeleccionada.id_sucursal ?? sucursalSeleccionada.id);
    });

    const agendarServicio = (item) => {
            router.push({
                pathname: '/reserva',
                params: { 
                    id_servicio: item.id_servicio ?? item.id,
                    nombre: item.nombre,
                    // Pasamos la sucursal para bloquear profesionales de otros locales
                    id_sucursal: item.id_sucursal?.id_sucursal ?? item.id_sucursal ?? item.id_sucursal_id 
                }
            });
        };

    const renderServicio = ({ item }) => {
        const precioFormateado = '$' + parseInt(item.precio || item.precio_base || 0).toLocaleString('es-CL');
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    <Text style={styles.cardPrice}>{precioFormateado}</Text>
                </View>
                <Text style={styles.cardDescription}>{item.descripcion}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.cardDuration}>⏱ {item.duracion_minutos || item.duracion_min || 30} min</Text>
                    <Text style={styles.cardLocation}>📍 {sucursalSeleccionada?.nombre || sucursalSeleccionada?.nombre_comercial || 'Sucursal'}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => agendarServicio(item)}>
                    <Text style={styles.buttonText}>Agendar ahora</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderSucursalModal = ({ item }) => {
        const id = item.id_sucursal ?? item.id;
        const isSelected = sucursalSeleccionada && (sucursalSeleccionada.id_sucursal ?? sucursalSeleccionada.id) === id;
        return (
            <TouchableOpacity 
                style={[styles.sucursalItem, isSelected && styles.sucursalItemSelected]}
                onPress={() => {
                    setSucursalSeleccionada(item);
                    setModalVisible(false);
                    setTextoBusqueda(''); // Limpiar búsqueda al seleccionar
                }}
            >
                <Text style={[styles.sucursalNombre, isSelected && styles.sucursalTextoSelected]}>
                    {item.nombre || item.nombre_comercial || `Sucursal #${id}`}
                </Text>
                <Text style={[styles.sucursalDireccion, isSelected && styles.sucursalTextoSelected]}>
                    📍 {item.direccion || 'Dirección no registrada'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btnMisCitas} onPress={() => router.push('/perfil')}>
                <Text style={styles.btnMisCitasText}>👤 Ir a mi Perfil</Text>
            </TouchableOpacity>

            {/* BOTÓN SELECTOR DE SUCURSAL */}
            <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Estás viendo servicios en:</Text>
                <TouchableOpacity style={styles.selectorButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.selectorButtonText} numberOfLines={1}>
                        📍 {sucursalSeleccionada ? (sucursalSeleccionada.nombre || sucursalSeleccionada.nombre_comercial) : 'Seleccionar Sucursal'}
                    </Text>
                    <Text style={styles.selectorIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            {serviciosFiltrados.length === 0 ? (
                <Text style={styles.emptyText}>No hay servicios disponibles en esta sucursal.</Text>
            ) : (
                <FlatList
                    data={serviciosFiltrados}
                    keyExtractor={(item) => (item.id_servicio ?? item.id).toString()}
                    renderItem={renderServicio}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* MODAL DEL BUSCADOR DE SUCURSALES */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Buscar Sucursal</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="🔍 Buscar nombre, calle o servicio (ej. veterinaria)"
                            placeholderTextColor="#94a3b8"
                            value={textoBusqueda}
                            onChangeText={setTextoBusqueda}
                        />

                        <FlatList
                            data={sucursalesFiltradas}
                            keyExtractor={(item) => (item.id_sucursal ?? item.id).toString()}
                            renderItem={renderSucursalModal}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No se encontraron resultados para tu búsqueda.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    listContainer: { padding: 16, paddingTop: 8 },
    btnMisCitas: { backgroundColor: '#0f172a', margin: 16, marginBottom: 10, padding: 14, borderRadius: 8, alignItems: 'center' },
    btnMisCitasText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
    selectorContainer: { paddingHorizontal: 16, paddingBottom: 10 },
    selectorLabel: { fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 'bold' },
    selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', padding: 14, borderRadius: 10 },
    selectorButtonText: { fontSize: 15, color: '#1e293b', fontWeight: '600', flex: 1 },
    selectorIcon: { fontSize: 12, color: '#64748b', marginLeft: 10 },
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
    emptyText: { textAlign: 'center', marginTop: 40, color: '#64748b', fontSize: 15 },
    
    // Estilos del Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%', minHeight: '50%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    modalClose: { fontSize: 20, color: '#94a3b8', fontWeight: 'bold', padding: 5, paddingHorizontal: 10 },
    searchInput: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 15, color: '#1e293b', marginBottom: 16 },
    sucursalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    sucursalItemSelected: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, borderBottomWidth: 0, marginVertical: 4 },
    sucursalNombre: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
    sucursalDireccion: { fontSize: 13, color: '#64748b' },
    sucursalTextoSelected: { color: '#0066cc' }
});