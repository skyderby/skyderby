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

  test '.search matches canonical name' do
    profile = Profile.create!(name: 'Ivan Ivanov')
    assert_includes Profile.search('ivanov'), profile
  end

  test '.search matches alias name' do
    profile = Profile.create!(name: 'Ivan Ivanov')
    profile.aliases.create!(name: 'Иван Иванович')

    assert_includes Profile.search('Иванович'), profile
  end

  test '.search returns each profile once' do
    profile = Profile.create!(name: 'Ivan Ivanov')
    profile.aliases.create!(name: 'Ivan Ivanovich')
    profile.aliases.create!(name: 'Vanya Ivanov')

    assert_equal 1, Profile.search('ivanov').to_a.count(profile)
  end

  test '.name_options includes canonical and alias names with country' do
    country = countries(:norway)
    profile = Profile.create!(name: 'Ivan Ivanov', country:)
    profile.aliases.create!(name: 'Иван Иванович')

    options = Profile.name_options('Иван')
    alias_option = options.find { |option| option.name == 'Иван Иванович' }

    assert_not_nil alias_option
    assert_equal profile.id, alias_option.profile_id
    assert_equal country.id, alias_option.country_id
  end

  test '.name_options requires minimum query length' do
    Profile.create!(name: 'Ivan')
    assert_empty Profile.name_options('Iv')
  end

  test '.resolve_name returns profile id for exact canonical match' do
    profile = Profile.create!(name: 'Ivan Ivanov')
    assert_equal [profile.id, nil], Profile.resolve_name('ivan ivanov')
  end

  test '.resolve_name returns profile and alias id for alias match' do
    profile = Profile.create!(name: 'Ivan Ivanov')
    alias_record = profile.aliases.create!(name: 'Иван Иванович')
    assert_equal [profile.id, alias_record.id], Profile.resolve_name('Иван Иванович')
  end

  test '.resolve_name returns nil when match is ambiguous' do
    Profile.create!(name: 'Ivan')
    Profile.create!(name: 'Ivan')
    assert_nil Profile.resolve_name('Ivan')
  end

  test '.resolve_name returns nil without a match' do
    assert_nil Profile.resolve_name('Nobody')
  end

  test '.resolve_name treats LIKE metacharacters literally' do
    profile = Profile.create!(name: 'Anne')
    assert_nil Profile.resolve_name('Ann_')
    assert_equal [profile.id, nil], Profile.resolve_name('Anne')
  end

  test '.search treats LIKE metacharacters literally' do
    match = Profile.create!(name: '100% Cotton')
    Profile.create!(name: 'Linen')

    assert_includes Profile.search('100%'), match
    assert_not_includes Profile.search('100%'), Profile.find_by(name: 'Linen')
  end

  test '#competitor_of_events' do
    profile = Profile.create!(name: 'Piotr')
    performance_event = events(:nationals)
    category = performance_event.categories.first
    performance_event.competitors.create!(profile:, suit: suits(:apache), category:)

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
