from weather.weather_anomaly_track import WeatherAnomalyTrack
from weather.weather_anomaly_region import WeatherAnomalyRegion


print("Weather Anomaly Track test")
print()


# ---------------------------------------------------------
# Create two anomaly regions
# ---------------------------------------------------------

region_0 = WeatherAnomalyRegion(
    region_id=0,
    time="2015-01-01T00:00:00",
    category="extreme_heat"
)

region_0.add_node(
    node_id=38,
    latitude=20.0,
    longitude=78.5,
    value=20.9989,
    standardized_anomaly=2.0190
)


region_1 = WeatherAnomalyRegion(
    region_id=1,
    time="2015-01-01T06:00:00",
    category="extreme_heat"
)

region_1.add_node(
    node_id=40,
    latitude=20.0,
    longitude=79.0,
    value=21.0536,
    standardized_anomaly=2.0448
)


# ---------------------------------------------------------
# Create track
# ---------------------------------------------------------

track = WeatherAnomalyTrack(
    track_id=0,
    category="extreme_heat"
)


print("Initial track")
print("-------------")

print("Track ID:", track.track_id)
print("Category:", track.category)
print("Region count:", track.region_count)
print("Start time:", track.start_time)
print("End time:", track.end_time)

print()


# ---------------------------------------------------------
# Add regions
# ---------------------------------------------------------

track.add_region(region_0)
track.add_region(region_1)


print("Track after adding regions")
print("--------------------------")

print("Track ID:", track.track_id)
print("Category:", track.category)
print("Region count:", track.region_count)
print("Start time:", track.start_time)
print("End time:", track.end_time)
print("Duration count:", track.duration_count)

print()


# ---------------------------------------------------------
# Inspect regions
# ---------------------------------------------------------

print("Track regions")
print("-------------")

for index, region in enumerate(track.regions):

    print(
        f"Region {index}:"
    )

    print(
        f"  Region ID: {region.region_id}"
    )

    print(
        f"  Time: {region.time}"
    )

    print(
        f"  Category: {region.category}"
    )

    print(
        f"  Nodes: {region.node_ids}"
    )

    print()


# ---------------------------------------------------------
# Test region access
# ---------------------------------------------------------

first_region = track.get_region(0)
last_region = track.get_last_region()

print("Region access")
print("-------------")

print(
    "First region:",
    first_region.region_id
)

print(
    "Last region:",
    last_region.region_id
)

print()


# ---------------------------------------------------------
# Test category protection
# ---------------------------------------------------------

invalid_region = WeatherAnomalyRegion(
    region_id=2,
    time="2015-01-01T12:00:00",
    category="extreme_cold"
)

invalid_region.add_node(
    node_id=50,
    latitude=20.0,
    longitude=80.0,
    value=10.0,
    standardized_anomaly=-2.5
)


try:

    track.add_region(invalid_region)

except ValueError as error:

    print("Category protection test")
    print("------------------------")

    print("Correctly rejected incompatible region.")

    print("Error:", error)

else:

    raise RuntimeError(
        "Category protection test failed."
    )


print()
print("Weather Anomaly Track test complete.")