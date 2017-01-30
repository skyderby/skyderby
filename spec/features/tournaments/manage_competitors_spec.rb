require 'spec_helper'

feature 'Manage tournament competitors', js: true do
  scenario 'add competitor with existed profile' do
    user = create :user
    sign_in user

    tournament = create :tournament, responsible: user.profile
    profile = create :profile, name: 'Ivan R'
    suit = create :suit

    visit tournament_tournament_competitors_path(tournament)

    click_link 'Add competitor'
    sleep 0.5 # wait for modal

    # Select existing profile
    find('#select2-tournament_competitor_profile_id-container').click
    sleep 0.5 # wait for ajax
    first('li.select2-results__option', text: 'Ivan R').click

    # Select suit
    find('#select2-tournament_competitor_wingsuit_id-container').click
    sleep 0.5 # wait for ajax
    first('li.select2-results__option', text: suit.name).click

    click_button I18n.t('general.save')
    sleep 0.5 # wait for ajax and modal

    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: profile.name)
  end

  scenario 'add competitor with new profile' do
    user = create :user
    sign_in user

    tournament = create :tournament, responsible: user.profile
    suit = create :suit
    country = create :country, :norway

    visit tournament_tournament_competitors_path(tournament)

    click_link 'Add competitor'
    sleep 0.5 # wait for modal

    find('label[for=tournament_competitor_profile_mode_create]').click
    fill_in 'tournament_competitor[profile_attributes][name]', with: 'Petr Zh'

    # Select country
    find('#select2-tournament_competitor_profile_attributes_country_id-container').click
    sleep 0.5 # wait for ajax
    first('li.select2-results__option', text: country.name).click

    # Select suit
    find('#select2-tournament_competitor_wingsuit_id-container').click
    sleep 0.5 # wait for ajax
    first('li.select2-results__option', text: suit.name).click

    click_button I18n.t('general.save')
    sleep 0.5 # wait for ajax and modal

    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: 'Petr Zh')
    expect(page).to have_css('.tournament-competitors-table tbody tr td', text: 'no')
  end

  scenario 'edit competitor' do
    user = create :user
    sign_in user

    tournament = create :tournament, responsible: user.profile
    create :tournament_competitor, tournament: tournament
    suit = create :suit, name: 'awesome'

    visit tournament_tournament_competitors_path(tournament)
    find('tbody > tr > td > a[data-remote=true]').click
    sleep 0.5 # wait for modal

    # Select suit
    find('#select2-tournament_competitor_wingsuit_id-container').click
    sleep 0.5 # wait for ajax
    first('li.select2-results__option[role=treeitem]', text: suit.name).click

    click_button I18n.t('general.save')
    sleep 0.5 # wait for ajax and modal

    expect(page).to have_css('tbody > tr > td', text: suit.name)
  end

  scenario 'delete competitor' do
    user = create :user
    sign_in user

    tournament = create :tournament, responsible: user.profile
    create :tournament_competitor, tournament: tournament

    visit tournament_tournament_competitors_path(tournament)
    find('tbody > tr > td > .button_to > button').click

    expect(page).not_to have_css('tbody > tr')
  end
end
