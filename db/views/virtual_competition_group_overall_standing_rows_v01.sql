SELECT
  results_by_profile.group_id,
  results_by_profile.suits_kind suits_kind,
  results_by_profile.profile_id,
  wind_cancelled,
  RANK() OVER (PARTITION BY group_id, suits_kind, wind_cancelled ORDER BY SUM(results_by_profile.points) DESC) AS rank,
  JSON_OBJECT_AGG(
    results_by_profile.discipline,
    json_build_object(
      'suit_id', results_by_profile.suit_id,
      'result', results_by_profile.result,
      'points', results_by_profile.points
      )
    ) results,
  JSON_OBJECT_AGG(
    results_by_profile.discipline,
    results_by_profile.competition_id
    ) competitions,
  SUM(results_by_profile.points) total_points
FROM
  (SELECT DISTINCT ON (suits_kind, tracks.profile_id, wind_cancelled, virtual_competitions.id)
     suits_kind,
     tracks.profile_id,
     tracks.suit_id,
     wind_cancelled,
     virtual_competitions.id competition_id,
     virtual_competitions.group_id group_id,
     virtual_competitions.discipline,
     virtual_competition_results.result result,
     virtual_competition_results.result /
       MAX(virtual_competition_results.result) OVER (PARTITION BY virtual_competitions.id) * 100 AS points
   FROM
     virtual_competitions
       LEFT JOIN virtual_competition_results
                 ON virtual_competition_results.virtual_competition_id = virtual_competitions.id
       LEFT JOIN tracks
                 ON virtual_competition_results.track_id = tracks.id
   ORDER BY
     suits_kind,
     tracks.profile_id,
     virtual_competitions.id,
     wind_cancelled,
     virtual_competition_results.result DESC
   ) results_by_profile
GROUP BY
  results_by_profile.group_id,
  results_by_profile.suits_kind,
  results_by_profile.profile_id,
  wind_cancelled
