module Api
  module V1
    class ManufacturersController < ApplicationController
      def index
        authorize Manufacturer

        @manufacturers =
          Manufacturer
          .order(:name)
          .then(&method(:apply_filters))
          .paginate(page: current_page, per_page: rows_per_page)

        respond_to do |format|
          format.json
        end
      end

      def show
        @manufacturer = Manufacturer.find(params[:id])

        authorize @manufacturer

        respond_to do |format|
          format.json
        end
      end

      def create
        authorize Manufacturer

        @manufacturer = Manufacturer.new(manufacturer_params)

        respond_to do |format|
          if @manufacturer.save
            format.json
          else
            format.json do
              render json: { errors: @manufacturer.errors }, status: :unprocessable_entity
            end
          end
        end
      end

      def update
        @manufacturer = Manufacturer.find(params[:id])

        authorize @manufacturer

        respond_to do |format|
          if @manufacturer.update(manufacturer_params)
            format.json
          else
            format.json do
              render json: { errors: @manufacturer.errors }, status: :unprocessable_entity
            end
          end
        end
      end

      def destroy
        @manufacturer = Manufacturer.find(params[:id])

        authorize @manufacturer

        respond_to do |format|
          if @manufacturer.destroy
            format.json { head :ok }
          else
            format.json do
              render json: { errors: @manufacturer.errors }, status: :unprocessable_entity
            end
          end
        end
      end

      private

      def manufacturer_params
        params.require(:manufacturer).permit(:name, :code)
      end

      def apply_filters(relation)
        return relation if params[:ids].empty?

        relation.where(id: params[:ids])
      end
    end
  end
end
