require 'test_helper'

class Profiles::JournalTest < ActiveSupport::TestCase
  setup do
    @profile = profiles(:regular_user)
  end

  test 'builds performance tasks ordered by attempt with competition variant' do
    a = skydive_track(10, suits(:apache))
    b = skydive_track(9, suits(:apache))
    c = skydive_track(8, suits(:oneshot))
    [[a, 2000], [b, 2500], [c, 2200]].each do |track, value|
      track.results.create!(discipline: :distance, variant: Track::Result::COMPETITION_VARIANT, result: value)
    end

    journal = Profiles::Journal.new(@profile, mode: :performance)

    assert_equal :performance, journal.current_mode
    distance = journal.tasks.find { |task| task.key == :distance }
    assert distance
    assert distance.higher_is_better
    points = distance.series.first.points
    assert_equal [1, 2, 3], points.map(&:x)
    assert_equal [2000, 2500, 2200], points.map(&:y)
  end

  test 'splits speed into series by suit class' do
    wing = skydive_track(5, suits(:apache))
    track = skydive_track(4, suits(:oneshot))
    wing.results.create!(discipline: :speed, variant: Track::Result::COMPETITION_VARIANT, result: 300)
    track.results.create!(discipline: :speed, variant: Track::Result::COMPETITION_VARIANT, result: 250)

    journal = Profiles::Journal.new(@profile, mode: :performance)
    speed = journal.tasks.find { |task| task.key == :speed }

    assert_equal %w[tracksuit wingsuit], speed.series.map(&:key).sort
  end

  test 'base race task uses the lower-is-better direction' do
    track = skydive_track(3, suits(:apache), kind: :base)
    track.results.create!(discipline: :base_race, variant: '1', result: 30)

    journal = Profiles::Journal.new(@profile, mode: :base)
    base_race = journal.tasks.find { |task| task.key == :base_race }

    assert base_race
    assert_not base_race.higher_is_better
  end

  private

  def skydive_track(days_ago, suit, kind: :skydive)
    Track.create!(pilot: @profile, kind: kind, suit: suit, recorded_at: days_ago.days.ago)
  end
end
