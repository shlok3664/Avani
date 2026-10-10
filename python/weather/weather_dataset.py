from weather.weather_data_bridge import WeatherDataBridge
from weather.weather_value import WeatherValue
from weather.weather_field import WeatherField
from weather.weather_state import WeatherState
from weather.weather_grid_index import WeatherGridIndex
from weather.weather_variables import WEATHER_VARIABLES


class WeatherDataset:
    """
    High-level interface for application weather data.

    WeatherDataset coordinates:
        - weather data access
        - variable conversion
        - spatial indexing
        - temporal indexing
        - weather state construction
    """

    def __init__(self, bridge):
        self.bridge = bridge

        self._grid_index = None
        self._index_reader = None

    def open(self):
        """Open the weather data sources and initialize indexing."""

        self.bridge.open()

        self._index_reader = self.bridge.get_reader(
            "temperature"
        )

        self._grid_index = WeatherGridIndex(
            self._index_reader
        )

        self._grid_index.initialize()

    def close(self):
        """Close the weather data sources."""

        self._grid_index = None
        self._index_reader = None

        self.bridge.close()

    @property
    def grid_index(self):
        """
        Return the underlying WeatherGridIndex.

        This provides access to the spatial grid structure
        used by application-level spatial indexing.
        """

        if self._grid_index is None:
            raise RuntimeError(
                "WeatherDataset is not open."
            )

        return self._grid_index

    def get_value(
        self,
        variable,
        time,
        latitude,
        longitude
    ):
        """
        Get one weather value at a specific location and time.
        """

        if variable not in WEATHER_VARIABLES:
            raise ValueError(
                f"Unsupported weather variable: {variable}"
            )

        definition = WEATHER_VARIABLES[variable]

        result = self.bridge.get_value(
            variable,
            time,
            latitude,
            longitude
        )

        value = definition.convert(result["value"])

        return WeatherValue(
            variable=definition.name,
            time=result["time"],
            requested_latitude=result["requested_latitude"],
            requested_longitude=result["requested_longitude"],
            latitude=result["latitude"],
            longitude=result["longitude"],
            value=float(value),
            unit=definition.output_unit
        )

    def get_field(
        self,
        variable,
        time,
        min_latitude,
        max_latitude,
        min_longitude,
        max_longitude
    ):
        """
        Get a weather field over a spatial region.
        """

        if variable not in WEATHER_VARIABLES:
            raise ValueError(
                f"Unsupported weather variable: {variable}"
            )

        definition = WEATHER_VARIABLES[variable]

        data = self.bridge.get_region(
            variable,
            time,
            min_latitude,
            max_latitude,
            min_longitude,
            max_longitude
        )

        data = definition.convert(data)

        return WeatherField(
            variable=definition.name,
            time=str(data.valid_time.values),
            latitudes=data.latitude.values,
            longitudes=data.longitude.values,
            data=data,
            unit=definition.output_unit
        )

    def get_state(
        self,
        time,
        latitude,
        longitude
    ):
        """
        Get the complete atmospheric state at a
        specific location and time.
        """

        values = {}

        for variable_name in WEATHER_VARIABLES:

            values[variable_name] = self.get_value(
                variable=variable_name,
                time=time,
                latitude=latitude,
                longitude=longitude
            )

        return WeatherState(
            time=time,
            latitude=latitude,
            longitude=longitude,

            temperature=values["temperature"].value,
            dewpoint=values["dewpoint"].value,

            mean_sea_level_pressure=(
                values["mean_sea_level_pressure"].value
            ),

            surface_pressure=(
                values["surface_pressure"].value
            ),

            wind_u=values["wind_u"].value,
            wind_v=values["wind_v"].value,

            total_precipitation=(
                values["total_precipitation"].value
            )
        )

    def get_grid_index(
        self,
        time,
        latitude,
        longitude
    ):
        """
        Resolve a geographic coordinate and timestamp
        to the corresponding ERA5 grid location.
        """

        if self._grid_index is None:
            raise RuntimeError(
                "WeatherDataset is not open."
            )

        return self._grid_index.get_grid_index(
            time=time,
            latitude=latitude,
            longitude=longitude
        )

    def get_temperature(
        self,
        time,
        latitude,
        longitude
    ):
        """Get temperature at a specific location and time."""

        return self.get_value(
            variable="temperature",
            time=time,
            latitude=latitude,
            longitude=longitude
        )

    def get_temperature_field(
        self,
        time,
        min_latitude,
        max_latitude,
        min_longitude,
        max_longitude
    ):
        """Compatibility helper for temperature fields."""

        return self.get_field(
            variable="temperature",
            time=time,
            min_latitude=min_latitude,
            max_latitude=max_latitude,
            min_longitude=min_longitude,
            max_longitude=max_longitude
        )