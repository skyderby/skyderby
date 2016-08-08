require 'spec_helper'

# Тесты основаны на ручных вычислениях и дополняются 
# вручную выверенными треками. 
describe 'Results processing:' do
  let(:range) { { range_from: 3000, range_to: 2000 } }
  let(:pilot) { create(:pilot) }
  let(:wingsuit) { create(:wingsuit) }

  context 'Flysight sample track from Michael Cooper' do
    subject :michaels_track do
      track_file = TrackFile.create(
        file: File.new("#{Rails.root}/spec/support/tracks/flysight.csv")
      )

      params = {
        track_file_id: track_file.id,
        pilot: pilot,
        wingsuit: wingsuit
      }
      track = CreateTrackService.new(pilot.user, params, 0).execute
      Skyderby::Tracks::Points.new(track).trimmed
    end

    it 'calculates correct result in Time discipline' do
      expect(
        Skyderby::ResultsProcessor.new(michaels_track, :time, range).execute
      ).to eql(32.3)
    end

    it 'calculates correct result in Distance discipline' do
      expect(
        Skyderby::ResultsProcessor.new(michaels_track, :distance, range).execute
      ).to eql(1474)
    end

    it 'calculates correct result in Speed discipline' do
      expect(
        Skyderby::ResultsProcessor.new(michaels_track, :speed, range).execute
      ).to eql(164.3)
    end
  end

  context 'Distance (2014 - Csaba - Round 1)' do
    subject :csabas_track do
      track_file = TrackFile.create(
        file: File.new("#{Rails.root}/spec/support/tracks/2014-Csaba-Round-1.CSV")
      )

      params = {
        track_file_id: track_file.id,
        pilot: pilot,
        wingsuit: wingsuit
      }
      track = CreateTrackService.new(pilot.user, params, 0).execute
      Skyderby::Tracks::Points.new(track).trimmed
    end

    it 'calculates correct result Distance discipline' do
      expect(
        Skyderby::ResultsProcessor.new(csabas_track, :distance, range).execute
      ).to eql(2110)
    end
  end
end
