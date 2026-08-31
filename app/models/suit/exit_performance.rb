# == Schema Information
#
# Table name: suit_exit_performances
#
#  id           :bigint           not null, primary key
#  suit_id      :bigint           not null
#  pilots_count :integer          default(0), not null
#  jumps_count  :integer          default(0), not null
#  samples      :jsonb            not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Suit::ExitPerformance < ApplicationRecord
  MIN_PILOTS = 1
  RELIABLE_PILOTS = 10

  belongs_to :suit, inverse_of: :exit_performance

  def reliable? = pilots_count >= RELIABLE_PILOTS

  def self.recalculate(suit_id:)
    record = find_by(suit_id:)
    pilots = Profile::ExitPerformance.where(suit_id:).to_a

    if pilots.size < MIN_PILOTS
      record&.destroy
      return
    end

    (record || new(suit_id:)).update!(
      pilots_count: pilots.size,
      jumps_count: pilots.sum(&:tracks_count),
      samples: build_samples(pilots)
    )
  end

  def self.refresh_all
    suit_ids = Profile::ExitPerformance.distinct.pluck(:suit_id) | pluck(:suit_id)
    suit_ids.each { |suit_id| recalculate(suit_id:) }
  end

  def self.build_samples(pilots)
    Track::ExitProfile.drops.each_with_index.map do |drop, index|
      build_sample(drop, values_at(pilots, index, 'mid'), values_at(pilots, index, 'flat'))
    end
  end

  def self.values_at(pilots, index, key)
    pilots.map { |pilot| pilot.samples[index][key].to_f }
  end

  def self.build_sample(drop, medians, flats)
    percentile = Profile::ExitPerformance.method(:percentile)

    {
      drop:,
      low: percentile.call(medians, 10).round(1),
      q1: percentile.call(medians, 25).round(1),
      mid: percentile.call(medians, 50).round(1),
      q3: percentile.call(medians, 75).round(1),
      high: percentile.call(medians, 90).round(1),
      flat: percentile.call(flats, 50).round(1)
    }
  end

  private_class_method :build_samples, :values_at, :build_sample
end
