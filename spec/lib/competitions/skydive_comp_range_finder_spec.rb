require 'spec_helper'
require 'competitions/skydive_comp_range_finder'

describe 'SkydiveCompRangeFinder', type: :feature do
  before :all do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    @track_file = "#{Rails.root}/spec/support/tracks/flysight.csv"
    expect { upload @track_file }.to change(Track, :count).by(1)
  end

  it 'should find right range for specified track' do
        track_comp_range = SkydiveCompRange.for(Track.last, 3000, 2000)

    point = track_comp_range.start_point
    expect(point.elevation).to eq 3000
    expect(point.latitude.round(10)).to eq 53.6135027708
    expect(point.longitude.round(10)).to eq -114.2020732488

    point = track_comp_range.end_point
    expect(point.elevation).to eq 2000
    expect(point.latitude.round(10)).to eq 53.6172882092
    expect(point.longitude.round(10)).to eq -114.1806631144
  end
end
