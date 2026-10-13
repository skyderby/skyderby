require 'test_helper'

module Tournaments
  module Qualifications
    module Results
      class JumpRangesControllerTest < ActionDispatch::IntegrationTest
        test 'does not change the jump range for a user who cannot edit the tournament' do
          result = qualification_jumps(:qualification_jump_1)
          sign_in users(:places_editor)

          assert_no_changes -> { result.reload.track&.ff_start } do
            put tournament_qualification_result_jump_range_path(result.tournament, result),
                params: { jump_range: { jump_range: '1;20' } },
                as: :turbo_stream
          end

          assert_match 'not authorized to perform this action', response.body
        end
      end
    end
  end
end
