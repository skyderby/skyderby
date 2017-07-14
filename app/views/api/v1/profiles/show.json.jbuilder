json.extract! @profile, :id, :name
json.photo @profile.userpic.url
json.photo_medium @profile.userpic.url(:medium)
json.photo_thumb @profile.userpic.url(:thumb)
