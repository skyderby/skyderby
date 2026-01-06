require 'application_system_test_case'

class ManageTournamentCompetitorsTest < ApplicationSystemTestCase
  test 'add competitor with existed profile' do
    sign_in users(:regular_user)

    tournament = tournaments(:world_base_race)
    profile = create :profile
    suit = create :suit

    visit tournament_competitors_path(tournament)

    click_link 'Add competitor'
    sleep 0.1 # wait for modal

    hot_select profile.name, from: :profile_id
    hot_select suit.name, from: :suit_id

    click_button I18n.t('general.save')
    sleep 0.1 # wait for ajax and modal

    assert_selector('.tournament-competitors-table tbody tr td', text: profile.name)
  end

  test 'add competitor with new profile' do
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
    hot_select country.name, from: :country_id

    # Select suit
    hot_select suit.name, from: :suit_id

    click_button I18n.t('general.save')
    sleep 0.1 # wait for ajax and modal

    assert_selector('.tournament-competitors-table tbody tr td', text: 'Petr Zh')
    assert_selector('.tournament-competitors-table tbody tr td', text: 'RUS')
  end

  test 'delete competitor' do
    sign_in users(:regular_user)

    tournament = tournaments(:world_base_race)
    tournament_match_slots(:slot_1).delete
    qualification_jumps(:qualification_jump_1).delete

    visit tournament_competitors_path(tournament)
    accept_alert do
      find('tbody > tr > td > .button_to > button').click
    end

    assert_no_selector('tbody > tr')
  end
end
