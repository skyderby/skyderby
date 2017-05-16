require 'spec_helper'

feature 'Adding place' do
  scenario 'Non admin user do not see add button' do
    visit places_path
    expect(page).not_to have_css('a', text: I18n.t('places.index.new'))
  end

  scenario 'Non admin user can not add place' do
    visit new_place_path

    expect(page).to have_css('div.alert', text: 'You are not authorized to access this page')
  end

  scenario 'Admin user can add place' do
    user = create :user
    role = Role.create!(name: :admin)
    user.assignments << Assignment.new(role: role)
    # allow(user).to receive(:has_role?).with(:admin).and_return(true)
    sign_in user

    country = create :country

    visit places_path
    click_link I18n.t('places.index.new')

    within '#new_place' do
      fill_in 'place[name]', with: 'Gridset'
      fill_in 'place[latitude]', with: '62.5203062'
      fill_in 'place[longitude]', with: '7.5773933'

      click_button I18n.t('general.save')
    end

    expect(page).to have_content('Gridset')
  end
end
