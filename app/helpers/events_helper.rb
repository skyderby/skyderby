module EventsHelper
  def event_track_points(event, event_track, net: false)
    result_value = event_track.final_result(net: net)

    return 0 if result_value.nil? || result_value.zero?

    best_result = event.best_result_in(round: event_track.round, section: event_track.section, net: net)
    result_value / best_result.final_result(net: net) * 100
  end

  def best_in_round?(event, event_track, net: false)
    best_result = event.best_result_in(round: event_track.round, section: event_track.section, net: net)
    event_track == best_result
  end

  def best_in_section?(event, event_track, net: false)
    best_result = event.best_result_in(section: event_track.section, net: net)
    event_track == best_result
  end

  def worst_in_section?(event, event_track, net: false)
    worst_result = event.worst_result_in(section: event_track.section, net: net)
    event_track == worst_result
  end
end
