require 'test_helper'

module Tournaments
  module Matches
    module Slots
      class JumpRangesControllerTest < ActionDispatch::IntegrationTest
        test 'does not change the jump range for a user who cannot edit the tournament' do
          slot = tournament_match_slots(:slot_1)
          sign_in users(:places_editor)

          put tournament_match_slot_jump_range_path(slot.match.tournament, slot.match, slot),
              params: { jump_range: { jump_range: '1;20' } },
              as: :turbo_stream

          assert_match 'not authorized to perform this action', response.body
        end
      end
    end
  end
end
