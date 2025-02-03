require 'test_helper'

class PerformanceCompetition::ResultTest < ActiveSupport::TestCase
  setup do
    @event = events(:nationals)
    @result = event_results(:john_distance_1)
  end

  test 'can not be created for finished event' do
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      @event.results.create!(
        competitor: event_competitors(:alex),
        round: event_rounds(:distance_1),
        uploaded_by: @event.responsible.profile
      )
    end
  end

  test 'can not be updated for finished event' do
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      @result.update!(result: 120)
    end
  end

  test 'can not be destroyed for finished event' do
    @event.finished!

    assert_raises(ActiveRecord::RecordNotDestroyed) do
      @result.destroy!
    end
  end

  test '#need_review? - true if result is 0' do
    @result.update_columns(result: 0)

    assert_predicate @result, :need_review?
  end

  test '#need_review? - true if detected jump range outside competition window' do
    track = create_track_from_file 'flysight.csv'
    track.update!(ff_start: 10, ff_end: 30)
    result = create :event_result, track: track

    assert_predicate result, :need_review?
  end

  test 'rounds result correctly' do
    @result.result = 266.3477
    @result.save!

    assert_in_delta 266.3, @result.reload.result.round(1), 0.01
  end
end
