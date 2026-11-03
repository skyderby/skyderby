json.key_format! camelize: :lower

json.kinds @logbooks do |logbook|
  entry = logbook.new_entry
  json.kind logbook.kind
  json.total_jumps logbook.total_jumps
  json.freefall_seconds logbook.freefall_seconds
  json.canopy_seconds logbook.canopy_seconds
  json.defaults do
    json.extract! entry, :number, :place_id, :place_name, :suit_id, :equipment, :aircraft, :jump_type
    json.place_label entry.place_label
    json.suit_name entry.suit_name
  end
  json.suggestions do
    %i[equipment jump_type aircraft shared_with].each { json.set! it, entry.suggestions_for(it) }
  end
end
