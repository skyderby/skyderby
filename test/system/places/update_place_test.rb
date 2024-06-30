require 'application_system_test_case'

class UpdatePlaceTest < ApplicationSystemTestCase
  test 'regular user can not see edit button' do
    sign_in users(:regular_user)
    visit "/places/#{places(:ravenna).id}"

    refute_link href: "/places/#{places(:ravenna).id}/edit"
  end

  test 'regular user is redirected back to /places' do
    sign_in users(:regular_user)
    visit "/places/#{places(:ravenna).id}/edit"

    assert_current_path "/places/#{places(:ravenna).id}"
  end

  test 'admin user can see edit button' do
    sign_in users(:admin)
    visit "/places/#{places(:ravenna).id}"

    assert_link href: "/places/#{places(:ravenna).id}/edit"
  end

  test 'cancel button navigates to overview tab' do
    sign_in users(:admin)
    visit("/places/#{places(:ravenna).id}/edit")

    click_link I18n.t('general.cancel')

    assert_current_path "/places/#{places(:ravenna).id}"
  end

  test 'admin user is able to fill the form and update place' do
    sign_in users(:admin)
    visit "/places/#{places(:ravenna).id}"
    click_link I18n.t('general.edit')

    fill_in 'name', with: 'New name'
    choose(option: 'base', allow_label_click: true)
    find('[aria-label="Select country"').send_keys :arrow_down
    first('div', exact_text: 'Russia').click
    fill_in 'latitude', with: 55.168499
    fill_in 'longitude', with: 38.689909
    fill_in 'msl', with: 16.25

    click_button I18n.t('general.save')

    assert_current_path "/places/#{places(:ravenna).id}"
    assert_selector 'h2', text: 'New name'
    assert_text 'Lat: 55.168499'
    assert_text 'Lon: 38.689909'
    assert_text 'MSL: 16.3 m'
  end

  test 'admin user can delete' do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127

    sign_in users(:admin)
    visit "/places/#{place.id}"
    click_link I18n.t('general.edit')
    click_button I18n.t('general.delete')

    assert_current_path '/places'
    assert_text 'Place had been successfully deleted'
    assert_not Place.exists?(place.id)
  end

  test 'can not be deleted if track reference it' do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127
    tracks(:track_with_video).update(place: place)

    sign_in users(:admin)
    visit "/places/#{place.id}"
    click_link I18n.t('general.edit')
    click_button I18n.t('general.delete')

    assert_current_path "/places/#{place.id}/edit"
    assert_text 'Cannot delete record because dependent tracks exist'
    assert Place.exists?(place.id)
  end
end
