module Tournaments
  module Qualifications
    class ComparisonsController < ApplicationController
      def create
        return redirect_to_sign_in unless Current.user.registered?
        return head :unprocessable_content unless track_a && track_b
        return render_incompatible_toast unless comparable?

        if FreeProView.grant(user: Current.user, track: track_a) == :limit_reached
          redirect_to subscriptions_path
        else
          track_comparison_started
          redirect_to track_path(track_a, compare_id: track_b.id)
        end
      end

      private

      def tournament
        @tournament ||= Tournament.find(params[:tournament_id])
      end

      def track_a
        @track_a ||= comparable_track(params[:track_a_id])
      end

      def track_b
        @track_b ||= comparable_track(params[:track_b_id])
      end

      def comparable_track(id)
        track = tournament_tracks.find_by(id:)
        return unless track
        return track if tournament.editable? || track.viewable?

        nil
      end

      def tournament_tracks
        @tournament_tracks ||= Track.where(id: tournament.qualification_jumps.select(:track_id))
      end

      def comparable?
        track_a.kind == track_b.kind && %w[base skydive].include?(track_a.kind)
      end

      def render_incompatible_toast
        render turbo_stream: turbo_stream.append(
          'toasts',
          partial: 'toasts/toast',
          locals: {
            type: 'error',
            message: t(
              'tournaments.qualifications.compare.incompatible_kinds',
              kind_a: track_a.kind, name_a: pilot_name(track_a),
              kind_b: track_b.kind, name_b: pilot_name(track_b)
            )
          }
        )
      end

      def pilot_name(track)
        tournament.qualification_jumps.find_by(track_id: track.id)&.competitor_name
      end

      def redirect_to_sign_in
        redirect_to new_user_session_path,
                    notice: t('tracks.pro_view.sign_in_required',
                              product: t('tracks.pro_view.product.base'))
      end

      def track_comparison_started
        Amplitude.track_later(
          user_id: Current.user.id,
          event: 'competition_compare_started',
          properties: {
            source: 'tournaments',
            competition_id: tournament.id,
            kind: track_a.kind,
            compare_track_id: track_b.id,
            subscription_plan: Current.user.subscription_plan,
            views_remaining: FreeProView.remaining_for(Current.user)
          }
        )
      end
    end
  end
end
