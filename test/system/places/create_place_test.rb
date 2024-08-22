require 'application_system_test_case'

class CreatePlaceTest < ApplicationSystemTestCase
  setup do
    @regular_user = users(:regular_user)
    @admin = users(:admin)
  end

  test 'regular user can not see + button' do
    sign_in @regular_user
    visit '/places'

    assert_css 'h2', text: 'ITALY'
    assert page.has_no_link?('/places/new')
  end

  test 'regular user is redirected back to /places' do
    sign_in @regular_user
    visit '/places/new'

    assert_current_path '/places'
  end

  test 'admin user can see + button' do
    sign_in @admin
    visit '/places'

    assert_link href: '/places/new'
  end

  test 'admin user is not redirected back to /places' do
    sign_in @admin
    visit '/places'
    find("a[href='/places/new']").click

    assert_current_path '/places/new'
  end

  test 'cancel button navigates to place index' do
    sign_in @admin
    visit('/places/new')

    click_link I18n.t('general.cancel')

    assert_current_path '/places'
  end

  test 'admin user is able to fill the form and save new place' do
    sign_in @admin
    visit '/places'
    find("a[href='/places/new']").click

    fill_in 'name', with: 'New test location'
    choose(option: 'base', allow_label_click: true)
    find('[aria-label="Select country"').send_keys :arrow_down
    first('div', exact_text: 'Russia').click
    fill_in 'latitude', with: 55.168499
    fill_in 'longitude', with: 38.689909
    fill_in 'msl', with: 16.25

    click_button I18n.t('general.save')

    assert_css 'h2', text: 'New test location'

    place_id = Place.find_by(name: 'New test location').id

    assert_current_path "/places/#{place_id}"
    assert_css 'span', text: 'Overview'
    assert_css 'span', text: 'Videos'
    assert_css 'span', text: 'Track'
  end
end
