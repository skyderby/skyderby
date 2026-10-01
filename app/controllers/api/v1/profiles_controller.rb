module Api
  module V1
    class ProfilesController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }, only: :update
      before_action :require_registered_user!, only: :update

      def index
        @profiles =
          (params[:query].present? ? Profile.search(params[:query]).order(:name) : featured)
          .select('profiles.*', *track_counts)
          .left_joins(:tracks)
          .group('profiles.id')
          .includes(:country, userpic_attachment: :blob)
          .limit(params[:query].present? ? 40 : 20)
      end

      def show
        @profile =
          Profile
          .includes(:country, personal_top_scores: { virtual_competition: :group })
          .find(params[:id])
        @track_counts = @profile.tracks.group(:kind).count
      end

      def update
        @profile = Profile.find(params[:id])
        return respond_not_authorized unless @profile.editable?(current_user)

        if @profile.update(profile_params)
          @track_counts = @profile.tracks.group(:kind).count
          render :show
        else
          render_errors @profile.errors.full_messages, status: :unprocessable_content
        end
      end

      private

      def profile_params
        params.require(:profile).permit(:name, :country_id, :gender, :userpic)
      end

      def featured
        Profile.where(id: Track.joins(:video, :pilot).select(:profile_id)).order('random()')
      end

      def track_counts
        Track.kinds.slice('skydive', 'base', 'speed_skydiving').map do |kind, value|
          "COUNT(tracks.id) FILTER (WHERE tracks.kind = #{value}) AS #{kind}_count"
        end
      end
    end
  end
end
