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

  test '#title - prefixes with group name' do
    group = create :virtual_competition_group, name: 'WTF'
    competition = create :virtual_competition, name: 'Gridset race', group: group

    assert_equal 'WTF - Gridset race', competition.title
  end

  test '#comparable_in_pro_view? - true for speed skydiving despite vertical speed discipline' do
    competition = VirtualCompetition.new(jumps_kind: :speed_skydiving, discipline: :vertical_speed)

    assert_predicate competition, :comparable_in_pro_view?
  end

  test '#comparable_in_pro_view? - false for flare and non-speed vertical speed' do
    assert_not VirtualCompetition.new(jumps_kind: :skydive, discipline: :flare).comparable_in_pro_view?
    assert_not VirtualCompetition.new(jumps_kind: :skydive, discipline: :vertical_speed).comparable_in_pro_view?
  end
end
