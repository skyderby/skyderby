require 'test_helper'

class Events::Scoreboards::Results::ItemTest < ActiveSupport::TestCase
  test 'result raw' do
    event_track = event_results(:john_distance_1)
    result = build_result(event_track, {})

    assert_equal 3000, result.result
  end

  test 'result wind adjusted' do
    event_track = event_results(:john_distance_1)
    event_track.event.update!(wind_cancellation: true)
    result = build_result(event_track, {})

    assert_equal 2900, result.result
  end

  test 'result raw, penalty' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, {})

    assert_equal 200, result.result
  end

  test 'result wind adjusted, penalty' do
    event_track = event_results(:john_speed_1)
    event_track.event.update!(wind_cancellation: true)
    result = build_result(event_track, {})

    assert_equal 192, result.result
  end

  test 'result raw, omit penalty' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, omit_penalties: 'true')

    assert_equal 250, result.result
  end

  test 'result wind adjusted, omit penalty' do
    event_track = event_results(:john_speed_1)
    event_track.event.update!(wind_cancellation: true)
    result = build_result(event_track, omit_penalties: 'true')

    assert_equal 240, result.result
  end

  test 'penalized?' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, {})

    assert_predicate result, :penalized?
  end

  test 'omit penalties' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, omit_penalties: 'true')

    assert_not result.penalized?
  end

  test 'penalty size penalized' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, {})

    assert_equal 20, result.penalty_size
  end

  test 'penalty size omit penalties' do
    event_track = event_results(:john_speed_1)
    result = build_result(event_track, omit_penalties: 'true')

    assert_equal 0, result.penalty_size
  end

  test 'best in round and category' do
    event_track = event_results(:travis_speed_1)
    event = event_track.event

    params = Events::Scoreboards::Params.new(event, {})
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)

    result = collection.for(competitor: event_competitors(:travis), round: event_rounds(:speed_1))

    assert_predicate result, :best_in_round_and_category?
  end

  private

  def build_result(event_track, raw_params)
    event = event_track.event
    params = Events::Scoreboards::Params.new(event, raw_params)
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)

    Events::Scoreboards::Results::Item.new(event_track, collection, params)
  end
end
