require 'spec_helper'

describe Skyderby::ResultsProcessors::DistanceInAltitude do
  def read_points_from_file(filename)
    pilot = create :pilot
    wingsuit = create :wingsuit

    track_file = TrackFile.create(
      file: File.new("#{Rails.root}/spec/support/tracks/#{filename}")
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      wingsuit: wingsuit
    }
    track = CreateTrackService.new(pilot.user, params, 0).execute
    Skyderby::Tracks::Points.new(track)
  end

  context 'correctly process track for distance in altitude discipline' do
    subject do
      track_points = read_points_from_file '06-38-21_SimonP.CSV'

      Skyderby::ResultsProcessors::DistanceInAltitude.new(
        track_points, altitude: 200, is_flysight: true
      ).calculate
    end

    it 'calculates distance right' do
      expect(subject[:result].round(2)).to eq(80.69)
    end

    it 'calculates best gr' do
      expect(subject[:highest_gr].round(2)).to eq(1.45)
    end

    it 'calculates best speed' do
      expect(subject[:highest_speed].round(2)).to eq(28.68)
    end
  end
end
