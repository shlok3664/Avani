from pathlib import Path

from weather.era5_reader import ERA5Reader


class WeatherDataBridge:
    """
    Connects application weather variables to their
    underlying ERA5 NetCDF files.

    The bridge is responsible for:
        - knowing which file contains each variable
        - creating ERA5 readers
        - opening and closing the required datasets
        - routing variable requests to the correct reader

    The rest of the application does not need to know
    how the ERA5 files are organized.
    """

    def __init__(self, raw_data_root):
        self.raw_data_root = Path(raw_data_root)

        self._readers = {}
        self._variable_sources = {
            "temperature": "temperature",
            "dewpoint": "dewpoint_pressure",
            "mean_sea_level_pressure": "dewpoint_pressure",

            "wind_u": "wind_u_surface_pressure",
            "surface_pressure": "wind_u_surface_pressure",

            "wind_v": "wind_v",
            "total_precipitation": "total_precipitation"
        }

        self._source_files = {
            "temperature":
                "temperature_2015_2019.nc",

            "dewpoint_pressure":
                "dewpoint_pressure_2015_2019.nc",

            "wind_u_surface_pressure":
                "wind_u_surface_pressure_2015_2019.nc",

            "wind_v":
                "wind_v_2015_2019.nc",

            "total_precipitation":
                "total_precipitation_2015_2019.nc"
        }

    def open(self):
        """
        Create and open readers for all ERA5 source files.
        """

        for source_name, filename in self._source_files.items():
            file_path = self.raw_data_root / filename

            reader = ERA5Reader(file_path)
            reader.open()

            self._readers[source_name] = reader

    def close(self):
        """
        Close all ERA5 readers.
        """

        for reader in self._readers.values():
            reader.close()

        self._readers.clear()

    def get_value(
        self,
        variable_name,
        time,
        latitude,
        longitude
    ):
        """
        Get one value for an application weather variable.
        """

        reader = self._get_reader(variable_name)

        return reader.get_value(
            self._get_source_variable(variable_name),
            time,
            latitude,
            longitude
        )

    def get_region(
        self,
        variable_name,
        time,
        min_latitude,
        max_latitude,
        min_longitude,
        max_longitude
    ):
        """
        Get a spatial region for an application weather variable.
        """

        reader = self._get_reader(variable_name)

        return reader.get_region(
            self._get_source_variable(variable_name),
            time,
            min_latitude,
            max_latitude,
            min_longitude,
            max_longitude
        )   

    def get_reader(self, variable_name):
        """
        Return the ERA5 reader responsible for a weather variable.
        """

        return self._get_reader(variable_name)

    def _get_reader(self, variable_name):
        """
        Find the ERA5 reader responsible for a variable.
        """

        if variable_name not in self._variable_sources:
            raise ValueError(
                f"Unsupported weather variable: {variable_name}"
            )

        source_name = self._variable_sources[variable_name]

        if source_name not in self._readers:
            raise RuntimeError(
                "WeatherDataBridge is not open. "
                "Call open() first."
            )

        return self._readers[source_name]

    def _get_source_variable(self, variable_name):
        """
        Convert an application variable name into
        its ERA5 variable name.
        """

        source_variables = {
            "temperature": "t2m",
            "dewpoint": "d2m",
            "mean_sea_level_pressure": "msl",

            "wind_u": "u10",
            "surface_pressure": "sp",

            "wind_v": "v10",
            "total_precipitation": "tp"
        }

        if variable_name not in source_variables:
            raise ValueError(
                f"Unsupported weather variable: {variable_name}"
            )

        return source_variables[variable_name]