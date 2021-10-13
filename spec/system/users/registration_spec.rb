describe 'User registration', type: :system, js: true do
  it 'register if all filled' do
    visit '/users/sign-up'

    fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
    fill_in 'email', with: 'some@example.com'
    fill_in 'password', with: '123456'
    fill_in 'passwordConfirmation', with: '123456'

    expect { click_button I18n.t('devise.registrations.new.sign_up') }.to change { User.count }.by(1)
    expect(User.last.name).to eq('Ivan Ivanov')

    expect(page).to have_text('Welcome! You have signed up successfully.')
    expect(page).to have_css('a', text: 'Back to main page')
    expect(page).to have_css('a', text: "Didn't receive confirmation instructions?")
  end

  describe 'client side validations' do
    it 'name is required' do
      visit '/users/sign-up'

      fill_in 'email', with: 'some@example.com'
      fill_in 'password', with: '123456'
      fill_in 'passwordConfirmation', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Name is required')
    end

    it 'email is required' do
      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'password', with: '123456'
      fill_in 'passwordConfirmation', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Email is required')
    end

    it 'email should be valid' do
      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'email', with: 'invalid.email'
      fill_in 'password', with: '123456'
      fill_in 'passwordConfirmation', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Email should be valid')
    end

    it 'password is required' do
      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'email', with: 'some@example.com'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Password is required')
    end

    it 'password should be at least 6 characters' do
      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'email', with: 'some@example.com'
      fill_in 'password', with: '123'
      fill_in 'passwordConfirmation', with: '123'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Password should be at least 6 characters')
    end

    it 'password confirmation must match password' do
      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'email', with: 'some@example.com'
      fill_in 'password', with: '123456'
      fill_in 'passwordConfirmation', with: '654321'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('Passwords must match')
    end
  end

  describe 'sever side validations' do
    it 'email already exists' do
      User.create!(email: 'some@example.com', password: '123456')

      visit '/users/sign-up'

      fill_in 'profileAttributes[name]', with: 'Ivan Ivanov'
      fill_in 'email', with: 'some@example.com'
      fill_in 'password', with: '123456'
      fill_in 'passwordConfirmation', with: '123456'

      click_button I18n.t('devise.registrations.new.sign_up')

      expect(page).not_to have_text('Welcome! You have signed up successfully.')
      expect(page).to have_text('has already been taken')
    end
  end
end
