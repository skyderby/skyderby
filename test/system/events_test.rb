require 'application_system_test_case'

class EventsTest < ApplicationSystemTestCase
  test 'Scoring PPC-like competitions' do
    user = users(:regular_user)
    sign_in user

    create :place, name: 'Awesome DZ', msl: 27, latitude: 28.21975954, longitude: -82.15107322

    create_competition
    assert_selector('.show-page-title', text: 'TEST EVENT')

    add_category 'Open'
    add_category 'Intermediate'
    assert_selector('td .section-name', text: 'OPEN')
    assert_selector('td .section-name', text: 'INTERMEDIATE')

    ## Add competitors
    add_competitor name: 'Aleksandr', category: 'Open', new_profile: true
    add_competitor name: 'Sergey', category: 'Open'
    add_competitor name: 'Ivan', category: 'Open'

    add_competitor name: 'Aleksey', category: 'Intermediate'
    add_competitor name: 'Petr', category: 'Intermediate'

    add_round 'Distance'

    submit_result competitor: 'Aleksandr', filename: 'distance_2645.csv'
    verify_last_result result: '2646'

    submit_result competitor: 'Sergey', filename: 'distance_3107.csv'
    verify_last_result result: '3107'

    submit_result competitor: 'Ivan', filename: 'distance_2454.csv'
    verify_last_result result: '2454'

    add_penalty_to_last_result competitor: 'Sergey'
  end

  def create_competition
    visit events_path
    click_link 'Competition'
    click_link 'Create Wingsuit Performance Competition'

    fill_in :event_name, with: 'Test event'
    fill_in :event_range_from, with: 3000
    fill_in :event_range_to, with: 2000

    hot_select 'Awesome DZ', from: 'place_id'
    click_button I18n.t('general.save')
  end

  def add_category(name)
    click_button I18n.t('activerecord.models.event/section')
    fill_in :section_name, with: name
    click_button I18n.t('general.save')
  end

  def add_competitor(name:, category:, new_profile: false)
    suit = create :suit

    click_button I18n.t('activerecord.models.event/competitor')
    assert_selector('.modal-title', text: I18n.t('events.add_competitor'))
    hot_select category, from: 'section_id'
    hot_select suit.name, from: 'suit_id'

    if new_profile
      country = create :country

      find('label', text: I18n.t('competitors.form.create_profile')).click

      fill_in 'competitor[profile_attributes][name]', with: name
      hot_select country.name, from: 'country_id'
    else
      profile = create :profile, name: name
      hot_select profile.name, from: 'profile_id'
    end

    click_button I18n.t('general.save')
  end

  def add_round(discipline)
    click_button 'Round'
    assert_selector('.sd-dropdown-menu')
    click_button discipline
  end

  def submit_result(competitor:, filename:)
    competitor_row(competitor).find('.result-cell').hover
    competitor_row(competitor).find('svg').click

    file = file_fixture("tracks/#{filename}")
    attach_file 'result[track_attributes][file]', file, make_visible: true

    click_button I18n.t('general.save')
  end

  def verify_last_result(result:)
    assert_no_selector('#modal')
    assert_selector('td.result-cell', text: result)
  end

  def add_penalty_to_last_result(competitor:)
    row = competitor_row(competitor)
    row.find('.result-cell').hover
    row.find('.result-cell a').click

    modal_title = "#{I18n.t('activerecord.models.event/result')}: #{competitor} | Distance - 1"
    assert_selector('.modal-title', text: modal_title)

    click_link 'Penalties'

    sleep 0.5

    check 'penalty[penalized]'
    find('label', text: '50 %').click
    fill_in 'penalty[penalty_reason]', with: 'Some reason'

    click_button I18n.t('general.save')
  end

  def competitor_row(competitor_name)
    find('td.competitor', text: competitor_name).find(:xpath, '..')
  end
end
