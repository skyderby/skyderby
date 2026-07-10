module Tracks
  class ProViewsController < ApplicationController
    def create
      @track = Track.find(params[:track_id])

      return redirect_to_sign_in unless Current.user.registered?

      if FreeProView.grant(user: Current.user, track: @track) == :limit_reached
        show_limit_error
      else
        refresh_page
      end
    end

    private

    def redirect_to_sign_in
      redirect_to new_user_session_path,
                  notice: t('tracks.pro_view.sign_in_required',
                            product: t("tracks.pro_view.product.#{@track.kind}"))
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
