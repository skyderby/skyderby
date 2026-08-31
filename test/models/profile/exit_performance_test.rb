require 'test_helper'

class Profile::ExitPerformanceTest < ActiveSupport::TestCase
  test 'aggregates percentiles and the flattest quarter of jumps' do
    create_exit_profiles([1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7])

    performance = recalculate

    assert_equal 8, performance.tracks_count
    assert_equal 61, performance.samples.size

    sample = performance.samples.find { |value| value['drop'] == 200 }

    assert_in_delta 270, sample['mid'], 1
    assert_in_delta 214, sample['low'], 2
    assert_in_delta 326, sample['high'], 2
    assert_in_delta 330, sample['flat'], 2
  end

  test 'keeps a suit with a single jump but marks it unreliable' do
    create_exit_profiles([1.2])

    performance = recalculate

    assert_equal 1, performance.tracks_count
    assert_not_predicate performance, :reliable?
  end

  test 'marks a suit reliable once it has enough jumps' do
    create_exit_profiles([1.0, 1.1, 1.2, 1.3, 1.4])

    assert_predicate recalculate, :reliable?
  end

  test 'keeps the flattest jumps instead of treating them as outliers' do
    create_exit_profiles([0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 2.0])

    performance = recalculate
    sample = performance.samples.find { |value| value['drop'] == 200 }

    assert_equal 7, performance.tracks_count
    assert_in_delta 298, sample['high'], 5
    assert_in_delta 315, sample['flat'], 5
  end

  test 'keeps only the most recent jumps within the window' do
    create_exit_profiles(Array.new(Profile::ExitPerformance::TRACKS_WINDOW + 5) { 1.2 })

    performance = recalculate

    assert_equal Profile::ExitPerformance::TRACKS_WINDOW, performance.tracks_count
  end

  test 'removes the aggregate when jumps are gone' do
    create_exit_profiles([1.0, 1.1])
    assert_predicate recalculate, :present?

    Track::ExitProfile.delete_all

    assert_nil recalculate
  end

  private

  def profile = profiles(:alex)

  def suit = suits(:apache)

  def recalculate
    Profile::ExitPerformance.recalculate(profile_id: profile.id, suit_id: suit.id)
    Profile::ExitPerformance.find_by(profile_id: profile.id, suit_id: suit.id)
  end

  def create_exit_profiles(glide_ratios)
    glide_ratios.each_with_index do |glide_ratio, index|
      track = Track.create!(pilot: profile, suit:, kind: :base, visibility: :public_track,
                            recorded_at: index.days.ago)
      distances = Track::ExitProfile.drops.map { |drop| (drop * glide_ratio).round(1) }

      Track::ExitProfile.create!(
        track:, profile_id: profile.id, suit_id: suit.id, recorded_at: track.recorded_at,
        distances:, reference_distance: distances[Track::ExitProfile.reference_index]
      )
    end
  end
end
