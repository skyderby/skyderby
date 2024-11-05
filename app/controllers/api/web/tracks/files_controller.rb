class Api::Web::Tracks::FilesController < Api::Web::ApplicationController
  def create
    authorize Track

    @track_file = Track::File.new(track_file_params)

    respond_to do |format|
      if @track_file.save
        format.json
      else
        format.json do
          render json: { errors: @track_file.errors }, status: :unprocessable_entity
        end
      end
    end
  end

  private

  def track_file_params
    params.permit(:file)
  end
end
