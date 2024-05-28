require 'test_helper'

class Profiles::RankingPositionsTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:distance_in_time)

    @vasya_profile = create :profile, name: 'Vasya'
    track = create :empty_track, pilot: @vasya_profile
    create :virtual_competition_result,
           virtual_competition: @competition,
           track: track,
           result: 100

    @petya_profile = create :profile, name: 'Petya'
    track = create :empty_track, pilot: @petya_profile
    create :virtual_competition_result,
           virtual_competition: @competition,
           track: track,
           result: 90

    @ilya_profile = create :profile, name: 'Ilya'
    track = create :empty_track, pilot: @ilya_profile
    create :virtual_competition_result,
           virtual_competition: @competition,
           track: track,
           result: 90

    @misha_profile = create :profile, name: 'Misha'
    track = create :empty_track, pilot: @misha_profile
    create :virtual_competition_result,
           virtual_competition: @competition,
           track: track,
           result: 90

    @kolya_profile = create :profile, name: 'Kolya'
    track = create :empty_track, pilot: @kolya_profile
    create :virtual_competition_result,
           virtual_competition: @competition,
           track: track,
           result: 80
  end

  test 'when on first place' do
    results = Profiles::RankingPositions.new(@vasya_profile).by_competition

    _competition, scores = results.first

    profile_names = scores.map { |x| x.profile.name }

    assert_equal %w[Vasya Petya Ilya], profile_names
  end

  test 'when on last place' do
    results = Profiles::RankingPositions.new(@kolya_profile).by_competition

    _competition, scores = results.first

    profile_names = scores.map { |x| x.profile.name }

    assert_equal %w[Ilya Misha Kolya], profile_names
  end

  test 'when in the middle' do
    results = Profiles::RankingPositions.new(@ilya_profile).by_competition

    _competition, scores = results.first

    profile_names = scores.map { |x| x.profile.name }

    assert_equal %w[Petya Ilya Misha], profile_names
  end
end
