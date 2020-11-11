module Api
  module Users
    class SessionsController < Devise::SessionsController
      include UnderscoreParams
      
      after_action :set_new_csrf_token, only: %i[create destroy]

      clear_respond_to
      respond_to :json

      private

      def respond_to_on_destroy
        respond_to do |format|
          format.json { head :ok }
        end
      end

      def set_new_csrf_token
        response.set_header('New-CSRF-Token', form_authenticity_token)
      end
    end
  end
end
