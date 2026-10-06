import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseDeDatosLocal } from '../memoria';

const API_URL = 'https://agendapp-backend-djml.onrender.com/api';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const generarDiasDelMes = (año, mes) => {
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(año, mes, 1).getDay();
  const inicioAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; 
  
  const dias = [];
  for (let i = 0; i < inicioAjustado; i++) { dias.push(null); }
  for (let i = 1; i <= diasEnMes; i++) { dias.push(i); }
  return dias;
};

export default function ReservaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const idServicio = params.id_servicio || params.servicio_id || 1;
  const nombreServicio = params.nombre || 'Servicio';
  const idSucursalServicio = params.id_sucursal; // Rescatamos la sucursal del servicio
  
  const fechaHoy = new Date();
  const [añoActual, setAñoActual] = useState(fechaHoy.getFullYear());
  const [mesActual, setMesActual] = useState(fechaHoy.getMonth());
  
  const [listaProfesionales, setListaProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);

  const diaHoyStr = String(fechaHoy.getDate()).padStart(2, '0');
  const mesHoyStr = String(fechaHoy.getMonth() + 1).padStart(2, '0');
  const [fechaMostrar, setFechaMostrar] = useState(`${diaHoyStr}/${mesHoyStr}/${añoActual}`);
  const [fechaIso, setFechaIso] = useState(`${añoActual}-${mesHoyStr}-${diaHoyStr}`);
  
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  
  const [modalProfVisible, setModalProfVisible] = useState(false);
  const [modalCalendarioVisible, setModalCalendarioVisible] = useState(false);

  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [isLoadingHoras, setIsLoadingHoras] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const diasDelMesGrid = generarDiasDelMes(añoActual, mesActual);

  const getNombreProf = (prof) => {
    if (!prof) return 'Cargando...';
    const nombre = prof.nombre_completo || prof.usuario?.nombre || prof.nombre;
    if (nombre && prof.especialidad) {
        return `${nombre} (${prof.especialidad.charAt(0).toUpperCase() + prof.especialidad.slice(1)})`;
    }
    return nombre || `Profesional ID: ${prof.id_profesional}`;
  };

  // CARGAR PROFESIONALES (FILTRADOS POR SUCURSAL)
  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const response = await fetch(`${API_URL}/personal/profesionales/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BaseDeDatosLocal.token}` }
        });
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          // Filtramos estricto: El profesional debe pertenecer a la misma sucursal del servicio
          const profesionalesFiltrados = data.filter(p => {
              if (!idSucursalServicio) return true; // Si no hay sucursal en params, muestra todos por seguridad
              const pSucursalId = p.id_sucursal?.id_sucursal ?? p.id_sucursal ?? p.id_sucursal_id;
              return String(pSucursalId) === String(idSucursalServicio);
          });

          setListaProfesionales(profesionalesFiltrados);
          if (profesionalesFiltrados.length > 0) {
            setProfesionalSeleccionado(profesionalesFiltrados[0]); 
          }
        }
      } catch (error) {
        console.error("Error al cargar profesionales:", error);
      }
    };
    cargarProfesionales();
  }, []);

  // CARGAR HORAS DISPONIBLES
  useEffect(() => {
    if (!profesionalSeleccionado) return; 

    const cargarHorasDisponibles = async () => {
      setIsLoadingHoras(true);
      setHoraSeleccionada(null);
      
      try {
        const url = `${API_URL}/citas/disponibilidad/?profesional=${profesionalSeleccionado.id_profesional}&servicio=${idServicio}&fecha=${fechaIso}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data && data.slots) {
          const slotsMapeados = data.slots.map(slot => ({
            rango: `${slot.hora_inicio} - ${slot.hora_fin}`,
            datetime_inicio: slot.datetime_inicio,
            datetime_fin: slot.datetime_fin,
            ocupado: false
          }));
          setTurnosDisponibles(slotsMapeados);
        } else {
          setTurnosDisponibles([]);
        }
      } catch (error) {
        setTurnosDisponibles([]);
      } finally {
        setIsLoadingHoras(false);
      }
    };
    cargarHorasDisponibles();
  }, [profesionalSeleccionado, fechaIso, idServicio]);

  const handleConfirmar = async () => {
    if (!horaSeleccionada) return;
    setIsSubmitting(true);
    
    const usuarioActual = BaseDeDatosLocal.usuarioActivo;
    const clienteId = usuarioActual?.id_usuario || usuarioActual?.id;

    if (!clienteId) {
      Alert.alert('Error', 'Sesión inválida. Vuelve a iniciar sesión.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        id_cliente: clienteId,
        id_profesional: profesionalSeleccionado.id_profesional,
        id_servicio: Number(idServicio),
        id_sucursal: Number(idSucursalServicio || 1), 
        fecha_hora_inicio: horaSeleccionada.datetime_inicio,
        fecha_hora_fin: horaSeleccionada.datetime_fin,
        estado: 'CONFIRMADA'
      };

      const response = await fetch(`${API_URL}/citas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BaseDeDatosLocal.token}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('¡Reserva Confirmada!', `Has agendado ${nombreServicio} para el ${fechaMostrar} a las ${horaSeleccionada.rango}.`,
          [{ text: 'Ver Mis Citas', onPress: () => router.replace('/miscitas') }]
        );
      } else {
        Alert.alert('Error de validación', 'Ya posees otra cita a esta hora o el profesional se ocupó.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cambiarMes = (direccion) => {
    let nuevoMes = mesActual + direccion;
    let nuevoAño = añoActual;
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAño++; } else if (nuevoMes < 0) { nuevoMes = 11; nuevoAño--; }
    setMesActual(nuevoMes); setAñoActual(nuevoAño);
  };

  const seleccionarFecha = (dia) => {
    if (!dia) return;
    const diaStr = String(dia).padStart(2, '0');
    const mesStr = String(mesActual + 1).padStart(2, '0');
    setFechaMostrar(`${diaStr}/${mesStr}/${añoActual}`);
    setFechaIso(`${añoActual}-${mesStr}-${diaStr}`);
    setModalCalendarioVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>1. Profesional Disponible:</Text>
        <TouchableOpacity style={styles.dropdownInput} onPress={() => setModalProfVisible(true)}>
          <Text style={styles.dropdownText}>{getNombreProf(profesionalSeleccionado)}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>2. Elige un día:</Text>
        <TouchableOpacity style={styles.dropdownInput} onPress={() => setModalCalendarioVisible(true)}>
          <Text style={styles.dropdownText}>📅 {fechaMostrar}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>3. Horas disponibles:</Text>
        {isLoadingHoras ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Buscando horarios...</Text>
          </View>
        ) : turnosDisponibles.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No hay horarios para este profesional hoy.</Text>
          </View>
        ) : (
          <View style={styles.gridHoras}>
            {turnosDisponibles.map((turno, index) => {
              const isSelected = horaSeleccionada?.rango === turno.rango;
              return (
                <TouchableOpacity key={index} style={[styles.btnHora, isSelected && styles.btnHoraSeleccionada]} onPress={() => setHoraSeleccionada(turno)}>
                  <Text style={[styles.txtHora, isSelected && styles.txtHoraSeleccionada]}>{turno.rango}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btnConfirmar, (!horaSeleccionada || isSubmitting) && styles.btnConfirmarDisabled]} onPress={handleConfirmar} disabled={!horaSeleccionada || isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnConfirmarText}>{horaSeleccionada ? `Confirmar hora (${horaSeleccionada.rango})` : 'Selecciona una hora'}</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={modalProfVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profesionales en esta Sucursal</Text>
            {listaProfesionales.length === 0 ? (
                <Text style={{textAlign: 'center', marginVertical: 20, color: '#64748b'}}>No hay profesionales asignados aquí.</Text>
            ) : (
                listaProfesionales.map(prof => (
                <TouchableOpacity key={prof.id_profesional} style={styles.modalItem} onPress={() => { setProfesionalSeleccionado(prof); setModalProfVisible(false); }}>
                    <Text style={[styles.modalItemText, profesionalSeleccionado?.id_profesional === prof.id_profesional && styles.modalItemTextActive]}>{getNombreProf(prof)}</Text>
                </TouchableOpacity>
                ))
            )}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalProfVisible(false)}><Text style={styles.modalCancelText}>Cerrar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalCalendarioVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.calBtnMes}><Text style={styles.calBtnMesText}>{'<'}</Text></TouchableOpacity>
              <Text style={styles.calTituloMes}>{MESES[mesActual]} {añoActual}</Text>
              <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.calBtnMes}><Text style={styles.calBtnMesText}>{'>'}</Text></TouchableOpacity>
            </View>
            <View style={styles.calDiasSemana}>{DIAS_SEMANA.map((dia, i) => <Text key={i} style={styles.calTextoDiaSemana}>{dia}</Text>)}</View>
            <View style={styles.calGridDias}>
              {diasDelMesGrid.map((dia, i) => {
                const isSelected = dia && fechaIso === `${añoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                return (
                  <TouchableOpacity key={i} style={[styles.calDiaCelda, isSelected && styles.calDiaCeldaSelected]} onPress={() => seleccionarFecha(dia)} disabled={!dia}>
                    <Text style={[styles.calDiaTexto, isSelected && styles.calDiaTextoSelected, !dia && styles.calDiaTextoVacio]}>{dia || ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalCalendarioVisible(false)}><Text style={styles.modalCancelText}>Cerrar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 10 },
  dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16, marginBottom: 20 },
  dropdownText: { fontSize: 16, color: '#334155', fontWeight: '500', textTransform: 'capitalize' },
  dropdownIcon: { fontSize: 14, color: '#94a3b8' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b' },
  gridHoras: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  btnHora: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12, elevation: 1 },
  btnHoraSeleccionada: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
  txtHora: { color: '#334155', fontWeight: 'bold', fontSize: 15 },
  txtHoraSeleccionada: { color: '#ffffff' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderColor: '#e2e8f0', elevation: 10 },
  btnConfirmar: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnConfirmarDisabled: { backgroundColor: '#cbd5e1' },
  btnConfirmarText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, color: '#334155', textAlign: 'center' },
  modalItemTextActive: { color: '#0066cc', fontWeight: 'bold' },
  modalCancel: { marginTop: 20, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calTituloMes: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  calBtnMes: { padding: 10 },
  calBtnMesText: { fontSize: 20, color: '#64748b', fontWeight: 'bold' },
  calDiasSemana: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calTextoDiaSemana: { flex: 1, textAlign: 'center', color: '#64748b', fontWeight: 'bold' },
  calGridDias: { flexDirection: 'row', flexWrap: 'wrap' },
  calDiaCelda: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  calDiaCeldaSelected: { backgroundColor: '#0066cc', borderRadius: 20 },
  calDiaTexto: { fontSize: 16, color: '#1e293b' },
  calDiaTextoSelected: { color: '#ffffff', fontWeight: 'bold' },
  calDiaTextoVacio: { color: 'transparent' }
});