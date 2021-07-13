feature 'Event profiles', type: :system, skip: true do
  scenario 'change name by responsible of event' do
    user = create :user
    event = create :event, responsible: user

    profile = create :profile, owner: event
    new_profile_name = 'Ivan Popov'

    sign_in user
    visit profile_path(profile)
    click_link I18n.t('general.edit')

    fill_in I18n.t('activerecord.attributes.profile.name'), with: new_profile_name
    click_button I18n.t('general.save')

    expect(page).to have_content(new_profile_name)
  end
end
