module Api
  module V1
    module Logbook
      class JumpsController < Api::ApplicationController
        include ApiLogbookScoped

        UUID_FORMAT = /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/

        before_action :set_jump, only: %i[update destroy]

        rescue_from Sync::Cursor::Invalid do
          render_errors ['Invalid cursor'], status: :bad_request
        end

        def index
          @changes = ::Profiles::Logbook::Changes.new(logbook_profile, since: params[:since], limit: params[:limit])
        end

        def create
          return render_errors(['Client UUID is invalid'], status: :unprocessable_content) unless valid_client_uuid?

          @jump = logbook_profile.jumps.find_by(client_uuid:)
          return render :show if @jump

          @jump = new_jump
          save_jump(status: :created)
        rescue ActiveRecord::RecordNotUnique
          @jump = logbook_profile.jumps.find_by!(client_uuid:)
          render :show
        end

        def update
          @jump.assign_attributes(jump_params)
          save_jump(status: :ok)
        end

        def destroy
          @jump.discard if @jump.deleted_at.nil?
          head :no_content
        end

        private

        def set_jump
          @jump = logbook_profile.jumps.find_by!(client_uuid: params[:id])
          render_errors ['This jump was deleted'], status: :gone if action_name == 'update' && @jump.deleted_at
        end

        def client_uuid
          @client_uuid ||= params.dig(:jump, :client_uuid).presence&.downcase || SecureRandom.uuid
        end

        def new_jump
          kind = ::Profiles::Logbook.new(logbook_profile, kind: params.dig(:jump, :kind)).kind
          logbook_profile.jumps.new(jump_params.merge(client_uuid:, kind:))
        end

        def valid_client_uuid? = UUID_FORMAT.match?(client_uuid)

        def save_jump(status:)
          if @jump.save
            render :show, status:
          else
            render_errors @jump.errors.full_messages, status: :unprocessable_content
          end
        end

        def jump_params
          params.require(:jump).permit(
            :number, :jumped_at, :place_id, :place_name, :suit_id, :equipment, :jump_type, :aircraft, :object_type,
            :wind_strength, :wind_direction, :exit_altitude, :deployment_altitude, :freefall_seconds,
            :canopy_seconds, :shared_with, :notes
          )
        end
      end
    end
  end
end
