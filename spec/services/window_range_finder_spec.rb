require 'spec_helper'

describe WindowRangeFinder do
  context 'from_altitude filter' do
    it 'trim until specified altitude' do
      range_finder = WindowRangeFinder.new(sample_points)
      track_segment = range_finder.execute(from_altitude: 2900)

      expect(track_segment.size).to eq(7)

      expect(track_segment.start_point[:gps_time]).to be_within(0.1).of(15.5)
      expect(track_segment.start_point[:altitude]).to eq(2900)
      expect(track_segment.start_point[:latitude]).to be_within(0.000001).of(1.65)
      expect(track_segment.start_point[:longitude]).to be_within(0.000001).of(2.35)
      expect(track_segment.start_point[:v_speed]).to be_within(0.1).of(125)
    end

    it 'raises error if point with given altitude is first' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(from_altitude: 3100) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end

    it 'raises error if point not found' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(from_altitude: 3100) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end
  end

  context 'to_altitude filter' do
    it 'trim after specified altitude' do
      range_finder = WindowRangeFinder.new(sample_points)
      track_segment = range_finder.execute(to_altitude: 2600)

      expect(track_segment.size).to eq(6)

      expect(track_segment.end_point[:gps_time]).to be_within(0.1).of(25.5)
      expect(track_segment.end_point[:altitude]).to eq(2600)
      expect(track_segment.end_point[:latitude]).to be_within(0.000001).of(4.95)
      expect(track_segment.end_point[:longitude]).to be_within(0.000001).of(5.05)
      expect(track_segment.end_point[:v_speed]).to be_within(0.1).of(155)
    end

    it 'raises error if point with given altitude is first' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(to_altitude: 3050) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end

    it 'raises error if point not found' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(to_altitude: 2300) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end
  end

  context 'from_vertical_speed filter' do
    it 'trim from start by speed' do
      range_finder = WindowRangeFinder.new(sample_points)
      track_segment = range_finder.execute(from_vertical_speed: 125)

      expect(track_segment.size).to eq(7)

      expect(track_segment.start_point[:gps_time]).to be_within(0.1).of(15.5)
      expect(track_segment.start_point[:altitude]).to eq(2900)
      expect(track_segment.start_point[:latitude]).to be_within(0.000001).of(1.65)
      expect(track_segment.start_point[:longitude]).to be_within(0.000001).of(2.35)
      expect(track_segment.start_point[:v_speed]).to be_within(0.1).of(125)
    end

    it 'raises error if point with given altitude is first' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(from_vertical_speed: 90) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end

    it 'raises error if point not found' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(from_vertical_speed: 2300) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end
  end

  context 'duration filter' do
    it 'trim after specified duration' do
      range_finder = WindowRangeFinder.new(sample_points)
      track_segment = range_finder.execute(duration: 9)

      expect(track_segment.size).to eq(4)

      expect(track_segment.end_point[:gps_time]).to be_within(0.1).of(20)
      expect(track_segment.end_point[:altitude]).to eq(2775)
      expect(track_segment.end_point[:latitude]).to be_within(0.000001).of(3.025)
      expect(track_segment.end_point[:longitude]).to be_within(0.000001).of(3.475)
      expect(track_segment.end_point[:v_speed]).to be_within(0.1).of(137.5)
    end

    it 'raises error if point with given altitude is first' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(duration: 0) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end

    it 'raises error if point not found' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(duration: 300) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end
  end

  context 'elevation filter' do
    it 'trim after specified elevation' do
      range_finder = WindowRangeFinder.new(sample_points)
      track_segment = range_finder.execute(elevation: 250)

      expect(track_segment.size).to eq(4)

      expect(track_segment.end_point[:gps_time]).to be_within(0.1).of(19)
      expect(track_segment.end_point[:altitude]).to eq(2800)
      expect(track_segment.end_point[:latitude]).to be_within(0.000001).of(2.75)
      expect(track_segment.end_point[:longitude]).to be_within(0.000001).of(3.25)
      expect(track_segment.end_point[:v_speed]).to be_within(0.1).of(135)
    end

    it 'raises error if point with given altitude is first' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(elevation: 0) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end

    it 'raises error if point not found' do
      range_finder = WindowRangeFinder.new(sample_points)
      expect { range_finder.execute(elevation: 3000) }
        .to raise_exception(WindowRangeFinder::ValueOutOfRange)
    end
  end

  it 'raises error if given filter unsupported' do
    range_finder = WindowRangeFinder.new(sample_points)
    expect { range_finder.execute(from_some_column: 0.0) }
      .to raise_exception(WindowRangeFinder::UnknownFilter)
  end

  def sample_points
    [
      { gps_time: 11, latitude: 0.0, longitude: 0.0, altitude: 3050, v_speed: 100 },
      { gps_time: 14, latitude: 1.1, longitude: 1.9, altitude: 2950, v_speed: 120 },
      { gps_time: 17, latitude: 2.2, longitude: 2.8, altitude: 2850, v_speed: 130 },
      { gps_time: 21, latitude: 3.3, longitude: 3.7, altitude: 2750, v_speed: 140 },
      { gps_time: 24, latitude: 4.4, longitude: 4.6, altitude: 2650, v_speed: 150 },
      { gps_time: 27, latitude: 5.5, longitude: 5.5, altitude: 2550, v_speed: 160 },
      { gps_time: 31, latitude: 6.6, longitude: 6.4, altitude: 2450, v_speed: 170 },
      { gps_time: 34, latitude: 7.7, longitude: 7.3, altitude: 2350, v_speed: 180 }
    ]
  end
end
