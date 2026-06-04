# D3 Exercises Portfolio

This repo contains a small portfolio of D3/SVG exercises with consistent navigation and layout:

- **Home**: `index.html`
- **Exercise 4**: `exercise4.html` (static SVG house + CSV-driven bar chart)
- **Exercise 5**: `exercise5.html` (multi-chart dashboard grid)
- **Exercise 6**: `exercise6.html` (filters + colour-coded scatterplot with SVG tooltip + legend)
- **Police Dashboard**: `police-dashboard.html` (linked charts + filters)

## Run locally (important)
D3 loads CSV files via HTTP, so run a local server from the repo root:

```bash
python3 -m http.server 8000
```

Then open:
- http://localhost:8000/
- http://localhost:8000/police-dashboard.html
- http://localhost:8000/exercise4.html
- http://localhost:8000/exercise5.html
- http://localhost:8000/exercise6.html

## Data
All datasets are stored in `data/`.
