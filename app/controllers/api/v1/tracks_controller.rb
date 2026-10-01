module Api
  module V1
    class TracksController < Api::ApplicationController
      DEFAULT_PER_PAGE = 25
      MAX_PER_PAGE = 100
      TRACK_JOBS = [ResultsJob, OnlineCompetitionJob, MissingWeatherFetchingJob, ExitProfileJob].freeze
      UUID_FORMAT = /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/

      before_action -> { doorkeeper_authorize! :write }, only: %i[create update destroy]
      before_action :set_track, only: %i[show update destroy]
      before_action :require_editable_track, only: %i[update destroy]

      def index
        @tracks =
          TrackFilter.new(index_params)
                     .apply(Track.accessible)
                     .sorted(*order_params)
                     .includes(
                       :video, :distance, :speed, :time,
                       place: :country, pilot: %i[country owner], suit: :manufacturer
                     )
                     .page(page)
                     .per(per_page)
      end

      def show; end

      def create
        return render_errors(['File is required'], status: :unprocessable_content) if params[:file].blank?
        return render_errors(['Invalid client_uuid'], status: :unprocessable_content) unless valid_client_uuid?

        @track = existing_client_track
        return render :show if @track

        @track_file = Track::File.new(files: [params[:file], params[:sensor_file]].compact_blank)
        return render_errors(@track_file.errors.full_messages, status: :unprocessable_content) unless @track_file.save

        create_track
        render :show, status: :created
      rescue ActiveRecord::RecordNotUnique
        @track_file&.destroy
        @track = existing_client_track
        render :show
      rescue CreateTrackService::MissingActivityData
        render_errors ['No activity data found in file'], status: :unprocessable_content
      end

      def update
        if @track.update(track_params)
          TRACK_JOBS.each { |job| job.perform_later(@track.id) }
          render :show
        else
          render_errors @track.errors.full_messages, status: :unprocessable_content
        end
      end

      def destroy
        if @track.destroy
          head :no_content
        else
          render_errors @track.errors.full_messages, status: :unprocessable_content
        end
      end

      private

      def set_track
        @track = Track.includes(
          :video, :distance, :speed, :time,
          place: :country, pilot: :country, suit: :manufacturer
        ).find(params[:id])

        render_errors(['Not found'], status: :not_found) unless @track.viewable?
      end

      def require_editable_track
        respond_not_authorized unless @track.editable?
      end

      def create_track
        @track = CreateTrackService.call(new_track_attributes, segment: params[:segment].to_i)
        @first_look = FreeProView.grant_first_look(user: current_user, track: @track).present?
      end

      def valid_client_uuid? = params[:client_uuid].blank? || params[:client_uuid].to_s.match?(UUID_FORMAT)

      def existing_client_track
        return if params[:client_uuid].blank?

        Track.find_by(owner: current_user, client_uuid: params[:client_uuid])
      end

      def new_track_attributes
        params
          .permit(:kind, :name, :location, :place_id, :missing_suit_name, :suit_id, :comment, :visibility, :client_uuid)
          .merge(track_file: @track_file, owner: current_user)
      end

      def track_params
        permitted = params.fetch(:track, params).permit(
          :name,
          :kind,
          :location,
          :place_id,
          :ground_level,
          :jump_range,
          :landing_fl_time,
          :missing_suit_name,
          :suit_id,
          :comment,
          :visibility,
          :disqualified_from_online_competitions
        )
        current_user.admin? ? permitted : permitted.except(:disqualified_from_online_competitions)
      end

      def index_params
        params.permit(
          :order, :kind, :term, :profile_id, :suit_id, :place_id, :year,
          profile_id: [], suit_id: [], place_id: [], year: []
        )
      end

      def per_page
        return DEFAULT_PER_PAGE if params[:per].blank?

        params[:per].to_i.clamp(1, MAX_PER_PAGE)
      end
    end
  end
end
