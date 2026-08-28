# == Schema Information
#
# Table name: track_exit_profiles
#
#  id                 :bigint           not null, primary key
#  track_id           :bigint           not null
#  profile_id         :bigint           not null
#  suit_id            :bigint           not null
#  recorded_at        :datetime         not null
#  distances          :jsonb            not null
#  reference_distance :float            not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class Track::ExitProfile < ApplicationRecord
  STEP = 5
  MAX_DROP = 300
  REFERENCE_DROP = 200
  MAX_TIME_GAP = 2.0

  belongs_to :track
  belongs_to :suit, inverse_of: :exit_profiles
  belongs_to :profile, inverse_of: :exit_profiles

  after_commit :refresh_performance

  def self.drops = (0..MAX_DROP).step(STEP).to_a

  def self.reference_index = drops.index(REFERENCE_DROP)

  def self.recalculate(track)
    record = find_by(track_id: track.id)
    distances = suitable?(track) ? sample_distances(track) : nil

    if distances.nil?
      record&.destroy
      return
    end

    (record || new(track_id: track.id)).update!(
      profile_id: track.profile_id,
      suit_id: track.suit_id,
      recorded_at: track.recorded_at,
      distances:,
      reference_distance: distances[reference_index]
    )
  end

  def self.suitable?(track)
    track.base? && track.profile_id.present? && track.suit_id.present? && track.ff_start.present?
  end

  def self.sample_distances(track)
    curve = build_curve(track)
    return unless curve && curve.last.first >= MAX_DROP

    drops.map { |drop| distance_at(curve, drop) }
  end

  def self.build_curve(track)
    points = PointsQuery.execute(track, trimmed: true, freq_1hz: true,
                                        only: %i[fl_time altitude latitude longitude])
    return if points.size < 2

    origin = points.first
    curve = []

    points.each_cons(2) do |previous, point|
      return nil if point[:fl_time] - previous[:fl_time] > MAX_TIME_GAP

      drop = origin[:altitude] - point[:altitude]
      curve << [drop, distance_between(origin, point)] if curve.empty? || drop > curve.last.first
      break if drop >= MAX_DROP
    end

    curve.unshift([0.0, 0.0])
  end

  def self.distance_between(origin, point)
    Skyderby::Geospatial.distance(
      [origin[:latitude], origin[:longitude]],
      [point[:latitude], point[:longitude]]
    )
  end

  def self.distance_at(curve, drop)
    index = curve.index { |curve_drop, _| curve_drop >= drop }
    return curve[index].last.round(1) if index.zero?

    lower = curve[index - 1]
    upper = curve[index]
    ratio = (drop - lower.first) / (upper.first - lower.first)

    (lower.last + ((upper.last - lower.last) * ratio)).round(1)
  end

  private_class_method :sample_distances, :build_curve, :distance_between, :distance_at

  private

  def refresh_performance
    affected_pairs.each { |pair| Profile::ExitPerformance.recalculate(**pair) }
  end

  def affected_pairs
    [{ profile_id:, suit_id: }, previous_pair].compact.uniq
  end

  def previous_pair
    pair = {
      profile_id: previous_changes.dig('profile_id', 0) || profile_id,
      suit_id: previous_changes.dig('suit_id', 0) || suit_id
    }

    pair if pair.values.all?(&:present?)
  end
end
