require 'test_helper'

class Event::RoundTest < ActiveSupport::TestCase
  setup do
    @event = PerformanceCompetition.create!(
      name: 'Test Event',
      starts_at: Time.zone.today,
      place: places(:ravenna),
      responsible: users(:event_responsible)
    )
  end

  test 'can not be created for finished event' do
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      @event.rounds.create!(discipline: 'time')
    end
  end

  test 'can not be updated for finished event' do
    round = @event.rounds.create!(discipline: 'time')
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      round.update!(discipline: 'speed')
    end
  end

  test 'can not be destroyed for finished event' do
    round = @event.rounds.create!(discipline: 'time')
    @event.finished!

    assert_raises(ActiveRecord::RecordNotDestroyed) do
      round.destroy!
    end
  end

  test 'automatically set number as order within discipline' do
    assert_equal 1, @event.rounds.create!(discipline: 'time').number
    assert_equal 2, @event.rounds.create!(discipline: 'time').number

    assert_equal 1, @event.rounds.create!(discipline: 'speed').number
    assert_equal 2, @event.rounds.create!(discipline: 'speed').number
  end

  test 'should require discipline' do
    round = @event.rounds.new(number: 1)
    assert_not round.valid?
  end

  test '.by_name' do
    event = events(:nationals)
    assert_equal event_rounds(:distance_1), event.rounds.by_name('Distance-1')
  end
end
