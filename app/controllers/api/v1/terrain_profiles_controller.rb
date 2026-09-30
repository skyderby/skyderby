module Api
  module V1
    class TerrainProfilesController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }, only: %i[create update destroy]
      before_action :require_registered_user!, only: %i[create update destroy]
      before_action :set_terrain_profile, only: %i[show update destroy]

      def index
        @terrain_profiles = profiles_scope.search(params[:term]).includes(:shares).page(params[:page]).per(50)
      end

      def show
        respond_not_authorized unless @terrain_profile.viewable?(current_user)
      end

      def create
        @terrain_profile = TerrainProfile.new(terrain_profile_params)
        @terrain_profile.user = new_profile_owner

        if @terrain_profile.save
          render :show, status: :created
        else
          render_errors @terrain_profile.errors.full_messages, status: :unprocessable_content
        end
      end

      def update
        return respond_not_authorized unless @terrain_profile.editable?(current_user)

        if @terrain_profile.update(terrain_profile_params)
          @terrain_profile.reload
          render :show
        else
          render_errors @terrain_profile.errors.full_messages, status: :unprocessable_content
        end
      end

      def destroy
        share = @terrain_profile.shares.find_by(user_id: current_user.id)

        if @terrain_profile.deletable?(current_user)
          @terrain_profile.destroy
        elsif share
          share.destroy
        else
          return respond_not_authorized
        end

        head :no_content
      end

      private

      def set_terrain_profile
        @terrain_profile = TerrainProfile.includes(:place, :measurements, :shares).find(params[:id])
      end

      def profiles_scope
        viewable = TerrainProfile.viewable(current_user)

        if params[:place_id].present?
          viewable.where(place_id: params[:place_id]).with_measurements.with_place
                  .order(own_first_order).merge(TerrainProfile.alphabetically)
        elsif params[:scope] == 'own'
          own_profiles
        else
          viewable.publicly_listed.alphabetically
        end
      end

      def own_profiles
        return TerrainProfile.none unless current_user.registered?

        TerrainProfile.owned_by(current_user).or(TerrainProfile.shared_with(current_user)).alphabetically
      end

      def own_first_order
        return Arel.sql('1') unless current_user.registered?

        Arel.sql(TerrainProfile.sanitize_sql_array(['CASE WHEN terrain_profiles.user_id = ? THEN 0 ELSE 1 END',
                                                    current_user.id]))
      end

      def new_profile_owner
        return nil if params.dig(:terrain_profile, :ownership) == 'shared' && TerrainProfile.shareable_by?(current_user)

        current_user
      end

      def terrain_profile_params
        permitted = params.expect(terrain_profile: [:name, :place_id, :track_id, :published,
                                                    { measurements: [%i[altitude distance]] }])
        rows = permitted.delete(:measurements)
        permitted[:measurements_text] = rows.map { "#{it[:altitude]} #{it[:distance]}" }.join("\n") if rows
        permitted
      end
    end
  end
end
