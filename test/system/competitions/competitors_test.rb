require 'application_system_test_case'

class EventsCompetitorsTest < ApplicationSystemTestCase
  setup do
    @user = users(:event_responsible)
  end

  test 'add competitor with existing profile' do
    event = create :event, responsible: @user
    create :event_section, event: event

    suit = create :suit
    profile = create :profile, name: 'Ivan Petrov'

    sign_in @user
    visit performance_competition_path(event)
    click_button I18n.t('activerecord.models.event/competitor')
    assert_selector('.dialog-title', text: I18n.t('events.add_competitor'))
    fill_in 'competitor[profile_attributes][name]', with: profile.name
    find('.profile-suggestion', text: profile.name).click
    hot_select suit.name, from: :suit_id

    click_button I18n.t('general.save')

    assert_no_selector('.dialog-title', text: "#{I18n.t('activerecord.models.event/competitor')}: New")
    assert_text(profile.name)
  end

  test 'add competitor with new profile' do
    event = create :event, responsible: @user
    create :event_section, event: event

    suit = create :suit
    country = create :country
    profile_name = 'Ivan Petrov'

    sign_in @user
    visit performance_competition_path(event)
    click_button I18n.t('activerecord.models.event/competitor')
    assert_selector('.dialog-title', text: I18n.t('events.add_competitor'))

    fill_in 'competitor[profile_attributes][name]', with: profile_name
    hot_select country.name, from: 'country_id'

    hot_select suit.name, from: :suit_id

    click_button I18n.t('general.save')
    assert_no_selector('.dialog-title', text: "#{I18n.t('activerecord.models.event/competitor')}: New")
    assert_text(profile_name)
  end
end
