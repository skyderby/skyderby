WITH results_by_profile AS (
  SELECT DISTINCT ON (suits_kind, tracks.profile_id, wind_cancelled, virtual_competitions.id)
    suits_kind,
    tracks.profile_id,
    tracks.suit_id,
    wind_cancelled,
    virtual_competitions.id competition_id,
    virtual_competitions.group_id group_id,
    virtual_competitions.discipline,
    virtual_competition_results.result result,
    virtual_competition_results.track_id,
    ROUND(
      (virtual_competition_results.result /
        MAX(virtual_competition_results.result) OVER (PARTITION BY virtual_competitions.id, wind_cancelled) * 100)::numeric,
      1
    ) AS points
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
),

ranked_results_by_profile AS (
  SELECT
    results_by_profile.*,
    RANK() OVER (PARTITION BY competition_id, wind_cancelled ORDER BY results_by_profile.result DESC) AS rank
  FROM results_by_profile
)

SELECT
  ranked_results_by_profile.group_id,
  ranked_results_by_profile.suits_kind suits_kind,
  ranked_results_by_profile.profile_id,
  wind_cancelled,
  RANK() OVER (PARTITION BY group_id, suits_kind, wind_cancelled ORDER BY SUM(ranked_results_by_profile.points) DESC) AS rank,
  JSON_OBJECT_AGG(
    ranked_results_by_profile.discipline,
    json_build_object(
      'rank', ranked_results_by_profile.rank,
      'suit_id', ranked_results_by_profile.suit_id,
      'track_id', ranked_results_by_profile.track_id,
      'result', ranked_results_by_profile.result,
      'points', ranked_results_by_profile.points
      )
    ) results,
  SUM(ranked_results_by_profile.points) total_points
FROM
  ranked_results_by_profile
GROUP BY
  ranked_results_by_profile.group_id,
  ranked_results_by_profile.suits_kind,
  ranked_results_by_profile.profile_id,
  wind_cancelled
