require 'spec_helper'
require 'results_calculator'

describe 'Calculates track results', :type => :feature do

  before do
    @csv_flysight = "#{Rails.root}/spec/support/tracks/flysight.csv"
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end
    upload @csv_flysight
    @track = Track.last
    @event = Event.create(:comp_range_from => 3000, :comp_range_to => 2000)
  end

  it 'Time' do

    round = Round.create(:discipline => Discipline.time, :event => @event)
    results_calculator = ResultsCalculator.new(@track, round)

    results_calculator.calculate.eql? 32.3

  end

  it 'Distance' do

    round = Round.create(:discipline => Discipline.distance, :event => @event)
    results_calculator = ResultsCalculator.new(@track, round)

    results_calculator.calculate.eql? 1478

  end

  it 'Speed' do

    round = Round.create(:discipline => Discipline.speed, :event => @event)
    results_calculator = ResultsCalculator.new(@track, round)

    results_calculator.calculate.eql? 165

  end

end