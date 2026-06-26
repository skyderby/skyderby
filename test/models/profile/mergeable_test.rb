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
