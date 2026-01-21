module Tournaments
  module Qualifications
    module ResultsHelper
      def new_qualification_track_link(tournament, competitor, round)
        link_to new_tournament_qualification_result_path(tournament),
                remote: true,
                'data-params': { 'result[competitor_id]' => competitor.id,
                                 'result[qualification_round_id]' => round.id }.to_param,
                class: 'create-result-cell__link',
                rel: 'nofollow' do
          icon_tag('upload-solid')
        end
      end

      def show_qualification_track_link(tournament, result, editable)
        link_options = mobile? ? { target: '_blank' } : { data: { turbo_stream: true } }
        link_to tournament_qualification_result_path(tournament, result),
                **link_options, class: 'show-result', rel: 'nofollow' do
          icon_tag(editable ? 'pencil-solid' : 'magnifying-glass-solid')
        end
      end

      def delete_qualification_track_link(tournament, result)
        link_to(t('event_tracks.show.delete'),
                tournament_qualification_result_path(tournament, result),
                'data-confirm': t('event_tracks.show.delete_confirmation'),
                remote: true,
                method: :delete,
                class: 'button button--ghost button--danger')
      end
    end
  end
end
