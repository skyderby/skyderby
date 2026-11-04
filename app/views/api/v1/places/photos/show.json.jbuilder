json.key_format! camelize: :lower

json.id @photo.id
json.thumb_url stored_file_url(@photo.image_url(:thumb))
json.large_url stored_file_url(@photo.image_url(:large))
