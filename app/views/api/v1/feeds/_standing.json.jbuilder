json.rank standing.rank
json.total standing.total&.to_f
json.total_formatted feed_result_value(standing)
json.unit t("feed.units.#{standing.unit}")
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: standing.profile }
