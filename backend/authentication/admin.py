from django.contrib import admin
from .models import Usuario, Rol

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id_rol', 'nombre', 'descripcion')
    search_fields = ('nombre',)
    ordering = ('id_rol',)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'correo', 'nombre', 'apellido', 'id_rol', 'activo', 'is_staff', 'is_superuser')
    search_fields = ('correo', 'nombre', 'apellido')
    list_filter = ('activo', 'is_staff', 'is_superuser', 'id_rol')
    ordering = ('id_usuario',)
    # Agrega esta línea para evitar el conflicto con Python 3.14:
    fields = ('correo', 'nombre', 'apellido', 'id_rol', 'activo', 'is_staff', 'is_superuser')