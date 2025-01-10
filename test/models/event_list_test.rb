require 'test_helper'

class EventListTest < ActiveSupport::TestCase
  setup do
    @responsible = users(:event_responsible)
  end

  test 'PerformanceCompetitionSeries' do
    PerformanceCompetitionSeries.create! \
      name: 'Empty one',
      responsible: @responsible

    PerformanceCompetitionSeries.create!(
      name: 'With two locations',
      responsible: @responsible
    ).tap do |series|
      series.competitions << Event.create!(
        name: 'First location',
        responsible: @responsible,
        starts_at: '2022-04-15'
      ).tap do |event|
        category = event.sections.create!(name: 'Open')
        event.competitors.create!(
          section: category,
          profile: profiles(:alex),
          suit: suits(:apache)
        )
      end

      series.competitions << Event.create!(
        name: 'Second location',
        responsible: @responsible,
        starts_at: '2022-04-24'
      ).tap do |event|
        category = event.sections.create!(name: 'Open')
        event.competitors.create!(
          section: category,
          profile: profiles(:john),
          suit: suits(:apache)
        )
      end
    end

    records = EventList.where(event_type: 'PerformanceCompetitionSeries')
    assert_equal 2, records.count
    empty_series = records.find { |r| r.name == 'Empty one' }

    assert_not_nil empty_series
    assert_nil empty_series.starts_at
    assert_nil empty_series.country_ids
    assert_nil empty_series.competitors_count

    series = records.find { |r| r.name == 'With two locations' }

    assert_not_nil series
    assert_equal Time.zone.parse('2022-04-15'), series.starts_at
    assert_equal({ 'First location' => 1, 'Second location' => 1 }, series.competitors_count)
    assert_equal [profiles(:john).country_id], series.country_ids
  end
end
