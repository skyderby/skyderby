module EventTracksHelper
  def new_event_track_link(event, competitor, round)
    data_params = {
      'event_track[competitor_id]' => competitor.id,
      'event_track[round_id]' => round.id,
    }.merge(display_event_params).to_param

    link_to content_tag('i', nil, class: 'fa fa-upload'),
            new_event_event_track_path(event),
            remote: true,
            'data-params': data_params.to_param,
            class: 'create-result-cell__link',
            rel: 'nofollow'
  end

  def edit_event_track_link(event, event_track)
    link_to content_tag(:i, nil, class: 'fa fa-pencil'),
            edit_event_event_track_path(event, event_track),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'edit-result',
            rel: 'nofollow'
  end

  def delete_event_track_link(event_track)
    link_to(t('event_tracks.show.delete'),
            [event_track.event, event_track],
            'data-params': display_event_params.to_param,
            'data-confirm': t('event_tracks.show.delete_confirmation'),
            remote: true,
            method: :delete,
            class: 'btn-flat btn-flat--danger')
  end

  def event_track_presentation(event_track)
    "#{I18n.t('activerecord.models.event_track')}: " \
      "#{event_track.competitor.name} | " \
      "#{I18n.t('disciplines.' + event_track.round_discipline)} - " \
      "#{event_track.round_number}"
  end
end
