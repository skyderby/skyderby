module VirtualCompetitions
  class ComparisonsController < ApplicationController
    def create
      return redirect_to_sign_in unless Current.user.registered?
      return head :unprocessable_content unless comparable?

      if FreeProView.grant(user: Current.user, track: track_a) == :limit_reached
        redirect_to subscriptions_path
      else
        track_comparison_started
        redirect_to track_path(track_a, compare_id: track_b.id, result_competition_id: result_competition.id)
      end
    end

    private

    def competition
      @competition ||= VirtualCompetition.find(params[:virtual_competition_id])
    end

    def track_a
      @track_a ||= Track.viewable.find(params[:track_a_id])
    end

    def track_b
      @track_b ||= Track.viewable.find(params[:track_b_id])
    end

    def result_competition
      @result_competition ||=
        VirtualCompetition.find_by(id: params[:result_competition_id]) || competition
    end

    def comparable?
      track_a.kind == track_b.kind && %w[base skydive].include?(track_a.kind)
    end

    def redirect_to_sign_in
      redirect_to new_user_session_path,
                  notice: t('tracks.pro_view.sign_in_required',
                            product: t("tracks.pro_view.product.#{track_a.kind}"))
    end

    def track_comparison_started
      Amplitude.track_later(
        user_id: Current.user.id,
        event: 'competition_compare_started',
        properties: {
          source: 'virtual_competitions',
          competition_id: competition.id,
          kind: track_a.kind,
          discipline: result_competition.discipline,
          compare_track_id: track_b.id,
          subscription_plan: Current.user.subscription_plan,
          views_remaining: FreeProView.remaining_for(Current.user)
        }
      )
    end
  end
end
