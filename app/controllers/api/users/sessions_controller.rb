module Api
  module Users
    class SessionsController < Devise::SessionsController
      clear_respond_to
      respond_to :json

      private

      def respond_to_on_destroy
        respond_to do |format|
          format.json
        end
      end
    end
  end
end
