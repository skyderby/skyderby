require 'test_helper'

class Profile::PermissionsTest < ActiveSupport::TestCase
  setup do
    @admin = users(:admin)
  end

  test '#editable? - allowed to admins' do
    assert profiles(:john).editable?(@admin)
  end

  test '#editable? - allowed to owner' do
    user = create :user
    assert user.profile.editable?(user)
  end

  test '#editable? - allowed to responsible of event' do
    user = create :user
    event = create :event, responsible: user

    profile = create :profile, owner: event
    assert profile.editable?(user)
  end

  test '#editable? - allowed to organizer of event' do
    user = create :user
    event = create :event
    create :event_organizer, organizable: event, user: user

    profile = create :profile, owner: event
    assert profile.editable?(user)
  end

  test '#editable? - not allowed to anyone else' do
    profile = create :profile

    user = create :user
    assert_not profile.editable?(user)
  end

  test '#deletable? - only allowed to admins' do
    assert profiles(:john).deletable?(@admin)
    assert_not profiles(:john).deletable?(create(:user))
  end

  test '#masqueradable? - only allowed to admins' do
    assert profiles(:john).masqueradable?(@admin)
    assert_not profiles(:john).masqueradable?(create(:user))
  end

  test '#mergeable? - only allowed to admins' do
    assert profiles(:john).mergeable?(@admin)
    assert_not profiles(:john).mergeable?(create(:user))
  end
end
