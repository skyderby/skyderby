SELECT 
    *
FROM 
    (SELECT 
        'Event' as event_type,
        events.id as event_id,
        events.starts_at,
        events.status,
        events.visibility,
        events.responsible_id,
        events.created_at
    FROM
        events
        
    UNION ALL

    SELECT
        'Tournament',
        tournaments.id,
        tournaments.starts_at,
        1,
        0,
        tournaments.responsible_id,
        tournaments.created_at
    FROM
        tournaments) events
        
ORDER BY 
    events.starts_at DESC,
    events.created_at DESC
