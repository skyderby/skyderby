require 'spec_helper'
require 'tracks/points_interpolation'

describe 'PointsInterpolation' do
  let(:first_point) do
    Skyderby::Tracks::TrackPoint.new(
      fl_time: 1,
      fl_time_abs: Time.parse('2014-07-19T17:35:19.00Z'),
      latitude: 53.6134805,
      longitude: -114.2022615,
      elevation: 3007.745,
      abs_altitude: 3107.745
    )
  end

  let(:second_point) do
    Skyderby::Tracks::TrackPoint.new(
      fl_time: 1,
      fl_time_abs: Time.parse('2014-07-19T17:35:20.00Z'),
      latitude: 53.6135751,
      longitude: -114.2014603,
      elevation: 2975.243,
      abs_altitude: 3075.243
    )
  end

  let(:k) do
    (first_point.elevation - 3000) / (first_point.elevation - second_point.elevation)
  end

  context 'correctly finds point between two others' do
    subject { PointsInterpolation.find_between(first_point, second_point, k) }

    it 'calculate fl_time' do
      expect(subject.fl_time).to eq k
    end

    it 'calculate latitude' do
      expect(subject.latitude.to_f).to eq(53.61350304252046)
    end

    it 'calculate longitude' do
      expect(subject.longitude.to_f).to eq(-114.20207057962587)
    end

    it 'calculate elevation' do
      expect(subject.elevation).to eq 3000
    end

    it 'calculate abs_altitude' do
      expect(subject.abs_altitude).to eq 3100
    end

    it 'calculate fl_time_abs' do
      expect(subject.fl_time_abs).to eq(first_point.fl_time_abs + subject.fl_time)
    end
  end
end
