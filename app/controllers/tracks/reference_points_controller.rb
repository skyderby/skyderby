module Tracks
  class ReferencePointsController < ApplicationController
    before_action :authorize_edit, only: [:create, :update, :destroy]

    def show
      respond_to do |format|
        format.json { render json: reference_point_data }
      end
    end

    def create
      @reference_point = track.build_reference_point(reference_point_params)

      if @reference_point.save
        render json: reference_point_data, status: :created
      else
        render json: { errors: @reference_point.errors }, status: :unprocessable_entity
      end
    end

    def update
      if reference_point.update(reference_point_params)
        render json: reference_point_data
      else
        render json: { errors: reference_point.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      reference_point&.destroy
      head :no_content
    end

    private

    def track
      @track ||= Track.find(params[:track_id])
    end

    def reference_point
      @reference_point ||= track.reference_point
    end

    def reference_point_data
      if track.competitive? && competition_reference_point
        competition_reference_point_data
      else
        user_reference_point_data
      end
    end

    def competition_reference_point
      track.event_result&.reference_point
    end

    def competition_reference_point_data
      {
        reference_point: {
          latitude: competition_reference_point.latitude.to_f,
          longitude: competition_reference_point.longitude.to_f
        },
        editable: false,
        competitive: true
      }
    end

    def user_reference_point_data
      return { reference_point: nil, editable: can_edit?, competitive: false } unless reference_point

      {
        reference_point: {
          latitude: reference_point.latitude.to_f,
          longitude: reference_point.longitude.to_f
        },
        editable: can_edit?,
        competitive: false
      }
    end

    def reference_point_params
      params.require(:reference_point).permit(:latitude, :longitude)
    end

    def can_edit?
      return false unless Current.user&.registered?
      return true if Current.user.admin?

      track.pilot&.user == Current.user
    end

    def authorize_edit
      render json: { error: 'Unauthorized' }, status: :forbidden unless can_edit?
    end
  end
end
