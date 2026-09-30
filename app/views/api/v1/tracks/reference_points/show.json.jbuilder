json.key_format! camelize: :lower

competition_point = @track.competitive? ? @track.event_result&.reference_point : nil
point = competition_point || @track.reference_point

if point
  json.reference_point do
    json.latitude point.latitude.to_f
    json.longitude point.longitude.to_f
  end
else
  json.reference_point nil
end
json.competitive competition_point.present?
json.editable competition_point.nil? && editable?
