module ProfilesHelper
  def is_owner
    current_user && current_user.profile == @profile
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
      if x.distance && x.distance.result && !x.distance.result.nan?
        x.distance.result
      else
        0
      end
    end

    if track && track.distance
      track.distance.result.round
    else
      '----'
    end
  end

  def max_speed
    track = profile_tracks.max_by do |x|
      if x.speed && x.speed.result && !x.speed.result.nan?
        x.speed.result
      else
        0
      end
    end

    if track && track.speed
      track.speed.result.round
    else
      '---'
    end
  end

  def max_time
    track = profile_tracks.max_by do |x|
      if x.time && x.time.result && !x.time.result.nan?
        x.time.result
      else
        0
      end
    end

    if track && track.time
      track.time.result.round(1)
    else
      '--.-'
    end
  end

  def profile_tracks
    if is_owner
      profile_tracks = @profile.tracks
    else
      profile_tracks = @profile.tracks.accessible_by(current_user)
    end
  end
end
