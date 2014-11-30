module TracksHelper

  def title(track)
    "#{t 'tracks.show.title_track' } ##{track.id} | #{track.name}"
  end

  def header(track)
    "#{track.name} | #{t 'tracks.show.title_track'} ##{track.id}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.wingsuit.present? ? track.wingsuit.name : track.suit}, @#{track.location}"
  end

end