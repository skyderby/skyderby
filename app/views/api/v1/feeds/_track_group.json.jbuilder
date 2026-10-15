json.type 'tracks'
json.id "tracks-#{group.profile.id}-#{group.date.iso8601}"
json.date group.date.iso8601
json.occurred_at group.sort_time.utc.iso8601
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: group.profile }
json.tracks group.preview, partial: 'api/v1/tracks/track', as: :track
json.more_count group.more_count
json.uploaded_label t('feed.tracks.uploaded', count: group.tracks.size)
json.more_label(group.more_count.positive? ? t('feed.tracks.more', count: group.more_count) : nil)
