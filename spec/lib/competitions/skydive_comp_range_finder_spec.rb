require 'spec_helper'
require 'competitions/skydive_comp_range_finder'

describe 'SkydiveCompRangeFinder', type: :feature do
  before :all do
    visit root_path(locale: 'ru')
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    track_file = TrackFile.create(
        file: File.new("#{Rails.root}/spec/support/tracks/flysight.csv")
    )

    params = {
        track_file_id: track_file.id,
        pilot: FactoryGirl.create(:pilot),
        wingsuit: FactoryGirl.create(:wingsuit)
    }
    track = CreateTrackService.new(params[:pilot].user, params, 0).execute
    track_points = Skyderby::Tracks::Points.new(track).trimmed
    @track_comp_range = SkydiveCompRange.for(track_points, 3000, 2000)
  end

  context 'start point' do
    subject { @track_comp_range.start_point }

    it 'have correct abs. altitude' do
      expect(subject.abs_altitude).to eq 3746.81
    end

    it 'have correct elevation' do
      expect(subject.elevation).to eq 3000
    end

    it 'have correct latitude' do
      expect(subject.latitude.round(7)).to eq 53.6135026
    end

    it 'have correct longitude' do
      expect(subject.longitude.round(7)).to eq -114.2020719
    end
  end

  context 'end point' do
    subject { @track_comp_range.end_point }

    it 'have correct abs. altitude' do
      expect(subject.abs_altitude).to eq 2746.81
    end

    it 'have correct elevation' do
      expect(subject.elevation).to eq 2000
    end

    it 'have correct latitude' do
      expect(subject.latitude.round(7)).to eq 53.6172886
    end

    it 'have correct longitude' do
      expect(subject.longitude.round(7)).to eq -114.1806617
    end
  end
end
