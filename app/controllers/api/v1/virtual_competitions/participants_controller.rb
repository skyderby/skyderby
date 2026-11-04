module Api
  module V1
    module VirtualCompetitions
      class ParticipantsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize!(request.get? ? :read : :write) }
        before_action :set_competition

        def index
          @roster = @competition.participants_roster
        end

        def create
          participant = @competition.participants.find_or_initialize_by(profile_id: params[:profile_id])
          participant.admin = ActiveModel::Type::Boolean.new.cast(params[:admin]) || false
          return render_errors(participant.errors.full_messages, status: :unprocessable_content) unless participant.save

          render_roster(status: :created)
        end

        def update
          participant = @competition.participants.find(params[:id])
          unless participant.update(admin: ActiveModel::Type::Boolean.new.cast(params[:admin]) || false)
            return render_errors(participant.errors.full_messages, status: :unprocessable_content)
          end

          render_roster
        end

        def destroy
          @competition.participants.find(params[:id]).destroy!
          render_roster
        end

        private

        def set_competition
          @competition = VirtualCompetition.find(params[:virtual_competition_id])
          respond_not_authorized unless @competition.manageable_by?(current_user)
        end

        def render_roster(status: :ok)
          @roster = @competition.participants_roster
          render :index, status:
        end
      end
    end
  end
end
