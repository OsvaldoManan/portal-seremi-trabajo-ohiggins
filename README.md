# Portal SEREMI del Trabajo y Previsión Social — O'Higgins

Portal institucional de datos abiertos de la Secretaría Regional Ministerial del Trabajo y Previsión Social, Región del Libertador General Bernardo O'Higgins.

Sitio web estático con visualizaciones interactivas sobre indicadores comunales, inversión pública histórica y cartera de proyectos privados.

## Contenido del portal

- **Inicio** — Síntesis regional con KPIs y gráficos de overview
- **Indicadores Comunales** — 31 fichas comunales con 32 indicadores cada una (Censo 2024, ENE, SII, BNE, MIDESO, CBC)
- **Inversión Regional** — 30.401 iniciativas históricas (1994-2025) + 36 proyectos de la cartera 2026
- **Institucional** — Misión, visión, líneas de acción y servicios del sector trabajo

## Fuentes de datos

| Fuente | Descripción |
|--------|-------------|
| CENSO 2024 (INE) | Población, distribución por género, rangos etarios |
| ENE 2024 | Ocupación, desocupación, fuerza de trabajo, PET |
| SII 2024 | Empresas activas y trabajadores formales |
| BNE 2025 | Avisos, vacantes y ocupaciones demandadas |
| MIDESO 2024 | Ingresos asalariados y ocupados formales |
| CBC 2025 | Cartera de inversión privada 2025-2029 |
| BIP | Banco Integrado de Proyectos (inversión pública histórica) |

## Stack técnico

- HTML5 + CSS3 + Vanilla JavaScript
- [Chart.js 4.4](https://www.chartjs.org/) para visualizaciones interactivas
- Sitio estático sin build — compatible con GitHub Pages
- Datos en JSON (procesados con Python desde fuentes originales)

## Estructura del proyecto

```
.
├── site/                       # Sitio web (GitHub Pages publica desde aquí)
│   ├── index.html              # Portada
│   ├── comunas.html            # Indicadores comunales (fichas + comparar + ranking)
│   ├── inversion.html          # Inversión histórica + cartera 2026
│   ├── institucional.html      # Misión, valores, servicios, metodología
│   ├── css/
│   │   └── styles.css          # Estilos institucionales
│   ├── js/
│   │   ├── main.js             # Utilidades comunes y configuración Chart.js
│   │   ├── home.js             # Lógica de la portada
│   │   ├── comunas.js          # Dashboard de comunas
│   │   └── inversion.js        # Dashboard de inversión
│   └── data/
│       ├── comunas.json        # 31 comunas × 32 indicadores
│       ├── inversion_historica.json   # Agregaciones de 30.401 iniciativas
│       └── inversion_2026.json # 36 proyectos cartera privada 2026
├── Ohiggins/                   # PDFs originales (Fichas Comunales)
├── Resultado_Consulta (1).xls  # Datos crudos inversión histórica
├── proyectos_inversión-2026-05-15.xlsx  # Datos crudos cartera 2026
├── process_data.py             # Script de procesamiento (regenera JSONs)
└── README.md
```

## Desarrollo local

```bash
# Levantar servidor de desarrollo
cd site
python -m http.server 8000

# Abrir en navegador
# http://localhost:8000
```

## Regenerar datos desde las fuentes

Si actualizas los PDFs o Excel, regenera los JSON:

```bash
python -m pip install pandas openpyxl xlrd pdfplumber
python process_data.py
```

## Despliegue en GitHub Pages

El sitio está configurado para publicarse automáticamente desde la carpeta `/site` usando GitHub Actions.

### Pasos para desplegar

1. **Crear repositorio en GitHub**
   - Crea un repositorio público en tu cuenta
   - Nombre sugerido: `portal-seremi-trabajo-ohiggins`

2. **Conectar el repositorio local con GitHub**
   ```bash
   git init
   git add .
   git commit -m "Portal SEREMI Trabajo O'Higgins - versión inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/portal-seremi-trabajo-ohiggins.git
   git push -u origin main
   ```

3. **Habilitar GitHub Pages**
   - En GitHub: `Settings` → `Pages`
   - Source: `GitHub Actions`
   - El workflow `.github/workflows/pages.yml` desplegará automáticamente

4. **Acceder al sitio**
   - URL: `https://TU_USUARIO.github.io/portal-seremi-trabajo-ohiggins/`

## Licencia y uso de datos

Los datos integrados en este portal son de fuentes públicas del Estado de Chile y se publican bajo el principio de transparencia activa (Ley 20.285).

---

© 2026 Gobierno de Chile · Ministerio del Trabajo y Previsión Social
