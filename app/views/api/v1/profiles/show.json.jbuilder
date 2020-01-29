json.extract! @profile, :id, :name
json.photo do |json|
  json.original @profile.userpic.url
  json.medium @profile.userpic.url(:medium)
  json.thumb @profile.userpic.url(:thumb)
end
