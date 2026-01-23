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
      series.competitions << PerformanceCompetition.create!(
        name: 'First location',
        responsible: @responsible,
        starts_at: '2022-04-15'
      ).tap do |event|
        category = event.categories.create!(name: 'Open')
        event.competitors.create!(category:, profile: profiles(:alex), suit: suits(:apache))
      end

      series.competitions << PerformanceCompetition.create!(
        name: 'Second location',
        responsible: @responsible,
        starts_at: '2022-04-24'
      ).tap do |event|
        category = event.categories.create!(name: 'Open')
        event.competitors.create!(category:, profile: profiles(:john), suit: suits(:apache))
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

  test 'listable filters events correctly for non-participants' do
    user = create :user

    events(:nationals).update!(name: 'Finished/Public', status: :finished, visibility: :public_event)
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Public', status: :published, visibility: :public_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Draft/Public', status: :draft, visibility: :public_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(
        name: 'Draft/Public/WhenResponsible',
        status: :draft,
        visibility: :public_event,
        responsible: user
      )
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Unlisted', status: :published, visibility: :unlisted_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Private', status: :draft, visibility: :private_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Private/WhenCompetitor', status: :published, visibility: :private_event)
      category = event.categories.create!(name: 'Open')
      event.competitors.create!(profile: user.profile, suit: suits(:apache), category:)
    end

    speed_skydiving_competitions(:nationals).update!(name: 'Speed')
    tournaments(:world_base_race).update!(name: 'Tournament')
    tournaments(:qualification_loen).update!(name: 'Qualification')

    event_array = EventList.listable(user).map { it.event.name }

    assert_includes event_array, 'Finished/Public'
    assert_includes event_array, 'Published/Public'
    assert_includes event_array, 'Speed'
    assert_includes event_array, 'Tournament'
    assert_includes event_array, 'Qualification'
    assert_includes event_array, 'Draft/Public/WhenResponsible'
    assert_includes event_array, 'Published/Private/WhenCompetitor'
    assert_not_includes event_array, 'Published/Private'
    assert_not_includes event_array, 'Published/Unlisted'
    assert_not_includes event_array, 'Draft/Public'
  end
end
