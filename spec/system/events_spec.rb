describe 'Scoring PPC-like competitions', js: true do
  it 'complete test' do
    user = create :user
    sign_in user

    create :place, name: 'Awesome DZ', msl: 27, latitude: 28.21975954, longitude: -82.15107322

    create_competition 
    expect(page).to have_css('#event-header h1 span', text: 'Test event')

    add_category 'Open'
    add_category 'Intermediate'
    expect(page).to have_css('td.section-cell', text: 'Open')
    expect(page).to have_css('td.section-cell', text: 'Intermediate')

    ## Add competitors
    add_competitor name: 'Aleksandr', category: 'Open', new_profile: true
    add_competitor name: 'Sergey', category: 'Open'
    add_competitor name: 'Ivan', category: 'Open'

    add_competitor name: 'Aleksey', category: 'Intermediate'
    add_competitor name: 'Petr', category: 'Intermediate'

    add_round 'Distance'

    submit_result competitor: 'Aleksandr', filename: 'distance_2645.csv'
    verify_result competitor: 'Aleksandr', result: '2645'

    submit_result competitor: 'Sergey', filename: 'distance_3107.csv'
    verify_result competitor: 'Sergey', result: '3107'

    submit_result competitor: 'Ivan', filename: 'distance_2454.csv'
    verify_result competitor: 'Ivan', result: '2454'

    add_penalty competitor: 'Sergey', result: '3107', penalty: '50%'
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
    click_link I18n.t('activerecord.models.section')
    fill_in :section_name, with: name
    click_button I18n.t('general.save')
  end

  def add_competitor(name:, category:, new_profile: false)
    suit = create :suit

    click_link I18n.t('activerecord.models.competitor')
    find('label', text: category).click
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
    competitor_row(competitor).find('.create-result-cell__link').click

    sleep 0.5

    file = Rails.root.join('spec', 'support', 'tracks', 'event_test', filename)
    attach_file 'event_track[track_attributes][file]', file, make_visible: true

    click_button I18n.t('general.save')
  end

  def verify_result(competitor:, result:)
    expect(page).not_to have_css('#modal')
    expect(page).to have_css('td.result-cell', text: result)
  end

  def add_penalty(competitor:, result:, penalty:)
    row = competitor_row(competitor)
    row.find('.result-cell').hover
    row.find('.show-result').click

    click_link 'Penalties'
    check 'penalty[penalized]'
    find('label', text: '50 %').click
    fill_in 'penalty[penalty_reason]', with: 'Some reason'

    click_button I18n.t('general.save')
  end

  def competitor_row(competitor_name)
    find('.competitor-cell', text: competitor_name).find(:xpath, '..')
  end
end
