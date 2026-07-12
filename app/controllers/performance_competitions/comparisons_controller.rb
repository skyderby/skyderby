module PerformanceCompetitions
  class ComparisonsController < ApplicationController
    def create
      return redirect_to_sign_in unless Current.user.registered?
      return head :unprocessable_content unless comparable?

      if FreeProView.grant(user: Current.user, track: track_a) == :limit_reached
        redirect_to subscriptions_path
      else
        track_comparison_started
        redirect_to track_path(track_a, compare_id: track_b.id)
      end
    end

    private

    def competition
      @competition ||= PerformanceCompetition.find(params[:performance_competition_id])
    end

    def track_a
      @track_a ||= comparable_track(params[:track_a_id])
    end

    def track_b
      @track_b ||= comparable_track(params[:track_b_id])
    end

    def comparable_track(id)
      track = competition.tracks.find_by(id:)
      return unless track
      return track if competition.editable? || track.viewable?

      nil
    end

    def comparable?
      track_a && track_b &&
        track_a.kind == track_b.kind &&
        %w[base skydive].include?(track_a.kind)
    end

    def discipline
      competition.results.find_by(track_id: track_a.id)&.round_discipline
    end

    def redirect_to_sign_in
      redirect_to new_user_session_path,
                  notice: t('tracks.pro_view.sign_in_required',
                            product: t('tracks.pro_view.product.skydive'))
    end

    def track_comparison_started
      Amplitude.track_later(
        user_id: Current.user.id,
        event: 'competition_compare_started',
        properties: {
          source: 'performance_competitions',
          competition_id: competition.id,
          kind: track_a.kind,
          discipline: discipline,
          compare_track_id: track_b.id,
          subscription_plan: Current.user.subscription_plan,
          views_remaining: FreeProView.remaining_for(Current.user)
        }
      )
    end
  end
end
