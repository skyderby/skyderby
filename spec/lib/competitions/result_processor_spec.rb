require 'spec_helper'
require 'competitions/results_processor'

describe 'Results processing:', type: :feature do
  before :all do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    @track_file = "#{Rails.root}/spec/support/tracks/flysight.csv"
    expect { upload @track_file }.to change(Track, :count).by(1)

    @track = Track.last
    @track_points = TrackPoints.new(@track)
    @params = {range_from: 3000, range_to: 2000}
  end

  it 'Time' do
    expect(ResultsProcessor.process(@track_points, :time, @params)).to eql(32.3)
  end

  it 'Distance' do
    expect(ResultsProcessor.process(@track_points, :distance, @params)).to eql(1474)
  end

  it 'Speed' do
    expect(ResultsProcessor.process(@track_points, :speed, @params)).to eql(164.3)
  end
end
