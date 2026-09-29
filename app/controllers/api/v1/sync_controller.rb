module Api
  module V1
    class SyncController < Api::ApplicationController
      rescue_from Sync::Cursor::Invalid do
        render_errors ['Invalid cursor'], status: :bad_request
      end

      def show
        return render_errors(['Not found'], status: :not_found) unless Sync::RESOURCES.include?(params[:resource])

        @feed = Sync::Feed.new(resource: params[:resource], since: params[:since], limit: params[:limit])
        return render(json: { resetRequired: true }, status: :gone) if @feed.reset_required?

        expires_in 1.minute
      end
    end
  end
end
