require 'test_helper'

class User::IdentityTest < ActiveSupport::TestCase
  test 'detects Apple private relay emails' do
    identity = users(:regular_user).identities.create!(provider: 'apple', uid: 'a1',
                                                       email: 'x@privaterelay.appleid.com')

    assert_predicate identity, :private_email?
  end

  test 'uid is unique per provider' do
    users(:regular_user).identities.create!(provider: 'apple', uid: 'a1')
    duplicate = users(:admin).identities.build(provider: 'apple', uid: 'a1')

    assert_not duplicate.valid?
    assert_predicate users(:admin).identities.build(provider: 'google_oauth2', uid: 'a1'), :valid?
  end

  test 'removable unless it is the only identity of a user without password' do
    user = users(:regular_user)
    user.update_column(:password_set, false)
    apple = user.identities.create!(provider: 'apple', uid: 'a1')

    assert_not apple.removable?

    user.identities.create!(provider: 'google_oauth2', uid: 'g1')

    assert_predicate apple.reload, :removable?
  end

  test 'removable when the user has a password' do
    user = users(:regular_user)
    user.update_column(:password_set, true)

    assert_predicate user.identities.create!(provider: 'apple', uid: 'a1'), :removable?
  end

  test 'revoke_apple_token clears the stored token' do
    identity = users(:regular_user).identities.create!(provider: 'apple', uid: 'a1', apple_refresh_token: 'r1')

    identity.revoke_apple_token

    assert_nil identity.reload.apple_refresh_token
  end
end
