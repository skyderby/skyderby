module EventTracksHelper
  def new_event_track_link(event, competitor, round, display_raw_results)
    link_to content_tag('i', nil, class: 'fa fa-upload'),
            new_event_event_track_path(event),
            remote: true,
            'data-params': { 'event_track[competitor_id]' => competitor.id,
                             'event_track[round_id]' => round.id,
                             display_raw_results: display_raw_results }.to_param,
            class: 'create-result-cell__link',
            rel: 'nofollow'
  end

  def edit_event_track_link(event, event_track, display_raw_results)
    link_to content_tag(:i, nil, class: 'fa fa-pencil'),
            edit_event_event_track_path(event, event_track),
            remote: true,
            'data-params': { display_raw_results: display_raw_results }.to_param,
            class: 'edit-result',
            rel: 'nofollow'
  end

  def event_track_presentation(event_track)
    "#{I18n.t('activerecord.models.event_track')}: " \
      "#{event_track.competitor.name} | " \
      "#{I18n.t('disciplines.' + event_track.round_discipline)} - " \
      "#{event_track.round_number}"
  end
end
