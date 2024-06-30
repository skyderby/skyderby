require 'test_helper'

class PointInterpolationTest < ActiveSupport::TestCase
  setup do
    @points_to_interpolate ||= [
      {
        gps_time: 11,
        latitude: 0.0,
        longitude: 0.0,
        altitude: 3050,
        v_speed: 100,
        h_speed: 180
      }, {
        gps_time: 14,
        latitude: 1.1,
        longitude: 1.9,
        altitude: 2950,
        v_speed: 120,
        h_speed: 200
      }
    ]
  end

  test 'interpolates by altitude' do
    expected_point = {
      gps_time: 12.5,
      latitude: 0.55,
      longitude: 0.95,
      altitude: 3000,
      v_speed: 110,
      h_speed: 190
    }

    interpolated_point = PointInterpolation.new(
      @points_to_interpolate.first,
      @points_to_interpolate.last
    ).execute(by: :altitude, with_value: 3000)

    assert_equal expected_point, interpolated_point
  end

  test 'interpolates by altitude when points reversed' do
    expected_point = {
      gps_time: 12.5,
      latitude: 0.55,
      longitude: 0.95,
      altitude: 3000,
      v_speed: 110,
      h_speed: 190
    }

    interpolated_point = PointInterpolation.new(
      @points_to_interpolate.last,
      @points_to_interpolate.first
    ).execute(by: :altitude, with_value: 3000)

    assert_equal expected_point, interpolated_point
  end

  test 'interpolates by gps_time when points reversed' do
    expected_point = {
      gps_time: 12.5,
      latitude: 0.55,
      longitude: 0.95,
      altitude: 3000,
      v_speed: 110,
      h_speed: 190
    }

    interpolated_point = PointInterpolation.new(
      @points_to_interpolate.last,
      @points_to_interpolate.first
    ).execute(by: :gps_time, with_value: 12.5)

    assert_equal expected_point, interpolated_point
  end

  test 'raise error if value for interpolation out of range' do
    interpolation_sevice = PointInterpolation.new(
      @points_to_interpolate.first,
      @points_to_interpolate.last
    )

    assert_raises(PointInterpolation::ValueOutOfRange) do
      interpolation_sevice.execute(by: :altitude, with_value: 5000)
    end
  end
end
