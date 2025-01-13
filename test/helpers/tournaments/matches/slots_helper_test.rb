require 'test_helper'

class Tournaments::Matches::SlotsHelperTest < ActionView::TestCase
  test '#match_slot_presentation' do
    slot = tournament_match_slots(:slot_1)
    assert_includes match_slot_presentation(slot), 'John | Round - 1'
  end
end
