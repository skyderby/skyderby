require 'application_system_test_case'

class EventProfilesTest < ApplicationSystemTestCase
  test 'change name by responsible of event' do
    user = create :user
    event = create :event, responsible: user

    profile = create :profile, owner: event
    new_profile_name = 'Ivan Popov'

    sign_in user
    visit profile_path(profile)
    click_link I18n.t('general.edit')

    fill_in I18n.t('activerecord.attributes.profile.name'), with: new_profile_name
    click_button I18n.t('general.save')

    assert_text new_profile_name
  end
end
