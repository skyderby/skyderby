module Suits
  module Index
    def self.for(params)
      return if params[:manufacturer_id].blank?

      ManufacturerSuits.new(params[:manufacturer_id])
    end
  end
end
