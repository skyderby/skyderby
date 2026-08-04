require 'test_helper'

class VirtualCompetition::Group::ScoreboardTest < ActiveSupport::TestCase
  setup do
    @group = virtual_competition_groups(:cumulative)
    @time = create_competition(:time, :wingsuit)
    @distance = virtual_competitions(:skydive_distance_wingsuit)
    @speed = virtual_competitions(:skydive_speed_wingsuit)
  end

  test 'skips suit classes without all three disciplines' do
    assert_empty VirtualCompetition::Group::Scoreboard.new(@group).categories.map(&:suit_kind) & ['tracksuit']
  end

  test 'builds a wingsuit category once all three disciplines are present' do
    score(@distance, profiles(:john), 3000)
    score(@speed, profiles(:john), 300)
    score(@time, profiles(:john), 90)

    categories = VirtualCompetition::Group::Scoreboard.new(@group).categories

    assert_equal ['wingsuit'], categories.map(&:suit_kind)
    assert_equal [profiles(:john).id], categories.first.rows.map(&:profile_id)
  end

  test 'excludes pilots missing a discipline' do
    score(@distance, profiles(:john), 3000)
    score(@speed, profiles(:john), 300)
    score(@time, profiles(:john), 90)

    score(@distance, profiles(:travis), 2500)
    score(@speed, profiles(:travis), 280)

    rows = VirtualCompetition::Group::Scoreboard.new(@group).category('wingsuit').rows

    assert_equal [profiles(:john).id], rows.map(&:profile_id)
  end

  test 'scores each discipline as a percentage of the best and sums them' do
    score(@distance, profiles(:john), 3000)
    score(@speed, profiles(:john), 300)
    score(@time, profiles(:john), 90)

    score(@distance, profiles(:travis), 1500)
    score(@speed, profiles(:travis), 150)
    score(@time, profiles(:travis), 45)

    rows = VirtualCompetition::Group::Scoreboard.new(@group).category('wingsuit').rows

    leader, runner_up = rows

    assert_equal 1, leader.rank
    assert_in_delta 300.0, leader.total_points, 0.01
    assert_equal 2, runner_up.rank
    assert_in_delta 150.0, runner_up.total_points, 0.01
    assert_in_delta 50.0, runner_up.points_in_disciplines['distance'], 0.01
  end

  test 'gives tied totals an equal rank' do
    [profiles(:john), profiles(:travis)].each do |profile|
      score(@distance, profile, 3000)
      score(@speed, profile, 300)
      score(@time, profile, 90)
    end

    rows = VirtualCompetition::Group::Scoreboard.new(@group).category('wingsuit').rows

    assert_equal [1, 1], rows.map(&:rank)
  end

  test 'filters by gender' do
    female = create(:profile, name: 'Female pilot', gender: 'female')

    score(@distance, profiles(:john), 3000)
    score(@speed, profiles(:john), 300)
    score(@time, profiles(:john), 90)

    score(@distance, female, 2000)
    score(@speed, female, 200)
    score(@time, female, 60)

    rows = VirtualCompetition::Group::Scoreboard.new(@group, gender: 'female').category('wingsuit').rows

    assert_equal [female.id], rows.map(&:profile_id)
    assert_in_delta 300.0, rows.first.total_points, 0.01
  end

  test 'year view honours the wind cancellation toggle' do
    score(@distance, profiles(:john), 3000, wind_cancelled: true)
    score(@speed, profiles(:john), 300, wind_cancelled: true)
    score(@time, profiles(:john), 90, wind_cancelled: true)

    raw = VirtualCompetition::Group::Scoreboard.new(@group, year: 2024).category('wingsuit')
    assert_empty raw.rows

    adjusted = VirtualCompetition::Group::Scoreboard
               .new(@group, year: 2024, wind_cancellation: true)
               .category('wingsuit')

    assert_equal [profiles(:john).id], adjusted.rows.map(&:profile_id)
  end

  test 'ignores scores from tracks without a pilot' do
    score(@distance, profiles(:john), 3000)
    score(@speed, profiles(:john), 300)
    score(@time, profiles(:john), 90)

    score(@distance, nil, 2000)
    score(@speed, nil, 200)
    score(@time, nil, 60)

    rows = VirtualCompetition::Group::Scoreboard.new(@group).category('wingsuit').rows

    assert_equal [profiles(:john).id], rows.map(&:profile_id)
  end

  test 'falls back to the overall view for a year outside the group' do
    assert_predicate VirtualCompetition::Group::Scoreboard.new(@group, year: 'garbage'), :overall?
    assert_predicate VirtualCompetition::Group::Scoreboard.new(@group, year: '1066'), :overall?
    assert_not VirtualCompetition::Group::Scoreboard.new(@group, year: '2024').overall?
  end

  test 'survives non-scalar page values' do
    scoreboard = VirtualCompetition::Group::Scoreboard.new(@group, pages: { 'wingsuit' => ['2'] })

    assert_equal 1, scoreboard.category('wingsuit').page
  end

  private

  def create_competition(discipline, suits_kind)
    VirtualCompetition.create!(
      name: "#{suits_kind} #{discipline}",
      group: @group,
      suits_kind:,
      jumps_kind: :skydive,
      discipline:,
      period_from: Date.new(2015, 1, 1),
      period_to: Date.new(2025, 1, 1)
    )
  end

  def score(competition, profile, result, wind_cancelled: false)
    track = Track.create!(
      pilot: profile,
      name: ('Anonymous track' if profile.nil?),
      kind: :skydive,
      visibility: :public_track,
      suit: suits(:apache),
      recorded_at: Date.new(2024, 6, 1)
    )

    competition.results.create!(track:, result:, wind_cancelled:)
  end
end
