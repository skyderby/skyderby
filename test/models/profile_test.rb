require 'test_helper'

class ProfileTest < ActiveSupport::TestCase
  test '#cropping? - true if all attrs present' do
    profile = Profile.new(crop_x: 1, crop_y: 1, crop_h: 1, crop_w: 1)
    assert_predicate profile, :cropping?
  end

  test '#cropping? - false if none attr present' do
    profile = Profile.new
    assert_not_predicate profile, :cropping?
  end

  test '#cropping? - false if any attr is not present' do
    profile = Profile.new(crop_x: 1, crop_y: 1, crop_h: 1)
    assert_not_predicate profile, :cropping?
  end

  test '#belongs_to_user?' do
    user = create :user
    assert_predicate user.profile, :belongs_to_user?
  end

  test '#belongs_to_event?' do
    event = create :event
    profile = create :profile, owner: event
    assert_predicate profile, :belongs_to_event?
  end

  test '#belongs_to_tournament?' do
    tournament = tournaments(:world_base_race)
    profile = create :profile, owner: tournament
    assert_predicate profile, :belongs_to_tournament?
  end

  test '#competitor_of_events' do
    profile = Profile.create!(name: 'Piotr')
    performance_event = events(:nationals)
    category = performance_event.sections.first
    performance_event.competitors.create!(profile:, suit: suits(:apache), section: category)

    speed_event = speed_skydiving_competitions(:nationals)
    category = speed_event.categories.first
    speed_event.competitors.create!(profile:, category:)

    non_participation_event = events(:nationals).dup.tap(&:save!)

    participations = profile.competitor_of_events
    assert_includes participations, performance_event
    assert_includes participations, speed_event
    assert_not_includes participations, non_participation_event
  end
end
