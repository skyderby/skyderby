require 'spec_helper'
require 'results_calculator'

describe 'Calculates track results', type: :feature do
  before do
    @csv_flysight = "#{Rails.root}/spec/support/tracks/flysight.csv"
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end
    upload @csv_flysight
    @track = Track.last
    @event = Event.create(range_from: 3000, range_to: 2000)
  end

  it 'Time' do
    round = Round.create(discipline: :time, event: @event)
    expect(ResultsCalculator.calculate(@track, round)).to eql(32.3)
  end

  it 'Distance' do
    round = Round.create(discipline: :distance, event: @event)
    expect(ResultsCalculator.calculate(@track, round)).to eql(1474)
  end

  it 'Speed' do
    round = Round.create(discipline: :speed, event: @event)
    expect(ResultsCalculator.calculate(@track, round)).to eql(164)
  end
end
