with_additional_info = local_assigns.fetch :with_additional_info, false

json.partial! partial: 'places/place',
              collection: @places,
              as: :place,
              locals: { with_additional_info: with_additional_info }
