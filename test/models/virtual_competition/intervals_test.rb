require 'test_helper'

class VirtualCompetition::IntervalsTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:base_race)
    @competition.custom_intervals!

    @competition.tap do |record|
      record.custom_intervals.create(
        name: '1st week',
        period_from: Time.zone.parse('2018-01-01 00:00:00'),
        period_to: Time.zone.parse('2018-01-07 23:59:59')
      )

      record.custom_intervals.create(
        name: '2nd week',
        period_from: Time.zone.parse('2018-01-08 00:00:00'),
        period_to: Time.zone.parse('2018-01-15 23:59:59')
      )

      record.custom_intervals.create(
        name: '3rd week',
        period_from: Time.zone.parse('2018-01-16 00:00:00'),
        period_to: Time.zone.parse('2018-01-21 23:59:59')
      )
    end
  end

  test 'last_interval before start' do
    travel_to Time.zone.parse('2017-01-01')
    assert_nil @competition.last_interval
  end

  test 'last_interval when in the middle' do
    travel_to Time.zone.parse('2018-01-09')
    assert_equal '2nd week', @competition.last_interval.name
  end

  test 'last_interval after end' do
    travel_to Time.zone.parse('2019-01-01')
    assert_equal '3rd week', @competition.last_interval.name
  end

  test 'intervals before start' do
    travel_to Time.zone.parse('2017-01-01')
    assert_empty @competition.intervals.map(&:name)
  end

  test 'intervals when in the middle' do
    travel_to Time.zone.parse('2018-01-09')
    assert_equal ['1st week', '2nd week'], @competition.intervals.map(&:name)
  end

  test 'intervals after end' do
    travel_to Time.zone.parse('2019-01-01')
    assert_equal ['1st week', '2nd week', '3rd week'], @competition.intervals.map(&:name)
  end
end
