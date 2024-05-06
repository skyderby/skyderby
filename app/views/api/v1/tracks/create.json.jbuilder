json.key_format! camelize: :lower

json.partial! partial: 'api/v1/tracks/track', track: @track

json.partial! partial: 'api/v1/tracks/relations', tracks: [@track]
