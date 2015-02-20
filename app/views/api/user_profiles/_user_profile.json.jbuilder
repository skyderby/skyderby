json.extract! profile, :id, :name, :crop_x, :crop_y, :crop_w, :crop_h
json.userpic_thumb profile.userpic.url(:thumb)
json.userpic_medium profile.userpic.url(:medium)
json.userpic_large profile.userpic.url(:large)
