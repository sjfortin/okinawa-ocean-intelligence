// Synthetic contract data; these are not recorded provider responses.
export const weather = { latitude: 26.4, longitude: 127.7, hourly_units: {"time": "unixtime", "temperature_2m": "°C", "precipitation": "mm", "visibility": "m", "wind_speed_10m": "km/h", "wind_direction_10m": "°", "wind_gusts_10m": "km/h"}, hourly: {
  time: [1790463600, 1790467200], temperature_2m: [28, 29], precipitation: [0, null], visibility: [10000, null], wind_speed_10m: [12, 15], wind_direction_10m: [90, 90], wind_gusts_10m: [20, 25],
} };
export const marine = { latitude: 26.5, longitude: 127.5, hourly_units: {"time": "unixtime", "wave_height": "m", "wave_direction": "°", "wave_period": "s", "swell_wave_height": "m", "swell_wave_direction": "°", "sea_level_height_msl": "m", "sea_surface_temperature": "°C", "ocean_current_velocity": "km/h", "ocean_current_direction": "°"}, hourly: {
  time: [1790467200], wave_height: [null], wave_direction: [90], wave_period: [6], swell_wave_height: [0.4], swell_wave_direction: [100], sea_level_height_msl: [0.1], sea_surface_temperature: [27], ocean_current_velocity: [1.2], ocean_current_direction: [180],
} };
