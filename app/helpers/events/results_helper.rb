module Events
  module ResultsHelper
    def new_event_track_link(event, competitor, round)
      button_to svg_icon('upload-solid'), new_event_result_path(event),
                params: { 'result[competitor_id]' => competitor.id, 'result[round_id]' => round.id }.merge(display_event_params),
                method: :get, form: { data: { turbo_stream: true }, class: 'result-upload-cell' }
    end

    def show_event_track_link(event, event_track, can_update)
      link_to(event_result_path(event, event_track, format: mobile? ? :html : :turbo_stream),
              class: 'show-result',
              rel: 'nofollow') do
        class_list = can_update ? 'fas fa-pencil-alt' : 'fa fa-search'
        tag.i(nil, class: class_list)
      end
    end

    def delete_event_track_link(event_track)
      button_to(t('event_tracks.show.delete'),
                event_result_path(event_track.event, event_track),
                params: display_event_params,
                data: {
                  confirm: t('event_tracks.show.delete_confirmation'),
                  turbo: true
                },
                method: :delete,
                class: 'btn-flat btn-flat--danger')
    end

    def event_result_presentation(event_track)
      "#{I18n.t('activerecord.models.event/result')}: " \
        "#{event_track.competitor.name} | " \
        "#{I18n.t("disciplines.#{event_track.round_discipline}")} - " \
        "#{event_track.round_number}"
    end
  end
end
