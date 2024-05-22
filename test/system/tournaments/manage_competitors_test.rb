feature 'Manage tournament competitors', type: :system, js: true, skip: true do
  scenario 'add competitor with existed profile' do
    sign_in users(:regular_user)

    tournament = tournaments(:world_base_race)
    profile = create :profile
    suit = create :suit

    visit tournament_competitors_path(tournament)

    click_link 'Add competitor'
    sleep 0.1 # wait for modal

    select2 profile.name, from: 'tournament_competitor_profile_id'
    select2 suit.name, from: 'tournament_competitor_suit_id'

    click_button I18n.t('general.save')
    sleep 0.1 # wait for ajax and modal

    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: profile.name)
  end

  scenario 'add competitor with new profile' do
    sign_in users(:regular_user)

    tournament = tournaments(:world_base_race)
    suit = suits(:apache)
    country = countries(:russia)

    visit tournament_competitors_path(tournament)

    click_link 'Add competitor'
    sleep 0.3 # wait for modal

    find('#tournament_competitor_profile_mode_create').click
    fill_in 'tournament_competitor[profile_attributes][name]', with: 'Petr Zh'

    # Select country
    select2 country.name, from: 'tournament_competitor_profile_attributes_country_id'

    # Select suit
    select2 suit.name, from: 'tournament_competitor_suit_id'

    click_button I18n.t('general.save')
    sleep 0.1 # wait for ajax and modal

    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: 'Petr Zh')
    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: 'RUS')
  end

  scenario 'delete competitor' do
    sign_in users(:regular_user)

    tournament = tournaments(:world_base_race)
    tournament_match_slots(:slot_1).delete
    qualification_jumps(:qualification_jump_1).delete

    visit tournament_competitors_path(tournament)
    accept_alert do
      find('tbody > tr > td > .button_to > button').click
    end

    expect(page).not_to have_css('tbody > tr')
  end
end
