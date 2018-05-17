describe 'User registration', type: :system, js: true do
  it 'register if all filled' do
    visit new_user_registration_path

    within '#new_user' do
      fill_in 'user[profile_attributes][name]', with: 'Ivan Ivanov'
      fill_in 'user[email]', with: 'some@example.com'
      fill_in 'user[password]', with: '123456'
      fill_in 'user[password_confirmation]', with: '123456'
    end

    expect { click_button I18n.t('devise.registrations.new.sign_up') }.to change { User.count }.by(1)
    expect(User.last.name).to eq('Ivan Ivanov')
  end

  it 'require name' do
    visit new_user_registration_path

    within '#new_user' do
      fill_in 'user[email]', with: 'some@example.com'
      fill_in 'user[password]', with: '123456'
      fill_in 'user[password_confirmation]', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')
    end

    expect(page).to have_css('input[name="user[profile_attributes][name]"] + label', text: I18n.t('jquery_validate.required_field'))
  end
end
