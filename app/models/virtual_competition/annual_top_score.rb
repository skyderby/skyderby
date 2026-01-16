# == Schema Information
#
# Table name: annual_top_scores
#
#  rank                   :integer
#  virtual_competition_id :integer
#  year                   :float
#  track_id               :integer
#  result                 :float
#  highest_speed          :float
#  highest_gr             :float
#  profile_id             :integer
#  suit_id                :integer
#  recorded_at            :datetime
#

class VirtualCompetition::AnnualTopScore < ApplicationRecord
  self.table_name = 'virtual_competition_results'

  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :profile
  belongs_to :suit

  scope :wind_cancellation, ->(enabled) { where(wind_cancelled: enabled) }

  class << self
    def for_competition(virtual_competition, year:, wind_cancelled: false, snapshot_at: Time.current)
      sort_direction = virtual_competition.results_sort_order == 'descending' ? 'DESC' : 'ASC'

      best_results =
        VirtualCompetition::Result
        .joins(:track)
        .where(virtual_competition:, wind_cancelled:)
        .where(tracks: { recorded_at: ...snapshot_at })
        .where('EXTRACT(YEAR FROM tracks.recorded_at) = :year', year:)
        .select(
          "DISTINCT ON (tracks.profile_id) #{VirtualCompetition::Result.table_name}.*",
          'tracks.profile_id',
          'tracks.suit_id',
          'tracks.recorded_at'
        )
        .order(Arel.sql("tracks.profile_id, result #{sort_direction}"))

      from("(
        SELECT ROW_NUMBER() OVER (ORDER BY result #{sort_direction}) as rank, best_results.*
        FROM (#{best_results.to_sql}) AS best_results
      ) AS #{table_name}")
    end
  end

  def readonly? = true
end
