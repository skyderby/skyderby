json.array! tracks do |json, track| # rubocop:disable Metrics/BlockLength
  json.url track_path(id: track.id)
  json.id track.id
  if track.suit
    json.suit do |json|
      json.extract! track.suit, :id, :name
      json.manufacturer do |json|
        json.extract! track.suit.manufacturer, :id, :name
      end
    end
    json.suit track.suit.name
  else
    json.suit track.missing_suit_name
  end
  json.location track.location
  json.time track.time.result if track.time
  json.distance track.distance.result if track.distance
  json.speed track.speed.result if track.speed
  json.comment track.comment
  json.uploaded_at track.created_at
  json.uploaded_at_formatted l(track.created_at,
                               format: '%-d %b %Y',
                               locale: params[:locale])
  json.month track.created_at.beginning_of_month
  json.str_month l(track.created_at,
                   format: '%B %Y',
                   locale: params[:locale])
end
