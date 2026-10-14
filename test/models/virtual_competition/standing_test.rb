require 'test_helper'

class VirtualCompetition::StandingTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @ascending_competition = virtual_competitions(:base_race)
    @multi_competition = virtual_competitions(:feather_challenge)

    @john = profiles(:john)
    @alex = profiles(:alex)
    @travis = profiles(:travis)
  end

  test 'ranks the best result per pilot in descending order' do
    create_result @competition, @john, 2000, '2024-03-01'
    create_result @competition, @john, 2500, '2024-03-15'
    create_result @competition, @alex, 3000, '2024-03-02'
    create_result @competition, @travis, 2400, '2024-03-03'

    scores = @competition.standings.order(:rank)

    assert_equal [@alex.id, @john.id, @travis.id], scores.map(&:profile_id)
    assert_equal [3000, 2500, 2400], scores.map(&:result)
    assert_equal [1, 2, 3], scores.map(&:rank)
  end

  test 'ranks ascending for base race' do
    create_result @ascending_competition, @john, 30, '2016-03-01'
    create_result @ascending_competition, @alex, 25, '2016-03-02'
    create_result @ascending_competition, @travis, 28, '2016-03-03'

    scores = @ascending_competition.standings.order(:rank)

    assert_equal [@alex.id, @travis.id, @john.id], scores.map(&:profile_id)
    assert_equal [25, 28, 30], scores.map(&:result)
  end

  test 'counts the earlier jump when results tie' do
    earlier = create_result(@competition, @john, 2000, '2024-03-01').track
    create_result @competition, @john, 2000, '2024-04-01'

    assert_equal earlier, @competition.standings.sole.track
  end

  test 'ranks wind cancelled results separately' do
    create_result @competition, @john, 2000, '2024-03-01'
    create_result @competition, @alex, 3000, '2024-03-01', wind_cancelled: true

    assert_equal [@john.id], @competition.standings.map(&:profile_id)
    assert_equal [@alex.id], @competition.standings(wind_cancelled: true).map(&:profile_id)
  end

  test 'limits the ranking to a year including its last day' do
    create_result @competition, @john, 2000, '2023-06-01'
    create_result @competition, @alex, 3000, '2024-12-31 18:00'
    create_result @competition, @travis, 2500, '2025-01-01'

    assert_equal [@alex.id], @competition.standings(year: 2024).map(&:profile_id)
  end

  test 'limits the ranking to a custom interval' do
    interval = @ascending_competition.custom_intervals.create!(
      name: 'February', period_from: Time.zone.parse('2016-02-01'), period_to: Time.zone.parse('2016-02-28')
    )
    create_result @ascending_competition, @john, 50, '2016-01-08'
    create_result @ascending_competition, @john, 100, '2016-02-02'
    create_result @ascending_competition, @alex, 150, '2016-02-03'

    scores = @ascending_competition.standings(interval:).order(:rank)

    assert_equal([[@john.id, 100], [@alex.id, 150]], scores.map { |score| [score.profile_id, score.result] })
  end

  test 'interval ending at midnight includes jumps from its last day' do
    interval = @ascending_competition.custom_intervals.create!(
      name: 'February', period_from: Time.zone.parse('2016-02-01'), period_to: Time.zone.parse('2016-02-28')
    )
    create_result @ascending_competition, @john, 100, '2016-02-28 14:00'

    assert_equal [@john.id], @ascending_competition.standings(interval:).map(&:profile_id)
  end

  test 'podium places of a track include the wind cancelled ranking' do
    create_result @competition, @alex, 3000, '2024-03-01'
    create_result @competition, @travis, 2900, '2024-03-01'
    create_result @competition, @john, 2800, '2024-03-01'
    track = create_result(@competition, profiles(:maynard), 2000, '2024-03-02').track
    @competition.results.create!(track:, result: 3500, wind_cancelled: true)

    places = VirtualCompetition::Standing.podium_places_of(track)

    assert_equal([[true, 1]], places.map { |place| [place.wind_cancelled, place.rank] })
  end

  test 'interval ending at midnight does not overlap the next interval' do
    february = @ascending_competition.custom_intervals.create!(
      name: 'February', period_from: Time.zone.parse('2016-02-01'), period_to: Time.zone.parse('2016-03-01')
    )
    march = @ascending_competition.custom_intervals.create!(
      name: 'March', period_from: Time.zone.parse('2016-03-01'), period_to: Time.zone.parse('2016-03-31')
    )
    create_result @ascending_competition, @john, 100, '2016-03-01 10:00'

    assert_empty @ascending_competition.standings(interval: february)
    assert_equal [@john.id], @ascending_competition.standings(interval: march).map(&:profile_id)
  end

  test 'snapshot ignores jumps recorded after it' do
    create_result @competition, @john, 2000, '2024-03-01'
    create_result @competition, @john, 3000, '2024-03-20'
    create_result @competition, @alex, 2500, '2024-03-20'

    scores = @competition.standings(year: 2024, snapshot_at: Time.zone.parse('2024-03-10'))

    assert_equal([[@john.id, 2000]], scores.map { |score| [score.profile_id, score.result] })
  end

  test 'filters by jump kind before picking the best jump' do
    create_result @competition, @john, 3000, '2024-03-01', kind: :base
    create_result @competition, @john, 2000, '2024-03-02'
    create_result @competition, @alex, 2500, '2024-03-03'

    scores = @competition.standings(jump_kind: 'skydive').order(:rank)

    assert_equal([[@alex.id, 2500, 1], [@john.id, 2000, 2]], scores.map { |s| [s.profile_id, s.result, s.rank] })
  end

  test 'filters by gender and re-ranks from one' do
    @alex.update!(gender: :female)
    create_result @competition, @john, 3000, '2024-03-01'
    create_result @competition, @alex, 2500, '2024-03-02'

    scores = @competition.standings(gender: 'female')

    assert_equal([[@alex.id, 1]], scores.map { |score| [score.profile_id, score.rank] })
  end

  test 'filters by suit' do
    create_result @competition, @john, 3000, '2024-03-01', suit: suits(:nala)
    create_result @competition, @alex, 2500, '2024-03-02'

    assert_equal [@john.id], VirtualCompetition::Standing.ranked(suit_id: suits(:nala).id).map(&:profile_id)
  end

  test 'ranks each competition separately' do
    create_result @competition, @john, 3000, '2024-03-01'
    create_result virtual_competitions(:skydive_speed_wingsuit), @alex, 300, '2024-03-01'

    scores = VirtualCompetition::Standing.ranked.where(rank: 1)

    assert_equal [@john.id, @alex.id].sort, scores.map(&:profile_id).sort
  end

  test 'preloads and eager loads associations' do
    create_result @competition, @john, 2000, '2024-03-01'

    preloaded = @competition.standings.includes(:profile, :track).first
    eager_loaded = @competition.standings.includes(:virtual_competition).references(:virtual_competition).to_a

    assert_equal @john.name, preloaded.profile.name
    assert_equal [@competition], eager_loaded.map(&:virtual_competition)
  end

  test 'multi-discipline scores every discipline of a single track relative to the best results' do
    add_jump @john, distance: 100, flare: 10
    add_jump profiles(:maynard), distance: 40, flare: 20

    scores = @multi_competition.standings.order(:rank)

    assert_equal [@john, profiles(:maynard)], scores.map(&:profile)
    assert_in_delta 150, scores.first.result
    assert_equal [100, 50], scores.first.entries.map(&:points)
    assert_equal [0, -10], scores.first.entries.map(&:gap)
    assert_in_delta 140, scores.second.result
  end

  test 'multi-discipline counts the best single track instead of combining tracks' do
    best = add_jump @john, distance: 90, flare: 18
    add_jump @john, distance: 100, flare: nil
    add_jump @john, distance: nil, flare: 20

    score = @multi_competition.standings.sole

    assert_equal best, score.track
    assert_in_delta 200, score.result
  end

  test 'multi-discipline scores the table only against counted jumps' do
    add_jump @john, distance: 100, flare: nil
    counted = add_jump @john, distance: 50, flare: 10
    add_jump profiles(:maynard), distance: 80, flare: 5

    john, maynard = @multi_competition.standings.order(:rank)

    assert_equal counted, john.track
    assert_equal [62.5, 100.0], john.entries.map(&:points)
    assert_equal [100.0, 50.0], maynard.entries.map(&:points)
  end

  test 'multi-discipline counts the earlier jump when totals tie' do
    earlier = add_jump @john, distance: 100, flare: nil, recorded_at: '2025-03-01'
    add_jump @john, distance: nil, flare: 20, recorded_at: '2025-04-01'

    assert_equal earlier, @multi_competition.standings.sole.track
  end

  test 'multi-discipline limits scores to the requested year' do
    add_jump @john, distance: 100, flare: 10, recorded_at: '2024-06-01'
    add_jump profiles(:maynard), distance: 50, flare: 20, recorded_at: '2025-06-01'

    scores = @multi_competition.standings(year: 2025)

    assert_equal [profiles(:maynard)], scores.map(&:profile)
    assert_in_delta 200, scores.first.result
  end

  test 'multi-discipline gender filter scores against the filtered field' do
    @alex.update!(gender: :female)
    add_jump @john, distance: 100, flare: 20
    add_jump @alex, distance: 50, flare: 10

    score = @multi_competition.standings(gender: 'female').sole

    assert_equal @alex, score.profile
    assert_in_delta 200, score.result
  end

  test 'can leave multi-discipline rankings out' do
    create_result @competition, @john, 2000, '2024-03-01'
    add_jump @john, distance: 100, flare: 10

    competition_ids = VirtualCompetition::Standing.ranked(multi_discipline: false).map(&:virtual_competition_id)

    assert_equal [@competition.id], competition_ids
  end

  test 'multi-discipline ranking ignores results scored before disciplines were added' do
    add_jump @john, distance: 100, flare: 10
    @multi_competition.results.create!(track: create_track(@john, '2025-02-01', kind: :base), result: 500)

    assert_equal([[@john.id, 1]], @multi_competition.standings.map { |score| [score.profile_id, score.rank] })
  end

  test 'personal jumps score every jump against the pilot own bests, counted jump first' do
    add_jump @john, distance: 100, flare: nil, recorded_at: '2025-03-01'
    counted = add_jump @john, distance: 50, flare: 10, recorded_at: '2025-04-01'
    add_jump @alex, distance: 500, flare: 50

    jumps = VirtualCompetition::Standing
            .personal_jumps(competition_ids: [@multi_competition.id])
            .where(profile_id: @john.id)
            .order(sort_value: :desc, recorded_at: :asc, track_id: :asc)

    assert_equal counted, jumps.first.track
    assert_equal counted, @multi_competition.standings.find_by(profile_id: @john.id).track
    assert_equal [150.0, 100.0], jumps.map(&:result)
    assert_equal [50.0, 100.0], jumps.first.entries.map(&:points)
  end

  test 'requires at least two disciplines' do
    competition = VirtualCompetition.new(
      name: 'Single', group: virtual_competition_groups(:main), discipline: :flare,
      disciplines_attributes: [{ discipline: :flare }]
    )

    assert_not competition.valid?
    assert competition.errors.added?(:disciplines, :single)
  end

  private

  def create_result(competition, profile, result, recorded_at, **options)
    track = create_track(profile, recorded_at, kind: options.fetch(:kind, :skydive), suit: options[:suit])
    competition.results.create!(track:, result:, wind_cancelled: options.fetch(:wind_cancelled, false))
  end

  def add_jump(profile, distance:, flare:, recorded_at: '2025-03-01')
    track = create_track(profile, recorded_at, kind: :base)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track:, result: distance) if distance
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track:, result: flare) if flare
    track
  end

  def create_track(profile, recorded_at, kind:, suit: nil)
    Track.create!(
      pilot: profile, kind:, suit: suit || suits(:apache), recorded_at: Time.zone.parse(recorded_at),
      ground_level: 0, ff_start: 0, ff_end: 10
    )
  end
end
