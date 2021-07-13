feature 'Profile badges', type: :system, skip: true do
  scenario 'Create', js: true do
    user = create :user, :admin
    sign_in user

    profile = create :profile

    visit profile_path(profile)

    within '.profile-achievements' do
      click_link 'Add'
    end

    fill_in 'badge[name]', with: 'WWL 2020'
    fill_in 'badge[comment]', with: 'Target flight'
    click_button I18n.t('general.save')

    expect(page).to have_content('WWL 2020')
  end
end
