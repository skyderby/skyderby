require 'spec_helper'
require 'competitions/results_processor'

# Тесты основаны на ручных вычислениях и дополняются вручную выверенными треками. 
describe 'Results processing:' do
  let (:range) { {range_from: 3000, range_to: 2000} }
  let (:pilot) { create(:pilot) }
  let (:wingsuit) { create(:wingsuit) }
    
  context 'Flysight sample track from Michael Cooper' do
    subject :michaels_track do
      track = Track.create!(
        file: File.new("#{Rails.root}/spec/support/tracks/flysight.csv"),
        pilot: pilot,
        wingsuit: wingsuit
      )
      points = Skyderby::Tracks::Points.new(track)
    end

    it 'calculates correct result in Time discipline' do
      expect(ResultsProcessor.process(michaels_track, :time, range)).to eql(32.3)
    end

    it 'calculates correct result in Distance discipline' do
      expect(ResultsProcessor.process(michaels_track, :distance, range)).to eql(1474)
    end

    it 'calculates correct result in Speed discipline' do
      expect(ResultsProcessor.process(michaels_track, :speed, range)).to eql(164.3)
    end
  end

  context 'Distance (2014 - Csaba - Round 1)' do
    subject :csabas_track do
      track = Track.create!(
        file: File.new("#{Rails.root}/spec/support/tracks/2014-Csaba-Round-1.CSV"),
        pilot: pilot,
        wingsuit: wingsuit
      )
      points = Skyderby::Tracks::Points.new(track)
    end

    it 'calculates correct result Distance discipline' do
      expect(ResultsProcessor.process(csabas_track, :distance, range)).to eql(2110)
    end
  end
end
