module Api
  module V1
    class OrganizersController < Api::ApplicationController
      def index
        authorize organizable, :show?

        @organizers = organizable.organizers.includes(user: :profile)
      end

      def create
        authorize organizable, :update?

        @organizer = organizable.organizers.new organizer_params

        if @organizer.save
          render
        else
          respond_with_errors(@organizer.errors)
        end
      end

      def destroy
        authorize organizable, :update?

        @organizer = organizable.organizers.find(params[:id])

        if @organizer.destroy
          render
        else
          respond_with_errors(@organizer.errors)
        end
      end

      private

      def organizer_params
        params.require(:organizer).permit(:user_id)
      end

      def organizable
        @organizable ||= organizable_class.find(params["#{organizable_class.name.underscore}_id"])
      end

      def organizable_class
        @organizable_class ||= [Event, Tournament, SpeedSkydivingCompetition].detect do |c|
          params["#{c.name.underscore}_id"]
        end
      end
    end
  end
end
