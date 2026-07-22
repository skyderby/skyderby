class VirtualCompetition::PersonalTopScore < ApplicationRecord
  # Best result per (competition, profile), ranked. Built inline over
  # virtual_competition_results (like AnnualTopScore) instead of a database view.
  self.table_name = 'virtual_competition_results'
  self.implicit_order_column = :rank

  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :profile
  belongs_to :suit

  default_scope { from(ranked_results_sql) }

  scope :wind_cancellation, ->(enabled) { where(wind_cancelled: enabled) }

  def self.ranked_results_sql
    sql = <<~SQL.squish
      SELECT
        row_number() OVER (
          PARTITION BY virtual_competition_id, entities.wind_cancelled
          ORDER BY CASE WHEN entities.results_sort_order = 'descending' THEN entities.result ELSE -entities.result END DESC
        ) AS rank,
        entities.*
      FROM (
        SELECT DISTINCT ON (results.virtual_competition_id, results.wind_cancelled, tracks.profile_id)
          results.id,
          results.virtual_competition_id,
          results.track_id,
          results.result,
          results.highest_speed,
          results.highest_gr,
          results.wind_cancelled,
          results.created_at,
          results.updated_at,
          tracks.profile_id,
          tracks.suit_id,
          tracks.recorded_at,
          competitions.results_sort_order
        FROM virtual_competition_results AS results
          INNER JOIN virtual_competitions competitions ON results.virtual_competition_id = competitions.id
          LEFT JOIN tracks AS tracks ON tracks.id = results.track_id
        ORDER BY
          results.virtual_competition_id,
          results.wind_cancelled,
          tracks.profile_id,
          CASE WHEN competitions.results_sort_order = 'descending' THEN results.result ELSE -results.result END DESC
      ) AS entities
    SQL

    Arel.sql("(#{sql}) AS #{table_name}")
  end

  private

  def readonly?
    true
  end
end
