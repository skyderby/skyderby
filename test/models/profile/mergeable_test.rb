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
