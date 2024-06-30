require 'application_system_test_case'

class ResendConfirmationTest < ApplicationSystemTestCase
  test 'when address exists' do
    email = 'some@email.com'
    User.create!(
      email: email,
      password: 'FORGOT',
      password_confirmation: 'FORGOT'
    )

    visit '/users/resend-confirmation'

    fill_in 'email', with: email

    perform_enqueued_jobs do
      click_button I18n.t('devise.confirmations.new.resend_confirmation_instructions')

      assert_text I18n.t('devise.confirmations.send_instructions')
    end

    sent_emails = ActionMailer::Base.deliveries
    assert_equal 1, sent_emails.count

    link_to_reset =
      URI
      .extract(sent_emails.last.body.to_s, /http(s)?/)
      .find { _1.include?('/users/email-confirmation?confirmation_token=') }

    assert_not_nil link_to_reset

    visit URI.parse(link_to_reset).request_uri

    assert_text I18n.t('devise.confirmations.confirmed')
  end

  test 'when coming with invalid confirmation_token' do
    visit '/users/email-confirmation?confirmation_token=INVALID_TOKEN'

    assert_text I18n.t('activerecord.errors.models.user.attributes.confirmation_token.invalid')
  end
end
