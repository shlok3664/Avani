from pathlib import Path

from visualization.global_visualization_builder import (
    GlobalVisualizationBuilder
)


SOURCE_PATH = Path(
    r"D:\WeatherData\ERA5\raw\temperature_2015_2019.nc"
)

OUTPUT_PATH = Path(
    r"C:\Users\Ajivak\Desktop\AI_V1\Avani"
    r"\public\data\visualization"
    r"\global_temperature.json"
)


builder = GlobalVisualizationBuilder(
    source_path=SOURCE_PATH,
    output_path=OUTPUT_PATH,
    variable="temperature",
    spatial_step=8
)


builder.build(
    start_time="2015-01-01T00:00",
    end_time="2015-01-01T18:00"
)