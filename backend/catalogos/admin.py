from django.contrib import admin
from .models import Sucursal, Servicio

@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ('id_sucursal', 'nombre', 'rut_empresa', 'telefono', 'activo', 'fecha_creacion')
    search_fields = ('nombre', 'rut_empresa', 'correo')
    list_filter = ('activo',)
    ordering = ('id_sucursal',)

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('id_servicio', 'nombre', 'id_sucursal', 'precio', 'duracion_minutos', 'activo')
    search_fields = ('nombre', 'descripcion')
    list_filter = ('activo', 'id_sucursal')
    ordering = ('id_servicio',)