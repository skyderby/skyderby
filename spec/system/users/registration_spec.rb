describe 'User registration', type: :system, js: true do
  it 'register if all filled' do
    visit new_user_registration_path

    fill_in 'user[profile_attributes][name]', with: 'Ivan Ivanov'
    fill_in 'user[email]', with: 'some@example.com'
    fill_in 'user[password]', with: '123456'
    fill_in 'user[password_confirmation]', with: '123456'

    expect { click_button I18n.t('devise.registrations.new.sign_up') }.to change { User.count }.by(1)
    expect(User.last.name).to eq('Ivan Ivanov')
  end

  it 'does not create record if honey pot filled' do
    visit new_user_registration_path

    fill_in 'user[profile_attributes][name]', with: 'Ivan Ivanov'
    fill_in 'user[email]', with: 'some@example.com'
    fill_in 'user[password]', with: '123456'
    fill_in 'user[password_confirmation]', with: '123456'

    fill_in 'user[profile_attributes][last_name]', with: 'I am a robot'

    expect { click_button I18n.t('devise.registrations.new.sign_up') }.not_to change { User.count }
  end
end
