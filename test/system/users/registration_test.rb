require 'application_system_test_case'

class RegistrationTest < ApplicationSystemTestCase
  test 'User registration with all fields filled' do
    visit new_user_registration_path

    fill_in 'user[profile_attributes][name]', with: 'Ivan Ivanov'
    fill_in 'user[email]', with: 'some@example.com'
    fill_in 'user[password]', with: '123456'
    fill_in 'user[password_confirmation]', with: '123456'

    assert_difference 'User.count', 1 do
      click_button I18n.t('devise.registrations.new.sign_up')
    end
    assert_equal 'Ivan Ivanov', User.last.name
  end

  test 'User registration does not create record if honey pot filled' do
    visit new_user_registration_path

    fill_in 'user[profile_attributes][name]', with: 'Ivan Ivanov'
    fill_in 'user[email]', with: 'some@example.com'
    fill_in 'user[password]', with: '123456'
    fill_in 'user[password_confirmation]', with: '123456'
    fill_in 'user[profile_attributes][last_name]', with: 'I am a robot', visible: false

    assert_no_difference 'User.count' do
      click_button I18n.t('devise.registrations.new.sign_up')
    end
  end
end
