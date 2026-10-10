import numpy as np


class WeatherField:
    """
    Represents a weather variable over a spatial grid
    at one point in time.
    """

    def __init__(
        self,
        variable,
        time,
        latitudes,
        longitudes,
        data,
        unit
    ):
        self.variable = variable
        self.time = time

        self.latitudes = latitudes
        self.longitudes = longitudes

        self.data = np.asarray(data)
        self.unit = unit

    @property
    def shape(self):
        """Return the spatial field shape."""

        return self.data.shape