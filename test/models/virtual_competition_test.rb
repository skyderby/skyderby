require 'test_helper'

class VirtualCompetitionTest < ActiveSupport::TestCase
  test '#task - returns right task for distance in time' do
    competition = VirtualCompetition.create(discipline: :distance_in_time)

    assert_equal 'distance', competition.task
  end

  test '#task - returns right task for distance in altitude' do
    competition = VirtualCompetition.create(discipline: :distance_in_altitude)

    assert_equal 'distance', competition.task
  end
end
