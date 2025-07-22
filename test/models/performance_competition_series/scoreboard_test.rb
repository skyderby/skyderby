require 'test_helper'

class PerformanceCompetitionSeries::ScoreboardTest < ActiveSupport::TestCase
  setup do
    @responsible = users(:event_responsible)
    @series = PerformanceCompetitionSeries.create!(name: 'Series', responsible: @responsible)
  end

  test 'group categories by name' do
    @series.competitions << PerformanceCompetition.create!(
      name: 'First',
      responsible: @responsible,
      starts_at: '2022-04-20'
    ).tap do |event|
      event.categories.create!(name: 'open')
      event.categories.create!(name: 'intermediate')
    end

    @series.competitions << PerformanceCompetition.create!(
      name: 'Second',
      responsible: @responsible,
      starts_at: '2022-04-20'
    ).tap do |event|
      event.categories.create!(name: 'OPEN')
    end

    categories = PerformanceCompetitionSeries::Scoreboard.new(@series, {}).categories

    assert_equal %w[open intermediate], categories.map { _1.name.downcase }
  end
end
