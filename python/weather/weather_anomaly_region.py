class WeatherAnomalyRegion:
    """
    Represents one spatially connected weather-anomaly
    region at a specific point in time.

    A region is composed of spatial weather-grid nodes
    that are anomalous and connected through the spatial
    neighbor graph.
    """

    def __init__(
        self,
        region_id,
        time,
        category
    ):
        self.region_id = int(
            region_id
        )

        self.time = time

        self.category = category

        self.node_ids = []

        self.min_latitude = None
        self.max_latitude = None

        self.min_longitude = None
        self.max_longitude = None

        self.min_value = None
        self.max_value = None

        self.mean_value = None

        self.min_standardized_anomaly = None
        self.max_standardized_anomaly = None
        self.mean_standardized_anomaly = None

    def add_node(
        self,
        node_id,
        latitude,
        longitude,
        value,
        standardized_anomaly
    ):
        """
        Add one anomalous spatial node to the region.
        """

        node_id = int(
            node_id
        )

        if node_id not in self.node_ids:
            self.node_ids.append(
                node_id
            )

        self._update_bounds(
            latitude=latitude,
            longitude=longitude
        )

        self._update_value_range(
            value=value
        )

        if standardized_anomaly is not None:

            self._update_standardized_range(
                standardized_anomaly
            )

    def _update_bounds(
        self,
        latitude,
        longitude
    ):
        """
        Update the geographic bounding box.
        """

        latitude = float(
            latitude
        )

        longitude = float(
            longitude
        )

        if self.min_latitude is None:

            self.min_latitude = latitude
            self.max_latitude = latitude

            self.min_longitude = longitude
            self.max_longitude = longitude

            return

        self.min_latitude = min(
            self.min_latitude,
            latitude
        )

        self.max_latitude = max(
            self.max_latitude,
            latitude
        )

        self.min_longitude = min(
            self.min_longitude,
            longitude
        )

        self.max_longitude = max(
            self.max_longitude,
            longitude
        )

    def _update_value_range(
        self,
        value
    ):
        """
        Update the observed weather-value range.
        """

        value = float(
            value
        )

        if self.min_value is None:

            self.min_value = value
            self.max_value = value

            self.mean_value = value

            return

        self.min_value = min(
            self.min_value,
            value
        )

        self.max_value = max(
            self.max_value,
            value
        )

    def _update_standardized_range(
        self,
        value
    ):
        """
        Update the standardized anomaly range.
        """

        value = float(
            value
        )

        if self.min_standardized_anomaly is None:

            self.min_standardized_anomaly = value
            self.max_standardized_anomaly = value

            return

        self.min_standardized_anomaly = min(
            self.min_standardized_anomaly,
            value
        )

        self.max_standardized_anomaly = max(
            self.max_standardized_anomaly,
            value
        )

    @property
    def node_count(self):
        """
        Return the number of spatial nodes in the region.
        """

        return len(
            self.node_ids
        )

    @property
    def latitude_span(self):
        """
        Return the latitude span of the region.
        """

        if self.min_latitude is None:
            return 0.0

        return (
            self.max_latitude
            - self.min_latitude
        )

    @property
    def longitude_span(self):
        """
        Return the longitude span of the region.
        """

        if self.min_longitude is None:
            return 0.0

        return (
            self.max_longitude
            - self.min_longitude
        )

    def __repr__(self):
        return (
            f"WeatherAnomalyRegion("
            f"region_id={self.region_id}, "
            f"time={self.time}, "
            f"category={self.category}, "
            f"node_count={self.node_count}, "
            f"latitude_range=("
            f"{self.min_latitude}, "
            f"{self.max_latitude}), "
            f"longitude_range=("
            f"{self.min_longitude}, "
            f"{self.max_longitude})"
            f")"
        )