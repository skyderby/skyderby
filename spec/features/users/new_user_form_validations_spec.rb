require 'spec_helper'

feature 'Registration form validations', js: true do
  scenario 'User should provide name' do
    visit new_user_registration_path

    within '#new_user' do
      fill_in 'user[email]', with: 'some@example.com'
      fill_in 'user[password]', with: '123456'
      fill_in 'user[password_confirmation]', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')
    end

    expect(page).to have_css('input[name="user[name]"] + label', text: I18n.t('jquery_validate.required_field'))
  end
end
