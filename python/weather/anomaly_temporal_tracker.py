from weather.weather_anomaly_track import (
    WeatherAnomalyTrack
)


class AnomalyTemporalTracker:
    """
    Tracks weather anomaly regions through time.

    The initial implementation uses deterministic spatial
    matching between anomaly regions at consecutive
    timestamps.

    Regions are matched when:

        1. Their anomaly categories are identical.
        2. Their geographic centers are within the configured
           latitude and longitude thresholds.

    Tracks that no longer receive a matching region are
    considered terminated, but they remain in the returned
    collection so their complete history is preserved.

    This is an initial tracking implementation.

    Future versions can replace the geographic matching
    with proper spherical distance, region overlap,
    movement prediction, intensity evolution, and
    machine-learning/GNN-based tracking.
    """

    def __init__(
        self,
        maximum_latitude_distance=1.0,
        maximum_longitude_distance=1.0
    ):
        self.maximum_latitude_distance = float(
            maximum_latitude_distance
        )

        self.maximum_longitude_distance = float(
            maximum_longitude_distance
        )

    def build_tracks(self, region_fields):
        """
        Build temporal anomaly tracks from multiple
        timestamped region fields.

        Each element of region_fields must be a dictionary
        containing:

            {
                "time": ...,
                "regions": [...]
            }

        Returns:

            List[WeatherAnomalyTrack]

        The returned list contains both active and
        terminated tracks.
        """

        if not region_fields:
            return []

        sorted_fields = sorted(
            region_fields,
            key=lambda field: field["time"]
        )

        all_tracks = []
        active_tracks = []

        next_track_id = 0

        # -------------------------------------------------
        # Process the first timestamp
        # -------------------------------------------------

        first_field = sorted_fields[0]

        for region in first_field["regions"]:

            track = WeatherAnomalyTrack(
                track_id=next_track_id,
                category=region.category
            )

            next_track_id += 1

            track.add_region(region)

            active_tracks.append(track)
            all_tracks.append(track)

        # -------------------------------------------------
        # Process subsequent timestamps
        # -------------------------------------------------

        for field in sorted_fields[1:]:

            regions = field["regions"]

            used_region_indices = set()

            new_active_tracks = []

            # ---------------------------------------------
            # Try to extend existing active tracks
            # ---------------------------------------------

            for track in active_tracks:

                previous_region = track.get_last_region()

                best_region = None
                best_region_index = None
                best_distance = None

                for region_index, region in enumerate(
                    regions
                ):

                    if region_index in used_region_indices:
                        continue

                    if region.category != track.category:
                        continue

                    distance = self._region_distance(
                        previous_region,
                        region
                    )

                    if not self._within_threshold(
                        distance
                    ):
                        continue

                    if (
                        best_distance is None
                        or self._distance_is_smaller(
                            distance,
                            best_distance
                        )
                    ):
                        best_region = region
                        best_region_index = region_index
                        best_distance = distance

                # -----------------------------------------
                # Existing track successfully continued
                # -----------------------------------------

                if best_region is not None:

                    track.add_region(
                        best_region
                    )

                    used_region_indices.add(
                        best_region_index
                    )

                    new_active_tracks.append(
                        track
                    )

                # -----------------------------------------
                # No matching region
                #
                # The track terminates here.
                #
                # It is deliberately NOT added to
                # new_active_tracks, but remains in
                # all_tracks.
                # -----------------------------------------

            # ---------------------------------------------
            # Unmatched regions become new tracks
            # ---------------------------------------------

            for region_index, region in enumerate(
                regions
            ):

                if region_index in used_region_indices:
                    continue

                track = WeatherAnomalyTrack(
                    track_id=next_track_id,
                    category=region.category
                )

                next_track_id += 1

                track.add_region(region)

                new_active_tracks.append(track)
                all_tracks.append(track)

            active_tracks = new_active_tracks

        # -------------------------------------------------
        # Return complete track history
        # -------------------------------------------------

        return all_tracks

    def _region_distance(
        self,
        first_region,
        second_region
    ):
        """
        Calculate the current geographic distance metric
        between two anomaly regions.

        The initial implementation uses the difference
        between their geographic centers.

        Returns:

            (
                latitude_difference,
                longitude_difference
            )
        """

        first_latitude = (
            self._region_center_latitude(
                first_region
            )
        )

        first_longitude = (
            self._region_center_longitude(
                first_region
            )
        )

        second_latitude = (
            self._region_center_latitude(
                second_region
            )
        )

        second_longitude = (
            self._region_center_longitude(
                second_region
            )
        )

        latitude_difference = abs(
            first_latitude -
            second_latitude
        )

        longitude_difference = abs(
            first_longitude -
            second_longitude
        )

        return (
            latitude_difference,
            longitude_difference
        )

    def _within_threshold(
        self,
        distance
    ):
        """
        Determine whether a region is close enough to
        continue an existing track.
        """

        latitude_difference, longitude_difference = (
            distance
        )

        return (
            latitude_difference
            <= self.maximum_latitude_distance
            and
            longitude_difference
            <= self.maximum_longitude_distance
        )

    def _distance_is_smaller(
        self,
        first_distance,
        second_distance
    ):
        """
        Compare two geographic distances.

        The comparison is lexicographic:

            latitude difference first,
            longitude difference second.

        This keeps the initial tracker deterministic.

        A proper spherical distance metric can replace
        this later without changing the tracker API.
        """

        return first_distance < second_distance

    def _region_center_latitude(
        self,
        region
    ):
        """
        Calculate the latitude of the region center.
        """

        return (
            region.min_latitude +
            region.max_latitude
        ) / 2.0

    def _region_center_longitude(
        self,
        region
    ):
        """
        Calculate the longitude of the region center.
        """

        return (
            region.min_longitude +
            region.max_longitude
        ) / 2.0