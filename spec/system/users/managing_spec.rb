describe 'User management' do
  describe 'permissions' do
    it 'admin user can see' do
      sign_in users(:admin)
      visit '/admin/users'

      expect(page).to have_css('h1', text: 'Users')
    end

    it 'redirects non-admin to main page' do
      sign_in users(:regular_user)
      visit '/admin/users'

      expect(page).to have_text("You're not allowed to view this page.")
    end
  end

  describe 'filtering' do
    before do
      sign_in users(:admin)
      visit '/admin/users'
    end

    it 'search by name' do
      fill_in 'searchTerm', with: users(:regular_user).name

      expect(page).to have_css('div', text: users(:regular_user).email)
      expect(page).not_to have_css('div', text: users(:admin).email)
      expect(page).not_to have_css('div', text: users(:event_responsible).email)
    end

    it 'search by email' do
      fill_in 'searchTerm', with: users(:admin).email

      expect(page).to have_css('div', text: users(:admin).email)
      expect(page).not_to have_css('div', text: users(:regular_user).email)
      expect(page).not_to have_css('div', text: users(:event_responsible).email)
    end

    it 'search by id' do
      fill_in 'searchTerm', with: users(:event_responsible).id

      expect(page).to have_css('div', text: users(:event_responsible).email)
      expect(page).not_to have_css('div', text: users(:admin).email)
      expect(page).not_to have_css('div', text: users(:regular_user).email)
    end
  end

  describe 'deleting user' do
    it 'delete only user' do
      sign_in users(:admin)
      user = users(:regular_user)
      profile = user.profile

      visit '/admin/users'
      fill_in 'searchTerm', with: user.email
      expect(page).to have_css('[role="row"]', count: 1)

      find('div[role="cell"]', text: user.name).click

      accept_confirm do
        click_button 'Delete user only'
      end

      expect(page).to have_text("User #{user.name} had been successfully deleted.")
      expect(page).to have_current_path("/admin/users?searchTerm=#{user.email}")
      expect(User.exists?(user.id)).to be_falsey
      expect(Profile.exists?(profile.id)).to be_truthy
    end

    it 'delete user with associated profile' do
      sign_in users(:admin)
      user = User.create! \
        email: 'ab@ex.com',
        password: 'password',
        confirmed_at: Time.current,
        profile_attributes: { name: 'Aleks' }

      profile = user.profile

      visit "/admin/users/#{user.id}"

      accept_confirm do
        click_button 'Delete user with associated profile'
      end

      expect(page).to have_current_path('/admin/users')
      expect(page).to have_text("User #{user.name} had been successfully deleted.")
      expect(User.exists?(user.id)).to be_falsey
      expect(Profile.exists?(profile.id)).to be_falsey
    end
  end
end
