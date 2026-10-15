json.key_format! camelize: :lower

json.following @feed.following?
json.until_date @feed.until_date.iso8601
json.older_until_date @feed.older_until_date&.iso8601
json.items @feed.items do |item|
  case item
  when Profiles::Feed::TrackGroup then json.partial! 'api/v1/feeds/track_group', group: item
  when Profiles::Feed::RankingCard then json.partial! 'api/v1/feeds/ranking', card: item
  else json.partial! 'api/v1/feeds/competition', card: item
  end
end
