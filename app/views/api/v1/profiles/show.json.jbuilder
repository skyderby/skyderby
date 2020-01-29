json.extract! @profile, :id, :name
json.photo do |json|
  json.original @profile.userpic_url
  json.medium @profile.userpic_url(:medium)
  json.thumb @profile.userpic_url(:thumb)
end
