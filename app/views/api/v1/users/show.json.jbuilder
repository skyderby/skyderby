json.extract! @user,
              :id,
              :email,
              :sign_in_count,
              :current_sign_in_ip,
              :last_sign_in_ip

json.current_sign_in_at @user.current_sign_in_at.iso8601
json.last_sign_in_at @user.last_sign_in_at.iso8601

json.name @user.profile.name
json.country @user.profile.country&.name
json.track_count @user.profile.tracks.count
