module Api
  module V1
    module Boogies
      class DeletionsController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement

        before_action :authorize_event_deletion!

        def create
          if @event.name == deletion_params[:event_name]
            @event.permanently_delete(including_tracks: delete_tracks?)
            head :no_content
          else
            render_errors [t('events.event_name_mismatch')], status: :unprocessable_content
          end
        rescue ActiveRecord::RecordNotDestroyed
          render_errors [t('events.event_deletion_failed')], status: :unprocessable_content
        end

        private

        def authorize_event_deletion!
          respond_not_authorized unless @event.deletable?
        end

        def deletion_params
          params.require(:event_deletion).permit(:event_name, :delete_tracks)
        end

        def delete_tracks? = ActiveModel::Type::Boolean.new.cast(deletion_params[:delete_tracks]) || false
      end
    end
  end
end
