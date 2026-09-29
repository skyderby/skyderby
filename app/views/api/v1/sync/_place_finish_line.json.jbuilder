json.extract! place_finish_line, :id, :place_id, :name
json.start do
  json.latitude place_finish_line.start_latitude&.to_f
  json.longitude place_finish_line.start_longitude&.to_f
end
json.set! :end do
  json.latitude place_finish_line.end_latitude&.to_f
  json.longitude place_finish_line.end_longitude&.to_f
end
json.updated_at place_finish_line.updated_at
