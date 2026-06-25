require 'test_helper'

class PerformanceCompetition::CompetitorPlacesTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup { @event = events(:nationals) }

  test 'assign_competitor_places! stores the scoreboard rank on each competitor' do
    expected = expected_places(@event)
    assert expected.values.any?(&:present?), 'fixture should produce ranked competitors'

    @event.assign_competitor_places!

    expected.each do |competitor_id, rank|
      assert_equal rank, PerformanceCompetition::Competitor.find(competitor_id).rank
    end
  end

  test 'completing a round recalculates competitor places' do
    @event.competitors.update_all(rank: nil)

    perform_enqueued_jobs { @event.rounds.first.update!(completed: true) }

    assert(@event.competitors.reload.any? { |competitor| competitor.rank.present? })
  end

  test 'clears places when no rounds are completed' do
    @event.assign_competitor_places!
    assert(@event.competitors.reload.any? { |competitor| competitor.rank.present? })

    perform_enqueued_jobs { @event.rounds.find_each { |round| round.update!(completed: false) } }

    assert(@event.competitors.reload.all? { |competitor| competitor.rank.nil? })
  end

  private

  def expected_places(event)
    event.standings.categories.values.flat_map(&:rows).to_h { |row| [row.competitor.id, row.rank] }
  end
end
