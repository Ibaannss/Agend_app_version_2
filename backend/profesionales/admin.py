from django.contrib import admin
from .models import Profesional, ProfesionalServicio, HorarioDisponible

class ProfesionalServicioInline(admin.TabularInline):
    model = ProfesionalServicio
    extra = 1

class HorarioDisponibleInline(admin.TabularInline):
    model = HorarioDisponible
    extra = 1

@admin.register(Profesional)
class ProfesionalAdmin(admin.ModelAdmin):
    list_display = (
        'id_profesional',
        'get_nombre_completo',
        'id_sucursal',
        'especialidad',
        'porcentaje_comision',
        'estado_laboral'
    )
    list_filter = ('estado_laboral', 'id_sucursal')
    search_fields = (
        'id_usuario__nombre',
        'id_usuario__apellido',
        'id_usuario__correo',
        'especialidad'
    )
    ordering = ('id_profesional',)
    inlines = [ProfesionalServicioInline, HorarioDisponibleInline]

    @admin.display(description='Profesional')
    def get_nombre_completo(self, obj):
        if obj.id_usuario:
            return f"{obj.id_usuario.nombre} {obj.id_usuario.apellido}"
        return "Sin usuario"

@admin.register(HorarioDisponible)
class HorarioDisponibleAdmin(admin.ModelAdmin):
    list_display = ('id_horario', 'id_profesional', 'get_dia_semana_display', 'hora_inicio', 'hora_fin')
    list_filter = ('dia_semana', 'id_profesional__id_sucursal')
    ordering = ('id_profesional', 'dia_semana', 'hora_inicio')

    @admin.display(description='Día')
    def get_dia_semana_display(self, obj):
        dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        return dias[obj.dia_semana] if 0 <= obj.dia_semana <= 6 else str(obj.dia_semana)

@admin.register(ProfesionalServicio)
class ProfesionalServicioAdmin(admin.ModelAdmin):
    list_display = ('id_profesional', 'id_servicio')
    list_filter = ('id_profesional', 'id_servicio')