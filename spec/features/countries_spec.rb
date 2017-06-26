require 'spec_helper'

feature 'Manage countries' do
  scenario 'Add new country' do
    sign_in_as_admin

    visit countries_path
    click_link 'New Country'

    within '#new_country' do
      fill_in 'country[name]', with: 'Russia'
      fill_in 'country[code]', with: 'RUS'
      
      click_button I18n.t('general.save')
    end

    expect(page).to have_content('Russia')
  end

  scenario 'Edit' do
    country = create :country
    sign_in_as_admin

    visit countries_path
    click_link 'Edit'

    within "#edit_country_#{country.id}" do
      fill_in 'country[name]', with: 'AbraCadabra'
      fill_in 'country[code]', with: 'ABC'

      click_button I18n.t('general.save')
    end

    expect(page).to have_content('AbraCadabra')
  end

  scenario 'Destroy' do
    country = create :country
    sign_in_as_admin

    visit countries_path
    click_link 'Destroy'

    expect(page).not_to have_content('Destroy')
  end
end
