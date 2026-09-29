json.key_format! camelize: :lower

json.partial! 'api/v1/tracks/track_detail', track: @track
json.first_look @first_look unless @first_look.nil?
