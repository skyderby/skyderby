require 'spec_helper'
require 'competitions/skydive_comp_range_finder'

describe 'SkydiveCompRangeFinder', type: :feature do
  before :all do
    visit root_path(locale: 'ru')
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    @track_file = "#{Rails.root}/spec/support/tracks/flysight.csv"
    expect { upload @track_file }.to change(Track, :count).by(1)
  end

  it 'should find right range for specified track' do
    track_points = Skyderby::Tracks::Points.new(Track.last)
    track_comp_range = SkydiveCompRange.for(track_points, 3000, 2000)

    point = track_comp_range.start_point
    expect(point.elevation).to eq 3000
    expect(point.latitude.round(10)).to eq 53.6135025741
    expect(point.longitude.round(10)).to eq -114.202071703

    point = track_comp_range.end_point
    expect(point.elevation).to eq 2000
    expect(point.latitude.round(10)).to eq 53.6172886317
    expect(point.longitude.round(10)).to eq -114.1806616849
  end
end
