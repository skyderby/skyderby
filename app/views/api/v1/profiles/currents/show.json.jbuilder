json.extract! @profile, :id, :name
json.photo do |json|
  json.original stored_file_url(@profile.userpic_url)
  json.medium stored_file_url(@profile.userpic_url(:medium))
  json.thumb stored_file_url(@profile.userpic_url(:thumb))
end
