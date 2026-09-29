json.key_format! camelize: :lower

json.items @tracks, partial: 'api/v1/tracks/track', as: :track
json.page @tracks.current_page
json.per_page @tracks.limit_value
json.total_pages @tracks.total_pages
json.total_count @tracks.total_count
