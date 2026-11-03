module Api
  module V1
    module Logbook
      module Jumps
        class RenumberingsController < Api::ApplicationController
          include ApiLogbookScoped

          def create
            jump = logbook_profile.jumps.kept.find_by!(client_uuid: params[:jump_id])
            if jump.renumber_following
              head :no_content
            else
              render_errors ['The jump has no number'], status: :unprocessable_content
            end
          end
        end
      end
    end
  end
end
