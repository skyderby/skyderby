feature 'Event competitors', js: true do
  scenario 'add competitor with existing profile' do
    user = create :user
    event = create :event, responsible: user.profile
    section = create :section, event: event

    suit = create :suit
    profile = create :profile, name: 'Ivan Petrov'

    sign_in user
    visit event_path(event)
    click_link I18n.t('activerecord.models.competitor')

    find('#select2-competitor_profile_id-container').click
    sleep 0.5
    first('li.select2-results__option', text: profile.name).click
    sleep 0.5

    find('#select2-competitor_suit_id-container').click
    sleep 0.5
    first('li.select2-results__option', text: suit.name).click
    sleep 0.5

    click_button I18n.t('general.save')
    sleep 0.5

    expect(page).to have_content(profile.name)
  end

  scenario 'add competitor with new profile' do
    user = create :user
    event = create :event, responsible: user.profile
    section = create :section, event: event

    suit = create :suit
    country = create :country
    profile_name = 'Ivan Petrov'

    sign_in user
    visit event_path(event)
    click_link I18n.t('activerecord.models.competitor')

    find('label[for="competitor_profile_mode_create"]').click

    fill_in I18n.t('activerecord.attributes.profile.name'), with: profile_name
    find('#select2-competitor_profile_attributes_country_id-container').click
    sleep 0.5
    first('li.select2-results__option', text: country.name).click
    sleep 0.5

    find('#select2-competitor_suit_id-container').click
    sleep 0.5
    first('li.select2-results__option', text: suit.name).click
    sleep 0.5

    click_button I18n.t('general.save')
    sleep 0.5

    expect(page).to have_content(profile_name)
  end
end
