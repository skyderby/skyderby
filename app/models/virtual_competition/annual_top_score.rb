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

  default_scope { from(ranked_results_sql) }

  scope :for_competition, ->(virtual_competition) { where(virtual_competition:) }
  scope :for_year, ->(year) { where(year:) }
  scope :wind_cancellation, ->(wind_cancelled) { where(wind_cancelled:) }

  class << self
    def at_snapshot(time)
      unscoped.from(ranked_results_sql(snapshot_at: time))
    end

    def ranked_results_sql(snapshot_at: Time.current, wind_cancelled: false)
      best_results_sql = <<~SQL.squish
        SELECT DISTINCT ON (vcr.virtual_competition_id, t.profile_id)
          vcr.*,
          t.profile_id,
          t.suit_id,
          t.recorded_at,
          EXTRACT(YEAR FROM t.recorded_at) as year,
          vc.results_sort_order
        FROM virtual_competition_results vcr
        JOIN tracks t ON t.id = vcr.track_id
        JOIN virtual_competitions vc ON vc.id = vcr.virtual_competition_id
        WHERE t.recorded_at < :snapshot_at
          AND vcr.wind_cancelled = :wind_cancelled
        ORDER BY vcr.virtual_competition_id, t.profile_id,
          CASE WHEN vc.results_sort_order = 'descending' THEN vcr.result ELSE -vcr.result END DESC
      SQL

      ranked_sql = <<~SQL.squish
        SELECT
          ROW_NUMBER() OVER (
            PARTITION BY virtual_competition_id
            ORDER BY CASE WHEN results_sort_order = 'descending' THEN result ELSE -result END DESC
          ) as rank,
          best.*
        FROM (#{best_results_sql}) AS best
      SQL

      Arel.sql("(#{sanitize_sql([ranked_sql, { snapshot_at:, wind_cancelled: }])}) AS #{table_name}")
    end
  end

  def readonly? = true
end
