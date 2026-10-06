import concurrent.futures
import requests

# URL de tu API desplegada en Render
URL = "https://agendapp-backend-djml.onrender.com"

# Token de cliente válido y los datos del slot que ambos intentarán reservar
TOKEN = "TU_ACCESS_TOKEN_AQUI"
payload = {
    "id_profesional": 1,
    "id_servicio": 1,
    "fecha_hora_inicio": "2026-10-10T10:00:00Z",
}
headers = {"Authorization": f"Bearer {TOKEN}"}


def intentar_reservar():
  response = requests.post(URL, json=payload, headers=headers)
  return response.status_code, response.json()


# Lanzar 2 peticiones exactamente al mismo tiempo
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
  futures = [
      executor.submit(intentar_reservar),
      executor.submit(intentar_reservar),
  ]
  results = [f.result() for f in futures]

print("Resultados de concurrencia:", results)