SELECT 
  row_number() OVER (
    PARTITION BY entities.virtual_competition_id, entities.year ORDER BY entities.result DESC
  ) AS rank,
  entities.virtual_competition_id,
  entities.year,
  entities.track_id,
  entities.result,
  entities.highest_speed,
  entities.highest_gr,
  entities.profile_id,
  entities.wingsuit_id,
  entities.recorded_at
  FROM ( 
    SELECT DISTINCT ON (results.virtual_competition_id, 
                        tracks.profile_id,
                        date_part('year', tracks.recorded_at)) 

      results.virtual_competition_id,
      results.track_id,
      results.result,
      results.highest_speed,
      results.highest_gr,
      tracks.profile_id,
      tracks.wingsuit_id,
      tracks.recorded_at,
      date_part('year', tracks.recorded_at) AS year
    FROM 
      virtual_comp_results results
      LEFT JOIN tracks tracks 
      ON tracks.id = results.track_id
    ORDER BY 
      results.virtual_competition_id, 
      tracks.profile_id, 
      date_part('year', tracks.recorded_at),
      results.result DESC
  ) entities
ORDER BY entities.result DESC;
