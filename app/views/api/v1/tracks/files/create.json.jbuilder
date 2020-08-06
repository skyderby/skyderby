json.key_format! camelize: :lower

json.extract! @track_file, :id, :file_format
json.segments_count @track_file.segments.size

if @track_file.segments.size > 1
  json.segments @track_file.segments do |segment|
    json.extract! segment, :name, :points_count, :h_up, :h_down
  end
end
