class Track < ApplicationRecord
  class Ownership
    TYPES = %w[None User Event Tournament].freeze

    include ActiveModel::Model

    attr_reader :track

    def initialize(track)
      @track = track
    end

    def profile
      @track.pilot
    end

    def profile_id
      @track.profile_id
    end

    def name
      @track.name
    end

    def type
      track.owner_type
    end

    TYPES.each do |possible_type|
      define_method possible_type.downcase do
        type == possible_type && track.owner
      end

      define_method "#{possible_type.downcase}_id" do
        type == possible_type && track.owner_id
      end
    end
  end
end
