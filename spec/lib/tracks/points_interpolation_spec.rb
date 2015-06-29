require 'spec_helper'
require 'tracks/points_interpolation'

describe 'PointsInterpolation' do
  it 'correctly finds point two others' do
    first_point = Skyderby::Tracks::TrackPoint.new(fl_time: 1,
                                 fl_time_abs: Time.parse('2014-07-19T17:35:19.00Z'),
                                 latitude: 53.6134805,
                                 longitude: -114.2022615,
                                 elevation: 3007.745)
    second_point = Skyderby::Tracks::TrackPoint.new(fl_time: 1,
                                  fl_time_abs: Time.parse('2014-07-19T17:35:20.00Z'),
                                  latitude: 53.6135751,
                                  longitude: -114.2014603,
                                  elevation: 2975.243)

    k = (first_point.elevation - 3000) / (first_point.elevation - second_point.elevation)

    new_point = PointsInterpolation.find_between(first_point, second_point, k)
    expect(new_point.fl_time).to eq k
    expect(new_point.latitude).to eq 53.61350304252046
    expect(new_point.longitude).to eq -114.20207057962587
    expect(new_point.elevation).to eq 3000
    expect(new_point.fl_time_abs).to eq (first_point.fl_time_abs + new_point.fl_time)
  end
end
