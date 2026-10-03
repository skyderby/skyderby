module Api
  module EventOrganizers
    extend ActiveSupport::Concern

    def create
      @organizer = managed_event.organizers.new(user_id: params.require(:organizer)[:user_id])

      if @organizer.save
        render 'api/v1/organizers/show', status: :created
      else
        render_record_errors @organizer
      end
    end

    def destroy
      organizer = managed_event.organizers.find(params[:id])

      if organizer.destroy
        head :no_content
      else
        render_record_errors organizer
      end
    end
  end
end
