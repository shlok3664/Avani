import json
from pathlib import Path

import xarray as xr


class GlobalVisualizationBuilder:

    def __init__(
        self,
        source_path,
        output_path,
        variable="temperature",
        spatial_step=8
    ):
        self.source_path = Path(source_path)
        self.output_path = Path(output_path)

        self.variable = variable
        self.spatial_step = spatial_step

    def build(
        self,
        start_time,
        end_time
    ):
        if not self.source_path.exists():
            raise FileNotFoundError(
                f"ERA5 source file not found: "
                f"{self.source_path}"
            )

        if self.spatial_step <= 0:
            raise ValueError(
                "spatial_step must be greater than zero."
            )

        print()
        print(
            "[GlobalVisualization] Opening ERA5:"
        )
        print(
            f"  {self.source_path}"
        )

        with xr.open_dataset(
            self.source_path
        ) as dataset:

            data_array = self._get_variable(
                dataset
            )

            print(
                "[GlobalVisualization] "
                f"ERA5 dimensions: "
                f"{dict(data_array.sizes)}"
            )

            selected = data_array.sel(
                valid_time=slice(
                    start_time,
                    end_time
                )
            )

            selected = selected.isel(
                latitude=slice(
                    None,
                    None,
                    self.spatial_step
                ),
                longitude=slice(
                    None,
                    None,
                    self.spatial_step
                )
            )

            print(
                "[GlobalVisualization] "
                f"Selected dimensions: "
                f"{dict(selected.sizes)}"
            )

            frames = []

            frame_count = (
                selected.sizes["valid_time"]
            )

            for time_index in range(
                frame_count
            ):

                frame = self._build_frame(
                    selected,
                    time_index
                )

                frames.append(frame)

                print(
                    "[GlobalVisualization] "
                    f"Frame {time_index + 1}/"
                    f"{frame_count}: "
                    f"{frame['time']} "
                    f"({len(frame['values'])} values)"
                )

        output = {
            "variable": self.variable,
            "start_time": (
                frames[0]["time"]
                if frames
                else None
            ),
            "end_time": (
                frames[-1]["time"]
                if frames
                else None
            ),
            "frame_count": len(frames),
            "spatial_step": self.spatial_step,
            "global": True,
            "frames": frames
        }

        self.output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        self.output_path.write_text(
            json.dumps(
                output
            ),
            encoding="utf-8"
        )

        print()
        print(
            "[GlobalVisualization] "
            "Global visualization written:"
        )
        print(
            f"  {self.output_path}"
        )

        return output

    def _get_variable(
        self,
        dataset
    ):
        if self.variable == "temperature":
            variable_name = "t2m"
        else:
            raise ValueError(
                f"Global visualization variable "
                f"not implemented yet: "
                f"{self.variable}"
            )

        if variable_name not in dataset:
            raise KeyError(
                f"ERA5 variable not found: "
                f"{variable_name}"
            )

        return dataset[variable_name]

    def _build_frame(
        self,
        data_array,
        time_index
    ):
        time_value = (
            data_array.valid_time.values[
                time_index
            ]
        )

        timestamp = self._serialize_time(
            time_value
        )

        frame_data = data_array.isel(
            valid_time=time_index
        )

        latitudes = (
            frame_data.latitude.values
        )

        longitudes = (
            frame_data.longitude.values
        )

        values = []

        node_id = 0

        for latitude_index, latitude in enumerate(
            latitudes
        ):

            for longitude_index, longitude in enumerate(
                longitudes
            ):

                value = frame_data.values[
                    latitude_index,
                    longitude_index
                ]

                if value != value:
                    continue

                values.append(
                    {
                        "node_id": node_id,
                        "latitude": float(
                            latitude
                        ),
                        "longitude": float(
                            longitude
                        ),
                        "value": float(
                            value - 273.15
                        )
                    }
                )

                node_id += 1

        return {
            "time": timestamp,
            "variable": self.variable,
            "values": values,
            "anomalies": [],
            "regions": [],
            "tracks": [],
            "events": []
        }

    @staticmethod
    def _serialize_time(
        value
    ):
        if hasattr(
            value,
            "isoformat"
        ):
            return value.isoformat()

        return str(value)