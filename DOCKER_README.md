# Docker Environment - Campaign Manager

## Struktura projektu

```
campaigns_full_app/
├── docker-compose.yml          # Orchestracja wszystkich serwisów
├── .env.example                # Przykładowa konfiguracja
├── backend/                    # Flask API
│   ├── Dockerfile
│   ├── app.py
│   ├── requirements.txt
│   └── .dockerignore
└── frontend/                   # React + Vite + nginx
    ├── Dockerfile
    ├── nginx.conf
    └── ... (pliki React)
```

## Serwisy

### 1. MongoDB (`db`)
- **Image**: `mcp/mongodb:latest`
- **Port**: `27017`
- **Dane**: Persistentne w volume `mongo_data`

### 2. Backend (`backend`)
- **Framework**: Flask (Python 3.11)
- **Port**: `5000`
- **Zależności**: pymongo, flask-cors
- **Endpoints**:
  - `GET /` - Status backend
  - `GET /api/campaigns` - Lista kampanii
  - `POST /api/campaigns` - Tworzenie kampanii
  - `DELETE /api/campaigns/<id>` - Usuwanie kampanii
  - `GET /api/health` - Health check

### 3. Frontend (`frontend`)
- **Framework**: React 19 + Vite
- **Webserver**: nginx (alpine)
- **Port**: `3000`
- **Build**: Multi-stage Docker build
- **Proxy**: nginx przekierowuje `/api` → `backend:5000`

## Uruchomienie

### Pierwszy raz
```bash
# Zbuduj i uruchom wszystkie serwisy
docker-compose up --build

# Lub w tle
docker-compose up --build -d
```

### Kolejne uruchomienia
```bash
docker-compose up

# Lub w tle
docker-compose up -d
```

### Zatrzymanie
```bash
docker-compose down

# Z usunięciem volumes (UWAGA: usuwa dane MongoDB)
docker-compose down -v
```

## Dostęp do aplikacji

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## Monitoring

### Logi
```bash
# Wszystkie serwisy
docker-compose logs -f

# Konkretny serwis
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Status kontenerów
```bash
docker-compose ps
```

### Wejście do kontenera
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# MongoDB
docker-compose exec db mongosh
```

## Development

### Backend - hot reload
Backend ma zmontowany volume z kodem, więc zmiany w `backend/app.py` będą automatycznie odświeżane.

### Frontend - rebuild
Dla zmian w frontend trzeba przebudować obraz:
```bash
docker-compose up --build frontend
```

### Dodawanie zależności Python
1. Dodaj do `backend/requirements.txt`
2. Przebuduj: `docker-compose up --build backend`

### Dodawanie zależności npm
1. Dodaj do `frontend/package.json`
2. Przebuduj: `docker-compose up --build frontend`

## Rozwiązywanie problemów

### Port zajęty
Jeśli port jest zajęty, zmień mapowanie w `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # zamiast 3000:80
```

### Problemy z MongoDB
```bash
# Sprawdź logi
docker-compose logs db

# Restart MongoDB
docker-compose restart db
```

### Czyszczenie
```bash
# Usuń wszystkie kontenery i volumes
docker-compose down -v

# Usuń nieużywane obrazy
docker system prune -a
```

## Konfiguracja produkcyjna

Dla produkcji:
1. Usuń `FLASK_DEBUG=1` i `FLASK_ENV=development`
2. Użyj `gunicorn` zamiast Flask dev server
3. Skonfiguruj SSL dla nginx
4. Użyj secrets dla hasła MongoDB
5. Skonfiguruj backup dla volume `mongo_data`

## Bezpieczeństwo

- ✅ Używamy bridge network dla izolacji
- ✅ CORS skonfigurowany w Flask
- ✅ nginx reverse proxy dla API
- ⚠️ TODO: Dodaj autentykację do MongoDB
- ⚠️ TODO: Dodaj zmienne środowiskowe dla secrets
