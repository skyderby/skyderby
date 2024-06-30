require 'application_system_test_case'

class ResetPasswordTest < ApplicationSystemTestCase
  test 'email present in database' do
    email = 'some@email.com'
    User.create!(
      email: email,
      password: 'FORGOT',
      password_confirmation: 'FORGOT',
      confirmed_at: Time.current
    )

    visit '/users/forgot-password'

    assert_selector 'h2', text: I18n.t('devise.shared.links.forgot_your_password')

    fill_in 'email', with: email

    perform_enqueued_jobs do
      click_button I18n.t('devise.passwords.new.send_me_reset_password_instructions')

      assert_text I18n.t('devise.passwords.send_instructions')
    end

    sent_emails = ActionMailer::Base.deliveries
    assert_equal 1, sent_emails.count

    link_to_reset =
      URI
      .extract(sent_emails.last.body.to_s, /http(s)?/)
      .find { _1.include?('/users/new-password?reset_password_token=') }

    assert_not_nil link_to_reset

    visit URI.parse(link_to_reset).request_uri

    assert_selector 'h2', text: I18n.t('devise.passwords.edit.change_your_password')

    fill_in 'password', with: 'NEW PASSWORD'
    fill_in 'passwordConfirmation', with: 'NEW PASSWORD'
    click_button I18n.t('devise.passwords.edit.change_your_password')

    assert_text I18n.t('devise.passwords.updated')
    assert_current_path '/'
  end

  test 'invalid reset_password_token' do
    visit '/users/new-password?reset_password_token=INVALID_TOKEN'

    assert_selector 'h2', text: I18n.t('devise.passwords.edit.change_your_password')

    fill_in 'password', with: 'NEW PASSWORD'
    fill_in 'passwordConfirmation', with: 'NEW PASSWORD'
    click_button I18n.t('devise.passwords.edit.change_your_password')

    assert_text I18n.t('activerecord.errors.models.user.attributes.reset_password_token.invalid')
  end
end
