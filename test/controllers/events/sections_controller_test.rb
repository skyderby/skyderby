require 'test_helper'

class Events::SectionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
    @section = event_sections(:advanced)
    @user = users(:event_responsible)
  end

  test 'event organizer updates section' do
    sign_in @user

    get edit_performance_competition_category_path(performance_competition_id: @event.id, id: @section.id), xhr: true
    assert_response :success
  end
end
