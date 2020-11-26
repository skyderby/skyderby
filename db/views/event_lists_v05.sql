SELECT
  *
FROM (
  SELECT
    'Event' AS event_type,
    events.id AS event_id,
    events.name,
    events.rules,
    events.starts_at,
    events.status,
    events.visibility,
    events.responsible_id,
    events.place_id,
    events.range_from,
    events.range_to,
    events.is_official,
    COALESCE(
      JSON_OBJECT_AGG(
        COALESCE(competitors_count.section_name, ''),
        competitors_count.count
      ) FILTER ( WHERE competitors_count.section_name IS NOT NULL ),
      '{}'::json
    ) AS competitors_count,
    participant_countries.country_ids,
    events.updated_at,
    events.created_at
  FROM events
  LEFT JOIN (
    SELECT
      sections.event_id AS event_id,
      sections.name AS section_name,
      count(competitors.id) AS count
    FROM event_sections AS sections
    LEFT JOIN event_competitors AS competitors
      ON sections.event_id = competitors.event_id
      AND sections.id = competitors.section_id
    GROUP BY
      sections.event_id, sections.name
  ) AS competitors_count
    ON events.id = competitors_count.event_id
  LEFT JOIN (
    SELECT
      competitors.event_id,
      COALESCE(
        array_agg(DISTINCT profiles.country_id) FILTER ( WHERE profiles.country_id IS NOT NULL ),
        ARRAY []::integer[]
      ) AS country_ids
    FROM event_competitors AS competitors
    LEFT JOIN profiles AS profiles
      ON competitors.profile_id = profiles.id
    GROUP BY
      competitors.event_id
  ) AS participant_countries
    ON events.id = participant_countries.event_id
  GROUP BY
    events.id, participant_countries.country_ids

  UNION ALL

  SELECT
    'Tournament',
    tournaments.id,
    tournaments.name,
    3 AS rules,
    tournaments.starts_at,
    1,
    0,
    tournaments.responsible_id,
    tournaments.place_id,
    NULL,
    NULL,
    TRUE,
    JSON_BUILD_OBJECT('Open', COUNT(competitors.id)),
    COALESCE(
      ARRAY_AGG(DISTINCT profiles.country_id) FILTER ( WHERE profiles.country_id IS NOT NULL ),
      ARRAY []::integer[]
    ),
    tournaments.updated_at,
    tournaments.created_at
  FROM tournaments
  LEFT JOIN tournament_competitors AS competitors
    ON tournaments.id = competitors.tournament_id
  LEFT JOIN profiles AS profiles
    ON competitors.profile_id = profiles.id
  GROUP BY tournaments.id
) events

ORDER BY
    events.starts_at DESC,
    events.created_at DESC;
