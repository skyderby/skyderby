require 'test_helper'

class Tournament::MatchTest < ActiveSupport::TestCase
  setup do
    @tournament = tournaments(:world_base_race)
    @tournament.update!(bracket_size: 2)
    @round = tournament_rounds(:round_1)
  end

  test 'build slots on create' do
    match = @round.matches.create!

    assert_equal 2, match.slots.count
  end
end
