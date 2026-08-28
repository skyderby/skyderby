require 'test_helper'

class Profile::MergeableTest < ActiveSupport::TestCase
  setup do
    @country = countries(:norway)
    @source = Profile.create!(name: 'Ivan', owner: users(:regular_user), country: @country)

    5.times do
      create :empty_track, pilot: @source
      create :badge, profile: @source
    end
  end

  def create_exit_profile(profile, suit, index)
    track = Track.create!(pilot: profile, suit:, kind: :base, recorded_at: index.days.ago)
    distances = Track::ExitProfile.drops.map { |drop| (drop * (1.5 + (index * 0.01))).round(1) }

    Track::ExitProfile.create!(
      track:, profile_id: profile.id, suit_id: suit.id, recorded_at: track.recorded_at,
      distances:, reference_distance: distances[Track::ExitProfile.reference_index]
    )
  end

  test 'merge' do
    merged_profile = Profile.create!(
      name: 'Peter',
      owner: events(:nationals)
    ).tap { |profile| profile.merge_with(@source) }

    assert_equal 'Peter', merged_profile.name
    assert_equal countries(:norway), merged_profile.country
    assert_equal 5, merged_profile.tracks.count
    assert_equal 5, merged_profile.badges.count
  end

  test 'rebuilds exit performances instead of moving them into a duplicate' do
    suit = suits(:apache)
    5.times { |index| create_exit_profile(@source, suit, index) }
    Profile::ExitPerformance.recalculate(profile_id: @source.id, suit_id: suit.id)

    destination = Profile.create!(name: 'Peter', owner: events(:nationals))
    Profile::ExitPerformance.create!(profile: destination, suit:, tracks_count: 99, samples: [],
                                     last_recorded_at: 1.year.ago)

    assert destination.merge_with(@source)

    assert_empty Profile::ExitPerformance.where(profile_id: @source.id)
    performances = Profile::ExitPerformance.where(profile_id: destination.id)
    assert_equal 1, performances.count
    assert_equal 5, performances.first.tracks_count
  end

  test 'preserves source name as alias on competitors' do
    competitor = create(:event_competitor, profile: @source)

    destination = Profile.create!(name: 'Peter', owner: events(:nationals))
    destination.merge_with(@source)

    assert_includes destination.aliases.map(&:name), 'Ivan'

    competitor.reload
    assert_equal destination, competitor.profile
    assert_equal 'Ivan', competitor.name
  end

  test 'preserves source name as alias on boogie competitors' do
    boogie = Boogie.create!(name: 'Boogie', starts_at: Time.zone.today, responsible: users(:regular_user))
    category = Boogie::Category.create!(event: boogie, name: 'Open', order: 1)
    competitor = Boogie::Competitor.create!(
      event: boogie, profile: @source, section_id: category.id, suit: suits(:apache)
    )

    destination = Profile.create!(name: 'Peter', owner: events(:nationals))
    destination.merge_with(@source)

    assert_includes destination.aliases.map(&:name), 'Ivan'

    competitor.reload
    assert_equal destination, competitor.profile
    assert_equal 'Ivan', competitor.name
  end

  test 'does not create alias when names match' do
    competitor = create(:event_competitor, profile: @source)

    destination = Profile.create!(name: 'Ivan', owner: events(:nationals))
    destination.merge_with(@source)

    assert_empty destination.aliases
    assert_nil competitor.reload.alias_id
    assert_equal 'Ivan', competitor.name
  end

  test 'merge userpic from source' do
    source = Profile.create(name: 'Ivan', userpic: fixture_file_upload('profile_userpic.png'))
    destination = Profile.create(name: 'Peter')

    destination.merge_with(source)

    assert_not_nil destination.userpic
  end

  test 'do not wipe existent userpic' do
    source = Profile.create(name: 'Ivan')
    destination = Profile.create(name: 'Peter', userpic: fixture_file_upload('profile_userpic.png'))

    destination.merge_with(source)

    assert_not_nil destination.userpic
  end

  test 'merge user if destination user blank' do
    source = Profile.create(name: 'Ivan', owner: users(:regular_user))
    destination = Profile.create(name: 'Peter')

    destination.merge_with(source)

    assert_equal users(:regular_user), destination.owner
  end

  test 'does not merge user if destination user present' do
    source = Profile.create(name: 'Ivan', owner: users(:regular_user))
    destination = Profile.create(name: 'Peter', owner: users(:admin))

    destination.merge_with(source)

    assert_equal users(:admin), destination.owner
  end
end
