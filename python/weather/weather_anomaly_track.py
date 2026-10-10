class WeatherAnomalyTrack:
    """
    Represents the temporal evolution of one weather anomaly.

    A track contains a chronological sequence of
    WeatherAnomalyRegion objects that are considered to
    belong to the same evolving weather event.

    The track itself does not determine how regions are
    matched. That decision is made by
    AnomalyTemporalTracker.
    """

    def __init__(
        self,
        track_id,
        category
    ):
        self.track_id = int(track_id)
        self.category = category

        self.regions = []

    def add_region(self, region):
        """
        Add an anomaly region to this track.

        Regions must belong to the same anomaly category.
        """

        if region.category != self.category:
            raise ValueError(
                "Region category does not match "
                "track category."
            )

        self.regions.append(region)

    @property
    def region_count(self):
        """
        Return the number of anomaly regions
        currently belonging to this track.
        """

        return len(self.regions)

    @property
    def start_time(self):
        """
        Return the time at which this track begins.
        """

        if not self.regions:
            return None

        return self.regions[0].time

    @property
    def end_time(self):
        """
        Return the time at which this track currently ends.
        """

        if not self.regions:
            return None

        return self.regions[-1].time

    @property
    def duration_count(self):
        """
        Return the number of time steps represented
        by this track.

        This is a temporal step count rather than an
        actual physical duration.
        """

        return self.region_count

    def get_region(self, index):
        """
        Return a region by its position in the track.
        """

        return self.regions[index]

    def get_last_region(self):
        """
        Return the most recent region in the track.

        Returns None when the track contains no regions.
        """

        if not self.regions:
            return None

        return self.regions[-1]

    def __repr__(self):
        return (
            f"WeatherAnomalyTrack("
            f"track_id={self.track_id}, "
            f"category={self.category}, "
            f"region_count={self.region_count}, "
            f"start_time={self.start_time}, "
            f"end_time={self.end_time}"
            f")"
        )