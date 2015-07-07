module TracksHelper
  def title(track)
    "#{t 'tracks.show.title_track' } ##{track.id} | #{track_pilot(track)}"
  end

  def header(track)
    " | #{t 'tracks.show.title_track'} ##{track.id}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.wingsuit.present? ? track.wingsuit.name : track.suit}, @#{track.location}"
  end

  def track_pilot(track)
    track.pilot ? track.pilot.name : track.name
  end

  def track_place(track)
    track.place ? place_presentation(track.place) : track.location
  end

  def tracks_index
    render template: 'tracks/_index.json.jbuilder',
           formats: :json
  end

  def range_title(result)
    '' + result.range_from.to_s + ' - ' + result.range_to.to_s if result
  end
end
