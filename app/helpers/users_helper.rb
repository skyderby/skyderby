module UsersHelper
  # def user_tracks
  #   tracks = Track.where(user: @user)
  #                 .includes(:time)
  #                 .includes(:distance)
  #                 .includes(:speed)
  #                 .includes(:wingsuit)
  #                 .order('id DESC')
  #                 
  #   tracks = tracks.public unless @user == current_user
  #   render template: 'api/user_profiles/_tracks.json.jbuilder',
  #          format: :json,
  #          locals: { tracks: tracks }
  # end
end
