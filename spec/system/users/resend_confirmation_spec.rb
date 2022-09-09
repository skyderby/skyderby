describe 'Resend confirmation flow' do
  it 'when address exists' do
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

      expect(page).to have_text(I18n.t('devise.confirmations.send_instructions'))
    end

    sent_emails = ActionMailer::Base.deliveries
    expect(sent_emails.count).to eq(1)

    link_to_reset =
      URI
      .extract(sent_emails.last.body.to_s, /http(s)?/)
      .find { _1.include?('/users/email-confirmation?confirmation_token=') }

    expect(link_to_reset).not_to be_nil

    visit link_to_reset
    expect(page).to have_text(I18n.t('devise.confirmations.confirmed'))
    sleep 3
  end

  it 'when coming with invalid confirmation_token' do
    visit user_confirmation_path(confirmation_token: 'INVALID')

    expect(page).to have_text(I18n.t('activerecord.errors.models.user.attributes.confirmation_token.invalid'))
  end
end
