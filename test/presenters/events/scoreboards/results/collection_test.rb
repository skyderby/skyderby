require 'test_helper'

class Events::Scoreboards::Results::CollectionTest < ActiveSupport::TestCase
  def test_for_by_round_and_competitor
    params = build_params
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)
    competitor = event_competitors(:john)
    round = event_rounds(:speed_1)

    result = collection.for(competitor: competitor, round: round).result
    assert_equal 200, result
  end

  def test_for_by_round_and_competitor_without_penalties
    params = build_params(omit_penalties: 'true')
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)
    competitor = event_competitors(:john)
    round = event_rounds(:speed_1)

    result = collection.for(competitor: competitor, round: round).result
    assert_equal 250, result
  end

  def test_best_in_round
    params = build_params
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)

    best_in_round = collection.best_in(round: event_rounds(:speed_1))

    assert_equal 270, best_in_round.result
  end

  def test_worst_in_round
    params = build_params
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)

    worst_in_round = collection.worst_in(round: event_rounds(:speed_1))

    assert_equal 200, worst_in_round.result
  end

  private

  def build_params(raw_params = {})
    Events::Scoreboards::Params.new(event, raw_params)
  end

  def event
    performance_competitions(:nationals)
  end
end
