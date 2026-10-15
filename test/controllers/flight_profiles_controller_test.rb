require 'test_helper'

class FlightProfilesControllerTest < ActionDispatch::IntegrationTest
  test '#show restores the favorites filter' do
    sign_in users(:regular_user)

    get flight_profiles_path(bookmarked: true)

    assert_response :success
    assert_select '.filter-tag[data-type="bookmarked"][data-value="true"]'
  end

  test '#show hides the favorites filter from guests' do
    get flight_profiles_path

    assert_select '.hot-select-option[data-value="bookmarked"]', count: 0
  end
end
