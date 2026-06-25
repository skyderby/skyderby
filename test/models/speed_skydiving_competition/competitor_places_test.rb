require 'test_helper'

class SpeedSkydivingCompetition::CompetitorPlacesTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup { @event = speed_skydiving_competitions(:nationals) }

  test 'completing a round assigns competitor places per category' do
    perform_enqueued_jobs { @event.rounds.find_by(number: 1).update!(completed: true) }

    assert_equal 1, speed_skydiving_competition_competitors(:hinton).reload.rank
    assert_equal 1, speed_skydiving_competition_competitors(:maynard).reload.rank
  end

  test 'assign_competitor_places! clears places when no rounds are completed' do
    speed_skydiving_competition_competitors(:hinton).update_column(:rank, 5)

    @event.assign_competitor_places!

    assert_nil speed_skydiving_competition_competitors(:hinton).reload.rank
  end
end
