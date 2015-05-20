require 'spec_helper'
require 'tracks/track_point'

describe 'TrackPoint' do
  let ( :hash_point) do
    {
      fl_time_abs: 1,
      fl_time: 1,
      latitude: 12.345678,
      longitude: 98.765432,
      elevation: 3000.5,
      elevation_diff: 40.5,
      abs_altitude: 3800.37,
      h_speed: 200.0,
      v_speed: 100.0,
      raw_h_speed: 200.0,
      raw_v_speed: 100.0
    }
  end

  it 'should initialize from hash' do
    point = TrackPoint.new(hash_point)
    hash_point.each do |key, value|
      expect(point[key]).to eql value
    end
  end

  it 'should calc gr and raw_gr on init' do
    point = TrackPoint.new(hash_point)
    expect(point.glrat).to eq 2
    expect(point.raw_gr).to eq 2
  end

  it 'should calc gr and raw_gr on change' do
    point = TrackPoint.new(hash_point)
    point.h_speed = 300.0
    expect(point.glrat).to eq 3
    point.raw_h_speed = 450.0
    expect(point.raw_gr).to eq 4.5
  end
end
