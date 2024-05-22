feature 'Edit profile', type: :system, skip: true do
  scenario 'user changes name' do
    user = create :user
    new_profile_name = 'Ivan Popov'

    sign_in user

    visit profile_path(user.profile)
    click_link I18n.t('general.edit')
    fill_in I18n.t('activerecord.attributes.profile.name'), with: new_profile_name
    click_button I18n.t('general.save')

    expect(page).to have_content(new_profile_name)
  end

  scenario 'guest user attempts to open edit page' do
    profile = create :profile
    visit edit_profile_path(profile)

    expect(page).to have_content('You are not authorized to access this page')
  end
end
