json.key_format! camelize: :lower

json.status @status
json.partial! 'api/v1/flight_profiles/playbacks/quota', quota: @quota
