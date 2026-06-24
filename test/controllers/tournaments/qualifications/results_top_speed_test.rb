require 'test_helper'

module Tournaments
  module Qualifications
    class ResultsTopSpeedTest < ActionDispatch::IntegrationTest
      setup do
        @result = qualification_jumps(:qualification_jump_1)
        @tournament = @result.tournament
        sign_in @tournament.responsible
      end

      test 'updates result top speed' do
        patch tournament_qualification_result_path(@tournament, @result),
              params: { result: { top_speed: '312.5' } },
              as: :turbo_stream

        assert_response :success
        assert_equal 312.5, @result.reload.top_speed
      end
    end
  end
end
