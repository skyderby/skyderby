require 'test_helper'

class User::OmniauthTest < ActiveSupport::TestCase
  test 'finds user by identity' do
    user = users(:regular_user)
    user.identities.create!(provider: 'google_oauth2', uid: '000-000', email: user.email)

    found_user = User.from_omniauth(google_auth(email: 'xx@zz.yyy'))

    assert_equal user, found_user
  end

  test 'finds user by email and adds the identity without touching others' do
    user = users(:regular_user)
    apple = user.identities.create!(provider: 'apple', uid: 'apple-1', email: user.email)

    assert_difference -> { user.identities.count } => 1 do
      assert_equal user, User.from_omniauth(google_auth(email: user.email.upcase))
    end
    assert_predicate apple.reload, :persisted?
    assert_equal 'google_oauth2', user.identities.find_by!(uid: '000-000').provider
  end

  test 'does not match users by Apple private relay email' do
    user = User.create!(email: 'abc123@privaterelay.appleid.com', password: Devise.friendly_token[0, 20],
                        profile_attributes: { name: 'Relay' })

    assert_nil User.from_identity(provider: 'apple', uid: 'other', email: user.email)
  end

  test 'creates new user from auth info' do
    user = assert_difference -> { User.count } => 1, -> { User::Identity.count } => 1 do
      User.from_omniauth(google_auth(email: 'ab@example.com', first_name: 'Ivan', last_name: 'Petrov'))
    end

    identity = user.identities.sole
    assert_equal 'google_oauth2', identity.provider
    assert_equal '000-000', identity.uid
    assert_equal 'ab@example.com', identity.email
    assert_equal 'ab@example.com', user.email
    assert_equal 'Ivan Petrov', user.name
    assert_predicate user, :confirmed?
    assert_not user.password_set?
  end

  test 'add_data_from_google adds an identity' do
    user = users(:regular_user)
    user.identities.create!(provider: 'apple', uid: 'apple-1', email: user.email)

    user.add_data_from_google(google_auth(email: 'other@example.com'))
    user.save!

    assert_equal %w[apple google_oauth2], user.identities.order(:provider).pluck(:provider)
    assert user.identity?('google_oauth2')
  end

  test 'add_data_from_google fails when the Google account belongs to someone else' do
    users(:admin).identities.create!(provider: 'google_oauth2', uid: '000-000')
    user = users(:regular_user)

    user.add_data_from_google(google_auth(email: 'other@example.com'))

    assert_not user.save
  end

  test 'password_set tracks user chosen passwords' do
    user = User.create!(email: 'new@example.com', password: 'changeme', profile_attributes: { name: 'New' })
    generated = User.from_omniauth(google_auth(email: 'generated@example.com'))

    assert_predicate user, :password_set?
    assert_not generated.password_set?

    generated.reset_password('newpassword', 'newpassword')

    assert_predicate generated.reload, :password_set?
  end

  private

  def google_auth(email:, first_name: nil, last_name: nil)
    OmniAuth::AuthHash.new(provider: 'google_oauth2', uid: '000-000',
                           info: { email:, image: '', first_name:, last_name: })
  end
end
