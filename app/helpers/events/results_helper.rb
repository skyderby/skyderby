module Events
  module ResultsHelper
    def new_event_track_link(event, competitor, round)
      button_to icon_tag('upload-solid'), new_performance_competition_result_path(event),
                params: {
                  'result[competitor_id]' => competitor.id,
                  'result[round_id]' => round.id
                },
                method: :get, form: { data: { turbo_stream: true }, class: 'result-upload-cell' }
    end

    def show_event_track_link(event, event_track, can_update)
      link_to(performance_competition_result_path(event, event_track, format: mobile? ? :html : :turbo_stream),
              class: 'show-result',
              rel: 'nofollow') do
        icon_tag(can_update ? 'pencil-solid' : 'magnifying-glass-solid')
      end
    end

    def delete_event_track_link(event_track)
      button_to(t('event_tracks.show.delete'),
                performance_competition_result_path(event_track.event, event_track),
                data: {
                  confirm: t('event_tracks.show.delete_confirmation'),
                  turbo: true
                },
                method: :delete,
                class: 'button button--ghost button--danger')
    end

    def event_result_presentation(event_track)
      [
        event_track.competitor.assigned_number.presence && "(##{event_track.competitor.assigned_number})",
        "#{event_track.competitor.name} |",
        "#{I18n.t("disciplines.#{event_track.round_discipline}")} - #{event_track.round_number}"
      ].compact.join(' ')
    end
  end
end
