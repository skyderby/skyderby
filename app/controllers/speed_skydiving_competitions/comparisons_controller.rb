module SpeedSkydivingCompetitions
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

    def event
      @event ||= SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
    end

    def track_a
      @track_a ||= comparable_track(params[:track_a_id])
    end

    def track_b
      @track_b ||= comparable_track(params[:track_b_id])
    end

    def comparable_track(id)
      track = event.tracks.find_by(id:)
      return unless track
      return track if event.editable? || track.viewable?

      nil
    end

    def comparable?
      track_a && track_b && track_a.speed_skydiving? && track_b.speed_skydiving?
    end

    def redirect_to_sign_in
      redirect_to new_user_session_path,
                  notice: t('tracks.pro_view.sign_in_required',
                            product: t('tracks.pro_view.product.speed_skydiving'))
    end

    def track_comparison_started
      Amplitude.track_later(
        user_id: Current.user.id,
        event: 'competition_compare_started',
        properties: {
          source: 'speed_skydiving_competitions',
          competition_id: event.id,
          kind: 'speed_skydiving',
          compare_track_id: track_b.id,
          subscription_plan: Current.user.subscription_plan,
          views_remaining: FreeProView.remaining_for(Current.user)
        }
      )
    end
  end
end
