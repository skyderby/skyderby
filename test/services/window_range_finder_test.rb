require 'test_helper'

class WindowRangeFinderTest < ActiveSupport::TestCase
  def setup
    @sample_points = [
      { gps_time: 11, latitude: 0.0, longitude: 0.0, altitude: 3050, v_speed: 100 },
      { gps_time: 14, latitude: 1.1, longitude: 1.9, altitude: 2950, v_speed: 120 },
      { gps_time: 17, latitude: 2.2, longitude: 2.8, altitude: 2850, v_speed: 130 },
      { gps_time: 21, latitude: 3.3, longitude: 3.7, altitude: 2750, v_speed: 140 },
      { gps_time: 24, latitude: 4.4, longitude: 4.6, altitude: 2650, v_speed: 150 },
      { gps_time: 27, latitude: 5.5, longitude: 5.5, altitude: 2550, v_speed: 160 },
      { gps_time: 31, latitude: 6.6, longitude: 6.4, altitude: 2450, v_speed: 170 },
      { gps_time: 34, latitude: 7.7, longitude: 7.3, altitude: 2350, v_speed: 180 }
    ]

    @range_finder = WindowRangeFinder.new(@sample_points)
  end

  test 'from_altitude filter trims until specified altitude' do
    track_segment = @range_finder.execute(from_altitude: 2900)

    assert_equal 7, track_segment.size
    assert_in_delta 15.5, track_segment.start_point[:gps_time], 0.1
    assert_equal 2900, track_segment.start_point[:altitude]
    assert_in_delta 1.65, track_segment.start_point[:latitude], 0.000001
    assert_in_delta 2.35, track_segment.start_point[:longitude], 0.000001
    assert_in_delta 125, track_segment.start_point[:v_speed], 0.1
  end

  test 'from_altitude filter raises error if point with given altitude is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_altitude: 3100)
    end
  end

  test 'from_altitude filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_altitude: 3100)
    end
  end

  test 'to_altitude filter trims after specified altitude' do
    track_segment = @range_finder.execute(to_altitude: 2600)

    assert_equal 6, track_segment.size
    assert_in_delta 25.5, track_segment.end_point[:gps_time], 0.1
    assert_equal 2600, track_segment.end_point[:altitude]
    assert_in_delta 4.95, track_segment.end_point[:latitude], 0.000001
    assert_in_delta 5.05, track_segment.end_point[:longitude], 0.000001
    assert_in_delta 155, track_segment.end_point[:v_speed], 0.1
  end

  test 'to_altitude filter raises error if point with given altitude is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(to_altitude: 3050)
    end
  end

  test 'to_altitude filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(to_altitude: 2300)
    end
  end

  test 'from_vertical_speed filter trims from start by speed' do
    track_segment = @range_finder.execute(from_vertical_speed: 125)

    assert_equal 7, track_segment.size
    assert_in_delta 15.5, track_segment.start_point[:gps_time], 0.1
    assert_equal 2900, track_segment.start_point[:altitude]
    assert_in_delta 1.65, track_segment.start_point[:latitude], 0.000001
    assert_in_delta 2.35, track_segment.start_point[:longitude], 0.000001
    assert_in_delta 125, track_segment.start_point[:v_speed], 0.1
  end

  test 'from_vertical_speed filter raises error if point with given vertical speed is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_vertical_speed: 90)
    end
  end

  test 'from_vertical_speed filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_vertical_speed: 2300)
    end
  end

  test 'from_gps_time filter trims until specified gps_time' do
    track_segment = @range_finder.execute(from_gps_time: 15.5)

    assert_equal 7, track_segment.size
    assert_in_delta 15.5, track_segment.start_point[:gps_time], 0.1
    assert_in_delta 2900, track_segment.start_point[:altitude], 1
    assert_in_delta 1.65, track_segment.start_point[:latitude], 0.000001
    assert_in_delta 2.35, track_segment.start_point[:longitude], 0.000001
    assert_in_delta 125, track_segment.start_point[:v_speed], 0.1
  end

  test 'from_gps_time filter raises error if point with given altitude is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_gps_time: 10)
    end
  end

  test 'from_gps_time filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(from_gps_time: 100)
    end
  end

  test 'duration filter trims after specified duration' do
    track_segment = @range_finder.execute(duration: 9)

    assert_equal 4, track_segment.size
    assert_in_delta 20, track_segment.end_point[:gps_time], 0.1
    assert_equal 2775, track_segment.end_point[:altitude]
    assert_in_delta 3.025, track_segment.end_point[:latitude], 0.000001
    assert_in_delta 3.475, track_segment.end_point[:longitude], 0.000001
    assert_in_delta 137.5, track_segment.end_point[:v_speed], 0.1
  end

  test 'duration filter raises error if point with given altitude is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(duration: 0)
    end
  end

  test 'duration filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(duration: 300)
    end
  end

  test 'elevation filter trims after specified elevation' do
    track_segment = @range_finder.execute(elevation: 250)

    assert_equal 4, track_segment.size
    assert_in_delta 19, track_segment.end_point[:gps_time], 0.1
    assert_equal 2800, track_segment.end_point[:altitude]
    assert_in_delta 2.75, track_segment.end_point[:latitude], 0.000001
    assert_in_delta 3.25, track_segment.end_point[:longitude], 0.000001
    assert_in_delta 135, track_segment.end_point[:v_speed], 0.1
  end

  test 'elevation filter raises error if point with given altitude is first' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(elevation: 0)
    end
  end

  test 'elevation filter raises error if point not found' do
    assert_raises(WindowRangeFinder::ValueOutOfRange) do
      @range_finder.execute(elevation: 3000)
    end
  end

  test 'raises error if given filter unsupported' do
    assert_raises(WindowRangeFinder::UnknownFilter) do
      @range_finder.execute(from_some_column: 0.0)
    end
  end
end
