"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from citas.views import CitaViewSet, BloqueoAgendaViewSet, DisponibilidadView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Router para las vistas de citas y bloqueos
router = DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'bloqueos', BloqueoAgendaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/catalogos/', include('catalogos.urls')),
    path('api/personal/', include('profesionales.urls')),
    path('api/reservas/', include('reservas.urls')),
    
    # Esto habilita /api/citas/ y /api/citas/disponibilidad/
    path('api/', include(router.urls)),
    path('api/citas/disponibilidad/', DisponibilidadView.as_view(), name='disponibilidad-citas'),

    # Rutas para documentación...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
