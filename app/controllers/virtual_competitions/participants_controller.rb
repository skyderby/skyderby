module VirtualCompetitions
  class ParticipantsController < ApplicationController
    before_action :set_competition

    def index
      @roster = @competition.participants_roster
    end

    def new
      @participant = @competition.participants.new
    end

    def create
      @participant = @competition.participants.find_or_initialize_by(profile_id: participant_params[:profile_id])
      @participant.admin = participant_params[:admin]

      if @participant.save
        replace_participants
      else
        form = turbo_stream.replace('participant_form', partial: 'form', locals: { participant: @participant })
        render turbo_stream: form, status: :unprocessable_content
      end
    end

    def update
      participant = @competition.participants.find(params[:id])

      if participant.update(admin: participant_params[:admin])
        replace_participants
      else
        respond_with_errors participant
      end
    end

    def destroy
      @competition.participants.find(params[:id]).destroy!

      replace_participants
    end

    private

    def set_competition
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :manage_participants?
    end

    def participant_params = params.require(:participant).permit(:profile_id, :admin)

    def replace_participants
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            'participants', partial: 'virtual_competitions/participants/participants',
                            locals: { roster: @competition.participants_roster }
          )
        end
        format.html { redirect_to virtual_competition_participants_path(@competition) }
      end
    end
  end
end
