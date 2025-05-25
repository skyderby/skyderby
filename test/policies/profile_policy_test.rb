require 'test_helper'

class ProfilePolicyTest < ActiveSupport::TestCase
  setup do
    @admin = users(:admin)
  end

  test '#index?' do
    assert_predicate ProfilePolicy.new(@admin, Profile), :index?
    assert_predicate ProfilePolicy.new(nil, Profile), :index?
  end

  test '#update? - allowed to admins' do
    profile = profiles(:john)
    assert_predicate ProfilePolicy.new(@admin, profile), :update?
  end

  test '#update? - allowed to owner' do
    user = create :user
    assert_predicate ProfilePolicy.new(user, user.profile), :update?
  end

  test '#update? - allowed to responsible of event' do
    user = create :user
    event = create :event, responsible: user

    profile = create :profile, owner: event
    assert_predicate ProfilePolicy.new(user, profile), :update?
  end

  test '#update? - allowed to organizer of event' do
    user = create :user
    event = create :event
    create :event_organizer, organizable: event, user: user

    profile = create :profile, owner: event
    assert_predicate ProfilePolicy.new(user, profile), :update?
  end

  test '#update? not allowed to anyone else' do
    profile = create :profile

    user = create :user
    assert_not_predicate ProfilePolicy.new(user, profile), :update?
  end

  test '#masquerade? - allowed to admins' do
    user = create :user, :admin
    assert_predicate ProfilePolicy.new(user, Profile), :masquerade?
  end

  test '#masquerade? - not allowed to everyone' do
    assert_not_predicate ProfilePolicy.new(nil, Profile), :masquerade?
  end

  test '#merge? - allowed to admins' do
    user = create :user, :admin
    assert_predicate ProfilePolicy.new(user, Profile), :merge?
  end

  test '#merge? - not allowed to everyone' do
    assert_not_predicate ProfilePolicy.new(nil, Profile), :merge?
  end
end
