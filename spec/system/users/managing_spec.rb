describe 'User management' do
  describe 'permissions' do
    it 'admin user can see' do
      sign_in users(:admin)
      visit '/users'

      expect(page).to have_css('h1', text: 'Users')
    end

    it 'redirects non-admin to main page' do
      sign_in users(:regular_user)
      visit '/users'

      expect(page).to have_current_path('/')
    end
  end

  describe 'filtering' do
    before do
      sign_in users(:admin)
      visit '/users'
    end

    it 'search by name' do
      fill_in 'searchTerm', with: users(:regular_user).name

      expect(page).to have_css('td', text: users(:regular_user).email)
      expect(page).not_to have_css('td', text: users(:admin).email)
      expect(page).not_to have_css('td', text: users(:event_responsible).email)
    end

    it 'search by email' do
      fill_in 'searchTerm', with: users(:admin).email

      expect(page).to have_css('td', text: users(:admin).email)
      expect(page).not_to have_css('td', text: users(:regular_user).email)
      expect(page).not_to have_css('td', text: users(:event_responsible).email)
    end

    it 'search by id' do
      fill_in 'searchTerm', with: users(:event_responsible).id

      expect(page).to have_css('td', text: users(:event_responsible).email)
      expect(page).not_to have_css('td', text: users(:admin).email)
      expect(page).not_to have_css('td', text: users(:regular_user).email)
    end
  end
end
