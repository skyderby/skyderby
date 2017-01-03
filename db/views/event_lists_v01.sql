SELECT 
    *
FROM 
    (SELECT 
        'Event' as event_type,
        events.id as event_id,
        events.starts_at,
        events.status,
        events.visibility,
        events.profile_id
    FROM
        events
        
    UNION ALL

    SELECT
        'Tournament',
        tournaments.id,
        tournaments.starts_at,
        1,
        0,
        NULL
    FROM
        tournaments) events
        
ORDER BY 
    events.starts_at DESC
