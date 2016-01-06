require 'spec_helper'

describe Skyderby::ResultsProcessors::DistanceInTime do
  def read_points_from_file filename
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

  context 'correctly process track for distance in time discipline' do
    subject do
      track_points = read_points_from_file '06-38-21_SimonP.CSV'

      result = Skyderby::ResultsProcessors::DistanceInTime.new(
        track_points, time: 20, is_flysight: true
      ).calculate
    end

    it 'calculates distance right' do
      expect(subject[:result].round(2)).to eq(700.43)
    end

    it 'calculates best gr' do
      expect(subject[:highest_gr].round(2)).to eq(2.09)
    end

    it 'calculates best speed' do
      expect(subject[:highest_speed].round(2)).to eq(203.63)
    end
  end
 
end
