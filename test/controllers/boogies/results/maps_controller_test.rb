require 'test_helper'

module Boogies
  module Results
    class MapsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @event = Boogie.find(events(:boogie).id)
        @result = Boogie::Result.find(event_results(:boogie_john_1).id)
      end

      test 'signed in pilot sees the map' do
        sign_in users(:event_responsible)

        get boogie_result_map_path(@event, @result)

        assert_response :success
        assert_select '.single-jump-map[data-controller=single-jump-map]'
        assert_select '.single-jump-map-container[data-controller=map]'
      end

      test 'anonymous visitor sees the auth wall instead of the map' do
        get boogie_result_map_path(@event, @result)

        assert_response :success
        assert_select '.single-jump-map', false
        assert_select 'a[href=?]', new_user_session_path
      end
    end
  end
end
