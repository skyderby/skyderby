module EventsHelper
  def event_track_points(event, event_track, net: false)
    result_value = event_track.result(net: net)

    return 0 if result_value.nil? || result_value.zero? || event_track.is_disqualified

    best_result = event.best_result_in(round: event_track.round, section: event_track.section, net: net)
    result_value / best_result.result(net: net) * 100
  end
end
