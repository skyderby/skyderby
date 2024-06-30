require 'test_helper'

class User::OmniauthTest < ActiveSupport::TestCase
  test 'finds user by provider and uid' do
    user = User.create! \
      email: 'ab@example.com',
      password: Devise.friendly_token[0, 20],
      provider: :facebook,
      uid: '000-000'

    auth = OmniAuth::AuthHash.new \
      provider: :facebook,
      uid: '000-000',
      info: { email: 'xx@zz.yyy' }

    found_user = User.from_omniauth(auth)

    assert_equal user, found_user
  end

  test 'finds user by email' do
    user = User.create! \
      email: 'ab@example.com',
      password: Devise.friendly_token[0, 20]

    auth = OmniAuth::AuthHash.new \
      provider: :facebook,
      uid: '000-000',
      info: { email: 'ab@example.com' }

    found_user = User.from_omniauth(auth)

    assert_equal user, found_user
  end

  test 'create new user from auth info' do
    auth = OmniAuth::AuthHash.new \
      provider: :facebook,
      uid: '000-000',
      info: {
        email: 'ab@example.com',
        image: '',
        first_name: 'Ivan',
        last_name: 'Petrov'
      }

    user = User.from_omniauth(auth)
    assert_equal 'facebook', user.provider
    assert_equal '000-000', user.uid
    assert_equal 'ab@example.com', user.email
    assert_equal 'Ivan Petrov', user.name
  end
end
