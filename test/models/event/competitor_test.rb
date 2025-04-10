require 'test_helper'

class PerformanceCompetition::CompetitorTest < ActiveSupport::TestCase
  setup do
    @event = performance_competitions(:nationals)
    @category = event_sections(:advanced)
    @norwegian = Profile.create! name: 'Natural Athlete', country: countries(:norway)
    @russian = Profile.create! name: 'Natural Athlete', country: countries(:russia)
  end

  test 'can not be created for finished event' do
    @event.finished!
    assert_raises(ActiveRecord::RecordInvalid) do
      @event.competitors.create!(profile: @norwegian, suit: suits(:apache), section: @category)
    end
  end

  test 'can not be updated for finished event' do
    competitor = @event.competitors.create!(profile: @norwegian, suit: suits(:apache), section: @category)
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      competitor.update!(profile: @russian)
    end
  end

  test 'can not be destroyed for finished event' do
    competitor = @event.competitors.create!(profile: @norwegian, suit: suits(:apache), section: @category)
    @event.finished!

    assert_raises(ActiveRecord::RecordNotDestroyed) do
      competitor.destroy!
    end
  end

  test 'russian competitor in restricted event' do
    @event.update!(is_official: true, starts_at: '2021-09-01')
    competitor = @event.competitors.create! profile: @russian, suit: suits(:apache), section: @category

    assert_equal 'RPF', competitor.country_code
    assert_equal 'Neutral Athletes', competitor.country_name
  end

  test 'norwegian competitor in restricted event' do
    @event.update!(is_official: true, starts_at: '2021-09-01')
    competitor = @event.competitors.create! profile: @norwegian, suit: suits(:apache), section: @category

    assert_equal 'NOR', competitor.country_code
    assert_equal 'Norway', competitor.country_name
  end

  test 'russian competitor in non-restricted event' do
    @event.update!(is_official: false)
    competitor = @event.competitors.create! profile: @russian, suit: suits(:apache), section: @category

    assert_equal 'RUS', competitor.country_code
    assert_equal 'Russia', competitor.country_name
  end
end
