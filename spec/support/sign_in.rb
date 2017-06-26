module SignInHelpers
  def sign_in(user, options = {})
    password = options[:password] || user.password

    visit new_user_session_path

    within '#new_user' do
      fill_in 'Email', with: user.email
      fill_in 'Password', with: password
      click_button I18n.t 'devise.shared.links.sign_in'
    end
  end

  def sign_out
    visit destroy_user_session_path
  end

  def sign_in_as_admin
    user = create :user
    role = Role.create!(name: :admin)
    user.assignments << Assignment.new(role: role)
    sign_in user
  end
end

RSpec.configure do |config|
  config.include SignInHelpers, type: :feature
end
