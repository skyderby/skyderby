require 'application_system_test_case'

class ManagingTest < ApplicationSystemTestCase
  test 'admin user can see' do
    sign_in users(:admin)
    visit '/admin/users'

    assert_selector 'h1', text: 'Users'
  end

  test 'redirects non-admin to main page' do
    sign_in users(:regular_user)
    visit '/admin/users'

    assert_text "You're not allowed to view this page."
  end

  test 'search by name' do
    sign_in users(:admin)
    visit '/admin/users'

    fill_in 'searchTerm', with: users(:regular_user).name

    assert_selector 'div', text: users(:regular_user).email
    refute_selector 'div', text: users(:admin).email
    refute_selector 'div', text: users(:event_responsible).email
  end

  test 'search by email' do
    sign_in users(:admin)
    visit '/admin/users'

    fill_in 'searchTerm', with: users(:admin).email

    assert_selector 'div', text: users(:admin).email
    refute_selector 'div', text: users(:regular_user).email
    refute_selector 'div', text: users(:event_responsible).email
  end

  test 'search by id' do
    sign_in users(:admin)
    visit '/admin/users'

    fill_in 'searchTerm', with: users(:event_responsible).id

    assert_selector 'div', text: users(:event_responsible).email
    refute_selector 'div', text: users(:admin).email
    refute_selector 'div', text: users(:regular_user).email
  end

  test 'delete only user' do
    sign_in users(:admin)
    user = users(:regular_user)
    profile = user.profile

    visit '/admin/users'
    fill_in 'searchTerm', with: user.email
    assert_selector '[role="row"]', count: 1

    find('div[role="cell"]', text: user.name).click

    accept_confirm do
      click_button 'Delete user only'
    end

    assert_text "User #{user.name} had been successfully deleted."
    assert_current_path "/admin/users?searchTerm=#{user.email}"
    assert_not User.exists?(user.id)
    assert Profile.exists?(profile.id)
  end

  test 'delete user with associated profile' do
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

    assert_current_path '/admin/users'
    assert_text "User #{user.name} had been successfully deleted."
    assert_not User.exists?(user.id)
    assert_not Profile.exists?(profile.id)
  end

  test 'does not delete user with associated profile if user has tracks' do
    sign_in users(:admin)
    user = users(:regular_user)
    profile = user.profile
    assert_predicate profile.tracks, :exists?

    visit "/admin/users/#{user.id}"

    accept_confirm do
      click_button 'Delete user with associated profile'
    end

    assert_current_path "/admin/users/#{user.id}"
    assert_text 'Cannot delete record because dependent tracks exist'
  end
end
