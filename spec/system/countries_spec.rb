feature 'Manage countries', type: :system, skip: true do
  scenario 'Add new country' do
    sign_in users(:admin)

    visit countries_path
    click_link 'New Country'

    within '#new_country' do
      fill_in 'country[name]', with: 'Ukraine'
      fill_in 'country[code]', with: 'UKR'

      click_button I18n.t('general.save')
    end

    expect(page).to have_content('Ukraine')
  end

  scenario 'Edit' do
    country = countries(:norway)
    sign_in users(:admin)

    visit countries_path
    first(:link, 'Edit').click

    within "#edit_country_#{country.id}" do
      fill_in 'country[name]', with: 'AbraCadabra'
      fill_in 'country[code]', with: 'ABC'

      click_button I18n.t('general.save')
    end

    expect(page).to have_content('AbraCadabra')
  end
end
