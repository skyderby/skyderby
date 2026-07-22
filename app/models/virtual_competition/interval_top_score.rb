class VirtualCompetition::IntervalTopScore < ApplicationRecord
  # Best result per (competition, custom interval, profile), ranked. Built inline
  # over virtual_competition_results (like AnnualTopScore) instead of a view.
  self.table_name = 'virtual_competition_results'
  self.implicit_order_column = :rank

  belongs_to :virtual_competition
  belongs_to :custom_interval
  belongs_to :track
  belongs_to :profile
  belongs_to :suit

  default_scope { from(ranked_results_sql) }

  scope :for, ->(interval) { where(custom_interval: interval) }
  scope :wind_cancellation, ->(enabled) { where(wind_cancelled: enabled) }

  def self.ranked_results_sql
    sql = <<~SQL.squish
      SELECT
        row_number() OVER (
          PARTITION BY entities.virtual_competition_id, entities.custom_interval_id, entities.wind_cancelled
          ORDER BY CASE WHEN entities.results_sort_order = 'descending' THEN entities.result ELSE -entities.result END DESC
        ) AS rank,
        entities.id,
        entities.virtual_competition_id,
        entities.track_id,
        entities.result,
        entities.highest_speed,
        entities.highest_gr,
        entities.profile_id,
        entities.suit_id,
        entities.custom_interval_id,
        entities.wind_cancelled,
        entities.recorded_at,
        entities.created_at,
        entities.updated_at
      FROM (
        SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id, intervals.id, results.wind_cancelled)
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
          competitions.results_sort_order,
          intervals.id AS custom_interval_id
        FROM virtual_competition_results results
          INNER JOIN virtual_competitions competitions ON results.virtual_competition_id = competitions.id
          LEFT JOIN tracks tracks ON tracks.id = results.track_id
          INNER JOIN virtual_competition_custom_intervals intervals
            ON intervals.virtual_competition_id = competitions.id
            AND tracks.recorded_at BETWEEN intervals.period_from AND intervals.period_to
        ORDER BY
          results.virtual_competition_id,
          tracks.profile_id,
          intervals.id,
          results.wind_cancelled,
          CASE WHEN competitions.results_sort_order = 'descending' THEN results.result ELSE -results.result END DESC
      ) entities
    SQL

    Arel.sql("(#{sql}) AS #{table_name}")
  end

  private

  def readonly?
    true
  end
end
