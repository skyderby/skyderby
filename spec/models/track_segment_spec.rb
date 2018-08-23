require 'spec_helper'

describe TrackSegment do
  subject { TrackSegment.new(sample_points) }

  it '#size' do
    expect(subject.size).to eq(8)
  end

  it '#start_altitude' do
    expect(subject.start_altitude).to eq(3050)
  end

  it '#end_altitude' do
    expect(subject.end_altitude).to eq(2350)
  end

  it '#vertical_speed' do
    expect(subject.vertical_speed).to be_within(0.5).of(109.5)
  end

  it '#time' do
    expect(subject.time).to eq(23)
  end

  def sample_points
    @points ||= [
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
