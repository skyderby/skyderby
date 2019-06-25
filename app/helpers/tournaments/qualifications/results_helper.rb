module Tournaments
  module Qualifications
    module ResultsHelper
      def new_qualification_track_link(tournament, competitor, round)
        link_to new_tournament_qualification_result_path(tournament),
                remote: true,
                'data-params': { 'qualification_jump[competitor_id]' => competitor.id,
                                 'qualification_jump[qualification_round_id]' => round.id}.to_param,
                class: 'create-result-cell__link',
                rel: 'nofollow' do
          content_tag 'i', nil, class: 'fa fa-upload'
        end
      end

      def show_qualification_track_link(tournament, result, editable)
        link_to tournament_qualification_result_path(tournament, result),
                remote: !mobile?, class: 'show-result', rel: 'nofollow' do
          content_tag('i', nil, class: editable ? 'fas fa-pencil-alt' : 'fa fa-search')
        end
      end

      def delete_qualification_track_link(tournament, result)
        link_to(t('event_tracks.show.delete'),
                tournament_qualification_result_path(tournament, result),
                'data-confirm': t('event_tracks.show.delete_confirmation'),
                remote: true,
                method: :delete,
                class: 'btn-flat btn-flat--danger')
      end
    end
  end
end
