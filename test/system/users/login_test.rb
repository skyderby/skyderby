require 'application_system_test_case'

class LoginTest < ApplicationSystemTestCase
  test 'redirects to previous page' do
    password = 'Secret123!'
    user = User.create!(email: 'ab@ex.com', password: password, confirmed_at: Time.current)

    visit '/'
    click_link I18n.t('application.header.tracks')
    click_link I18n.t('application.header.sign_in')

    assert_selector 'button', text: I18n.t('devise.sessions.new.sign_in')

    fill_in 'email', with: user.email
    fill_in 'password', with: password

    click_button I18n.t('devise.sessions.new.sign_in')

    assert_current_path('/tracks')
  end
end
