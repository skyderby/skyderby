module Tournaments
  module Qualifications
    module ResultsHelper
      def delete_qualification_track_link(tournament, result)
        link_to(t('event_tracks.show.delete'),
                tournament_qualification_result_path(tournament, result),
                data: {
                  turbo_method: :delete,
                  turbo_confirm: t('event_tracks.show.delete_confirmation'),
                  turbo_stream: true
                },
                class: 'button button--ghost button--danger')
      end
    end
  end
end
