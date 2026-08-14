require 'test_helper'

class Boogie::Scoreboard::StandingsTest < ActiveSupport::TestCase
  setup do
    @event = Boogie.find(events(:boogie).id)
    @rounds = @event.rounds.order(:number)
    @competitors = @event.competitors.to_a
    @results = @event.results.to_a
  end

  test 'pilots with the minimum set of jumps come first, ordered by average' do
    rows = standings(@results).rows

    assert_equal [competitor(:boogie_john), competitor(:boogie_travis)],
                 rows.first(2).map(&:competitor)
    assert rows.first(2).all?(&:qualified?)
    assert_equal 3100, rows.first.total_points
  end

  test 'pilots without the minimum set follow, ordered by number of jumps' do
    rows = standings(@results).rows
    unqualified = rows.reject(&:qualified?)

    assert_equal competitor(:boogie_organizer), unqualified.first.competitor
    assert_equal 1, unqualified.first.results.size
    assert_equal 0, unqualified.last.results.size
  end

  test 'pilots with the same number of jumps are ordered by their average' do
    rows = standings([result(:boogie_organizer_1), result(:boogie_john_1)]).rows

    assert_equal [competitor(:boogie_john), competitor(:boogie_organizer)],
                 rows.first(2).map(&:competitor)
  end

  test 'pilots without results are ordered alphabetically' do
    names = standings([]).rows.map { |row| row.competitor.name }

    assert_equal names.sort, names
  end

  private

  def standings(results)
    Boogie::Scoreboard::Standings.new(
      @competitors, @rounds, results, @event.number_of_results_for_total
    )
  end

  def competitor(fixture_name)
    @competitors.find { |competitor| competitor.id == event_competitors(fixture_name).id }
  end

  def result(fixture_name)
    @results.find { |result| result.id == event_results(fixture_name).id }
  end
end
