require 'test_helper'

module Boogies
  module Results
    class PenaltiesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @event = Boogie.find(events(:boogie).id)
        @result = Boogie::Result.find(event_results(:boogie_john_1).id)
        sign_in users(:event_responsible)
      end

      test 'organizer sees the penalty form' do
        get boogie_result_penalty_path(@event, @result)

        assert_response :success
        assert_select 'form[action=?]', boogie_result_penalty_path(@event, @result)
        assert_select 'input[name=?]', 'penalty[penalty_size]'
      end

      test 'organizer applies a penalty' do
        put boogie_result_penalty_path(@event, @result),
            params: { penalty: { penalized: true, penalty_size: 20, penalty_reason: 'Lane violation' } },
            as: :turbo_stream

        assert_response :success
        @result.reload
        assert_predicate @result, :penalized?
        assert_equal 20, @result.penalty_size
        assert_equal 2400, @result.scored_result
      end

      test 'pilots cannot apply penalties' do
        sign_in users(:regular_user)

        put boogie_result_penalty_path(@event, @result),
            params: { penalty: { penalized: true, penalty_size: 20 } }

        assert_response :forbidden
        assert_not @result.reload.penalized?
      end
    end
  end
end
