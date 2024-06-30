require 'application_system_test_case'

class RegistrationTest < ApplicationSystemTestCase
  test 'register if all filled' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    click_button I18n.t('devise.registrations.new.sign_up')

    assert_text 'Welcome! You have signed up successfully.'
    assert_selector 'a', text: 'Back to main page'
    assert_selector 'a', text: "Didn't receive confirmation instructions?"

    assert_equal 'Ivan Ivanov', User.last.name
  end

  test 'name is required' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Name is required'
  end

  test 'email is required' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Email is required'
  end

  test 'email should be valid' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'invalid.email'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Email should be valid'
  end

  test 'password is required' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Password is required'
  end

  test 'password should be at least 6 characters' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123'
    fill_in 'passwordConfirmation', with: '123'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Password should be at least 6 characters'
  end

  test 'password confirmation must match password' do
    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '654321'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'Passwords must match'
  end

  test 'email already exists' do
    User.create!(email: 'some@example.com', password: '123456')

    visit '/users/sign-up'

    assert_selector 'button', text: I18n.t('devise.registrations.new.sign_up')

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    click_button I18n.t('devise.registrations.new.sign_up')

    refute_text 'Welcome! You have signed up successfully.'
    assert_text 'has already been taken'
  end
end
