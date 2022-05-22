SELECT
  row_number() OVER(
    PARTITION BY virtual_competition_id, entities.wind_cancelled
    ORDER BY CASE WHEN entities.results_sort_order = 'descending'
               THEN entities.result
             ELSE -entities.result
             END DESC
  ) as rank,
  entities.*
FROM (
    SELECT DISTINCT ON (results.virtual_competition_id, results.wind_cancelled, tracks.profile_id)
      results.virtual_competition_id,
      results.track_id,
      results.result,
      results.highest_speed,
      results.highest_gr,
      results.wind_cancelled,
      tracks.profile_id,
      tracks.suit_id,
      tracks.recorded_at,
      competitions.results_sort_order
    FROM
      virtual_competition_results as results
      INNER JOIN virtual_competitions competitions
      ON results.virtual_competition_id = competitions.id
      LEFT JOIN tracks as tracks
      ON tracks.id = results.track_id
    ORDER BY
      results.virtual_competition_id,
      results.wind_cancelled,
      tracks.profile_id,
      CASE WHEN competitions.results_sort_order = 'descending'
        THEN results.result
      ELSE -results.result
      END DESC
    ) AS entities
ORDER BY CASE WHEN entities.results_sort_order = 'descending'
           THEN entities.result
         ELSE -entities.result
         END DESC;
