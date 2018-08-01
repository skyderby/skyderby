module EventResultsHelper
  def new_event_track_link(event, competitor, round)
    data_params = {
      'event_result[competitor_id]' => competitor.id,
      'event_result[round_id]' => round.id,
    }.merge(display_event_params).to_param

    link_to content_tag('i', nil, class: 'fa fa-upload'),
            new_event_result_path(event),
            remote: true,
            'data-params': data_params.to_param,
            class: 'create-result-cell__link',
            rel: 'nofollow'
  end

  def show_event_track_link(event, event_track, can_update)
    link_to(event_result_path(event, event_track),
            remote: true,
            class: 'show-result',
            rel: 'nofollow') do

      class_list = can_update ? 'fa fa-pencil' : 'fa fa-search'
      content_tag('i', nil, class: class_list)
    end
  end

  def delete_event_track_link(event_track)
    link_to(t('event_tracks.show.delete'),
            event_result_path(event_track.event, event_track),
            'data-params': display_event_params.to_param,
            'data-confirm': t('event_tracks.show.delete_confirmation'),
            remote: true,
            method: :delete,
            class: 'btn-flat btn-flat--danger')
  end

  def event_track_presentation(event_track)
    "#{I18n.t('activerecord.models.event/result')}: " \
      "#{event_track.competitor.name} | " \
      "#{I18n.t('disciplines.' + event_track.round_discipline)} - " \
      "#{event_track.round_number}"
  end
end
