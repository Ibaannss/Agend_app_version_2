from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from citas.views import CitaViewSet, BloqueoAgendaViewSet, DisponibilidadView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

router = DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'bloqueos', BloqueoAgendaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/catalogos/', include('catalogos.urls')),
    path('api/personal/', include('profesionales.urls')),
    path('api/reservas/', include('reservas.urls')),
    
    # 1. Ponemos la disponibilidad PRIMERO para que Django la atrape al vuelo
    path('api/citas/disponibilidad/', DisponibilidadView.as_view(), name='disponibilidad-citas'),
    
    # 2. Luego el router general
    path('api/', include(router.urls)),

    # Documentación
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
