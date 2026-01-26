from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"

IMAGES_DIR = DATA_DIR / "images"
POPULATION_DIR = DATA_DIR / "population"
ROADS_DIR = DATA_DIR / "roads"
BOUNDARIES_DIR = DATA_DIR / "boundaries"
PROCESSED_DIR = DATA_DIR / "processed"
PATCHES_DIR = DATA_DIR / "patches"
MODELS_DIR = DATA_DIR / "models"
PREDICTIONS_DIR = DATA_DIR / "predictions"

OUTPUTS_DIR = BASE_DIR / "outputs"
MAPS_DIR = OUTPUTS_DIR / "maps"
CHARTS_DIR = OUTPUTS_DIR / "charts"

# Create directories safely
# .
for d in [
    PROCESSED_DIR, PATCHES_DIR, MODELS_DIR,
    PREDICTIONS_DIR, MAPS_DIR, CHARTS_DIR
]:
    d.mkdir(parents=True, exist_ok=True)