module Api
  module Users
    class ConfirmationsController < Devise::ConfirmationsController
      include UnderscoreParams

      clear_respond_to
      respond_to :json

      def show
        self.resource = resource_class.confirm_by_token(params[:confirmation_token])

        if resource.errors.empty?
          head :ok
        else
          respond_with(resource, status: :unprocessable_entity)
        end
      end
    end
  end
end
