json.partial! 'api/v1/tracks/track', track:, detailed: true

json.extract! track, :gps_type, :missing_ranges, :require_range_review, :ff_start, :ff_end
json.data_frequency track.data_frequency&.to_f
json.exited_at track.exited_at&.iso8601
json.deployed_at track.deployed_at&.iso8601
json.landed_at track.landed_at&.iso8601
json.landing_fl_time track.landing_fl_time&.to_f
json.disqualified_from_online_competitions track.disqualified_from_online_competitions
json.ground_level track.ground_level&.to_f
json.msl_offset track.msl_offset.to_f
json.abs_altitude track.abs_altitude?
json.editable track.editable?
json.pro_view_available track.pro_view_available?
json.points_version track.updated_at.to_i.to_s

if track.video
  json.video do
    json.url track.video.url
    json.youtube_id track.video.video_code
    json.track_offset track.video.track_offset&.to_f
    json.video_offset track.video.video_offset&.to_f
  end
else
  json.video nil
end

json.online_competition_results(
  track.all_virtual_competition_results.includes(:virtual_competition)
) do |result|
  json.competition_id result.virtual_competition_id
  json.competition_name result.virtual_competition.name
  json.discipline result.virtual_competition.discipline
  json.discipline_parameter result.virtual_competition.discipline_parameter
  json.finish_line_id result.virtual_competition.finish_line_id
  json.result result.result
  json.wind_cancelled result.wind_cancelled
end

event = track.event_result&.round&.event
if event
  json.event_result do
    json.event_id event.id
    json.event_name event.name
    json.event_kind event.model_name.element
  end
else
  json.event_result nil
end
