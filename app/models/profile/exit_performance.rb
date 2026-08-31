# == Schema Information
#
# Table name: profile_exit_performances
#
#  id               :bigint           not null, primary key
#  profile_id       :bigint           not null
#  suit_id          :bigint           not null
#  tracks_count     :integer          default(0), not null
#  samples          :jsonb            not null
#  last_recorded_at :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class Profile::ExitPerformance < ApplicationRecord
  TRACKS_WINDOW = 50
  MIN_TRACKS = 1
  RELIABLE_TRACKS = 5
  FLAT_SHARE = 0.25
  SUITS_LIMIT = 3

  belongs_to :profile, inverse_of: :exit_performances
  belongs_to :suit, inverse_of: :pilot_exit_performances

  scope :recently_flown, -> { order(last_recorded_at: :desc) }

  def reliable? = tracks_count >= RELIABLE_TRACKS

  def self.recalculate(profile_id:, suit_id:)
    record = find_by(profile_id:, suit_id:)
    exit_profiles = recent_exit_profiles(profile_id, suit_id)

    if exit_profiles.size < MIN_TRACKS
      record&.destroy
      return
    end

    (record || new(profile_id:, suit_id:)).update!(
      tracks_count: exit_profiles.size,
      samples: build_samples(exit_profiles),
      last_recorded_at: exit_profiles.filter_map(&:recorded_at).max
    )
  end

  def self.recent_exit_profiles(profile_id, suit_id)
    Track::ExitProfile
      .where(profile_id:, suit_id:)
      .order(recorded_at: :desc)
      .limit(TRACKS_WINDOW)
      .to_a
  end

  def self.build_samples(exit_profiles)
    flat_profiles = exit_profiles.sort_by(&:reference_distance).last((exit_profiles.size * FLAT_SHARE).ceil)

    Track::ExitProfile.drops.each_with_index.map do |drop, index|
      build_sample(drop, distances_at(exit_profiles, index), distances_at(flat_profiles, index))
    end
  end

  def self.distances_at(exit_profiles, index)
    exit_profiles.map { |exit_profile| exit_profile.distances[index].to_f }
  end

  def self.build_sample(drop, values, flat_values)
    {
      drop:,
      low: percentile(values, 10).round(1),
      q1: percentile(values, 25).round(1),
      mid: percentile(values, 50).round(1),
      q3: percentile(values, 75).round(1),
      high: percentile(values, 90).round(1),
      flat: (flat_values.sum / flat_values.size).round(1)
    }
  end

  def self.percentile(values, rank)
    sorted = values.sort
    position = (sorted.size - 1) * rank / 100.0
    lower = sorted[position.floor]
    upper = sorted[position.ceil]

    lower + ((upper - lower) * (position - position.floor))
  end

  private_class_method :recent_exit_profiles, :build_samples, :distances_at, :build_sample
end
