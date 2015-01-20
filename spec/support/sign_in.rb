module SignInHelpers
  def sign_in(user, options = {})
    password = options[:password] || user.password

    visit new_user_session_path

    fill_in 'Email', with: user.email
    fill_in 'Password', with: password
    click_button 'Войти'
  end

  def sign_out
    visit destroy_user_session_path
  end
end

RSpec.configure do |config|
  config.include SignInHelpers, type: :feature
end
