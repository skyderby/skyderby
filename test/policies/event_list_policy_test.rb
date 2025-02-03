require 'test_helper'

class EventPolicy::ScopeTest < ActiveSupport::TestCase
  test 'public competitions visible to non-participants' do
    user = create :user

    events(:nationals).update!(name: 'Finished/Public', status: :finished, visibility: :public_event)
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Public', status: :published, visibility: :public_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Draft/Public', status: :draft, visibility: :public_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Draft/Public/WhenResponsible', status: :draft, visibility: :public_event, responsible: user)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Unlisted', status: :published, visibility: :unlisted_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Private', status: :draft, visibility: :private_event)
    end
    events(:nationals).dup.tap do |event|
      event.update!(name: 'Published/Private/WhenCompetitor', status: :draft, visibility: :private_event)
      section = event.sections.create!(name: 'Open')
      event.competitors.create!(profile: user.profile, suit: suits(:apache), section:)
    end

    speed_skydiving_competitions(:nationals).update!(name: 'Speed')
    tournaments(:world_base_race).update!(name: 'Tournament')
    tournaments(:qualification_loen).update!(name: 'Qualification')

    event_array = EventPolicy::Scope.new(user, EventList.all).resolve.map { _1.event.name }

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
