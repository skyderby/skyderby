require 'test_helper'

module Tournaments
  module Qualifications
    class ResultsTopSpeedTest < ActionDispatch::IntegrationTest
      setup do
        @result = qualification_jumps(:qualification_jump_1)
        @tournament = @result.tournament
        sign_in @tournament.responsible
      end

      test 'top speed is not editable through the result form' do
        @result.update_column(:top_speed, 250)

        patch tournament_qualification_result_path(@tournament, @result),
              params: { result: { top_speed: '312.5', canopy_time: '4.2' } },
              as: :turbo_stream

        assert_response :success
        @result.reload
        assert_equal 250, @result.top_speed
        assert_equal 4.2, @result.canopy_time
      end
    end
  end
end
