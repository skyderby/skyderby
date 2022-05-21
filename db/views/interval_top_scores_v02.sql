SELECT
  row_number() OVER (
    PARTITION BY entities.virtual_competition_id,
                 entities.custom_interval_id,
                 entities.wind_cancelled
    ORDER BY CASE WHEN entities.results_sort_order = 'descending'
               THEN entities.result
             ELSE -entities.result
             END DESC
  ) AS rank,
  entities.virtual_competition_id,
  entities.track_id,
  entities.result,
  entities.highest_speed,
  entities.highest_gr,
  entities.profile_id,
  entities.suit_id,
  entities.custom_interval_id,
  entities.wind_cancelled,
  entities.recorded_at
FROM (
    SELECT DISTINCT ON (results.virtual_competition_id,
                        tracks.profile_id,
                        intervals.id,
                        results.wind_cancelled)

      results.virtual_competition_id,
      results.track_id,
      results.result,
      results.highest_speed,
      results.highest_gr,
      results.wind_cancelled,
      tracks.profile_id,
      tracks.suit_id,
      tracks.recorded_at,
      competitions.results_sort_order,
      intervals.id AS custom_interval_id
    FROM
      virtual_competition_results results
      INNER JOIN virtual_competitions competitions
      ON results.virtual_competition_id = competitions.id
      LEFT JOIN tracks tracks
      ON tracks.id = results.track_id
      INNER JOIN virtual_competition_custom_intervals intervals
      ON intervals.virtual_competition_id = competitions.id
      AND tracks.recorded_at BETWEEN intervals.period_from AND intervals.period_to
    ORDER BY
      results.virtual_competition_id,
      tracks.profile_id,
      intervals.id,
      results.wind_cancelled,
      CASE WHEN competitions.results_sort_order = 'descending'
        THEN results.result
      ELSE -results.result
      END DESC
  ) entities
ORDER BY CASE WHEN entities.results_sort_order = 'descending'
           THEN entities.result
         ELSE -entities.result
         END DESC;
