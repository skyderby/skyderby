require 'test_helper'

class PlacesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @place = create(:place)
    @admin_user = users(:admin)
  end

  test 'regular user #index' do
    get places_path
    assert_response :success
  end

  test 'regular user #show' do
    get place_path(@place)
    assert_response :success
  end

  test 'regular user #new' do
    get new_place_path
    assert_response :forbidden
  end

  test 'regular user #edit' do
    get edit_place_path(@place)
    assert_response :forbidden
  end

  test 'regular user #create' do
    post places_path, params: { place: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch place_path(@place), params: { place: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete place_path(@place)
    assert_response :forbidden
  end

  test 'admin user #new' do
    sign_in @admin_user
    get new_place_path
    assert_response :success
  end

  test 'admin user #edit' do
    sign_in @admin_user
    get edit_place_path(@place)
    assert_response :success
  end

  test 'admin user #create' do
    sign_in @admin_user
    post places_path, params: { place: { name: 'SSSWWW' } }
    assert_response :success
  end

  test 'admin user #update' do
    sign_in @admin_user
    patch place_path(@place), params: { place: { name: 'SSSWWW' } }
    assert_redirected_to place_path(@place)
  end

  test 'admin user #destroy' do
    sign_in @admin_user
    delete place_path(@place)
    assert_redirected_to places_path
  end

  test 'admin user #destroy - tracks keep their data and lose the place' do
    track = Track.create!(name: 'Orphan track', place: @place)
    sign_in @admin_user

    assert_difference 'Place.count', -1 do
      delete place_path(@place)
    end

    assert_predicate track.reload, :persisted?
    assert_nil track.place_id
  end

  test 'admin user #destroy - refuses while an event is held there' do
    create(:event, place: @place)
    sign_in @admin_user

    assert_no_difference 'Place.count' do
      delete place_path(@place)
    end

    assert_predicate @place.reload, :persisted?
  end

  test 'admin user #destroy - refuses while an online competition points at it' do
    create(:virtual_competition, place: @place)
    sign_in @admin_user

    assert_no_difference 'Place.count' do
      delete place_path(@place)
    end
  end

  test 'admin user #destroy - refuses while a finish line is used elsewhere' do
    finish_line = create(:place_finish_line, place: @place)
    other_place = create(:place, latitude: 20, longitude: 20)
    create(:virtual_competition, finish_line: finish_line, place: other_place)
    sign_in @admin_user

    assert_no_difference 'Place.count' do
      delete place_path(@place)
    end

    assert_predicate finish_line.reload, :persisted?
    assert_match finish_line.name, @response.body
  end

  test 'admin user #edit - offers to delete the place' do
    sign_in @admin_user
    get edit_place_path(@place)

    assert_select 'form[action=?][method=post]', place_path(@place) do
      assert_select 'input[name=_method][value=delete]'
    end
  end
end
