describe 'Scoring PPC-like competitions', js: true, skip: true do
  it 'complete test' do
    user = users(:regular_user)
    sign_in user

    create :place, name: 'Awesome DZ', msl: 27, latitude: 28.21975954, longitude: -82.15107322

    create_competition
    expect(page).to have_css('#event-header h1 span', text: 'Test event')

    add_category 'Open'
    add_category 'Intermediate'
    expect(page).to have_css('td .section-name', text: 'OPEN')
    expect(page).to have_css('td .section-name', text: 'INTERMEDIATE')

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

    fill_in :event_name, with: 'Test event'
    fill_in :event_range_from, with: 3000
    fill_in :event_range_to, with: 2000

    select2 'Awesome DZ', from: 'event_place_id'
    find('input[type="submit"]').click
  end

  def add_category(name)
    click_link I18n.t('activerecord.models.event/section')
    fill_in :section_name, with: name
    click_button I18n.t('general.save')
  end

  def add_competitor(name:, category:, new_profile: false)
    suit = create :suit

    click_link I18n.t('activerecord.models.event/competitor')
    expect(page).to have_css('.modal-title', text: "#{I18n.t('activerecord.models.event/competitor')}: New")
    select2 category, from: 'section_id'
    select2 suit.name, from: 'suit_id'

    if new_profile
      country = create :country

      find('label', text: I18n.t('competitors.form.create_profile')).click

      fill_in 'competitor_name', with: name
      select2 country.name, from: 'country_id'
    else
      profile = create :profile, name: name
      select2 profile.name, from: 'profile_id'
    end

    click_button I18n.t('general.save')
  end

  def add_round(discipline)
    click_button 'Round'
    click_button discipline
  end

  def submit_result(competitor:, filename:)
    competitor_row(competitor).find('.scoreboard-result').hover
    competitor_row(competitor).find('i.fa.fa-upload').click

    sleep 0.5

    file = file_fixture("tracks/#{filename}")
    attach_file 'result[track_attributes][file]', file, make_visible: true

    click_button I18n.t('general.save')
  end

  def verify_last_result(result:)
    expect(page).not_to have_css('#modal')
    expect(page).to have_css('td.scoreboard-result', text: result)
  end

  def add_penalty_to_last_result(competitor:)
    row = competitor_row(competitor)
    row.find('.scoreboard-result').hover
    row.find('.show-result').click

    modal_title = "#{I18n.t('activerecord.models.event/result')}: #{competitor} | Distance - 1"
    expect(page).to have_css('.modal-title', text: modal_title)

    click_link 'Penalties'

    sleep 0.5

    check 'penalty[penalized]'
    find('label', text: '50 %').click
    fill_in 'penalty[penalty_reason]', with: 'Some reason'

    click_button I18n.t('general.save')
  end

  def competitor_row(competitor_name)
    find('.competitor-cell', text: competitor_name).find(:xpath, '..')
  end
end
