require 'application_system_test_case'

class CountriesTest < ApplicationSystemTestCase
  test 'Add new country' do
    sign_in users(:admin)

    visit countries_path
    click_link 'New Country'

    within '#new_country' do
      fill_in 'country[name]', with: 'Ukraine'
      fill_in 'country[code]', with: 'UKR'

      click_button I18n.t('general.save')
    end

    assert_text 'Ukraine'
  end

  test 'Edit' do
    sign_in users(:admin)

    visit countries_path
    first(:link, 'Edit').click

    fill_in 'country[name]', with: 'AbraCadabra'
    fill_in 'country[code]', with: 'ABC'

    click_button I18n.t('general.save')

    assert_text 'AbraCadabra'
  end
end
