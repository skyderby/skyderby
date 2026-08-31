require 'test_helper'

class Suit::ExitPerformanceTest < ActiveSupport::TestCase
  test 'aggregates pilots as one vote each' do
    create_pilots(10)

    performance = recalculate
    sample = performance.samples.find { |value| value['drop'] == 200 }

    assert_equal 10, performance.pilots_count
    assert_equal 100, performance.jumps_count
    assert_in_delta 290, sample['mid'], 2
    assert_in_delta 348, sample['flat'], 2
  end

  test 'does not let a prolific pilot outweigh the others' do
    create_pilots(9)
    create_pilot(9.0, jumps: 50)

    sample = recalculate.samples.find { |value| value['drop'] == 200 }

    assert_in_delta 290, sample['mid'], 2
  end

  test 'skips suits with too few pilots' do
    create_pilots(Suit::ExitPerformance::MIN_PILOTS - 1)

    assert_nil recalculate
  end

  test 'removes the aggregate when pilots drop below the minimum' do
    create_pilots(10)
    assert_predicate recalculate, :present?

    Profile::ExitPerformance.limit(5).destroy_all

    assert_nil recalculate
  end

  private

  def suit = suits(:apache)

  def recalculate
    Suit::ExitPerformance.recalculate(suit_id: suit.id)
    Suit::ExitPerformance.find_by(suit_id: suit.id)
  end

  def create_pilots(count)
    count.times { |index| create_pilot(1.0 + (index * 0.1)) }
  end

  def create_pilot(glide_ratio, jumps: 10)
    profile = Profile.create!(name: "Pilot #{Profile.count}")

    samples = Track::ExitProfile.drops.map do |drop|
      distance = drop * glide_ratio
      { drop:, low: distance * 0.8, q1: distance * 0.9, mid: distance,
        q3: distance * 1.1, high: distance * 1.2, flat: distance * 1.2 }
    end

    Profile::ExitPerformance.create!(profile:, suit:, tracks_count: jumps, samples:,
                                     last_recorded_at: Time.current)
  end
end
