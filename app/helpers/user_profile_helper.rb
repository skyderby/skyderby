module UserProfileHelper
  def user_tracks
    # tracks = Track.where(pilot: @profile.id)
    #               .includes(:time)
    #               .includes(:distance)
    #               .includes(:speed)
    #               .includes(:wingsuit)
    #               .includes(wingsuit: :manufacturer)
    #               .order('created_at DESC')
    #               
    # tracks = tracks.public_track unless current_user && @profile == current_user.user_profile
    # render template: 'api/user_profiles/_tracks.json.jbuilder',
    #        format: :json,
    #        locals: { tracks: tracks }
  end

  def is_owner
    current_user && current_user.user_profile == @profile
  end

  def profile_name
    unless @profile.name.blank?
      @profile.name
    else
      'Name not set'
    end
  end

  def max_distance
    track = profile_tracks.max_by do |x| 
      if x.distance
        x.distance.result 
      else
        0
      end
    end

    if track
      track.distance.result.round
    else
      '----'
    end
  end

  def max_speed
    track = profile_tracks.max_by do |x| 
      if x.speed
        x.speed.result 
      else
        0
      end
    end

    if track
      track.speed.result.round
    else
      '---'
    end
  end

  def max_time
    track = profile_tracks.max_by do |x| 
      if x.time
        x.time.result 
      else
        0
      end
    end

    if track
      track.time.result.round(1)
    else
      '--.-'
    end
  end

  def profile_tracks
    if is_owner
      profile_tracks = @profile.tracks
    else
      profile_tracks = @profile.public_tracks
    end
  end
end
