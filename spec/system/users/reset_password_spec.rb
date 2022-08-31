describe 'Reset Password' do
  it 'email present in database' do
    email = 'some@email.com'
    User.create!(
      email: email,
      password: 'FORGOT',
      password_confirmation: 'FORGOT',
      confirmed_at: Time.current
    )

    visit '/users/forgot-password'

    fill_in 'email', with: email

    perform_enqueued_jobs do
      click_button I18n.t('devise.passwords.new.send_me_reset_password_instructions')

      expect(page).to have_text(I18n.t('devise.passwords.send_instructions'))
    end

    sent_emails = ActionMailer::Base.deliveries
    expect(sent_emails.count).to eq(1)

    link_to_reset =
      URI
      .extract(sent_emails.last.body.to_s, /http(s)?/)
      .find { _1.include?('/users/new-password?reset_password_token=') }

    expect(link_to_reset).not_to be_nil

    visit URI.parse(link_to_reset).request_uri

    fill_in 'password', with: 'NEW PASSWORD'
    fill_in 'passwordConfirmation', with: 'NEW PASSWORD'
    click_button I18n.t('devise.passwords.edit.change_your_password')

    expect(page).to have_text(I18n.t('devise.passwords.updated'))
    expect(page).to have_current_path('/')
  end

  it 'invalid reset_password_token' do
    visit '/users/new-password?reset_password_token=INVALID_TOKEN'

    fill_in 'password', with: 'NEW PASSWORD'
    fill_in 'passwordConfirmation', with: 'NEW PASSWORD'
    click_button I18n.t('devise.passwords.edit.change_your_password')

    expect(page).to have_text(I18n.t('activerecord.errors.models.user.attributes.reset_password_token.invalid'))
  end
end
