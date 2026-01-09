module Tracks
  class ProViewsController < ApplicationController
    def create
      @track = Track.find(params[:track_id])

      return redirect_to_sign_in unless Current.user
      return refresh_page if can_access_pro_view?
      return show_limit_error if limit_reached?

      FreeProView.create!(user: Current.user, track: @track)
      refresh_page
    end

    private

    def can_access_pro_view?
      Current.subscription_active? || FreeProView.exists?(user: Current.user, track: @track)
    end

    def limit_reached?
      FreeProView.remaining_for(Current.user) <= 0
    end

    def redirect_to_sign_in
      redirect_to new_user_session_path, notice: t('tracks.pro_view.sign_in_required')
    end

    def refresh_page
      redirect_to track_path(@track)
    end

    def show_limit_error
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.append(
            'toasts',
            partial: 'toasts/toast',
            locals: { type: 'error', message: t('tracks.pro_view.limit_reached') }
          )
        end
      end
    end
  end
end
