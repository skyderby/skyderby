module Api
  module V1
    class FeedsController < Api::ApplicationController
      before_action :require_registered_user!

      def show
        @feed = ::Profiles::Feed.new(current_user, until_date:)
      end

      private

      def until_date
        Date.iso8601(params[:until].to_s)
      rescue Date::Error
        Time.zone.today
      end
    end
  end
end
