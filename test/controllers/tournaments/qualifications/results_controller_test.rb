require 'test_helper'

module Tournaments
  module Qualifications
    class ResultsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @tournament = qualification_jumps(:qualification_jump_1).tournament
        @round = @tournament.qualification_rounds.first
        sign_in @tournament.responsible
      end

      test 'renders errors when result is invalid' do
        post tournament_qualification_results_path(@tournament),
             params: { result: { qualification_round_id: @round.id, competitor_id: '' } },
             as: :turbo_stream

        assert_response :success
        assert_match 'toast', response.body
      end

      test 'does not create a result for a user who cannot edit the tournament' do
        sign_in users(:places_editor)

        assert_no_difference 'QualificationJump.count' do
          post tournament_qualification_results_path(@tournament),
               params: {
                 result: {
                   qualification_round_id: @round.id,
                   competitor_id: @tournament.competitors.first.id
                 }
               },
               as: :turbo_stream
        end

        assert_match 'not authorized to perform this action', response.body
      end
    end
  end
end
