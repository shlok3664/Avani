from pathlib import Path

import xarray as xr


class ERA5Reader:
    """
    Basic reader for ERA5 NetCDF datasets.

    The reader keeps the dataset lazy. It does not load
    the complete weather field into RAM.
    """

    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.dataset = None

    def open(self):
        """Open the ERA5 NetCDF dataset."""

        if not self.file_path.exists():
            raise FileNotFoundError(
                f"ERA5 file not found: {self.file_path}"
            )

        self.dataset = xr.open_dataset(
            self.file_path,
            engine="netcdf4"
        )

    def close(self):
        """Close the underlying dataset."""

        if self.dataset is not None:
            self.dataset.close()
            self.dataset = None

    def get_times(self):
        """Return the available valid times."""

        self._ensure_open()

        return self.dataset["valid_time"]

    def get_latitudes(self):
        """Return the latitude coordinate."""

        self._ensure_open()

        return self.dataset["latitude"]

    def get_longitudes(self):
        """Return the longitude coordinate."""

        self._ensure_open()

        return self.dataset["longitude"]

    def get_variable(self, variable_name):
        """
        Return an ERA5 variable as an xarray DataArray.

        Example:
            get_variable("t2m")
        """

        self._ensure_open()

        if variable_name not in self.dataset.data_vars:
            raise KeyError(
                f"Variable '{variable_name}' was not found."
            )

        return self.dataset[variable_name]

    def get_value(
        self,
        variable_name,
        time,
        latitude,
        longitude
    ):
        """
        Get one weather value at a specific time and location.

        The nearest ERA5 grid point is used.

        Returns information about both the requested
        coordinate and the actual ERA5 grid point selected.
        """

        self._ensure_open()

        # Convert longitude from GIS convention [-180, 180]
        # to ERA5 convention [0, 360).
        era5_longitude = longitude % 360.0

        data = self.dataset[variable_name].sel(
            valid_time=time,
            latitude=latitude,
            longitude=era5_longitude,
            method="nearest"
        )

        selected_latitude = float(data.latitude.values)
        selected_longitude = float(data.longitude.values)

        value = float(data.item())

        return {
            "variable": variable_name,
            "time": str(data.valid_time.values),
            "requested_latitude": latitude,
            "requested_longitude": longitude,
            "latitude": selected_latitude,
            "longitude": selected_longitude,
            "value": value
        }

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
        Get a spatial subset of an ERA5 variable at one time.

        The returned data remains lazy until values are requested.

        Latitude is handled according to ERA5's
        north-to-south coordinate ordering.
        """

        self._ensure_open()

        # Convert longitude from GIS convention [-180, 180]
        # to ERA5 convention [0, 360).
        era5_min_longitude = min_longitude % 360.0
        era5_max_longitude = max_longitude % 360.0

        data = self.dataset[variable_name].sel(
            valid_time=time,
            latitude=slice(max_latitude, min_latitude),
            longitude=slice(
                era5_min_longitude,
                era5_max_longitude
            )
        )

        return data

    def _ensure_open(self):
        """Make sure the dataset is open."""

        if self.dataset is None:
            raise RuntimeError(
                "ERA5 dataset is not open. Call open() first."
            )