require 'test_helper'

class VirtualCompetitionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @virtual_competition = virtual_competitions(:base_race)
  end

  test 'regular user #index' do
    get virtual_competitions_path
    assert_response :success
  end

  test 'regular user #show redirects to overall' do
    travel_to Time.zone.parse('2018-01-01') do
      get virtual_competition_path(@virtual_competition)
      assert_redirected_to virtual_competition_year_path(@virtual_competition.id, year: 2018)
    end
  end

  test 'regular user #new' do
    get new_virtual_competition_path
    assert_response :forbidden
  end

  test 'regular user #create' do
    post virtual_competitions_path, params: { virtual_competition: { name: 'New comp' } }
    assert_response :forbidden
  end

  test 'regular user #edit' do
    get edit_virtual_competition_path(@virtual_competition)
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch virtual_competition_path(@virtual_competition), params: { virtual_competition: { name: 'New name' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete virtual_competition_path(@virtual_competition)
    assert_response :forbidden
  end
end
