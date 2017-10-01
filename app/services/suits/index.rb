module Suits
  module Index
    def self.for(params)
      if params[:manufacturer_id].present?
        ManufacturerSuits.new(params[:manufacturer_id])
      else
        Overview.new
      end
    end
  end
end
