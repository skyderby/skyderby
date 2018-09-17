class Place < ApplicationRecord
  module Photos
    extend ActiveSupport::Concern

    included do
      has_many :photos, dependent: :destroy
    end

    def photo
      photos.first || Photo.new
    end
  end
end
