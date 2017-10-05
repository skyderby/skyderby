SELECT row_number() OVER(PARTITION BY virtual_competition_id ORDER BY result DESC) as rank, * 
FROM   (SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id)
            results.virtual_competition_id,
            results.track_id,
            results.result,
            results.highest_speed,
            results.highest_gr,
            tracks.profile_id,
            tracks.suit_id,
            tracks.recorded_at
        from
            virtual_comp_results as results
            LEFT JOIN tracks as tracks
            on tracks.id = results.track_id
        ORDER BY
            results.virtual_competition_id,
            tracks.profile_id,
            results.result DESC
        ) AS entities
ORDER BY entities.result DESC;
