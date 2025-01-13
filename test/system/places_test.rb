require 'application_system_test_case'

class PlacesTest < ApplicationSystemTestCase
  test 'Non admin user do not see add button' do
    visit places_path
    assert_no_selector 'a', text: I18n.t('places.index.new')
  end

  test 'Admin user can add place' do
    user = create :user, :admin
    sign_in user

    country = countries(:norway)

    visit places_path
    click_link I18n.t('places.index.new')

    within '#new_place' do
      fill_in 'place[name]', with: 'Gridset'
      fill_in 'place[latitude]', with: '62.5203062'
      fill_in 'place[longitude]', with: '7.5773933'
    end

    hot_select country.name, from: :country_id

    click_button I18n.t('general.save')

    assert_text 'GRIDSET'
  end
end
