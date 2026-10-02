export const BaseDeDatosLocal = {
  citas: [],
  // Creamos un usuario de prueba por defecto para que no tengas que registrarte siempre
  usuarios: [
    { 
      nombre: 'Gabriel', 
      apellido: 'Admin', 
      correo: 'gabriel@agendapp.cl', 
      password: 'Password1', // Cumple con los requisitos
      rol: 'CLIENTE' 
    }
  ],
  // Aquí guardaremos los datos del usuario que logró iniciar sesión
  usuarioActivo: null
};